-- Why a document was refused, and a permanent record of every decision.
--
-- Two things arrive together because they are the same idea from two sides:
--
--   1. The current decision on a document now carries a reason and an optional
--      admin message, so a rejection says what to fix.
--   2. Every transition to approved or rejected is copied into an append-only
--      history, so the record survives the document being replaced.
--
-- The reason is stored twice on purpose. The columns on the document are the
-- current state, which is what /me and the admin row render. The history row is
-- the decision at the moment it was made, and it has to keep reading correctly
-- after the document row is deleted — which happens whenever a caregiver
-- replaces the file.

-- ---------------------------------------------------------------------------
-- The current decision
-- ---------------------------------------------------------------------------

alter table public.caregiver_documents
  add column if not exists rejection_reason text;
alter table public.caregiver_documents
  add column if not exists rejection_message text;

-- Six reasons, closed set. `other` exists so an admin never has to pick a reason
-- that is almost right; the message is what makes it useful, and that rule is
-- enforced below.
alter table public.caregiver_documents
  drop constraint if exists caregiver_documents_rejection_reason_check;
alter table public.caregiver_documents
  add constraint caregiver_documents_rejection_reason_check
  check (
    rejection_reason is null
    or rejection_reason in (
      'invalid_or_unreadable',
      'not_california',
      'expired',
      'name_mismatch',
      'wrong_type',
      'other'
    )
  );

-- A message without a reason would render as an explanation of nothing.
alter table public.caregiver_documents
  drop constraint if exists caregiver_documents_rejection_message_check;
alter table public.caregiver_documents
  add constraint caregiver_documents_rejection_message_check
  check (
    (rejection_message is null or char_length(rejection_message) <= 1000)
    and (rejection_message is null or rejection_reason is not null)
  );

-- A reason belongs to a rejection and nowhere else. This is also what makes
-- approving clear it: an update to 'approved' that left a reason behind would
-- violate this constraint rather than storing a contradiction.
--
-- Null stays legal on a rejected row because documents rejected before this
-- migration have no reason and are not backfilled.
alter table public.caregiver_documents
  drop constraint if exists caregiver_documents_rejection_scope_check;
alter table public.caregiver_documents
  add constraint caregiver_documents_rejection_scope_check
  check (rejection_reason is null or review_status = 'rejected');

-- ---------------------------------------------------------------------------
-- The record
-- ---------------------------------------------------------------------------

-- A decision, not a file. `document_id` goes null when the document is deleted,
-- so `kind` and `file_name` are copied at decision time: the history has to
-- describe a decision made at a moment, and the thing it was about may be gone.
--
-- `kind` has no check constraint on purpose. The documents table has one today,
-- but a snapshot of history should not start refusing to be written because the
-- vocabulary changed years after the decision.
create table if not exists public.caregiver_document_reviews (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid references public.caregiver_documents (id) on delete set null,
  caregiver_id uuid not null references public.caregivers (user_id) on delete cascade,
  kind         text not null,
  file_name    text,
  decision     text not null check (decision in ('approved', 'rejected')),
  reason       text check (
                 reason is null
                 or reason in (
                   'invalid_or_unreadable',
                   'not_california',
                   'expired',
                   'name_mismatch',
                   'wrong_type',
                   'other'
                 )
               ),
  message      text check (message is null or char_length(message) <= 1000),
  reviewed_by  uuid references auth.users (id) on delete set null,
  reviewed_at  timestamptz not null default now()
);

create index if not exists caregiver_document_reviews_caregiver_idx
  on public.caregiver_document_reviews (caregiver_id, reviewed_at desc);

create index if not exists caregiver_document_reviews_document_idx
  on public.caregiver_document_reviews (document_id);

alter table public.caregiver_document_reviews enable row level security;

-- Read only. There is deliberately no insert, update, or delete policy and no
-- grant beyond select: the only writer is the trigger below, which is why an
-- admin cannot rewrite history through the API even though they can decide.
create policy "a caregiver may read their own review history"
  on public.caregiver_document_reviews for select
  to authenticated
  using (
    caregiver_id = (select auth.uid())
    or (select private.is_admin())
  );

grant select on public.caregiver_document_reviews to authenticated;

-- ---------------------------------------------------------------------------
-- The writer
-- ---------------------------------------------------------------------------

-- SECURITY DEFINER so the append needs no grant to the admin's role, and so the
-- write is atomic with the decision that caused it. A decision cannot be saved
-- without being recorded.
--
-- Only a transition into a decision is recorded. 'pending' is not a decision,
-- and re-saving the same status is not a second one.
create or replace function private.record_document_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.review_status not in ('approved', 'rejected') then
    return new;
  end if;

  insert into public.caregiver_document_reviews (
    document_id,
    caregiver_id,
    kind,
    file_name,
    decision,
    reason,
    message,
    reviewed_by,
    reviewed_at
  )
  values (
    new.id,
    new.caregiver_id,
    new.kind,
    new.file_name,
    new.review_status,
    new.rejection_reason,
    new.rejection_message,
    new.reviewed_by,
    coalesce(new.reviewed_at, now())
  );

  return new;
end;
$$;

-- The function is in the private schema, which the Data API does not expose, so
-- it is not an endpoint. The revoke is belt and braces, matching the helpers.
-- Trigger invocation does not need EXECUTE on the function.
revoke all on function private.record_document_review() from public;

drop trigger if exists caregiver_documents_record_review
  on public.caregiver_documents;

create trigger caregiver_documents_record_review
  after update on public.caregiver_documents
  for each row
  when (new.review_status is distinct from old.review_status)
  execute function private.record_document_review();
