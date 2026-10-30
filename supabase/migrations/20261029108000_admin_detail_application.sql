-- The detail function now carries the application.
--
-- The admin's review screen reads a caregiver's whole application: the work
-- details, the legal name and the address for a background check, the written
-- answers, and the signature record. The account email already forced this
-- function to exist — `auth.users` is not reachable through the Data API, so
-- there is one gated door and this is it. Everything else on the application
-- comes through the same door rather than opening six more tables to the admin
-- role.
--
-- Experience and references are *not* here. They are two child tables with their
-- own admin-free policies, and the review screen reads them directly: a function
-- returning two arrays of composite rows would be harder to type on the client
-- than two plain selects.
--
-- A changed return type cannot be replaced in place, so the function is dropped
-- and rebuilt with its grants.

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
  -- work details
  hourly_rate          integer,
  counties             text[],
  other_county         text,
  regional_center_worker boolean,
  regional_center_name text,
  earliest_start_date  date,
  -- languages
  languages            text[],
  other_language       text,
  -- transportation
  car_and_insurance    boolean,
  willing_to_drive     boolean,
  max_travel_miles     smallint,
  -- home environment
  pets                 text,
  non_smoker           boolean,
  -- the application
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
  -- the signature
  signature_name           text,
  signed_at                timestamptz,
  signed_statement_version text,
  -- the admin's own record
  interviewed_at       timestamptz,
  interview_outcome    text,
  trustline_status     text,
  returned_at          timestamptz,
  returned_reason      text
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
    c.returned_at,
    c.returned_reason
  from public.caregivers c
  join auth.users u on u.id = c.user_id
  where c.user_id = p_user_id;
end;
$$;

revoke all on function public.admin_caregiver_detail(uuid) from public;
revoke all on function public.admin_caregiver_detail(uuid) from anon;
grant execute on function public.admin_caregiver_detail(uuid) to authenticated;
