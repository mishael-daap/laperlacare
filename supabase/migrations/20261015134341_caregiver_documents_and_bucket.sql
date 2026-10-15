-- Caregiver documents, the profile columns the onboarding modal fills in, and
-- the private bucket those documents live in.
--
-- Run this as a sequence: columns, table, the guard that stops self-approval,
-- the reset rule, then the bucket and its policies.

-- ---------------------------------------------------------------------------
-- Profile columns
-- ---------------------------------------------------------------------------

-- bio is what the "profile and bio" stage writes.
-- submitted_at is what makes review state derivable: null means they are still
-- filling things in, set means they are waiting on us. That is why there is no
-- fourth verification status for "draft" — the review queue can tell the two
-- apart from this column alone, and the three-status state machine stays as it
-- was designed.
alter table public.caregivers add column if not exists bio text;
alter table public.caregivers add column if not exists submitted_at timestamptz;

-- ---------------------------------------------------------------------------
-- Documents
-- ---------------------------------------------------------------------------

create table public.caregiver_documents (
  id            uuid primary key default gen_random_uuid(),
  caregiver_id  uuid not null references public.caregivers (user_id) on delete cascade,
  kind          text not null check (kind in ('background_check', 'certification', 'other')),
  storage_path  text not null,
  review_status text not null default 'pending'
                  check (review_status in ('pending', 'approved', 'rejected')),
  reviewed_by   uuid references auth.users (id) on delete set null,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index caregiver_documents_caregiver_id_idx
  on public.caregiver_documents (caregiver_id);

alter table public.caregiver_documents enable row level security;

-- A caregiver reads and writes their own documents and nothing else. There is
-- deliberately no update policy for them: replacing a document is a delete and
-- an insert, which means review_status can only ever be the default on the way
-- in. Otherwise a caregiver could approve their own background check with a
-- single update, which is the whole thing admin review exists to prevent.
create policy "a caregiver may read their own documents"
  on public.caregiver_documents for select
  to authenticated
  using (caregiver_id = (select auth.uid()) or (select private.is_admin()));

create policy "a caregiver may add their own documents"
  on public.caregiver_documents for insert
  to authenticated
  with check (caregiver_id = (select auth.uid()));

create policy "a caregiver may remove their own documents"
  on public.caregiver_documents for delete
  to authenticated
  using (caregiver_id = (select auth.uid()));

-- Reviewing is an admin action, and arrives properly with the admin dashboard.
create policy "an admin may review documents"
  on public.caregiver_documents for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Stops a caregiver approving themselves
-- ---------------------------------------------------------------------------

-- A policy cannot express this. The update policy on caregivers says "your own
-- row", which is right, but nothing in it stops that row setting its own
-- verification_status to 'approved'. So the guard sits in a trigger, which is
-- the only place that can see both the old and the new value.
--
-- The rule is asymmetric on purpose: a non-admin may move the status *to*
-- pending and nowhere else. That is harmless, and it is exactly what the reset
-- rule below needs to do. Moving it to approved or rejected is refused.
create or replace function private.guard_caregiver_verification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select private.is_admin()) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.verification_status := 'pending';
    return new;
  end if;

  if new.verification_status is distinct from old.verification_status
     and new.verification_status <> 'pending' then
    new.verification_status := old.verification_status;
  end if;

  return new;
end;
$$;

create trigger caregivers_guard_verification
  before insert or update on public.caregivers
  for each row execute function private.guard_caregiver_verification();

-- ---------------------------------------------------------------------------
-- Replacing the background check sends them back for review
-- ---------------------------------------------------------------------------

-- The document an admin approved is no longer the document on file, so the
-- approval no longer means anything. Bio and contact edits do not do this,
-- because nothing was verified about them.
create or replace function private.reset_verification_on_new_document()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.kind = 'background_check' then
    update public.caregivers
    set verification_status = 'pending'
    where user_id = new.caregiver_id;
  end if;

  return new;
end;
$$;

create trigger caregiver_documents_reset_verification
  after insert on public.caregiver_documents
  for each row execute function private.reset_verification_on_new_document();

-- ---------------------------------------------------------------------------
-- The private bucket documents live in
-- ---------------------------------------------------------------------------

-- Private, unlike avatars. A caregiver's photo sits on a public catalogue; their
-- background check is the most sensitive file in the product, and a signed URL
-- that expires in an hour is the difference between "hard to find" and
-- "access-controlled".
--
-- PDFs are allowed here and are not allowed for avatars, because a background
-- check usually arrives as one.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'caregiver-documents',
  'caregiver-documents',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "a caregiver may upload their own documents"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'caregiver-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Readable by the caregiver who uploaded it, and by an admin reviewing it.
-- Nobody else, including other caregivers.
create policy "a caregiver or an admin may read a document"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'caregiver-documents'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select private.is_admin())
    )
  );

create policy "a caregiver may replace their own documents"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'caregiver-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'caregiver-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "a caregiver may delete their own documents"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'caregiver-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
