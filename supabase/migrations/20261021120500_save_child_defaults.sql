-- Makes the optional arguments of save_child actually optional over the API.
--
-- Postgres allows defaults only once every later argument has one too, so the
-- whole list is defaulted. The function still validates the name and date of
-- birth, which are the two values that genuinely have no sensible default.
--
-- This changes no behaviour; it changes the generated TypeScript signature from
-- "pass every argument" to "pass the ones you have".

create or replace function public.save_child(
  p_child_id      uuid default null,
  p_full_name     text default null,
  p_date_of_birth date default null,
  p_notes         text default null,
  p_needs         text[] default '{}',
  p_supports      text[] default '{}'
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  household     uuid := private.current_household_id();
  child         uuid := p_child_id;
  need_list     text[] := array(select distinct unnest(coalesce(p_needs, '{}')));
  support_list  text[] := array(select distinct unnest(coalesce(p_supports, '{}')));
  found_count   int;
begin
  if household is null then
    raise exception 'not a parent';
  end if;

  if p_full_name is null or btrim(p_full_name) = '' then
    raise exception 'a child needs a name';
  end if;

  if p_date_of_birth is null then
    raise exception 'a child needs a date of birth';
  end if;

  if p_date_of_birth > current_date then
    raise exception 'date of birth cannot be in the future';
  end if;

  if coalesce(char_length(p_notes), 0) > 1000 then
    raise exception 'notes are limited to 1000 characters';
  end if;

  select count(*) into found_count
  from public.needs
  where slug = any(need_list);

  if found_count <> coalesce(array_length(need_list, 1), 0) then
    raise exception 'unknown need in selection';
  end if;

  select count(*) into found_count
  from public.supports
  where slug = any(support_list);

  if found_count <> coalesce(array_length(support_list, 1), 0) then
    raise exception 'unknown support in selection';
  end if;

  if child is null then
    insert into public.children (household_id, full_name, date_of_birth, notes)
    values (
      household,
      btrim(p_full_name),
      p_date_of_birth,
      nullif(btrim(p_notes), '')
    )
    returning id into child;
  else
    update public.children
    set full_name     = btrim(p_full_name),
        date_of_birth = p_date_of_birth,
        notes         = nullif(btrim(p_notes), '')
    where id = child
      and household_id = household;

    if not found then
      raise exception 'child not found';
    end if;
  end if;

  delete from public.child_needs where child_id = child;
  insert into public.child_needs (child_id, need_id)
  select child, id from public.needs where slug = any(need_list);

  delete from public.child_supports where child_id = child;
  insert into public.child_supports (child_id, support_id)
  select child, id from public.supports where slug = any(support_list);

  return child;
end;
$$;
