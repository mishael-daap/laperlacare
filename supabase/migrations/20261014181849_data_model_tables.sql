-- The seven tables of the data model.
--
-- Policies and grants come in a later migration, because the policies call
-- helper functions that cannot be created until these tables exist. RLS is
-- enabled here anyway: a table with RLS on and no policies denies everything,
-- which is the safe state to sit in between the two migrations.

create table public.households (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- A logged-in adult belonging to a household.
create table public.parents (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  avatar_path  text,
  created_at   timestamptz not null default now()
);

-- A child under a household. No auth.users row: a child never logs in.
create table public.children (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households (id) on delete cascade,
  full_name     text not null,
  date_of_birth date,
  created_at    timestamptz not null default now()
);

-- A logged-in care provider. No household: a caregiver is not a member.
create table public.caregivers (
  user_id             uuid primary key references auth.users (id) on delete cascade,
  display_name        text not null,
  verification_status text not null default 'pending'
                        check (verification_status in ('pending', 'approved', 'rejected')),
  avatar_path         text,
  created_at          timestamptz not null default now()
);

-- One row per highlighted block on the weekly board.
-- day_of_week follows ISO: 1 = Monday through 7 = Sunday.
create table public.caregiver_availability (
  id           uuid primary key default gen_random_uuid(),
  caregiver_id uuid not null references public.caregivers (user_id) on delete cascade,
  day_of_week  smallint not null check (day_of_week between 1 and 7),
  start_time   time not null,
  end_time     time not null,
  constraint caregiver_availability_end_after_start check (end_time > start_time)
);

-- A logged-in internal reviewer.
create table public.admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  avatar_path text,
  created_at  timestamptz not null default now()
);

-- Phone, email, and address records. Many per person, for any role.
-- The owner is the auth.users row, so a parent's contact and a caregiver's
-- contact are the same shape with a real foreign key and no type column.
create table public.contacts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  label      text not null,
  phone      text,
  email      text,
  address    text,
  created_at timestamptz not null default now()
);

-- Postgres does not index foreign keys for you. The availability index carries
-- the search: without it every availability query scans the table.
create index parents_household_id_idx on public.parents (household_id);
create index children_household_id_idx on public.children (household_id);
create index contacts_user_id_idx on public.contacts (user_id);
create index caregiver_availability_day_start_idx
  on public.caregiver_availability (day_of_week, start_time);

alter table public.households              enable row level security;
alter table public.parents                 enable row level security;
alter table public.children                enable row level security;
alter table public.caregivers              enable row level security;
alter table public.caregiver_availability  enable row level security;
alter table public.admins                  enable row level security;
alter table public.contacts                enable row level security;
