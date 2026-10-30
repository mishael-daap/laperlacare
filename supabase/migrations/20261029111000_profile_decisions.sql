-- The writers that follow from the decision split.
--
-- Run order: submission (rewritten, because the columns it used to clear are
-- gone), then the two profile decisions, then the detail function that reports
-- them.

-- ---------------------------------------------------------------------------
-- Submit
-- ---------------------------------------------------------------------------

-- Unchanged in what it checks and what it records, minus the return columns.
--
-- It is still the only place a signature is written, and it still refuses while
-- an answer is missing. What changed is what a refusal costs: an application can
-- be edited freely now, so the nine checks below are a checklist rather than a
-- door that locks behind you.
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

  headers := coalesce(nullif(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  agent   := nullif(headers ->> 'user-agent', '');

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
      -- A new submission withdraws an earlier decline. Somebody who was turned
      -- down and has since fixed what we asked about is a new application.
      declined_at              = null,
      declined_by              = null,
      declined_reason          = null
  where user_id = caller;
end;
$$;

revoke all on function public.submit_caregiver_application(text, text) from public;
revoke all on function public.submit_caregiver_application(text, text) from anon;
grant execute on function public.submit_caregiver_application(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Approve the profile, once
-- ---------------------------------------------------------------------------

-- The decision the paper form calls "Approved". It is made once, on the strength
-- of a background check, and it is not revisited when a CPR card later expires —
-- a caregiver we vetted stays a caregiver we vetted.
--
-- The background check requirement lives here rather than in the status rule,
-- because it is a condition on making the decision, not on what the decision
-- means afterwards. A profile cannot be approved without a cleared check; once
-- approved, the check falling out of date does not silently un-approve anybody.
create or replace function public.admin_approve_caregiver(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if not private.is_admin() then
    raise exception 'not authorized';
  end if;

  if not exists (
    select 1
    from public.caregiver_documents d
    where d.caregiver_id = p_user_id
      and d.kind = 'background_check'
      and d.review_status = 'approved'
      and (d.expires_at is null or d.expires_at >= current_date)
  ) then
    raise exception 'approve the background check before approving the profile';
  end if;

  update public.caregivers
  set approved_at = coalesce(approved_at, now()),
      approved_by = coalesce(approved_by, caller),
      declined_at = null,
      declined_by = null,
      declined_reason = null
  where user_id = p_user_id;

  if not found then
    raise exception 'no such caregiver';
  end if;
end;
$$;

revoke all on function public.admin_approve_caregiver(uuid) from public;
revoke all on function public.admin_approve_caregiver(uuid) from anon;
grant execute on function public.admin_approve_caregiver(uuid) to authenticated;

-- The other decision the form offers. Reversible only by the caregiver
-- submitting again, which clears it.
create or replace function public.admin_decline_caregiver(
  p_user_id uuid,
  p_reason  text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
begin
  if not private.is_admin() then
    raise exception 'not authorized';
  end if;

  if nullif(btrim(coalesce(p_reason, '')), '') is null then
    raise exception 'say why';
  end if;

  update public.caregivers
  set declined_at     = now(),
      declined_by     = caller,
      declined_reason = btrim(p_reason)
  where user_id = p_user_id
    -- An approval is not undone by a decline. If we vetted them, the answer to
    -- "may they be listed" was yes.
    and approved_at is null;

  if not found then
    raise exception 'this caregiver is approved, or does not exist';
  end if;
end;
$$;

revoke all on function public.admin_decline_caregiver(uuid, text) from public;
revoke all on function public.admin_decline_caregiver(uuid, text) from anon;
grant execute on function public.admin_decline_caregiver(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- The detail function reports the decision
-- ---------------------------------------------------------------------------

drop function if exists public.admin_caregiver_detail(uuid);

create function public.admin_caregiver_detail(p_user_id uuid)
returns table (
  user_id             uuid,
  display_name        text,
  email               text,
  bio                 text,
  avatar_path         text,
  verification_status text,
  date_of_birth       date,
  gender              text,
  age_min             smallint,
  age_max             smallint,
  submitted_at        timestamptz,
  created_at          timestamptz,
  need_slugs          text[],
  support_slugs       text[],
  hourly_rate          integer,
  counties             text[],
  other_county         text,
  regional_center_worker boolean,
  regional_center_name text,
  earliest_start_date  date,
  languages            text[],
  other_language       text,
  car_and_insurance    boolean,
  willing_to_drive     boolean,
  max_travel_miles     smallint,
  pets                 text,
  non_smoker           boolean,
  legal_name           text,
  address_street       text,
  address_city         text,
  address_postal_code  text,
  referral_source      text,
  conditions           text[],
  other_condition      text,
  why_special_needs    text,
  difficult_moment     text,
  background_check_agreed boolean,
  signature_name           text,
  signed_at                timestamptz,
  signed_statement_version text,
  interviewed_at       timestamptz,
  interview_outcome    text,
  trustline_status     text,
  -- the decision
  approved_at          timestamptz,
  approved_by          uuid,
  declined_at          timestamptz,
  declined_reason      text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select
    c.user_id,
    c.display_name,
    u.email::text,
    c.bio,
    c.avatar_path,
    private.caregiver_status(c.user_id),
    c.date_of_birth,
    c.gender,
    c.age_min,
    c.age_max,
    c.submitted_at,
    c.created_at,
    coalesce(
      (
        select array_agg(n.slug order by n.position)
        from public.caregiver_needs cn
        join public.needs n on n.id = cn.need_id
        where cn.caregiver_id = c.user_id
      ),
      '{}'
    ),
    coalesce(
      (
        select array_agg(s.slug order by s.position)
        from public.caregiver_supports cs
        join public.supports s on s.id = cs.support_id
        where cs.caregiver_id = c.user_id
      ),
      '{}'
    ),
    c.hourly_rate,
    c.counties,
    c.other_county,
    c.regional_center_worker,
    c.regional_center_name,
    c.earliest_start_date,
    c.languages,
    c.other_language,
    c.car_and_insurance,
    c.willing_to_drive,
    c.max_travel_miles,
    c.pets,
    c.non_smoker,
    c.legal_name,
    c.address_street,
    c.address_city,
    c.address_postal_code,
    c.referral_source,
    c.conditions,
    c.other_condition,
    c.why_special_needs,
    c.difficult_moment,
    c.background_check_agreed,
    c.signature_name,
    c.signed_at,
    c.signed_statement_version,
    c.interviewed_at,
    c.interview_outcome,
    c.trustline_status,
    c.approved_at,
    c.approved_by,
    c.declined_at,
    c.declined_reason
  from public.caregivers c
  join auth.users u on u.id = c.user_id
  where c.user_id = p_user_id;
end;
$$;

revoke all on function public.admin_caregiver_detail(uuid) from public;
revoke all on function public.admin_caregiver_detail(uuid) from anon;
grant execute on function public.admin_caregiver_detail(uuid) to authenticated;
