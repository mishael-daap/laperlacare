# Technical Plan: Caregiver onboarding

## Components
- **`src/app/caregivers/sign-up/page.tsx`** — the caregiver sign-up, reusing `AuthForm` with a different action and an intent marker.
- **`src/app/me/page.tsx`** — the signed-in person's page, role-aware.
- **`src/components/caregiver/onboarding-modal.tsx`** — shadcn `Dialog`, three stages, each saving on its own.
- **`src/components/caregiver/completeness.tsx`** — the "3 of 5 complete" line, which opens the modal.
- **`src/components/caregiver/availability-board.tsx`** — the weekly grid. Separate from the modal, by request.
- **`src/components/caregiver/document-upload.tsx`** — uploads to the private bucket and writes the row.
- **`src/lib/caregiver/completeness.ts`** — derives the count from the loaded row.
- **`src/lib/auth/actions.ts`** — gains a caregiver sign-up action; **loses** its `ensureHousehold` calls.

## API
No new HTTP routes. Server actions for each stage, plus the upload, plus availability save.

## Data Model

**One new table** — this is the one we parked during the data model work:

```
caregiver_documents
  id            uuid PK
  caregiver_id  uuid NOT NULL → caregivers(user_id)
  kind          text NOT NULL    -- background_check | certification | other
  storage_path  text NOT NULL
  review_status text NOT NULL    -- pending | approved | rejected
  reviewed_by   uuid → auth.users(id)
  reviewed_at   timestamptz
  created_at    timestamptz NOT NULL default now()
```

**Two new columns:** `caregivers.bio text`, and `caregivers.submitted_at timestamptz`. The second is what makes review state derivable — null until they submit, set afterwards — so no fourth status value is needed. Everything else the modal collects already has a home: contact details in `contacts`, name and avatar on `caregivers`.

Still deferred to the search feature: `gender`, `education_level`, `certifications[]`, `specialisations[]`, `timezone`.

**A private bucket**, `caregiver-documents`, with a size cap and an allowed type list, and storage policies so a caregiver writes only to their own folder and **only admins can read**. This is the opposite of the avatars bucket, and it is why documents need signed URLs and avatars do not.

**Completeness** is derived in the app from five checks: a contact row exists, `display_name` and `bio` are set, `avatar_path` is set, an approved-or-pending `background_check` document exists, and at least one availability block exists.

**A trigger or server-side rule** returns `verification_status` to `pending` when a new `background_check` document replaces an old one. Not a policy — a caregiver can update their own row, so this is the one field they must not be able to set.

## Flow
Caregiver sign-up → account and `caregivers` row, no household → `/me` → completeness line → modal, stage by stage → each stage writes on its own → availability board separately.

## Notes
- **Removing `ensureHousehold` from the auth paths is part of this feature.** It currently runs on every sign-up and sign-in and would make every caregiver a parent with a household. Household creation moves to the parent household page; billing attaches a subscription to the household that already exists. The function itself stays — that page calls it.
- **Google needs the intent to travel.** A caregiver signing up through Google returns via the same `/auth/callback` as a parent, so the callback has to be told which it was. A value carried through the OAuth redirect, not a guess from the return URL.
- **`/me` must not be cached.** It reads the session, so it is dynamic by nature. No `"use cache"`.
- **The `caregivers` row is created at sign-up, not on first visit to `/me`.** Otherwise a caregiver who never opens their profile has no row and is indistinguishable from a parent.
- **Signed URLs expire.** Documents are shown on the profile and to admins, so the URL has to be generated at render and not stored. Sizes are small and counts are low, so one at a time is fine.
- **The board saves whole**, as specified in the data model: delete the caregiver's rows and insert the new set in one transaction. No diffing.
- **The caregiver sign-up needs somewhere to be linked from.** The landing page is entirely parent-facing, so there is no entry point yet. A link belongs somewhere on it, and the FAQ answer about who the service is for may need revisiting.
