-- One caregiver, for the review screen.
--
-- The list needs the account email, which the Data API cannot read, so the
-- directory function exists. The detail page needs the same email plus the
-- profile columns, and it cannot get them from a page of the directory without
-- asking for every row to find one. Same gate, same definer treatment, one row.

create or replace function public.admin_caregiver_detail(p_user_id uuid)
returns table (
  user_id             uuid,
  display_name        text,
  email               text,
  bio                 text,
  avatar_path         text,
  verification_status text,
  submitted_at        timestamptz,
  reviewed_by         uuid,
  reviewed_at         timestamptz,
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
    c.verification_status,
    c.submitted_at,
    c.reviewed_by,
    c.reviewed_at,
    c.created_at
  from public.caregivers c
  join auth.users u on u.id = c.user_id
  where c.user_id = p_user_id;
end;
$$;

revoke all on function public.admin_caregiver_detail(uuid) from public;
revoke all on function public.admin_caregiver_detail(uuid) from anon;
grant execute on function public.admin_caregiver_detail(uuid) to authenticated;
