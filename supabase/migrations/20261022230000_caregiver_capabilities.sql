-- What a caregiver can take on, who they are, and the extra facts a credential
-- now carries.
--
-- Three separate ideas land here because they share no machinery:
--
--   1. Four columns on caregivers: a date of birth, a gender, and the range of
--      ages they work with.
--   2. Two tag tables, mirroring child_needs and child_supports, so a caregiver
--      ticks the needs they can support and the supports they provide from the
--      same lists parents already use.
--   3. An expiry date on a document, and a wider closed set of kinds.
--
-- The status column and the review machinery that used to sit on the caregiver
-- are removed in the next migration, once the documents are the only thing that
-- decides it.

-- ---------------------------------------------------------------------------
-- Columns on caregivers
-- ---------------------------------------------------------------------------

-- The caregiver's own date of birth, which is what their age is derived from.
-- Age is never stored, for the same reason a child's is not: it would go stale.
alter table public.caregivers add column if not exists date_of_birth date;

alter table public.caregivers add column if not exists gender text;
alter table public.caregivers add column if not exists age_min smallint;
alter table public.caregivers add column if not exists age_max smallint;

-- A closed set with a "prefer not to say". Nullable, because nothing is required
-- to save a profile; a search filtered by gender simply will not match a blank.
alter table public.caregivers drop constraint if exists caregivers_gender_check;
alter table public.caregivers
  add constraint caregivers_gender_check
  check (
    gender is null
    or gender in ('female', 'male', 'nonbinary', 'prefer_not_to_say')
  );

-- age_min and age_max are the ages of the children a caregiver works with, not
-- their own. Both or neither: half a range cannot be compared against a child's
-- age, so it is refused rather than guessed at.
alter table public.caregivers drop constraint if exists caregivers_working_age_check;
alter table public.caregivers
  add constraint caregivers_working_age_check
  check (
    (age_min is null and age_max is null)
    or (
      age_min between 0 and 21
      and age_max between 0 and 21
      and age_max >= age_min
    )
  );

-- ---------------------------------------------------------------------------
-- Document kinds and expiry
-- ---------------------------------------------------------------------------

-- A licence and a CPR card are not "certifications", so the old three-value
-- constraint could not describe what caregivers actually hold. The two existing
-- values stay, so no row needs rewriting.
alter table public.caregiver_documents drop constraint if exists caregiver_documents_kind_check;
alter table public.caregiver_documents
  add constraint caregiver_documents_kind_check
  check (
    kind in ('background_check', 'cpr', 'drivers_licence', 'certification', 'other')
  );

-- Optional, because not every document has one. A CPR card does; a background
-- check may not. The comparison against today's date happens where the status is
-- calculated, not here.
alter table public.caregiver_documents add column if not exists expires_at date;

-- ---------------------------------------------------------------------------
-- What a caregiver can support, and what they provide
-- ---------------------------------------------------------------------------

-- Mirror images of child_needs and child_supports, against the same two lists.
-- A need here is one the caregiver can work with, not one they have.
create table if not exists public.caregiver_needs (
  caregiver_id uuid not null references public.caregivers (user_id) on delete cascade,
  need_id      uuid not null references public.needs (id) on delete cascade,
  primary key (caregiver_id, need_id)
);

create index if not exists caregiver_needs_need_id_idx
  on public.caregiver_needs (need_id);

create table if not exists public.caregiver_supports (
  caregiver_id uuid not null references public.caregivers (user_id) on delete cascade,
  support_id   uuid not null references public.supports (id) on delete cascade,
  primary key (caregiver_id, support_id)
);

create index if not exists caregiver_supports_support_id_idx
  on public.caregiver_supports (support_id);

alter table public.caregiver_needs    enable row level security;
alter table public.caregiver_supports enable row level security;

-- No update policy on either: a save replaces the set, so there is nothing to
-- update in place. A caregiver reads and writes only their own rows, and no
-- other caregiver can read them. An admin reads capabilities through the detail
-- function rather than through a policy here.
create policy "a caregiver may read their own needs"
  on public.caregiver_needs for select
  to authenticated
  using (caregiver_id = (select auth.uid()));

create policy "a caregiver may add their own needs"
  on public.caregiver_needs for insert
  to authenticated
  with check (caregiver_id = (select auth.uid()));

create policy "a caregiver may remove their own needs"
  on public.caregiver_needs for delete
  to authenticated
  using (caregiver_id = (select auth.uid()));

create policy "a caregiver may read their own supports"
  on public.caregiver_supports for select
  to authenticated
  using (caregiver_id = (select auth.uid()));

create policy "a caregiver may add their own supports"
  on public.caregiver_supports for insert
  to authenticated
  with check (caregiver_id = (select auth.uid()));

create policy "a caregiver may remove their own supports"
  on public.caregiver_supports for delete
  to authenticated
  using (caregiver_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant select, insert, delete
  on public.caregiver_needs, public.caregiver_supports
  to authenticated;
