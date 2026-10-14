# Technical Plan: Data model

## Data Model

Seven tables, plus Supabase's own. Plain definitions only — the executable form lives in `supabase/migrations/`.

Built as a sequence of small migrations, one per stage, so each stage can be applied and verified before the next is written: helpers first, then the tables with their policies and grants, then the avatars bucket.

**auth.users**
Supabase's table. Not ours, never altered. We reference it by id and add no columns to it.

**households** — the paying account. The tenancy anchor everything else points at.
- id — uuid, primary key
- created_at — timestamp with timezone, defaults to now

**parents** — a person who logs in and belongs to a household.
- user_id — uuid, primary key, references auth.users
- household_id — uuid, not null, references households
- avatar_path — text
- created_at — timestamp with timezone, defaults to now

**children** — a child under a household. No login, so no auth.users row.
- id — uuid, primary key
- household_id — uuid, not null, references households
- full_name — text, not null
- date_of_birth — date
- created_at — timestamp with timezone, defaults to now

**caregivers** — a person who logs in and offers care.
- user_id — uuid, primary key, references auth.users
- display_name — text, not null
- verification_status — text, not null, defaults to pending. One of: pending, approved, rejected
- avatar_path — text
- created_at — timestamp with timezone, defaults to now

**caregiver_availability** — one row per highlighted block on the weekly board.
- id — uuid, primary key
- caregiver_id — uuid, not null, references caregivers
- day_of_week — smallint, not null. 1 = Monday through 7 = Sunday
- start_time — time, not null
- end_time — time, not null. Must be later than start_time

**admins** — a person who logs in and reviews caregivers.
- user_id — uuid, primary key, references auth.users
- avatar_path — text
- created_at — timestamp with timezone, defaults to now

**children** deliberately has no avatar column. Child photos are not stored.

**contacts** — phone, email, and address records. Many per person.
- id — uuid, primary key
- user_id — uuid, not null, references auth.users. The person this contact belongs to
- label — text, not null. Free text: mobile, work, emergency
- phone — text
- email — text
- address — text
- created_at — timestamp with timezone, defaults to now

## Avatars

One public bucket named `avatars`. Each user type holds a path, not a URL.

- Path convention: `<user_id>/<filename>`, so a storage policy can allow a person to write only inside their own folder — the first path segment must equal their auth id.
- The column stores the path. The display URL is derived at render time with `getPublicUrl`.
- Filenames are versioned (`avatar-<timestamp>.jpg`). Reusing a path leaves browsers serving the old cached image.
- Nothing sensitive goes in this bucket. A public bucket means anyone with the URL can fetch the file; unguessable UUID paths make a URL hard to find, not protected.
- Children have no avatar. Child photos are not stored anywhere.

## Helper functions

Both live in a `private` schema, which the API does not expose, and both run with elevated rights. That matters: Postgres grants execute permission to everyone on a new function, so a helper in `public` would be callable by any anonymous visitor.

**private.current_household_id()** — returns the household of the logged-in user by reading `parents`. It exists because a policy on `parents` that reads `parents` would recurse.

**private.is_admin()** — returns whether the logged-in user has a row in `admins`.

## Rules that apply to every table

- RLS is enabled on every table. **Correction to an earlier assumption:** this project grants `anon` and `authenticated` full table privileges on new `public` tables by default, so a table is reachable the moment it is created. RLS is therefore the only layer deciding what comes back, and a wrong or missing policy leaks rows directly rather than being caught by a missing grant.
- Policies specify the target role and pair it with an ownership or household check. Role alone is not authorization.
- Update policies carry both a using clause and a with-check clause, so a row cannot be reassigned to another owner.
- Table and column names are lower case.
- Foreign keys to `households` and `auth.users` are indexed.

## Index

`caregiver_availability` is indexed on (day_of_week, start_time). This carries the availability search; without it every search scans the table.

## Membership is created by a function, not a policy

Creating a household is two rows: the household, then the parent pointing at it. No policy can express that safely. At the moment the household row is inserted the caller is not yet a member of it, so a policy cannot check membership; and at the moment the parent row is inserted the caller could name any household they liked.

So `private.create_household()` does both inserts in one call, after checking the caller is authenticated and does not already belong to a household. `parents` and `households` have no insert policy at all, which means direct inserts are impossible — verified: a signed-in user attempting to insert their own `parents` row is refused.

## Flow

Migration written → applied to the linked project → types regenerated → typecheck and build.

## Notes

- `db advisors` reports one security item, leaked-password protection, which is an Auth setting rather than a schema one. Enable it when auth is configured.
- Nothing here alters `auth.users`. It is referenced, never modified.
- `auth.uid()` returns a uuid, so every `user_id` column is a uuid referencing `auth.users`.
- `contacts` is never joined by a catalog query. Row-level security decides who may read a caregiver's contacts at all; the query rule keeps them off public pages regardless.
