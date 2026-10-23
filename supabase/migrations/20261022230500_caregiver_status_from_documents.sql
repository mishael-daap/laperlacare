-- The caregiver's verified status becomes a question, not a column.
--
-- Until now an admin pressed Approve and that set `verification_status` on the
-- caregiver. Documents were uploaded and never looked at individually, so the
-- badge could say Approved while the only file on record had been rejected.
--
-- This migration reverses that: the status is calculated from the documents
-- every time it is read. Any document rejected means rejected; at least one
-- document with all of them approved and unexpired means approved; anything
-- else, including nothing at all, means pending.
--
-- Deriving it also removes three pieces of machinery that existed only to keep a
-- stored copy honest: the guard trigger that stopped caregivers approving
-- themselves, the reset trigger that returned a caregiver to pending when a
-- background check was replaced, and the timer expiry would otherwise need.
-- None of them can drift out of step with a value that is never written.

-- ---------------------------------------------------------------------------
-- The rule
-- ---------------------------------------------------------------------------

-- SECURITY DEFINER because the rule has to read documents regardless of who is
-- asking — an anonymous visitor asks it through the catalogue policy below. It
-- returns one word and never a document, so nothing leaks through it.
create or replace function private.caregiver_status(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    -- A rejection is the one thing that cannot be argued with. It outranks a
    -- set of approvals, because a caregiver holding a rejected CPR card is not
    -- verified whatever else they hold.
    when exists (
      select 1
      from public.caregiver_documents d
      where d.caregiver_id = p_user_id
        and d.review_status = 'rejected'
    ) then 'rejected'

    -- Approved means every live document is approved and none has expired.
    -- Expiry is compared here rather than by a scheduled job, so a card that
    -- runs out overnight stops counting the next time anybody looks.
    when exists (
      select 1
      from public.caregiver_documents d
      where d.caregiver_id = p_user_id
    ) and not exists (
      select 1
      from public.caregiver_documents d
      where d.caregiver_id = p_user_id
        and (
          d.review_status <> 'approved'
          or (d.expires_at is not null and d.expires_at < current_date)
        )
    ) then 'approved'

    else 'pending'
  end;
$$;

revoke all on function private.caregiver_status(uuid) from public;
grant execute on function private.caregiver_status(uuid) to anon, authenticated;

-- The caregiver's own answer, for their profile page. Null for anybody who is
-- not a caregiver, so a parent is not told they are "pending".
create or replace function public.my_caregiver_status()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select case
    when exists (
      select 1 from public.caregivers c where c.user_id = (select auth.uid())
    ) then private.caregiver_status((select auth.uid()))
  end;
$$;

revoke all on function public.my_caregiver_status() from public;
revoke all on function public.my_caregiver_status() from anon;
grant execute on function public.my_caregiver_status() to authenticated;

-- ---------------------------------------------------------------------------
-- Policies that read the column have to go first
-- ---------------------------------------------------------------------------

drop policy if exists "approved caregivers are public" on public.caregivers;
drop policy if exists "availability of approved caregivers is public"
  on public.caregiver_availability;
drop policy if exists "a member may read an approved caregiver's contacts"
  on public.contacts;

-- There is no status for an admin to decide any more. The read policies stay:
-- reviewing documents still needs sight of the caregiver and their contacts.
drop policy if exists "an admin may decide on a caregiver" on public.caregivers;

-- ---------------------------------------------------------------------------
-- The machinery a stored status needed
-- ---------------------------------------------------------------------------

drop trigger if exists caregivers_guard_verification on public.caregivers;
drop trigger if exists caregiver_documents_reset_verification
  on public.caregiver_documents;

drop function if exists private.guard_caregiver_verification();
drop function if exists private.reset_verification_on_new_document();

-- ---------------------------------------------------------------------------
-- Columns
-- ---------------------------------------------------------------------------

-- reviewed_by and reviewed_at described a decision about a person. The decision
-- is now about each document, where the same columns already exist and are
-- finally used.
alter table public.caregivers drop column if exists verification_status;
alter table public.caregivers drop column if exists reviewed_by;
alter table public.caregivers drop column if exists reviewed_at;

-- ---------------------------------------------------------------------------
-- Policies rebuilt on the rule
-- ---------------------------------------------------------------------------

create policy "approved caregivers are public"
  on public.caregivers for select
  to anon, authenticated
  using (
    private.caregiver_status(user_id) = 'approved'
    or user_id = (select auth.uid())
  );

-- Same shape as before: readable where the caregiver is approved. The existence
-- of the caregivers row is still implied by the foreign key.
create policy "availability of approved caregivers is public"
  on public.caregiver_availability for select
  to anon, authenticated
  using (
    caregiver_id = (select auth.uid())
    or private.caregiver_status(caregiver_id) = 'approved'
  );

-- Contact details are the thing membership buys, so they stay limited to the
-- caregiver themselves, an admin, and members looking at an approved caregiver.
create policy "a member may read an approved caregiver's contacts"
  on public.contacts for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (
      (select private.current_household_id()) is not null
      and exists (
        select 1 from public.caregivers c
        where c.user_id = contacts.user_id
          and private.caregiver_status(c.user_id) = 'approved'
      )
    )
  );

-- ---------------------------------------------------------------------------
-- The admin directory, against the rule
-- ---------------------------------------------------------------------------

-- The return shape is unchanged, so this can replace the function in place.
-- status is computed once per row through a lateral join rather than repeated in
-- the select, the filter, and the order by.
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

  if p_status not in ('all', 'onboarding', 'pending', 'approved', 'rejected') then
    raise exception 'unknown status bucket: %', p_status;
  end if;

  return query
  select
    c.user_id,
    c.display_name,
    u.email::text,
    s.status,
    c.submitted_at,
    c.created_at,
    count(*) over () as total_count
  from public.caregivers c
  join auth.users u on u.id = c.user_id
  cross join lateral (
    select private.caregiver_status(c.user_id) as status
  ) s
  where
    case p_status
      when 'onboarding' then c.submitted_at is null
      when 'pending'    then c.submitted_at is not null and s.status = 'pending'
      when 'approved'   then s.status = 'approved'
      when 'rejected'   then s.status = 'rejected'
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
  order by c.submitted_at desc nulls last, c.created_at desc
  limit greatest(p_limit, 1)
  offset greatest(p_offset, 0);
end;
$$;

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
    count(*) filter (
      where c.submitted_at is not null
        and private.caregiver_status(c.user_id) = 'pending'
    ),
    count(*) filter (where private.caregiver_status(c.user_id) = 'approved'),
    count(*) filter (where private.caregiver_status(c.user_id) = 'rejected')
  from public.caregivers c;
end;
$$;

-- The detail function gains the four new columns and loses the two that no
-- longer exist. A changed return type cannot be replaced in place, so it is
-- dropped and rebuilt, with its grants.
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
  created_at          timestamptz
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
    c.created_at
  from public.caregivers c
  join auth.users u on u.id = c.user_id
  where c.user_id = p_user_id;
end;
$$;

revoke all on function public.admin_caregiver_detail(uuid) from public;
revoke all on function public.admin_caregiver_detail(uuid) from anon;
grant execute on function public.admin_caregiver_detail(uuid) to authenticated;
