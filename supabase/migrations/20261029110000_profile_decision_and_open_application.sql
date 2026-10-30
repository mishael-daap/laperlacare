-- The profile is decided once. The credentials are decided forever.
--
-- Two things change here, and they are the same idea from two sides.
--
-- 1. The application stops locking. A caregiver can edit their answers at any
--    time; what they cannot do is leave an edit unsigned. Changing an attested
--    answer clears the signature and clears `submitted_at`, so the application
--    drops back into the review queue on its own and an admin always reads the
--    current version. No return flow, no admin round trip for a typo.
--
-- 2. A rejected credential stops condemning the person. Until now any live
--    document with `review_status = 'rejected'` made the whole caregiver
--    rejected, so an out-of-date CPR card read as "this caregiver is not
--    approved" — which is not what an admin decided. The admin decides the
--    profile once, at onboarding, on the strength of the background check. After
--    that each credential is approved or rejected on its own and says so on its
--    own row.
--
-- So `caregiver_status` stops being derived from documents entirely. It is a
-- decision an admin recorded, and the two decisions an admin can record are
-- approve and decline.

-- ---------------------------------------------------------------------------
-- The profile decision
-- ---------------------------------------------------------------------------

-- `approved_at` is written once and never cleared: a caregiver who later lets a
-- CPR card expire is still a caregiver we vetted, and demoting them to
-- unapproved would be pretending we never checked.
--
-- `declined_at` is separate rather than the absence of an approval, because
-- "we have not decided" and "we decided no" are different, and the review queue
-- only makes sense if it can tell them apart.
alter table public.caregivers add column if not exists approved_at  timestamptz;
alter table public.caregivers add column if not exists approved_by  uuid references auth.users (id) on delete set null;
alter table public.caregivers add column if not exists declined_at  timestamptz;
alter table public.caregivers add column if not exists declined_by  uuid references auth.users (id) on delete set null;
alter table public.caregivers add column if not exists declined_reason text;

alter table public.caregivers drop constraint if exists caregivers_declined_reason_check;
alter table public.caregivers
  add constraint caregivers_declined_reason_check
  check (coalesce(char_length(declined_reason), 0) <= 1000);

-- A decision is one or the other, never both.
alter table public.caregivers drop constraint if exists caregivers_single_decision_check;
alter table public.caregivers
  add constraint caregivers_single_decision_check
  check (approved_at is null or declined_at is null);

-- ---------------------------------------------------------------------------
-- The status, decided rather than derived
-- ---------------------------------------------------------------------------

-- Kept as a function so every existing caller — the public catalogue policy, the
-- admin directory, the admin counts — keeps working unchanged.
create or replace function private.caregiver_status(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when c.declined_at is not null then 'rejected'
    when c.approved_at is not null then 'approved'
    when c.submitted_at is not null then 'pending'
    -- Signed out, or never signed. The admin directory counts these as
    -- onboarding, which is what `submitted_at is null` already meant.
    else 'pending'
  end
  from public.caregivers c
  where c.user_id = p_user_id;
$$;

-- The catalogue rule is unchanged in shape: only an approved profile is public.
create or replace function private.caregiver_is_public(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.caregivers c
    where c.user_id = p_user_id
      and c.approved_at is not null
      and c.declined_at is null
  );
$$;

revoke all on function private.caregiver_is_public(uuid) from public;
grant execute on function private.caregiver_is_public(uuid) to anon, authenticated;

drop policy if exists "approved caregivers are public" on public.caregivers;
create policy "approved caregivers are public"
  on public.caregivers for select
  to anon, authenticated
  using (
    private.caregiver_is_public(user_id)
    or user_id = (select auth.uid())
  );

drop policy if exists "availability of approved caregivers is public"
  on public.caregiver_availability;
create policy "availability of approved caregivers is public"
  on public.caregiver_availability for select
  to anon, authenticated
  using (
    caregiver_id = (select auth.uid())
    or private.caregiver_is_public(caregiver_id)
  );

drop policy if exists "a member may read an approved caregiver's contacts" on public.contacts;
create policy "a member may read an approved caregiver's contacts"
  on public.contacts for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (
      (select private.current_household_id()) is not null
      and private.caregiver_is_public(contacts.user_id)
    )
  );

-- ---------------------------------------------------------------------------
-- The lock goes
-- ---------------------------------------------------------------------------

drop trigger if exists caregivers_guard_application_lock on public.caregivers;
drop trigger if exists caregiver_experience_guard_lock on public.caregiver_experience;
drop trigger if exists caregiver_references_guard_lock on public.caregiver_references;

drop function if exists private.guard_application_lock();
drop function if exists private.guard_application_children();
drop function if exists private.application_locked(uuid);

-- The return flow goes with it. Nothing is ever "returned for correction" when
-- the caregiver can correct it themselves.
drop function if exists public.admin_return_caregiver_application(uuid, text);

alter table public.caregivers drop column if exists returned_at;
alter table public.caregivers drop column if exists returned_reason;

-- ---------------------------------------------------------------------------
-- An edit clears the signature
-- ---------------------------------------------------------------------------

-- The statement says the answers are true. Change an answer and the attestation
-- is about a different application, so it is cleared rather than quietly kept.
--
-- Clearing `submitted_at` as well is what puts the edit back in the admin's
-- queue without anybody pressing anything: the directory's Onboarding bucket is
-- `submitted_at is null`, so an edited application reappears there until it is
-- signed again.
--
-- A signed-in caregiver cannot do this by hand either — the columns are
-- overwritten by this trigger on the way through, whatever the statement said.
create or replace function private.clear_signature_on_edit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- The signature's own write is exempt: a submission changes the signature
  -- columns and nothing else, and must not clear itself.
  if new.signature_name is not null
     and old.signature_name is distinct from new.signature_name then
    return new;
  end if;

  if new.legal_name              is distinct from old.legal_name
  or new.address_street          is distinct from old.address_street
  or new.address_city            is distinct from old.address_city
  or new.address_postal_code     is distinct from old.address_postal_code
  or new.referral_source         is distinct from old.referral_source
  or new.conditions              is distinct from old.conditions
  or new.other_condition         is distinct from old.other_condition
  or new.why_special_needs       is distinct from old.why_special_needs
  or new.difficult_moment        is distinct from old.difficult_moment
  or new.background_check_agreed is distinct from old.background_check_agreed
  then
    new.signature_name           := null;
    new.signed_at                := null;
    new.signed_statement_version := null;
    new.signed_ip                := null;
    new.signed_user_agent        := null;
    new.submitted_at             := null;
  end if;

  return new;
end;
$$;

revoke all on function private.clear_signature_on_edit() from public;

drop trigger if exists caregivers_clear_signature on public.caregivers;
create trigger caregivers_clear_signature
  before update on public.caregivers
  for each row execute function private.clear_signature_on_edit();

-- The two list tables are part of the application too, so a changed role or a
-- changed reference clears it the same way. This is why the function is
-- SECURITY DEFINER: the write is to a row the caller is allowed to update, but
-- the trigger runs without a policy of its own.
create or replace function private.clear_signature_on_child_edit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := coalesce(new.caregiver_id, old.caregiver_id);
begin
  update public.caregivers
  set signature_name           = null,
      signed_at                = null,
      signed_statement_version = null,
      signed_ip                = null,
      signed_user_agent        = null,
      submitted_at             = null
  where user_id = owner_id
    and signature_name is not null;

  return coalesce(new, old);
end;
$$;

revoke all on function private.clear_signature_on_child_edit() from public;

drop trigger if exists caregiver_experience_clear_signature on public.caregiver_experience;
create trigger caregiver_experience_clear_signature
  after insert or update or delete on public.caregiver_experience
  for each row execute function private.clear_signature_on_child_edit();

drop trigger if exists caregiver_references_clear_signature on public.caregiver_references;
create trigger caregiver_references_clear_signature
  after insert or update or delete on public.caregiver_references
  for each row execute function private.clear_signature_on_child_edit();
