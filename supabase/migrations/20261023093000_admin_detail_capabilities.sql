-- The admin detail function now carries what a caregiver can take on.
--
-- The admin has no read policy on caregiver_needs or caregiver_supports, and
-- does not need one: the review screen already reads the profile through this
-- function, because that is the only way to get the account email. Adding the
-- two arrays here keeps capabilities on the same path instead of opening two
-- more tables to the admin role.
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
  support_slugs       text[]
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
    )
  from public.caregivers c
  join auth.users u on u.id = c.user_id
  where c.user_id = p_user_id;
end;
$$;

revoke all on function public.admin_caregiver_detail(uuid) from public;
revoke all on function public.admin_caregiver_detail(uuid) from anon;
grant execute on function public.admin_caregiver_detail(uuid) to authenticated;
