-- The two parts of the application that are lists rather than columns: where a
-- caregiver has worked, and the two people who can vouch for it.
--
-- Both are child tables of `caregivers`, keyed by the caregiver's own user id,
-- because a caregiver row always exists before either is written. A save
-- replaces the whole set — there is no update policy on experience — which is
-- the same rule `child_needs` and `caregiver_needs` already follow, and it means
-- an ordering column is all the identity a row needs.

-- ---------------------------------------------------------------------------
-- Experience
-- ---------------------------------------------------------------------------

-- Months, not exact days. Nobody remembers the day they started, and a date
-- precise to a day would only invite a wrong one.
create table if not exists public.caregiver_experience (
  id             uuid primary key default gen_random_uuid(),
  caregiver_id   uuid not null references public.caregivers (user_id) on delete cascade,
  employer       text not null check (char_length(btrim(employer)) between 1 and 200),
  role           text not null check (char_length(btrim(role)) between 1 and 200),
  started_on     date not null,
  ended_on       date,
  -- One free-text field, as on the paper form.
  ages_and_needs text check (char_length(ages_and_needs) <= 500),
  position       smallint not null,
  created_at     timestamptz not null default now(),
  constraint caregiver_experience_range_check check (ended_on is null or ended_on >= started_on)
);

create index if not exists caregiver_experience_caregiver_idx
  on public.caregiver_experience (caregiver_id, position);

-- ---------------------------------------------------------------------------
-- References
-- ---------------------------------------------------------------------------

-- `position` is 1 or 2 because the form asks for exactly two. The unique key is
-- what stops a third being added by a hand-written request, and the check is
-- what stops the gaps.
--
-- `known_for` is a duration in the caregiver's own words — "four years", "since
-- 2021" — rather than a date range. The form asks it that way, and a reference
-- who has known somebody their whole life does not have a start month.
--
-- The three checked_ columns are written by an admin only, through the
-- application-record function. They are the reference check itself, which
-- happens on a phone call and leaves no document behind.
create table if not exists public.caregiver_references (
  id              uuid primary key default gen_random_uuid(),
  caregiver_id    uuid not null references public.caregivers (user_id) on delete cascade,
  full_name       text not null check (char_length(btrim(full_name)) between 1 and 200),
  relationship    text not null check (char_length(btrim(relationship)) between 1 and 200),
  organisation    text check (char_length(organisation) <= 200),
  phone           text check (char_length(phone) <= 40),
  email           text check (char_length(email) <= 200),
  known_for       text check (char_length(known_for) <= 200),
  position        smallint not null check (position in (1, 2)),
  checked_at      timestamptz,
  checked_outcome text check (checked_outcome in ('ok', 'concern')),
  checked_by      uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  constraint caregiver_references_position_key unique (caregiver_id, position),
  -- A phone number, an email, or both: a reference nobody can reach is not a
  -- reference, which is the whole point of asking for two.
  constraint caregiver_references_reachable_check
    check (nullif(btrim(coalesce(phone, '')), '') is not null
        or nullif(btrim(coalesce(email, '')), '') is not null)
);

create index if not exists caregiver_references_caregiver_idx
  on public.caregiver_references (caregiver_id, position);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.caregiver_experience enable row level security;
alter table public.caregiver_references enable row level security;

-- The caregiver's own rows and nothing else. No admin policy: an admin reads
-- both through `admin_caregiver_detail`, which already exists because the
-- account email is not reachable any other way. Adding two more admin policies
-- would open two more tables to the admin role for reads the function already
-- serves.
create policy "a caregiver may read their own experience"
  on public.caregiver_experience for select
  to authenticated
  using (caregiver_id = (select auth.uid()));

create policy "a caregiver may add their own experience"
  on public.caregiver_experience for insert
  to authenticated
  with check (caregiver_id = (select auth.uid()));

create policy "a caregiver may remove their own experience"
  on public.caregiver_experience for delete
  to authenticated
  using (caregiver_id = (select auth.uid()));

create policy "a caregiver may read their own references"
  on public.caregiver_references for select
  to authenticated
  using (caregiver_id = (select auth.uid()));

create policy "a caregiver may add their own references"
  on public.caregiver_references for insert
  to authenticated
  with check (
    caregiver_id = (select auth.uid())
    -- The check columns belong to the reviewer. A caregiver writing them would
    -- be marking their own references as checked.
    and checked_at is null
    and checked_outcome is null
    and checked_by is null
  );

create policy "a caregiver may remove their own references"
  on public.caregiver_references for delete
  to authenticated
  using (caregiver_id = (select auth.uid()));

-- There is deliberately no update policy on either table. A save replaces the
-- set: delete the caregiver's rows, insert the new ones. That keeps a rejected
-- reference from being quietly edited into an approved one.

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant select, insert, delete on public.caregiver_experience to authenticated;
grant select, insert, delete on public.caregiver_references to authenticated;
