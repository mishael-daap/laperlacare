-- Policies and grants for the data model.
--
-- Two things to know before reading:
--
-- 1. Grant and policy are separate layers. The grant decides whether a role can
--    touch the table at all; the policy decides which rows. A missing grant
--    gives "42501 permission denied", not an empty result.
--
-- 2. Every policy names its target role and pairs it with an ownership or
--    household check. `to authenticated` on its own is authentication without
--    authorisation: it would let any signed-in user read every row.
--
-- Update policies carry both `using` and `with check`. Without the check a
-- person could reassign a row to somebody else.

-- Creating a household is a two-row operation: the household, then the parent
-- that points at it. Splitting it across two tables creates a problem no policy
-- can solve, because at the moment the household row is inserted the caller is
-- not yet a member of it, and at the moment the parent row is inserted the
-- caller could name any household they liked.
--
-- So membership is not granted by a policy at all. It is granted here, by a
-- function that does both inserts together and checks the caller first.
create or replace function private.create_household()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  new_id uuid;
begin
  if caller is null then
    raise exception 'not authenticated';
  end if;

  if exists (select 1 from public.parents where user_id = caller) then
    raise exception 'caller already belongs to a household';
  end if;

  insert into public.households default values returning id into new_id;
  insert into public.parents (user_id, household_id) values (caller, new_id);

  return new_id;
end;
$$;

revoke all on function private.create_household() from public;
grant execute on function private.create_household() to authenticated;

-- households: a parent sees their own household, and only theirs.
create policy "households are visible to their members"
  on public.households for select
  to authenticated
  using (id = (select private.current_household_id()));

-- parents: a parent sees themselves and the other adults in their household.
-- There is no insert policy: membership is created by private.create_household.
create policy "parents are visible within their household"
  on public.parents for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or household_id = (select private.current_household_id())
  );

create policy "a parent may update their own row"
  on public.parents for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- children: scoped to the household, all four verbs.
create policy "children are visible within their household"
  on public.children for select
  to authenticated
  using (household_id = (select private.current_household_id()));

create policy "a parent may add children to their household"
  on public.children for insert
  to authenticated
  with check (household_id = (select private.current_household_id()));

create policy "a parent may edit children in their household"
  on public.children for update
  to authenticated
  using (household_id = (select private.current_household_id()))
  with check (household_id = (select private.current_household_id()));

create policy "a parent may remove children from their household"
  on public.children for delete
  to authenticated
  using (household_id = (select private.current_household_id()));

-- caregivers: the catalog is public, so approved caregivers are readable by
-- anyone. A caregiver always sees their own row, whatever its status.
create policy "approved caregivers are public"
  on public.caregivers for select
  to anon, authenticated
  using (
    verification_status = 'approved'
    or user_id = (select auth.uid())
  );

create policy "a caregiver may create their own profile"
  on public.caregivers for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "a caregiver may edit their own profile"
  on public.caregivers for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- caregiver_availability: follows the catalog. Readable where the caregiver is
-- approved; writable only by that caregiver.
create policy "availability of approved caregivers is public"
  on public.caregiver_availability for select
  to anon, authenticated
  using (
    caregiver_id = (select auth.uid())
    or exists (
      select 1 from public.caregivers c
      where c.user_id = caregiver_availability.caregiver_id
        and c.verification_status = 'approved'
    )
  );

create policy "a caregiver may add their own availability"
  on public.caregiver_availability for insert
  to authenticated
  with check (caregiver_id = (select auth.uid()));

create policy "a caregiver may edit their own availability"
  on public.caregiver_availability for update
  to authenticated
  using (caregiver_id = (select auth.uid()))
  with check (caregiver_id = (select auth.uid()));

-- The board is saved whole: delete every row, insert the new set.
create policy "a caregiver may clear their own availability"
  on public.caregiver_availability for delete
  to authenticated
  using (caregiver_id = (select auth.uid()));

-- admins: a row is visible only to the admin it belongs to. No write policies:
-- admins are created deliberately, never through the API.
create policy "an admin may see their own row"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()));

-- contacts: yours always. A member may read an approved caregiver's contacts,
-- which is the paid part of the product. Never a signed-out visitor, never a
-- parent's contacts.
create policy "a member may read an approved caregiver's contacts"
  on public.contacts for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (
      (select private.current_household_id()) is not null
      and exists (
        select 1 from public.caregivers c
        where c.user_id = contacts.user_id
          and c.verification_status = 'approved'
      )
    )
  );

create policy "a person may add their own contacts"
  on public.contacts for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "a person may edit their own contacts"
  on public.contacts for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "a person may remove their own contacts"
  on public.contacts for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Grants. Without these the tables are unreachable regardless of policy, and
-- PostgREST answers 42501 rather than returning zero rows.
grant select, insert, update, delete on public.parents                to authenticated;
grant select, insert, update, delete on public.children               to authenticated;
grant select, insert, update, delete on public.caregivers             to authenticated;
grant select, insert, update, delete on public.caregiver_availability to authenticated;
grant select, insert, update, delete on public.contacts               to authenticated;
grant select                          on public.households            to authenticated;
grant select                          on public.admins                to authenticated;

-- Anonymous visitors get the public catalog and nothing else.
grant select on public.caregivers             to anon;
grant select on public.caregiver_availability to anon;
