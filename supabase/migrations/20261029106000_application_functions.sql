-- The five writers the application needs.
--
-- Three are the caregiver's: replace the experience list, replace the references,
-- and submit. Two are the admin's: send it back, and record what happened on the
-- phone.
--
-- The experience and reference functions exist because a replace-set is a delete
-- and an insert, and a server action cannot wrap two statements in one
-- transaction through the Data API. Everything else on the application is a
-- single `update` on one row, which the action does directly — no function
-- needed, and no reason to route it through one.
--
-- `jsonb` appears here as a *parameter* only. It is a transport for one request,
-- not storage: nothing about the application is kept as a document.

-- ===========================================================================
-- Experience
-- ===========================================================================

create or replace function public.save_caregiver_experience(p_rows jsonb default '[]')
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null then
    raise exception 'not authenticated';
  end if;

  if not exists (select 1 from public.caregivers where user_id = caller) then
    raise exception 'no caregiver profile for this account';
  end if;

  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'experience must be a list';
  end if;

  -- Checked here rather than left to the not-null constraints, so the caregiver
  -- reads a sentence instead of a constraint name. The table still enforces
  -- every one of these; this is the message layer.
  if exists (
    select 1
    from jsonb_array_elements(p_rows) as e
    where nullif(btrim(coalesce(e ->> 'employer', '')), '') is null
       or nullif(btrim(coalesce(e ->> 'role', '')), '') is null
       or nullif(e ->> 'started_on', '') is null
  ) then
    raise exception 'every role needs an employer, a title and a start month';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_rows) as e
    where nullif(e ->> 'started_on', '')::date > current_date
  ) then
    raise exception 'a role cannot start in the future';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_rows) as e
    where nullif(coalesce(e ->> 'ended_on', ''), '') is not null
      and nullif(e ->> 'ended_on', '')::date < nullif(e ->> 'started_on', '')::date
  ) then
    raise exception 'a role cannot end before it starts';
  end if;

  delete from public.caregiver_experience where caregiver_id = caller;

  -- Position comes from the order of the list, not from the caller, so the page
  -- renders roles in the order they were entered without the client having to
  -- keep track of a number it could get wrong.
  insert into public.caregiver_experience (
    caregiver_id, employer, role, started_on, ended_on, ages_and_needs, position
  )
  select
    caller,
    btrim(e ->> 'employer'),
    btrim(e ->> 'role'),
    (e ->> 'started_on')::date,
    nullif(coalesce(e ->> 'ended_on', ''), '')::date,
    nullif(btrim(coalesce(e ->> 'ages_and_needs', '')), ''),
    ordinality::smallint
  from jsonb_array_elements(p_rows) with ordinality as t(e, ordinality);
end;
$$;

revoke all on function public.save_caregiver_experience(jsonb) from public;
revoke all on function public.save_caregiver_experience(jsonb) from anon;
grant execute on function public.save_caregiver_experience(jsonb) to authenticated;

-- ===========================================================================
-- References
-- ===========================================================================

-- Exactly two, as the form asks. Fewer is refused here rather than at submit, so
-- a caregiver finds out while they are on the section, and the partial save the
-- page does between edits cannot leave one orphaned.
create or replace function public.save_caregiver_references(p_rows jsonb default '[]')
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if caller is null then
    raise exception 'not authenticated';
  end if;

  if not exists (select 1 from public.caregivers where user_id = caller) then
    raise exception 'no caregiver profile for this account';
  end if;

  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'references must be a list';
  end if;

  -- An empty list is a legitimate intermediate state: a caregiver clears the
  -- section and starts again. Anything else has to be both of them.
  if jsonb_array_length(p_rows) not in (0, 2) then
    raise exception 'two references are needed, and only two';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_rows) as e
    where nullif(btrim(coalesce(e ->> 'full_name', '')), '') is null
       or nullif(btrim(coalesce(e ->> 'relationship', '')), '') is null
  ) then
    raise exception 'every reference needs a name and how they know you';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_rows) as e
    where nullif(btrim(coalesce(e ->> 'phone', '')), '') is null
      and nullif(btrim(coalesce(e ->> 'email', '')), '') is null
  ) then
    raise exception 'every reference needs a phone number or an email';
  end if;

  delete from public.caregiver_references where caregiver_id = caller;

  insert into public.caregiver_references (
    caregiver_id, full_name, relationship, organisation, phone, email, known_for, position
  )
  select
    caller,
    btrim(e ->> 'full_name'),
    btrim(e ->> 'relationship'),
    nullif(btrim(coalesce(e ->> 'organisation', '')), ''),
    nullif(btrim(coalesce(e ->> 'phone', '')), ''),
    nullif(btrim(coalesce(e ->> 'email', '')), ''),
    nullif(btrim(coalesce(e ->> 'known_for', '')), ''),
    ordinality::smallint
  from jsonb_array_elements(p_rows) with ordinality as t(e, ordinality);
end;
$$;

revoke all on function public.save_caregiver_references(jsonb) from public;
revoke all on function public.save_caregiver_references(jsonb) from anon;
grant execute on function public.save_caregiver_references(jsonb) to authenticated;

-- ===========================================================================
-- Submit
-- ===========================================================================

-- The only place a signature is written.
--
-- The signature *is* the submission: there is no submitted-but-unsigned state,
-- which is why this function both records the attestation and sets
-- `submitted_at`. Doing it in one statement matters — a submission without a
-- signature would be a form nobody swore to.
--
-- The IP and user agent come from the request headers PostgREST already carries.
-- They are read rather than accepted as arguments because a client that could
-- name its own address would defeat the point of recording it.
--
-- The statement version is an argument, not a constant, because the wording
-- lives in `src/lib/caregiver/application-statement.ts` and the record has to
-- say which wording was on screen when the name was typed.
create or replace function public.submit_caregiver_application(
  p_signature_name text,
  p_statement_version text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  caller  uuid := (select auth.uid());
  profile public.caregivers%rowtype;
  headers jsonb;
  ip      inet;
  agent   text;
begin
  if caller is null then
    raise exception 'not authenticated';
  end if;

  select * into profile from public.caregivers where user_id = caller;

  if not found then
    raise exception 'no caregiver profile for this account';
  end if;

  -- The order of these checks is the order the page asks the questions, so the
  -- first thing named is the first thing the caregiver would go back to.
  if profile.date_of_birth is null then
    raise exception 'add your date of birth to your profile before applying';
  end if;

  if profile.date_of_birth > (current_date - interval '18 years')::date then
    raise exception 'you must be 18 or older to apply';
  end if;

  if nullif(btrim(coalesce(profile.legal_name, '')), '') is null then
    raise exception 'add your full legal name';
  end if;

  if not exists (
    select 1 from public.caregiver_experience where caregiver_id = caller
  ) then
    raise exception 'add at least one role to your experience';
  end if;

  if (select count(*) from public.caregiver_references where caregiver_id = caller) <> 2 then
    raise exception 'add both of your references';
  end if;

  if coalesce(array_length(profile.conditions, 1), 0) = 0 then
    raise exception 'tick at least one area you have worked with';
  end if;

  if nullif(btrim(coalesce(profile.why_special_needs, '')), '') is null
     or nullif(btrim(coalesce(profile.difficult_moment, '')), '') is null then
    raise exception 'answer both questions';
  end if;

  if not profile.background_check_agreed then
    raise exception 'agree to the background check';
  end if;

  if nullif(btrim(coalesce(p_signature_name, '')), '') is null then
    raise exception 'type your name to sign';
  end if;

  if nullif(btrim(coalesce(p_statement_version, '')), '') is null then
    raise exception 'the statement version is missing';
  end if;

  -- The headers are a JSON string when present and absent in a background
  -- context, which is why the setting is read with `true` (missing is null
  -- rather than an error) and coalesced.
  headers := coalesce(nullif(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  agent   := nullif(headers ->> 'user-agent', '');

  -- A malformed address must not block a submission. The record is worth having
  -- when it is there; it is not worth failing a signature over.
  begin
    ip := nullif(split_part(coalesce(headers ->> 'x-forwarded-for', ''), ',', 1), '')::inet;
  exception
    when others then ip := null;
  end;

  update public.caregivers
  set signature_name           = btrim(p_signature_name),
      signed_at                = now(),
      signed_statement_version = btrim(p_statement_version),
      signed_ip                = ip,
      signed_user_agent        = agent,
      submitted_at             = now(),
      returned_at              = null,
      returned_reason          = null
  where user_id = caller;
end;
$$;

revoke all on function public.submit_caregiver_application(text, text) from public;
revoke all on function public.submit_caregiver_application(text, text) from anon;
grant execute on function public.submit_caregiver_application(text, text) to authenticated;

-- ===========================================================================
-- Admin: return it, and record what happened offline
-- ===========================================================================

-- Returning is what unlocks the application. It does not clear the signature
-- itself — that happens on the next submission, which re-stamps it — but the
-- answer it attested to may well have changed in between, so the page asks for
-- it again on the way back in.
create or replace function public.admin_return_caregiver_application(
  p_user_id uuid,
  p_reason  text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'not authorized';
  end if;

  if nullif(btrim(coalesce(p_reason, '')), '') is null then
    raise exception 'say what needs changing';
  end if;

  update public.caregivers
  set returned_at     = now(),
      returned_reason = btrim(p_reason)
  where user_id = p_user_id;

  if not found then
    raise exception 'no such caregiver';
  end if;
end;
$$;

revoke all on function public.admin_return_caregiver_application(uuid, text) from public;
revoke all on function public.admin_return_caregiver_application(uuid, text) from anon;
grant execute on function public.admin_return_caregiver_application(uuid, text) to authenticated;

-- The interview and the TrustLine answer are the only two steps of the paper
-- form's review panel that no row can answer. Reference checks write themselves
-- onto the reference rows; everything else reads off a credential.
--
-- Coalesced rather than required, because an admin fills this in across two
-- sittings — the interview happens on Tuesday and the TrustLine answer may
-- arrive a fortnight later.
create or replace function public.admin_set_application_record(
  p_user_id         uuid,
  p_interviewed_at  timestamptz default null,
  p_interview_outcome text     default null,
  p_trustline_status  text     default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'not authorized';
  end if;

  update public.caregivers
  set interviewed_at    = coalesce(p_interviewed_at, interviewed_at),
      interview_outcome = coalesce(p_interview_outcome, interview_outcome),
      trustline_status  = coalesce(p_trustline_status, trustline_status)
  where user_id = p_user_id;

  if not found then
    raise exception 'no such caregiver';
  end if;
end;
$$;

revoke all on function public.admin_set_application_record(uuid, timestamptz, text, text) from public;
revoke all on function public.admin_set_application_record(uuid, timestamptz, text, text) from anon;
grant execute on function public.admin_set_application_record(uuid, timestamptz, text, text) to authenticated;
