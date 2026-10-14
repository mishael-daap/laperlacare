-- Helper functions used by the row level security policies.
--
-- They live in a private schema because Postgres grants EXECUTE to PUBLIC on
-- every new function. The Data API only exposes the schemas you list, so a
-- function here is not reachable as an endpoint. The revoke below is belt and
-- braces on top of that.
--
-- Both are SECURITY DEFINER so a policy can read a table the caller cannot
-- read themselves. That is the whole point: a policy on parents that reads
-- parents would recurse, and a member must be able to ask "which household am
-- I in?" without being able to browse parents.
--
-- `set search_path = ''` is required, not decorative. Without it a caller could
-- shadow a table the function touches by creating one earlier in the search
-- path, and the function would read theirs while running as its owner.

create schema if not exists private;

create or replace function private.current_household_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select household_id
  from public.parents
  where user_id = (select auth.uid());
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins
    where user_id = (select auth.uid())
  );
$$;

-- Policies run as the calling role, so that role needs EXECUTE. It gains
-- nothing else: the functions are not in an exposed schema, so there is no
-- endpoint that reaches them.
revoke all on function private.current_household_id() from public;
revoke all on function private.is_admin() from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.current_household_id() to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;
