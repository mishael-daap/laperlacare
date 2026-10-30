-- The reference check, which is the one part of the paper form's review panel
-- that neither a document nor a derived value can answer.
--
-- A reference check is a phone call. It has no file, it does not follow from
-- anything else on the row, and an admin has to record that it happened and what
-- came of it. Without this, the second column of the form's "For Perla Care use
-- only" table is unrepresentable.
--
-- A function rather than an update policy on `caregiver_references`. The table
-- has no admin policy on purpose — an admin reads references through the detail
-- path, and opening the table to the admin role for writes would let a
-- hand-written request rewrite a reference's name and phone number as well as its
-- outcome. This touches three columns and refuses everything else.

create or replace function public.admin_check_reference(
  p_reference_id uuid,
  p_outcome      text
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

  if p_outcome not in ('ok', 'concern') then
    raise exception 'an outcome is either ok or concern';
  end if;

  update public.caregiver_references
  set checked_at      = now(),
      checked_outcome = p_outcome,
      checked_by      = caller
  where id = p_reference_id;

  if not found then
    raise exception 'no such reference';
  end if;
end;
$$;

revoke all on function public.admin_check_reference(uuid, text) from public;
revoke all on function public.admin_check_reference(uuid, text) from anon;
grant execute on function public.admin_check_reference(uuid, text) to authenticated;
