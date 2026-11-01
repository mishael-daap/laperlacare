-- The shortlist: the caregivers a household has kept.
--
-- Matching answers "who fits us"; the shortlist answers "who were we looking
-- at". Without it a parent compares three people by keeping three browser tabs
-- open, and the next feature (contact requests) has no place to start from.
--
-- Keyed by household, not by parent: two parents in one household see the same
-- shortlist, exactly as they see the same children.

create table if not exists public.caregiver_shortlist (
  household_id uuid not null references public.households (id) on delete cascade,
  caregiver_id uuid not null references public.caregivers (user_id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (household_id, caregiver_id)
);

create index if not exists caregiver_shortlist_caregiver_id_idx
  on public.caregiver_shortlist (caregiver_id);

alter table public.caregiver_shortlist enable row level security;

create policy "a household may read its shortlist"
  on public.caregiver_shortlist for select
  to authenticated
  using (household_id = (select private.current_household_id()));

-- The check on the caregiver is deliberately not "approved": saving is allowed
-- for anyone matching returns, and a caregiver whose approval lapses later is
-- dropped by the match function rather than by a constraint firing on a row the
-- parent never touched.
create policy "a household may add to its shortlist"
  on public.caregiver_shortlist for insert
  to authenticated
  with check (household_id = (select private.current_household_id()));

create policy "a household may remove from its shortlist"
  on public.caregiver_shortlist for delete
  to authenticated
  using (household_id = (select private.current_household_id()));

grant select, insert, delete on public.caregiver_shortlist to authenticated;
