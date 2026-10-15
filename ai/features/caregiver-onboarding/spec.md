# Feature: Caregiver onboarding

## Purpose
A caregiver can create an account and then build the profile parents will see: contact details, a bio, a background check, and weekly availability. Nothing is mandatory up front and everything stays editable.

## User Flow
1. A caregiver arrives at `/caregivers/sign-up` and creates an account with email or Google. No household is created.
2. They land on `/me`, which is theirs because they have a `caregivers` row.
3. `/me` shows what is done and what is not: **"3 of 5 complete"**.
4. Tapping that opens the onboarding modal, a guided pass over what is missing.
5. The modal runs in stages — contact information, profile and bio, background check — and **each stage saves on its own**. Closing it at any point keeps whatever was saved.
6. The last stage confirms: their documents have been submitted for review.
7. Availability is **not** in the modal. It is its own board on `/me`, editable whenever.
8. Everything the modal covers is also editable directly on `/me`, so the modal is a shortcut rather than a gate.

## Rules
- **Signing up never creates a household.** A household is created after payment, where the parent is asked to name it. Caregivers are never parents, and this is what keeps the two apart.
- **`/me` is role-aware.** It reads whether the caller has a `caregivers` row and renders accordingly. Parents have no profile page yet.
- A caller with no `caregivers` row is not a caregiver. That is the only test needed.
- **A `caregivers` row is created at caregiver sign-up**, which is what makes someone a caregiver.
- The modal is dismissible at every stage, including mid-stage, with no data loss beyond the unsaved field.
- **Completeness is derived**, never stored. Five things: contact information, display name and bio, avatar, background check, and availability. A derived count cannot drift out of step with the data it describes.
- **`verification_status` starts at `pending` and is not changed by the caregiver.** Only an admin approves or rejects, in the next feature.
- **Whether they have submitted for review is derived, not a status.** `caregivers.submitted_at` is null until they submit and set afterwards, so "still filling this in" and "waiting on us" are distinguishable without a fifth state that every policy touching `verification_status` would have to learn about.
- A caregiver can edit their bio and contact details at any time. Replacing the background check returns them to `pending`, because the document an admin approved is no longer the document on file.
- Documents live in a **private** bucket and are reachable only by admins through short-lived signed URLs. Unlike avatars, these are never public.
- A caregiver is free to join. There is no payment anywhere in this flow.

## Acceptance Criteria
- [ ] `/caregivers/sign-up` creates an account and a `caregivers` row, and **no household and no parents row**.
- [ ] The same sign-up through Google also creates no household. Intent survives the OAuth round trip.
- [ ] Signing in sends a caregiver to `/me` and a parent to `/caregivers`.
- [ ] `/me` shows the correct completeness count, and the count changes when an item is completed.
- [ ] The modal shows only the incomplete stages, and can be closed at any point.
- [ ] Each stage saves independently; closing after stage one and returning later keeps stage one.
- [ ] The final stage confirms submission for review.
- [ ] Availability is editable from `/me` and is absent from the modal.
- [ ] Uploading a background check stores it in the private bucket, and fetching its URL while signed out fails.
- [ ] Replacing the background check after approval returns the caregiver to `pending`.
- [ ] The review queue can tell a submitted profile from one still being filled in, from `submitted_at` alone.
- [ ] No page anywhere lets a caregiver set their own `verification_status`.
- [ ] `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass.
