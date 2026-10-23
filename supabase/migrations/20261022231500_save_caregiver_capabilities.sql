-- Saving everything a caregiver can take on, in one transaction.
--
-- A server action cannot wrap five writes in a transaction through the Data API.
-- This function can. It is SECURITY INVOKER on purpose: RLS stays in force, and
-- the caregiver is resolved from the caller rather than accepted as an argument,
-- so it cannot be pointed at somebody else's row.
--
-- The two tag sets are replaced rather than diffed, the same way a child's are.
-- Slugs are validated rather than silently ignored: an unknown slug is a caller
-- bug, and a save that quietly drops half the selection is worse than an error.

create or replace function public.save_caregiver_capabilities(
  p_needs        text[]   default '{}',
  p_supports     text[]   default '{}',
  p_date_of_birth date    default null,
  p_gender       text     default null,
  p_age_min      smallint default null,
  p_age_max      smallint default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  unknown_slug text;
begin
  if caller is null then
    raise exception 'not authenticated';
  end if;

  -- The caller must already be a caregiver. Signing up creates the row; this
  -- function never does, so a parent cannot promote themselves by calling it.
  if not exists (select 1 from public.caregivers where user_id = caller) then
    raise exception 'no caregiver profile for this account';
  end if;

  if p_date_of_birth is not null and p_date_of_birth > current_date then
    raise exception 'date of birth cannot be in the future';
  end if;

  if p_gender is not null
     and p_gender not in ('female', 'male', 'nonbinary', 'prefer_not_to_say') then
    raise exception 'unknown gender: %', p_gender;
  end if;

  -- Both bounds or neither. Half a range cannot be compared with anything.
  if (p_age_min is null) <> (p_age_max is null) then
    raise exception 'an age range needs both a minimum and a maximum';
  end if;

  if p_age_min is not null and (p_age_min < 0 or p_age_max > 21) then
    raise exception 'an age range must sit between 0 and 21';
  end if;

  if p_age_min is not null and p_age_max < p_age_min then
    raise exception 'the maximum age cannot be below the minimum';
  end if;

  select s into unknown_slug
  from unnest(coalesce(p_needs, '{}')) as s
  where not exists (select 1 from public.needs n where n.slug = s)
  limit 1;

  if unknown_slug is not null then
    raise exception 'unknown need: %', unknown_slug;
  end if;

  select s into unknown_slug
  from unnest(coalesce(p_supports, '{}')) as s
  where not exists (select 1 from public.supports sp where sp.slug = s)
  limit 1;

  if unknown_slug is not null then
    raise exception 'unknown support: %', unknown_slug;
  end if;

  update public.caregivers
  set date_of_birth = p_date_of_birth,
      gender        = p_gender,
      age_min       = p_age_min,
      age_max       = p_age_max
  where user_id = caller;

  delete from public.caregiver_needs where caregiver_id = caller;
  delete from public.caregiver_supports where caregiver_id = caller;

  insert into public.caregiver_needs (caregiver_id, need_id)
  select caller, n.id
  from public.needs n
  where n.slug = any (coalesce(p_needs, '{}'));

  insert into public.caregiver_supports (caregiver_id, support_id)
  select caller, s.id
  from public.supports s
  where s.slug = any (coalesce(p_supports, '{}'));
end;
$$;

revoke all on function public.save_caregiver_capabilities(text[], text[], date, text, smallint, smallint) from public;
revoke all on function public.save_caregiver_capabilities(text[], text[], date, text, smallint, smallint) from anon;
grant execute on function public.save_caregiver_capabilities(text[], text[], date, text, smallint, smallint) to authenticated;
