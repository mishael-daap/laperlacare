# Feature: Data model

## Purpose
The Postgres schema everything else builds on: who exists, what a household is, and how a caregiver is represented. No product behaviour and no UI.

## User Flow
Records come into being in this order:
1. A person signs up. Supabase Auth creates the `auth.users` row.
2. The person becomes exactly one kind of user by gaining a row in exactly one role table — `parents`, `caregivers`, or `admins`.
3. A parent creates a household, setting `parents.household_id`.
4. A parent adds children, which live under the household.
5. A caregiver records their weekly availability, one row per highlighted block.

## Structure

Seven tables, plus Supabase's own. Field-level definitions are in `tech.md`.

- **households** — the paying account, and the tenancy anchor every other row points at.
- **parents** — a logged-in adult belonging to a household.
- **children** — a child under a household. No login, so no auth row.
- **caregivers** — a logged-in care provider.
- **caregiver_availability** — one row per highlighted block on the weekly board.
- **admins** — a logged-in reviewer of caregivers.
- **contacts** — phone, email, and address records. Many per person.
- **avatars** — not a table. Each user type stores a storage path in its own `avatar_path` column.

Every kind of person has its own table, referencing `auth.users`. Role is *which table a user is in*. There is no role column, no lookup table, and no nullable field standing in for a role.

**Deferred fields.** Each is a plain `ALTER TABLE ADD COLUMN` when the owning feature arrives, so nothing is lost by waiting.

| Field | Returns with |
|---|---|
| `households` stripe_customer_id, subscription_status, current_period_end | Membership & billing |
| `children.care_notes` | Household accounts |
| `caregivers.bio` | Caregiver onboarding |
| `caregivers.timezone` | Availability |
| `caregivers.gender`, `education_level`, `certifications[]`, `specialisations[]` | Search & filters |
| `caregiver_documents`, `interest_requests` tables | Their features |

## Rules
- Schema changes go through committed migration files. No table is created by hand in the dashboard.
- Every table gets RLS, and every policy names its target role. On this project that is the **only** gate: default privileges already grant `anon` and `authenticated` full table privileges on new tables in `public`, so a table is reachable the moment it exists. There is no grant acting as a backstop — a missing or wrong policy leaks rows directly.
- Anonymous visitors may read the public catalog (`caregivers`, `caregiver_availability`) and nothing else. Their table privileges are narrowed deliberately rather than left at the default.
- `verification_status` is an explicit state machine: `pending` → `approved` | `rejected`.
- Availability is weekly-recurring. A row means "every Monday, 14:00–16:00". There are no date-specific exceptions, so "away next Tuesday" is not expressible yet.
- Availability times are wall-clock in a single timezone. Multi-timezone support arrives with `caregivers.timezone`.
- The board is saved whole: delete the caregiver's rows and insert the new set in one transaction, rather than diffing blocks.
- A search matches any block that overlaps the requested window, where overlap means the block starts before the window ends and ends after the window starts.
- Avatars are stored as a storage **path** (`<user_id>/avatar.jpg`), never a URL. A signed URL expires and a public URL can be derived from the path at render time, so the path is the only durable value.
- All avatars live in a single public bucket. Nothing sensitive goes in it: a public bucket means anyone holding the URL can view the file, and UUID-based paths only make that URL unguessable, not access-controlled.
- The bucket accepts `image/jpeg`, `image/png`, and `image/webp`, and rejects any file over 2 MB. These limits are enforced by the bucket itself, so a hand-crafted request cannot bypass them; client-side checks exist only for good error messages.
- HEIC is not accepted, and the app does not convert anything. iOS Safari transcodes a camera-roll photo to JPEG for a file input, so iPhone users are unaffected — but that is behaviour worth confirming on a real device rather than assuming.
- Child photos are not stored at all. A child profile holds a name and a date of birth, and nothing else.
- Replacing an avatar writes a new versioned filename and updates the column, so browsers do not serve a stale cached image.
- Contacts belong to a person, not to a role. The owner is the `auth.users` row, so the same table serves parents, caregivers, and admins with a real foreign key and no type column.
- A person's own contacts are always readable to them. A caregiver's contacts are readable only by members, and never by a signed-out visitor.
- The catalog never joins `contacts`. That is the single place the subscription gate is enforced.
- Tenant checks resolve through `SECURITY DEFINER` helpers in a `private` schema, never in `public`, so they cannot be called by any signed-in user. `current_household_id()` reads `parents`; `is_admin()` reads `admins`.
- A child is never an `auth.users` row. No login credentials are created for a child.
- Because each role is its own table, one person can hold two roles (a caregiver who is also a parent). Tables are independent.
- No column is nullable in order to signal something other than absence of a value.

## Acceptance Criteria

Verified by this feature, against the linked project, by simulating each persona:
- [x] The migrations apply cleanly and create all seven tables.
- [x] Every table has RLS enabled, and every policy names its target role together with an ownership or household check.
- [x] A parent reads only their own household's children — parent A saw Child A, parent B saw Child B.
- [x] A member reads an approved caregiver's contacts and not a pending caregiver's.
- [x] A signed-in user cannot insert their own `parents` row, so a household cannot be self-joined.
- [x] `create_household()` creates exactly one household and refuses a second call.
- [x] A signed-out visitor reads the public catalog and no other table's rows.
- [x] An admin reads no contacts and no children.
- [x] The `avatars` bucket holds a 2 MB cap and the three accepted image types.
- [x] A user can write inside their own folder; another user's folder, and a signed-out write, are both refused.
- [x] A block ending exactly when a requested window starts is not returned, checked against the constraint and the overlap predicate.
- [x] `db advisors` reports no performance issues and no schema security issue.
- [x] `pnpm db:types` regenerates `src/types/supabase.ts` with all seven tables; `pnpm typecheck` and `pnpm build` pass.

Asserted by the features that use this schema, not here, because they need UI and queries this feature does not build:
- [ ] A caregiver saves a weekly board and reads it back unchanged.
- [ ] A search for a day and time window returns exactly the overlapping caregivers.
- [ ] An avatar uploads through the app, renders from the stored path, and replaces without a stale cache.
- [ ] A photo from an iPhone camera roll uploads with no conversion step.
- [ ] `curl` on the catalog path returns no caregiver contacts.
