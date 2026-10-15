-- Corrects the caregiver verification guard added in the previous migration.
--
-- The guard refused a non-admin moving verification_status anywhere but
-- 'pending'. That is right for a caregiver, and wrong for everyone else: a
-- seed, a migration, a support script, or an operator in the SQL editor has no
-- auth.uid() at all, so the guard treated them as "some user trying it on" and
-- silently forced the status back. The write looked like it succeeded and did
-- nothing.
--
-- The fix is to return early when there is no caller. Anonymous API traffic
-- cannot reach this table either way, because no policy grants anon insert or
-- update on caregivers — so "no auth.uid()" really does mean "not a request".

create or replace function private.guard_caregiver_verification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  -- No caller, or an admin: this is not a caregiver editing their own row.
  if caller is null or (select private.is_admin()) then
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
