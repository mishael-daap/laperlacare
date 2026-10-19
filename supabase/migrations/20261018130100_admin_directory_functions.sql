-- The admin directory: list, filter, search, and counts in SQL.
--
-- Why a function rather than a view or a plain table query:
--
--   1. The account email lives in auth.users, which the Data API never exposes.
--      A view owned by postgres would read it, but any role granted select on
--      the view would then read every row of it — RLS on the underlying table
--      does not apply to a view running as its owner. A function can check the
--      caller and refuse before returning anything.
--   2. Filtering, searching, and paging all have to happen before the rows
--      leave the database. Doing it in the browser would mean fetching every
--      caregiver, and the email is not available to the browser anyway.
--
-- Both functions sit in public because that is the only schema the Data API
-- exposes. That does not make them open: each raises for anybody who is not an
-- admin, and EXECUTE is revoked from PUBLIC and granted only to authenticated.

create or replace function public.admin_caregiver_directory(
  p_status text default 'all',
  p_query  text default null,
  p_limit  int  default 25,
  p_offset int  default 0
)
returns table (
  user_id             uuid,
  display_name        text,
  email               text,
  verification_status text,
  submitted_at        timestamptz,
  created_at          timestamptz,
  total_count         bigint
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

  -- An unknown bucket is a bug in the caller, not a request for everything.
  -- Silently falling back to "all" would hide it behind a page that looks fine.
  if p_status not in ('all', 'onboarding', 'pending', 'approved', 'rejected') then
    raise exception 'unknown status bucket: %', p_status;
  end if;

  return query
  select
    c.user_id,
    c.display_name,
    u.email::text,
    c.verification_status,
    c.submitted_at,
    c.created_at,
    count(*) over () as total_count
  from public.caregivers c
  join auth.users u on u.id = c.user_id
  where
    -- The buckets are disjoint. Onboarding and Pending both mean "no decision
    -- yet", split by whether a background check has been submitted; Approved
    -- and Rejected ignore submitted_at entirely.
    case p_status
      when 'onboarding' then c.submitted_at is null
      when 'pending'    then c.submitted_at is not null and c.verification_status = 'pending'
      when 'approved'   then c.verification_status = 'approved'
      when 'rejected'   then c.verification_status = 'rejected'
      else true
    end
    and (
      p_query is null
      or trim(p_query) = ''
      or c.display_name ilike '%' || p_query || '%'
      or u.email ilike '%' || p_query || '%'
      or exists (
        select 1
        from public.contacts ct
        where ct.user_id = c.user_id
          and (
            ct.phone ilike '%' || p_query || '%'
            or ct.email ilike '%' || p_query || '%'
          )
      )
    )
  -- Newest submission first. Caregivers who have not submitted fall to the end
  -- on their created date, which is where a half-built profile belongs.
  order by c.submitted_at desc nulls last, c.created_at desc
  limit greatest(p_limit, 1)
  offset greatest(p_offset, 0);
end;
$$;

revoke all on function public.admin_caregiver_directory(text, text, int, int) from public;
revoke all on function public.admin_caregiver_directory(text, text, int, int) from anon;
grant execute on function public.admin_caregiver_directory(text, text, int, int) to authenticated;

-- The five numbers on the filter buttons.
--
-- Kept separate from the directory so the list can be paged without the counts
-- changing per page. All five are counted in one pass; five round trips to
-- count five predicates would be five scans of the same table.
create or replace function public.admin_caregiver_counts()
returns table (
  total_count      bigint,
  onboarding_count bigint,
  pending_count    bigint,
  approved_count   bigint,
  rejected_count   bigint
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
    count(*),
    count(*) filter (where c.submitted_at is null),
    count(*) filter (where c.submitted_at is not null and c.verification_status = 'pending'),
    count(*) filter (where c.verification_status = 'approved'),
    count(*) filter (where c.verification_status = 'rejected')
  from public.caregivers c;
end;
$$;

revoke all on function public.admin_caregiver_counts() from public;
revoke all on function public.admin_caregiver_counts() from anon;
grant execute on function public.admin_caregiver_counts() to authenticated;
