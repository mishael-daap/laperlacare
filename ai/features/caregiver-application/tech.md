# Technical Plan: Caregiver application

## Components

**Pages**
- **`src/app/onboarding/page.tsx`** — the guided first run. Guarded like `/me`, `instant = false`. Renders the sixteen-section list with state and one primary action.
- **`src/app/application/page.tsx`** — the application. Six written sections plus Credentials and the signature. Guarded, `instant = false`.
- **`src/app/me/page.tsx`** — restructured into Profile, Work details, Languages, Transportation, Home environment, Children you can support, What you can provide, Weekly availability, Contact details. Credentials are removed.
- **`src/app/admin/(dashboard)/caregiver/[id]/page.tsx`** — gains the application, the derived record rows, and the three recorded fields.

**New components, `src/components/caregiver/`**
- `application-progress.tsx` — the counter and the sixteen-row rail. Used by `/onboarding` and pinned on both pages.
- `work-details-section.tsx` — rate, ages, counties, Regional Center, earliest start.
- `languages-section.tsx`
- `transportation-section.tsx` — car, willing to drive, travel distance.
- `home-environment-section.tsx` — pets, smoking.
- `conditions-checklist.tsx` — the fifteen boxes. Reuses `capability-checklist.tsx`.
- `experience-editor.tsx` — add, edit, remove rows; shows the derived total years.
- `references-editor.tsx` — exactly two cards.
- `application-questions.tsx` — the two long answers.
- `application-signature.tsx` — statement, consent checkbox, name field, submit.
- `application-draft.tsx` — the provider for `/application`, modelled on `profile-draft.tsx`.

**Moved**
- `credentials-section.tsx` and `credential-dialog.tsx` go from `/me` to `/application`, unchanged apart from the wider kind list.

**Library**
- `src/lib/caregiver/answers.ts` — counties, languages, conditions: slug, label, position. Same shape as `DOCUMENT_KINDS`, so one checklist component renders all three.
- `src/lib/caregiver/application.ts` — the Zod schema per section, shared by the actions and the clients.
- `src/lib/caregiver/application-statement.ts` — `STATEMENT_VERSION` and `STATEMENT_TEXT`.
- `src/lib/caregiver/completeness.ts` — becomes the sixteen sections. The single place the number is written.
- `src/lib/caregiver/credentials.ts` — eight kinds instead of five.
- `src/lib/caregiver/actions.ts` — one action per section, plus submit.
- `src/lib/caregiver/get-caregiver-profile.ts` — loads experience, references, conditions, and the new columns.
- `src/lib/auth/actions.ts`, `src/app/auth/callback/route.ts`, `src/app/auth/confirm/route.ts` — a caregiver's landing path becomes `/onboarding` until they have submitted, `/me` after.

**UI** — existing `Checkbox`, `FieldSet`, `Dialog`, `Input`, `Textarea`, `Badge`, `Button`, `Table`. No new shadcn component, no new dependency.

## API

All writes are server actions. No route handlers.

| Action | Writes |
|---|---|
| `saveWorkDetailsAction` | one `.update()` on `caregivers` |
| `saveLanguagesAction` | one `.update()` |
| `saveTransportationAction` | one `.update()` |
| `saveHomeEnvironmentAction` | one `.update()` |
| `saveApplicationDetailsAction` | one `.update()` |
| `saveConditionsAction` | one `.update()` |
| `saveQuestionsAction` | one `.update()` |
| `saveExperienceAction` | `rpc("save_caregiver_experience")` |
| `saveReferencesAction` | `rpc("save_caregiver_references")` |
| `submitApplicationAction` | `rpc("submit_caregiver_application")` |
| `approveCaregiverAction` | `rpc("admin_approve_caregiver")` |
| `declineCaregiverAction` | `rpc("admin_decline_caregiver")` |
| `saveApplicationRecordAction` | `rpc("admin_set_application_record")` |

Each returns `{ error?: string; ok?: boolean }`, reads the caller with `getClaims()`, and revalidates `/onboarding`, `/me`, the application path and the admin detail path.

## Data Model

### Columns on `caregivers`

```
-- work details
hourly_rate            integer  check between 15 and 500
counties               text[]   not null default '{}'  check private.valid_slugs(...)
other_county           text
regional_center_worker boolean  not null default false
regional_center_name   text
earliest_start_date    date

-- languages
languages              text[]   not null default '{}'  check private.valid_slugs(...)
other_language         text

-- transportation
car_and_insurance      boolean  not null default false
willing_to_drive       boolean  not null default false
max_travel_miles       smallint check between 1 and 500

-- home environment
pets                   text     check in ('dogs','cats','both','none')
non_smoker             boolean  not null default false

-- application
legal_name             text
address_street         text
address_city           text
address_postal_code    text
referral_source        text
conditions             text[]   not null default '{}'  check private.valid_slugs(...)
other_condition        text
why_special_needs      text     check char_length <= 2000
difficult_moment       text     check char_length <= 2000
background_check_agreed boolean not null default false

-- signature
signature_name            text
signed_at                 timestamptz
signed_statement_version  text
signed_ip                 inet
signed_user_agent         text

-- application record, admin-written
interviewed_at         timestamptz
interview_outcome      text  check in ('pass','no')
trustline_status       text  check in ('cleared','pending','na')
-- the profile decision, made once
approved_at            timestamptz
approved_by            uuid references auth.users (id) on delete set null
declined_at            timestamptz
declined_by            uuid references auth.users (id) on delete set null
declined_reason        text
```

`age_min`, `age_max`, `date_of_birth`, `gender`, `bio`, `display_name`, `avatar_path` and `submitted_at` already exist and are reused.

### New tables

```
caregiver_experience
  id            uuid pk
  caregiver_id  uuid not null references caregivers(user_id) on delete cascade
  employer      text not null
  role          text not null
  started_on    date not null
  ended_on      date null
  ages_and_needs text
  position      smallint not null
  created_at    timestamptz not null default now()
  check (ended_on is null or ended_on >= started_on)
  index on (caregiver_id, position)

caregiver_references
  id            uuid pk
  caregiver_id  uuid not null references caregivers(user_id) on delete cascade
  full_name     text not null
  relationship  text not null
  organisation  text
  phone         text
  email         text
  known_for     text
  position      smallint not null check in (1, 2)
  checked_at    timestamptz
  checked_outcome text check in ('ok','concern')
  checked_by    uuid references auth.users(id) on delete set null
  created_at    timestamptz not null default now()
  unique (caregiver_id, position)
  index on caregiver_id
```

### Changed tables

```
contacts
  drop column address
  add  preferred_contact_method text check in ('phone','text','email') default 'phone'

caregiver_documents
  kind check widens to
    ('background_check','cpr','first_aid','rbt','cna_nursing','trustline','drivers_licence','other')
```

### Slug validation without reference tables

```
private.valid_slugs(p_values text[], p_allowed text[]) returns boolean
language sql immutable
as $$ select coalesce(bool_and(v = any(p_allowed)), true) from unnest(p_values) as v $$
```

The allowed array is written inline in each constraint, so the function stays `immutable` and the check is legal. This is why counties, languages and conditions are `text[]` and not six tables: nothing joins on them, no row carries attributes, and the labels live in `answers.ts` beside `DOCUMENT_KINDS`.

A GIN index is added when the first filter needs it (`counties && array['contra_costa']`), not before.

### Status rule change

```
private.caregiver_status(p_user_id)
```

stops being derived from documents at all:

- `declined_at is not null` → `rejected`
- `approved_at is not null` → `approved`
- otherwise → `pending`

The profile decision is made once and recorded. A rejected CPR card no longer condemns the person, which it did before: the old rule returned `rejected` if any live document was rejected.

`private.caregiver_is_public(uid)` is the policy-side version, used by the catalogue, availability and contacts policies.

The background-check requirement moves to where the decision is made: `admin_approve_caregiver` refuses without a live approved `background_check`.

### No lock, and a signature that does not outlive its answers

```
private.clear_signature_on_edit()        -- before update on caregivers
private.clear_signature_on_child_edit()  -- after insert/update/delete on both child tables
```

Nothing is read-only. What the triggers do instead is null the signature and `submitted_at` whenever an attested column changes — legal name, address, referral, conditions, either written answer, the consent — or a row of either child table is added, changed or removed.

That is what makes the model work without a lock: the caregiver edits freely, the application drops out of the Pending bucket on its own, and an admin only ever reads a version that somebody has signed. No return flow, and no `returned_at`.

The signature's own write is exempt, or a submission would clear itself.

### RLS and grants

Every new table is scoped to `caregiver_id = auth.uid()`, with select/insert/update/delete. No admin policy: the admin reads both child tables through the detail function, which already exists for the account email.

`caregiver_references` carries `checked_by`, written only through `admin_set_application_record`.

## RPC

```
public.save_caregiver_experience(p_rows jsonb) returns void
public.save_caregiver_references(p_rows jsonb) returns void
```

Both `security invoker`, resolve the caregiver from `auth.uid()`, validate every row, then delete the caller's rows and reinsert. `jsonb` is used as a *parameter* here, not as storage — one round trip for a replace-set.

```
public.submit_caregiver_application(p_signature_name text) returns void
security invoker
```

The only place that writes `signed_at`, `signed_statement_version`, `signed_ip`, `signed_user_agent` and `submitted_at`. It checks, in order: signed in, a caregiver row exists, age 18+, legal name present, at least one experience row, at least two references, at least one condition, both answers present, `background_check_agreed` true, signature name non-empty. It raises on the first failure with a sentence the UI shows verbatim, then re-stamps the signature and `submitted_at = now()`, and clears any decline.

```
public.admin_approve_caregiver(p_user_id uuid) returns void
public.admin_decline_caregiver(p_user_id uuid, p_reason text) returns void
public.admin_set_application_record(p_user_id uuid, p_interviewed_at timestamptz,
                                    p_interview_outcome text, p_trustline_status text) returns void
```

Both `security definer`, both raise `'not authorized'` unless `private.is_admin()`, and both are revoked from `public` and `anon`.

## Flow

Sign up → `/onboarding` (`0 of 16`) → sections save one at a time → `16 of 16` → `submit_caregiver_application` writes the signature and `submitted_at` → the caregiver appears in the admin Pending bucket → the admin decides each credential → `private.caregiver_status` answers `approved` only when every credential is approved and unexpired **and** a background check is one of them.

## Notes

- **No jsonb for the form.** A jsonb column cannot carry the check constraints this schema leans on, cannot be read by a row policy per field, turns every read into a cast against the generated types, and turns filtering into `->>` string surgery. The whole form is one migration of `add column` lines; jsonb would trade an hour of typing for a permanent tax on every query.
- **`text[]` instead of six tables.** The four counts: no join, no attributes on a row, labels are product copy, and a GIN index covers the future filter exactly as a join would.
- **The signature guard is a trigger, not a policy**, for the same reason the old lock was: a `with check` sees only the new row, and this rule is about the difference between the two.
- **`submitted_at` now means "signed and current".** An edit nulls it, and signing sets it again. That is the whole queue mechanism — there is no separate draft state and no return flow.
- **The sixteen is data, not markup.** `completeness.ts` exports the list; the counter, the rail, the flow and the admin page all read it. Changing a section means changing one array.
- **The onboarding flow reuses the page components.** A true wizard would need a second copy of every form and a second source of layout truth.
- **The background check requirement is the one behaviour change to an existing rule.** A caregiver with only a CPR card stops reading as approved.
- **`contacts.address` is dropped for parents too.** No parent screen reads it.
- **Deferred:** multiple documents per kind, re-review reminders, approval emails, matching, catalog, billing and interest requests.
