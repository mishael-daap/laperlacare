-- The application locks on submission, and stays locked until an admin sends it
-- back.
--
-- Why a trigger rather than a policy. The caregiver's update policy says "your
-- own row", and that stays right — they can still edit a bio or a rate after
-- submitting. What it cannot express is "these nineteen columns are frozen but
-- the rest are not", because a policy's `with check` only ever sees the new row.
-- A trigger is the only place that can see both the old and the new one.
--
-- The rule is evaluated on the OLD row. That is what makes resubmission work:
-- while an application is returned, `returned_at` is set, so the row is unlocked
-- and the submission that clears `returned_at`, re-stamps the signature and
-- moves `submitted_at` is allowed to happen.
--
-- Both guards return early when there is no caller. A seed, a migration, or an
-- operator in the SQL editor has no `auth.uid()`, and a guard that treated them
-- as a caregiver trying it on would silently refuse to seed anything. Nothing
-- anonymous can reach these tables: there is no policy granting `anon` a write
-- on any of them.

-- ---------------------------------------------------------------------------
-- The one question both guards ask
-- ---------------------------------------------------------------------------

-- SECURITY DEFINER so a delete on a child table can read the parent row without
-- depending on the caller's policy. It returns one boolean and no data.
create or replace function private.application_locked(p_caregiver_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.caregivers c
    where c.user_id = p_caregiver_id
      and c.submitted_at is not null
      and c.returned_at is null
  );
$$;

revoke all on function private.application_locked(uuid) from public;

-- ---------------------------------------------------------------------------
-- The caregiver's own row
-- ---------------------------------------------------------------------------

-- The list is explicit rather than "every column except these". A new column
-- added later defaults to editable, which is the safe direction to fail: the
-- cost is a missed lock on a brand-new field, not a caregiver locked out of
-- their own availability because somebody forgot to exempt it.
create or replace function private.guard_application_lock()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    return new;
  end if;

  if old.submitted_at is null or old.returned_at is not null then
    return new;
  end if;

  if new.legal_name                is distinct from old.legal_name
  or new.address_street            is distinct from old.address_street
  or new.address_city              is distinct from old.address_city
  or new.address_postal_code       is distinct from old.address_postal_code
  or new.referral_source           is distinct from old.referral_source
  or new.conditions                is distinct from old.conditions
  or new.other_condition           is distinct from old.other_condition
  or new.why_special_needs         is distinct from old.why_special_needs
  or new.difficult_moment          is distinct from old.difficult_moment
  or new.background_check_agreed   is distinct from old.background_check_agreed
  or new.signature_name            is distinct from old.signature_name
  or new.signed_at                 is distinct from old.signed_at
  or new.signed_statement_version  is distinct from old.signed_statement_version
  or new.signed_ip                 is distinct from old.signed_ip
  or new.signed_user_agent         is distinct from old.signed_user_agent
  then
    raise exception
      'This application has been submitted. Ask us to return it if something needs changing.';
  end if;

  return new;
end;
$$;

revoke all on function private.guard_application_lock() from public;

drop trigger if exists caregivers_guard_application_lock on public.caregivers;
create trigger caregivers_guard_application_lock
  before update on public.caregivers
  for each row execute function private.guard_application_lock();

-- ---------------------------------------------------------------------------
-- The two list tables
-- ---------------------------------------------------------------------------

-- One function for both, because the question is the same and the answer is the
-- same. Written as a replace-set means an insert and a delete, so both are
-- frozen; without the delete half, a locked application could lose a reference.
create or replace function private.guard_application_children()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid;
begin
  if (select auth.uid()) is null then
    return coalesce(new, old);
  end if;

  -- NEW is null on delete and OLD is null on insert, so only one of them is ever
  -- the row being written.
  owner_id := coalesce(new.caregiver_id, old.caregiver_id);

  if private.application_locked(owner_id) then
    raise exception
      'This application has been submitted. Ask us to return it if something needs changing.';
  end if;

  return coalesce(new, old);
end;
$$;

revoke all on function private.guard_application_children() from public;

drop trigger if exists caregiver_experience_guard_lock on public.caregiver_experience;
create trigger caregiver_experience_guard_lock
  before insert or update or delete on public.caregiver_experience
  for each row execute function private.guard_application_children();

drop trigger if exists caregiver_references_guard_lock on public.caregiver_references;
create trigger caregiver_references_guard_lock
  before insert or update or delete on public.caregiver_references
  for each row execute function private.guard_application_children();
