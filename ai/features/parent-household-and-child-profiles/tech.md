# Technical Plan: Parent household and child profiles

## Components
- **`src/app/household/page.tsx`** — server page. Resolves the session, guards the role, ensures the household, loads everything, renders the sections. `instant = false` and `await connection()` for the same reason as `/me`.
- **`src/app/household/loading.tsx`** — skeleton matching the page's shape.
- **`src/components/household/child-list.tsx`** — children, empty state, and the add button.
- **`src/components/household/child-card.tsx`** — name, age, need and support badges, notes, edit and delete actions.
- **`src/components/household/child-dialog.tsx`** — add and edit form. Name, date of birth, two checkbox groups, notes.
- **`src/components/household/care-schedule.tsx`** — weekly windows, add-day form, remove buttons.
- **`src/components/household/gender-preference.tsx`** — household preference, saved on selection.
- **`src/lib/household/get-household-profile.ts`** — two rounds: the household, children, lists, and windows in parallel; then the child tags.
- **`src/lib/household/actions.ts`** — server actions for every write.
- **`src/lib/household/validation.ts`** — Zod schemas shared by the actions.
- **`src/lib/household/age.ts`** — UTC-safe age derivation and display.
- **`src/lib/auth/ensure-household.ts`** — returns the household id, and its “not called” comment goes.
- **`src/lib/auth/actions.ts`** — a parent lands on `/household` instead of the empty catalogue.
- **UI** — `Dialog`, `Checkbox`, `FieldSet`, `FieldLegend`, `Input`, `Label`, `Textarea`, `Button`, `Badge`, `DropdownMenu`, `Card`. No new shadcn component is needed.
- **Migrations** — one adding the columns, reference tables, join tables, schedule table, policies, grants, and seed rows; one making `save_child`'s optional arguments optional over the API.
- **RPC** — `public.save_child(...)`, so a child and its two tag sets are written in one transaction.

## API
All writes are server actions; there are no route handlers.

- `saveGenderPreferenceAction(gender)` — updates the caller's household.
- `saveChildAction(input)` — calls `public.save_child(...)`.
- `deleteChildAction(childId)` — deletes the child; joins cascade.
- `addCareWindowAction({ dayOfWeek, startTime, endTime })` — inserts one window.
- `removeCareWindowAction(windowId)` — deletes one window.

Each action returns `{ error?: string; ok?: boolean }`, reads the caller with `getClaims()`, and calls `revalidatePath("/household")` on success. `addCareWindowAction` and `saveGenderPreferenceAction` resolve the household id with `ensureHousehold()`; `save_child` resolves it inside the RPC. Inline errors, not toasts; Sonner is installed but never mounted, and the rest of the app reports errors on the page.

## Data Model

### Columns

```
households
  preferred_caregiver_gender  text not null default 'no_preference'
                              check in ('female', 'male', 'no_preference')

children
  notes                       text null
                              check (notes is null or char_length(notes) <= 1000)
```

`children` already has `full_name` and `date_of_birth`, and its household-scoped policies already cover select, insert, update, and delete. No policy changes are needed there.

### Reference tables

```
needs
  id          uuid primary key default gen_random_uuid()
  slug        text not null unique
  label       text not null
  position    smallint not null
  created_at  timestamptz not null default now()

supports
  id          uuid primary key default gen_random_uuid()
  slug        text not null unique
  label       text not null
  position    smallint not null
  created_at  timestamptz not null default now()
```

Two tables rather than one with a `kind` column: a need and a support are different dimensions, and 7.2 lets caregivers tick supports only. Separate tables keep the foreign keys honest.

Seeded in the migration with `on conflict (slug) do update`, so rerunning is safe.

**Needs — 14**

| slug | label |
|---|---|
| high-energy-behaviour | High-energy or heavy behaviour |
| big-feelings | Big feelings or frequent meltdowns |
| transitions | Difficulty with change or transitions |
| sensory-sensitivities | Sensory sensitivities |
| communication | Limited speech or non-speaking |
| close-supervision | Needs close supervision |
| medical-needs | Medical or health needs |
| mobility-needs | Physical or mobility needs |
| learning-support | Learning or developmental support |
| social-play | Social or play difficulties |
| sleep | Sleep or bedtime challenges |
| emotional-regulation | Anxiety or emotional regulation |
| personal-care | Toileting or personal care |
| feeding-mealtime | Feeding or mealtime challenges |

**Supports — 14**

| slug | label |
|---|---|
| personal-care | Personal care (toileting, dressing, hygiene) |
| feeding-mealtime | Feeding and mealtime support |
| cooking | Cooking and meal preparation |
| mobility-transfer | Mobility and transfer support |
| medication | Medication reminders |
| communication | Communication support (AAC or sign) |
| behaviour | Behavioural support and de-escalation |
| sensory-regulation | Sensory regulation |
| social-play | Social and play support |
| learning-homework | Learning and homework support |
| sleep-bedtime | Sleep and bedtime routines |
| seizure-response | Seizure response |
| medical-device | Medical device or tube care |
| transport | Transport accompaniment |

### Child tags

```
child_needs
  child_id  uuid not null references children(id) on delete cascade
  need_id   uuid not null references needs(id) on delete cascade
  primary key (child_id, need_id)
  index on need_id

child_supports
  child_id     uuid not null references children(id) on delete cascade
  support_id   uuid not null references supports(id) on delete cascade
  primary key (child_id, support_id)
  index on support_id
```

No update policy. A save replaces the set: delete the child's rows, insert the selected ones.

### Care windows

```
household_availability
  id            uuid primary key default gen_random_uuid()
  household_id  uuid not null references households(id) on delete cascade
  day_of_week   smallint not null check between 1 and 7
  start_time    time not null
  end_time      time not null
  check (end_time > start_time)
  index on household_id
```

Same shape as `caregiver_availability`, deliberately: matching is an overlap join on `day_of_week`, `start_time`, and `end_time`, with no translation layer.

### RLS and grants

- `needs` and `supports`: select for `anon` and `authenticated`. No write policies. The taxonomy is public.
- `child_needs` and `child_supports`: select, insert, delete for `authenticated`, each scoped through `exists (select 1 from children c where c.id = child_id and c.household_id = private.current_household_id())`.
- `household_availability`: select, insert, delete for `authenticated` where `household_id = private.current_household_id()`.
- `households`: a new update policy for members, `using` and `with check` both `id = private.current_household_id()`. Grant `update` on `households` to `authenticated`; the existing grant is select only.
- No admin policies on any of the new tables. Admins read no children, no notes, no need or support selections, and no care windows.

## RPC

```
public.save_child(
  p_child_id      uuid default null,      -- null creates
  p_full_name     text default null,
  p_date_of_birth date default null,
  p_notes         text default null,
  p_needs         text[] default '{}',    -- slugs
  p_supports      text[] default '{}'     -- slugs
) returns uuid
language plpgsql
security invoker
set search_path = ''
```

- Resolves `household := private.current_household_id()` and raises if null. The caller never supplies a household id.
- Rejects a blank name, a date of birth in the future, and notes over 1,000 characters.
- On update, `where id = p_child_id and household_id = household`; raises if no row matched, so a child from another household cannot be edited.
- Verifies every slug exists before writing, so an unknown slug is an error rather than silently ignored.
- Deletes the child's existing `child_needs` and `child_supports` rows, then inserts the selected ones.
- One transaction, so the child and both tag sets are all-or-nothing.
- `revoke all from public, anon`; `grant execute to authenticated`.

`security invoker` is deliberate: RLS stays in force, and the function's own household check stops cross-household writes.

## Flow
Parent signs in → `landingPath` returns `/household` → page checks admin, then caregiver, then `ensureHousehold()` → `getHouseholdProfile()` loads the household, children, tags, lists, and windows → add or edit child → `saveChildAction` → `save_child` RPC → revalidate → page shows the change.

## Notes
- **Household creation moves out of billing.** `ensureHousehold()` now runs on the household page. Billing attaches a subscription to the household that already exists, and contact details remain the paywall. This supersedes the caregiver-onboarding note that said creation waits for payment.
- **A parent's landing path changes** from `/caregivers` to `/household`. The catalogue stays the suspended placeholder it is now.
- **`ensureHousehold()` returns the id.** It currently returns nothing; the page needs the id, and the RPC already returns it.
- **Timezone is deferred.** Both sides store wall-clock `time` values. The architecture's UTC-plus-timezone rule needs a timezone on both owners; that lands with search. The shapes already match, so the change will be additive.
- **Age is derived in UTC** from the `YYYY-MM-DD` string, never from a local `Date`, so a birthday cannot appear a day early or late.
- **Notes are sensitive.** They are read only through the household's own session. Never select them in an admin function, never include them in a catalog query, and never log them.
- **No global save bar.** Each unit saves when it is confirmed: the child dialog, the add-day form, and the gender choice. There is no draft to lose.
- **No new dependency.** The existing shadcn set covers the form; gender and day selection use `DropdownMenu`.
- **Deferred:** inviting a second parent, naming the household, editing the lists from admin, per-child gender preference, custom needs or supports, child photos or care-plan uploads, matching, and billing.
