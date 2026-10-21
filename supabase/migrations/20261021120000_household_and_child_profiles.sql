-- Household preferences, the fixed care lists, child tags, and the household's
-- weekly care windows.
--
-- Run order: columns, reference tables and their seed rows, the two child tag
-- tables, the schedule, policies and grants, then the function that writes a
-- child and both tag sets in one transaction.

-- ---------------------------------------------------------------------------
-- Columns
-- ---------------------------------------------------------------------------

-- A household-level preference, not a per-child one. Siblings share a caregiver
-- often enough that asking once is the honest shape.
alter table public.households
  add column if not exists preferred_caregiver_gender text not null default 'no_preference';

alter table public.households
  drop constraint if exists households_preferred_caregiver_gender_check;

alter table public.households
  add constraint households_preferred_caregiver_gender_check
  check (preferred_caregiver_gender in ('female', 'male', 'no_preference'));

-- Free text about the child. Sensitive personal information under CCPA/CPRA:
-- never returned in a catalog query, never read by an admin, and never logged.
alter table public.children
  add column if not exists notes text;

alter table public.children
  drop constraint if exists children_notes_length_check;

alter table public.children
  add constraint children_notes_length_check
  check (notes is null or char_length(notes) <= 1000);

-- ---------------------------------------------------------------------------
-- Reference lists
-- ---------------------------------------------------------------------------

-- Two tables rather than one with a kind column. A need is what the child
-- experiences; a support is what the caregiver does. They are different
-- dimensions, and 7.2 lets caregivers tick supports only, so separate foreign
-- keys stay honest.
--
-- The wording is deliberately about behaviour and support rather than
-- diagnoses. Parents are not asked to label their child.
create table if not exists public.needs (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  label      text not null,
  position   smallint not null,
  created_at timestamptz not null default now()
);

create table if not exists public.supports (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  label      text not null,
  position   smallint not null,
  created_at timestamptz not null default now()
);

insert into public.needs (slug, label, position) values
  ('high-energy-behaviour', 'High-energy or heavy behaviour',      1),
  ('big-feelings',          'Big feelings or frequent meltdowns',  2),
  ('transitions',           'Difficulty with change or transitions', 3),
  ('sensory-sensitivities', 'Sensory sensitivities',               4),
  ('communication',         'Limited speech or non-speaking',      5),
  ('close-supervision',     'Needs close supervision',             6),
  ('medical-needs',         'Medical or health needs',             7),
  ('mobility-needs',        'Physical or mobility needs',          8),
  ('learning-support',      'Learning or developmental support',   9),
  ('social-play',           'Social or play difficulties',        10),
  ('sleep',                 'Sleep or bedtime challenges',        11),
  ('emotional-regulation',  'Anxiety or emotional regulation',    12),
  ('personal-care',         'Toileting or personal care',         13),
  ('feeding-mealtime',      'Feeding or mealtime challenges',     14)
on conflict (slug) do update
  set label = excluded.label,
      position = excluded.position;

insert into public.supports (slug, label, position) values
  ('personal-care',       'Personal care (toileting, dressing, hygiene)', 1),
  ('feeding-mealtime',    'Feeding and mealtime support',                 2),
  ('cooking',             'Cooking and meal preparation',                 3),
  ('mobility-transfer',   'Mobility and transfer support',                4),
  ('medication',          'Medication reminders',                         5),
  ('communication',       'Communication support (AAC or sign)',          6),
  ('behaviour',           'Behavioural support and de-escalation',        7),
  ('sensory-regulation',  'Sensory regulation',                           8),
  ('social-play',         'Social and play support',                      9),
  ('learning-homework',   'Learning and homework support',               10),
  ('sleep-bedtime',       'Sleep and bedtime routines',                  11),
  ('seizure-response',    'Seizure response',                            12),
  ('medical-device',      'Medical device or tube care',                 13),
  ('transport',           'Transport accompaniment',                     14)
on conflict (slug) do update
  set label = excluded.label,
      position = excluded.position;

-- ---------------------------------------------------------------------------
-- Child tags
-- ---------------------------------------------------------------------------

-- No id and no update policy. A save replaces the set: delete the child's rows
-- and insert the selected ones. The primary key stops a duplicate tick.
create table if not exists public.child_needs (
  child_id uuid not null references public.children (id) on delete cascade,
  need_id  uuid not null references public.needs (id) on delete cascade,
  primary key (child_id, need_id)
);

create index if not exists child_needs_need_id_idx
  on public.child_needs (need_id);

create table if not exists public.child_supports (
  child_id   uuid not null references public.children (id) on delete cascade,
  support_id uuid not null references public.supports (id) on delete cascade,
  primary key (child_id, support_id)
);

create index if not exists child_supports_support_id_idx
  on public.child_supports (support_id);

-- ---------------------------------------------------------------------------
-- Weekly care windows
-- ---------------------------------------------------------------------------

-- The same shape as caregiver_availability. Matching is an overlap join on
-- day_of_week, start_time, and end_time, so no translation layer is needed.
-- Several windows may share a day and may overlap.
create table if not exists public.household_availability (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  day_of_week  smallint not null check (day_of_week between 1 and 7),
  start_time   time not null,
  end_time     time not null,
  constraint household_availability_end_after_start check (end_time > start_time)
);

create index if not exists household_availability_household_id_idx
  on public.household_availability (household_id);

create index if not exists household_availability_day_start_idx
  on public.household_availability (day_of_week, start_time);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.needs                 enable row level security;
alter table public.supports              enable row level security;
alter table public.child_needs           enable row level security;
alter table public.child_supports        enable row level security;
alter table public.household_availability enable row level security;

-- The two lists are a public taxonomy. There are no write policies: changing a
-- list is a migration, never an API call.
create policy "the needs list is readable"
  on public.needs for select
  to anon, authenticated
  using (true);

create policy "the supports list is readable"
  on public.supports for select
  to anon, authenticated
  using (true);

-- Child tags are scoped through the child, which already carries the household.
-- The parent can read the child, so the exists check is allowed to see it.
create policy "a parent may read their children's needs"
  on public.child_needs for select
  to authenticated
  using (
    exists (
      select 1 from public.children c
      where c.id = child_needs.child_id
        and c.household_id = (select private.current_household_id())
    )
  );

create policy "a parent may add needs to their children"
  on public.child_needs for insert
  to authenticated
  with check (
    exists (
      select 1 from public.children c
      where c.id = child_needs.child_id
        and c.household_id = (select private.current_household_id())
    )
  );

create policy "a parent may remove needs from their children"
  on public.child_needs for delete
  to authenticated
  using (
    exists (
      select 1 from public.children c
      where c.id = child_needs.child_id
        and c.household_id = (select private.current_household_id())
    )
  );

create policy "a parent may read their children's supports"
  on public.child_supports for select
  to authenticated
  using (
    exists (
      select 1 from public.children c
      where c.id = child_supports.child_id
        and c.household_id = (select private.current_household_id())
    )
  );

create policy "a parent may add supports to their children"
  on public.child_supports for insert
  to authenticated
  with check (
    exists (
      select 1 from public.children c
      where c.id = child_supports.child_id
        and c.household_id = (select private.current_household_id())
    )
  );

create policy "a parent may remove supports from their children"
  on public.child_supports for delete
  to authenticated
  using (
    exists (
      select 1 from public.children c
      where c.id = child_supports.child_id
        and c.household_id = (select private.current_household_id())
    )
  );

create policy "a parent may read their care windows"
  on public.household_availability for select
  to authenticated
  using (household_id = (select private.current_household_id()));

create policy "a parent may add care windows"
  on public.household_availability for insert
  to authenticated
  with check (household_id = (select private.current_household_id()));

create policy "a parent may remove care windows"
  on public.household_availability for delete
  to authenticated
  using (household_id = (select private.current_household_id()));

-- The only writable column on a household is the gender preference. The check
-- on id stops a member moving the row to another household.
create policy "a parent may edit their household"
  on public.households for update
  to authenticated
  using (id = (select private.current_household_id()))
  with check (id = (select private.current_household_id()));

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant select on public.needs, public.supports to anon, authenticated;
grant select, insert, delete
  on public.child_needs, public.child_supports, public.household_availability
  to authenticated;
grant update on public.households to authenticated;

-- ---------------------------------------------------------------------------
-- Saving a child and both tag sets in one transaction
-- ---------------------------------------------------------------------------

-- A server action cannot wrap three writes in a transaction through the Data
-- API. This function can. It is SECURITY INVOKER on purpose: RLS stays in force,
-- and the function resolves the household from the caller rather than accepting
-- one as an argument, so it cannot be pointed at somebody else's child.
--
-- Slugs are validated rather than silently ignored. An unknown slug is a caller
-- bug, and a save that quietly drops half the selection is worse than an error.
create or replace function public.save_child(
  p_child_id      uuid,
  p_full_name     text,
  p_date_of_birth date,
  p_notes         text,
  p_needs         text[],
  p_supports      text[]
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

revoke all on function public.save_child(uuid, text, date, text, text[], text[]) from public;
revoke all on function public.save_child(uuid, text, date, text, text[], text[]) from anon;
grant execute on function public.save_child(uuid, text, date, text, text[], text[]) to authenticated;
