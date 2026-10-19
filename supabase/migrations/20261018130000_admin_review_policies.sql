-- Admin review: the audit columns, and the RLS that lets an admin see and
-- decide on a caregiver at all.
--
-- The existing caregivers policy is "approved caregivers are public, and your
-- own row". An admin falls into neither half, so without this migration the
-- review queue would read zero rows and an approval would be refused by the
-- update policy before the guard trigger was even reached.

-- ---------------------------------------------------------------------------
-- The audit record
-- ---------------------------------------------------------------------------

-- Who decided, and when. It was owed by the architecture doc ("verification is
-- an explicit state machine with an audit record of who reviewed what and when")
-- and caregivers had nowhere to put it.
--
-- `on delete set null` rather than cascade: removing a staff account must not
-- remove the fact that a decision was made.
alter table public.caregivers add column if not exists reviewed_by uuid
  references auth.users (id) on delete set null;
alter table public.caregivers add column if not exists reviewed_at timestamptz;

-- ---------------------------------------------------------------------------
-- Admin read and write
-- ---------------------------------------------------------------------------

-- Permissive policies are OR-ed with the existing ones, so this adds sight of
-- every caregiver without weakening "a caregiver sees their own row" or the
-- public catalogue's view of approved profiles.
create policy "an admin may read every caregiver"
  on public.caregivers for select
  to authenticated
  using ((select private.is_admin()));

-- RLS cannot restrict columns, so this permits an admin to update any column of
-- any caregiver. The app only ever writes verification_status, reviewed_by, and
-- reviewed_at. The guard trigger still applies, and it lets an admin through.
create policy "an admin may decide on a caregiver"
  on public.caregivers for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- Reviewing the person, not just the file: an admin needs to see how to reach
-- them. This deliberately overturns the data model spec's "an admin reads no
-- contacts", which was written when admins only read documents. Children and
-- households stay closed.
create policy "an admin may read a caregiver's contacts"
  on public.contacts for select
  to authenticated
  using ((select private.is_admin()));

-- The review screen shows what the caregiver can actually work, which is part
-- of deciding whether the profile is real.
create policy "an admin may read caregiver availability"
  on public.caregiver_availability for select
  to authenticated
  using ((select private.is_admin()));
