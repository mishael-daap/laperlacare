-- Narrows the admin contacts policy added in the previous migration.
--
-- It granted an admin every row in contacts, which includes parents. Reviewing a
-- caregiver means reading the caregiver's contact details, and nothing more; the
-- data model spec's "an admin reads no contacts" was aimed at exactly that leak.
-- Scoping the policy to contact rows whose owner has a caregivers row keeps the
-- review working and the rest closed.

drop policy "an admin may read a caregiver's contacts" on public.contacts;

create policy "an admin may read a caregiver's contacts"
  on public.contacts for select
  to authenticated
  using (
    (select private.is_admin())
    and exists (
      select 1 from public.caregivers c where c.user_id = contacts.user_id
    )
  );
