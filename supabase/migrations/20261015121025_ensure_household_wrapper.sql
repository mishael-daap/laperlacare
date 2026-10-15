-- The one door the app has into household creation.
--
-- private.create_household() already exists and does the work, but the private
-- schema is not exposed to the Data API, so the app cannot reach it — calling
-- it over HTTP returns 404. That was deliberate: a SECURITY DEFINER function
-- sitting in an exposed schema is callable by anyone. This is the thin, checked
-- wrapper that makes it reachable without making everything reachable.
--
-- Why it is safe to have this in public:
--
--   * It takes no arguments. There is nothing to pass it that could name
--     somebody else's household, which is the usual way an exposed
--     SECURITY DEFINER function becomes a hole.
--   * It resolves the caller from auth.uid() and refuses to act without one.
--   * It is idempotent, which is the property the app actually needs: it can be
--     called on every sign-in without creating a second household.

create or replace function public.ensure_household()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller   uuid := (select auth.uid());
  existing uuid;
begin
  if caller is null then
    raise exception 'not authenticated';
  end if;

  -- Two sign-ins racing on a double submit would otherwise both see no
  -- household and both try to insert one. The parents primary key would reject
  -- the second, surfacing as a confusing error. This serialises them instead.
  perform pg_advisory_xact_lock(hashtext(caller::text));

  select household_id into existing
  from public.parents
  where user_id = caller;

  if existing is not null then
    return existing;
  end if;

  return private.create_household();
end;
$$;

revoke all on function public.ensure_household() from public;
grant execute on function public.ensure_household() to authenticated;
