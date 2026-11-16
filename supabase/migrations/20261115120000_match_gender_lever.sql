-- Corrective: the gender lever decides the rank, not just the household.
--
-- `20261101102000` made a stated gender a rank instead of a filter, but it kept
-- comparing against the household's saved preference. Choosing `Male` in the
-- levers therefore left a female caregiver at Great fit and printed "Female, as
-- you asked" — the lever changed nothing and the card contradicted the URL.
--
-- The asked-for gender is now the effective preference: `Any` ranks everyone
-- Great and says nothing; `Female` / `Male` rank a mismatch down to Good and
-- say who was asked for. A household preference of `no_preference` still means
-- no gender line at all.

create or replace function public.match_caregivers(
  p_hours    text    default 'exact',
  p_partial  boolean default false,
  p_max_rate integer default null,
  p_gender   text    default 'household'
)
returns table (
  caregiver_id    uuid,
  display_name    text,
  avatar_path     text,
  bio             text,
  hourly_rate     integer,
  age_min         smallint,
  age_max         smallint,
  gender          text,
  languages       text[],
  counties        text[],
  needs_covered   smallint,
  needs_total     smallint,
  supports_covered smallint,
  supports_total  smallint,
  missing_needs   text[],
  missing_supports text[],
  overlap_minutes integer,
  window_minutes  integer,
  tier            text,
  reasons         text[],
  gaps            text[]
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  hh         uuid := (select private.current_household_id());
  v_needs    text[] := '{}';
  v_supports text[] := '{}';
  v_minutes  integer := 0;
  v_pref     text := 'no_preference';
  v_asked    text := 'no_preference';
  v_youngest integer;
  v_oldest   integer;
begin
  if hh is null then
    return;
  end if;

  if p_hours not in ('exact', 'flexible', 'day') then
    raise exception 'unknown hours option: %', p_hours;
  end if;

  if p_gender not in ('household', 'any', 'female', 'male') then
    raise exception 'unknown gender option: %', p_gender;
  end if;

  if p_max_rate is not null and p_max_rate <= 0 then
    raise exception 'max rate must be positive';
  end if;

  select coalesce(array_agg(distinct n.slug), '{}')
    into v_needs
  from public.children ch
    join public.child_needs cn on cn.child_id = ch.id
    join public.needs n on n.id = cn.need_id
  where ch.household_id = hh;

  select coalesce(array_agg(distinct s.slug), '{}')
    into v_supports
  from public.children ch
    join public.child_supports cs on cs.child_id = ch.id
    join public.supports s on s.id = cs.support_id
  where ch.household_id = hh;

  select coalesce(sum((extract(epoch from (w.end_time - w.start_time)) / 60)::integer), 0)
    into v_minutes
  from public.household_availability w
  where w.household_id = hh;

  -- Nothing to match against yet. An empty list is the honest answer; the page
  -- is gated on a care window, so this is a guard rather than a state.
  if v_minutes = 0 then
    return;
  end if;

  select h.preferred_caregiver_gender
    into v_pref
  from public.households h
  where h.id = hh;

  -- The lever wins over the saved preference. `any` is not a preference at all,
  -- so it is carried through and short-circuits the tier and the reason.
  v_asked := case
    when p_gender in ('female', 'male') then p_gender
    when p_gender = 'any' then 'any'
    else coalesce(v_pref, 'no_preference')
  end;

  select min(floor(extract(year from age(current_date, ch.date_of_birth))))::integer,
         max(floor(extract(year from age(current_date, ch.date_of_birth))))::integer
    into v_youngest, v_oldest
  from public.children ch
  where ch.household_id = hh
    and ch.date_of_birth is not null;

  return query
  with windows as (
    select w.day_of_week,
           w.start_time,
           w.end_time,
           (extract(epoch from (w.end_time - w.start_time)) / 60)::integer as minutes,
           -- A flexible window is scanned an hour wide at each end; the covered
           -- total is still capped at the window, so an hour of slack can never
           -- count as an hour of care.
           case when p_hours = 'flexible'
                then w.start_time - interval '1 hour'
                else w.start_time end as scan_start,
           case when p_hours = 'flexible'
                then w.end_time + interval '1 hour'
                else w.end_time end as scan_end,
           trim(to_char(date '2026-01-05' + (w.day_of_week - 1), 'FMDay'))
             || ' ' || to_char(w.start_time, 'HH24:MI')
             || '–' || to_char(w.end_time, 'HH24:MI') as label
    from public.household_availability w
    where w.household_id = hh
  ),
  per_window as (
    select c.user_id,
           w.day_of_week,
           w.start_time,
           w.minutes,
           w.label,
           case
             when p_hours = 'day' then
               case when coalesce(block.covered, 0) > 0 then w.minutes else 0 end
             else least(w.minutes, coalesce(block.covered, 0)::integer)
           end as covered
    from public.caregivers c
      cross join windows w
      left join lateral (
        select sum(
                 greatest(
                   0,
                   extract(epoch from (
                     least(w.scan_end, a.end_time) - greatest(w.scan_start, a.start_time)
                   )) / 60
                 )
               ) as covered
        from public.caregiver_availability a
        where a.caregiver_id = c.user_id
          and a.day_of_week = w.day_of_week
          and a.start_time < w.scan_end
          and a.end_time > w.scan_start
      ) block on true
  ),
  coverage as (
    select pw.user_id,
           coalesce(sum(pw.covered), 0)::integer as overlap_minutes,
           coalesce(
             array_agg(pw.label order by pw.day_of_week, pw.start_time)
               filter (where pw.covered < pw.minutes),
             '{}'
           ) as missed_windows
    from per_window pw
    group by pw.user_id
  ),
  held as (
    select c.user_id,
           coalesce((
             select array_agg(n.slug)
             from public.caregiver_needs cn
               join public.needs n on n.id = cn.need_id
             where cn.caregiver_id = c.user_id
           ), '{}') as needs_have,
           coalesce((
             select array_agg(s.slug)
             from public.caregiver_supports cs
               join public.supports s on s.id = cs.support_id
             where cs.caregiver_id = c.user_id
           ), '{}') as supports_have
    from public.caregivers c
  ),
  scored as (
    select
      c.user_id,
      c.display_name,
      c.avatar_path,
      c.bio,
      c.hourly_rate,
      c.age_min,
      c.age_max,
      c.gender,
      c.languages,
      c.counties,
      coalesce(cov.overlap_minutes, 0) as overlap_minutes,
      coalesce(cov.missed_windows, '{}') as missed_windows,
      coalesce(array(
        select unnest(v_needs) except select unnest(h.needs_have)
      ), '{}') as missing_need_slugs,
      coalesce(array(
        select unnest(v_supports) except select unnest(h.supports_have)
      ), '{}') as missing_support_slugs,
      (select count(*) from (
        select unnest(v_needs) intersect select unnest(h.needs_have)
      ) x)::smallint as needs_covered,
      (select count(*) from (
        select unnest(v_supports) intersect select unnest(h.supports_have)
      ) x)::smallint as supports_covered,
      cardinality(v_needs)::smallint as needs_total,
      cardinality(v_supports)::smallint as supports_total,
      case
        when v_asked in ('any', 'no_preference') then true
        else c.gender = v_asked
      end as gender_ok
    from public.caregivers c
      join held h on h.user_id = c.user_id
      left join coverage cov on cov.user_id = c.user_id
    where private.caregiver_is_public(c.user_id)
      and c.display_name is not null
      and (p_max_rate is null
           or (c.hourly_rate is not null and c.hourly_rate <= p_max_rate))
      -- A stated gender is never a filter. Filtering on it hides the caregiver a
      -- family would have said yes to, which is the whole reason the tier below
      -- exists: a mismatch costs a rank and says so, and the family decides.
      -- Age is hard at every lever setting: a caregiver who does not work with
      -- this age does not work with this family.
      and (
        v_youngest is null
        or v_oldest is null
        or (c.age_min is not null
            and c.age_max is not null
            and v_youngest >= c.age_min
            and v_oldest <= c.age_max)
      )
  ),
  judged as (
    select
      s.*,
      (cardinality(s.missing_need_slugs) = 0
       and cardinality(s.missing_support_slugs) = 0) as facts_full,
      ((s.needs_covered + s.supports_covered) * 2
        >= (s.needs_total + s.supports_total)) as facts_half,
      (s.overlap_minutes >= v_minutes) as hours_full,
      (s.overlap_minutes > 0 and s.overlap_minutes * 2 >= v_minutes) as hours_half
    from scored s
  ),
  kept as (
    select j.*
    from judged j
    where (j.facts_full or (p_partial and j.facts_half))
      and (j.hours_full or (p_partial and j.hours_half))
  )
  select
    k.user_id,
    k.display_name,
    k.avatar_path,
    k.bio,
    k.hourly_rate,
    k.age_min,
    k.age_max,
    k.gender,
    k.languages,
    k.counties,
    k.needs_covered,
    k.needs_total,
    k.supports_covered,
    k.supports_total,
    coalesce((
      select array_agg(n.label order by n.position)
      from public.needs n
      where n.slug = any(k.missing_need_slugs)
    ), '{}') as missing_needs,
    coalesce((
      select array_agg(s.label order by s.position)
      from public.supports s
      where s.slug = any(k.missing_support_slugs)
    ), '{}') as missing_supports,
    k.overlap_minutes,
    v_minutes,
    case
      when k.facts_full and k.hours_full and k.gender_ok then 'great'
      when k.facts_full then 'good'
      else 'partial'
    end as tier,
    array_remove(array[
      case
        when k.hours_full then
          format('Covers all %s hours you need', v_minutes / 60)
        else
          format('Covers %s of %s hours you need',
                 round(k.overlap_minutes / 60.0), v_minutes / 60)
      end,
      case
        when k.needs_total = 0 then null
        when k.needs_covered = k.needs_total then 'Supports every need you listed'
        else format('Supports %s of %s needs', k.needs_covered, k.needs_total)
      end,
      case
        when k.supports_total = 0 then null
        when k.supports_covered = k.supports_total then 'Provides every kind of support you listed'
        else format('Provides %s of %s supports', k.supports_covered, k.supports_total)
      end,
      case
        when v_asked in ('any', 'no_preference') then null
        when k.gender = v_asked then format('%s, as you asked', initcap(k.gender))
        else format('%s — you asked for %s', initcap(k.gender), v_asked)
      end
    ], null) as reasons,
    array_cat(
      coalesce((
        select array_agg('No cover for ' || w order by w)
        from unnest(k.missed_windows) w
      ), '{}'),
      coalesce((
        select array_agg('Not cleared for ' || n.label order by n.position)
        from public.needs n
        where n.slug = any(k.missing_need_slugs)
      ), '{}')
    ) as gaps
  from kept k
  order by
    case
      when k.facts_full and k.hours_full and k.gender_ok then 0
      when k.facts_full then 1
      else 2
    end,
    k.overlap_minutes desc,
    k.hourly_rate asc nulls last,
    k.display_name asc;
end;
$$;

revoke all on function public.match_caregivers(text, boolean, integer, text) from public;
revoke all on function public.match_caregivers(text, boolean, integer, text) from anon;
grant execute on function public.match_caregivers(text, boolean, integer, text) to authenticated;
