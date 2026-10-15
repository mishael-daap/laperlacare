# Tasks: Caregiver onboarding

Built by direction rather than by this list, so the order below is roughly what shipped rather than what was planned.

- [x] Migration creating `caregiver_documents`, adding `caregivers.bio` and `caregivers.submitted_at`, and creating the private `caregiver-documents` bucket with its size cap, type list, and storage policies.
- [x] A guard trigger stopping anybody who is not an admin from setting `verification_status`, plus the rule that replacing a background check returns the caregiver to `pending`. Verified: self-approval and self-rejection are refused, a service-context write is allowed, a background check resets the status, a certification leaves it alone.
- [x] Removed `ensureHousehold` from sign-up, sign-in, and both callbacks. It ran for everybody and would have made every caregiver a parent with a household. Household creation moves to billing.
- [x] `display_name` made nullable, so a caregiver row can exist before they have named themselves.
- [x] `/caregivers/sign-up`, with the caregiver intent carried across the Google round trip in a cookie rather than a URL parameter.
- [x] `/caregivers/sign-in`, so the caregiver pages stay a self-contained pair.
- [x] `/me`, role-aware: the `caregivers` row is the whole test, and a parent is sent to the catalogue.
- [x] Sign-in sends a caregiver to `/me` and a parent to `/caregivers`, decided after the session exists rather than from where they started.
- [x] Completeness derived from five checks, never stored.
- [x] The weekly availability board, saving the week whole, merging adjacent hours into blocks.
- [x] Contacts as cards, with any number of them, added and removed in the draft.
- [x] The background check, uploaded to the private bucket.
- [x] Profile fields edited in place behind a pencil, with one save bar committing everything.
- [x] An Edit profile toggle, so the page reads as a profile rather than a form.
- [x] `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass.

Changed while building, beyond the plan:

- [x] **The onboarding modal was built and then deleted.** Everything it did ended up on the page, so it was a three-step dialog for a form sitting in front of the caregiver. Its replacement is the Edit profile toggle.
- [x] **The save bar replaced a modal drawer.** The drawer dimmed the page and swallowed clicks; a prompt about this page should not block this page. It is a plain sliding bar now.
- [x] **`--success` and `--warning` tokens added to the theme.** It shipped no colour meaning "fine" or "waiting", and a verification status needs both.
- [x] **`--success` lightened after the first attempt.** A dark forest green read as *disabled* on the availability grid, which is the opposite of a lit hour.
- [x] **`next.config.ts` allows images from the Supabase Storage host**, derived from the project URL so a staging project needs no edit.
- [x] **The footer left the root layout.** It cannot be un-rendered by a nested layout, and `/me` must not have one.
- [x] A custom 404 in the primary colour, in the mono face.
- [x] `caregiver_documents.file_name`, because the storage path is a generated key and showed the caregiver nothing they recognised.

Deferred, and not forgotten:

- [ ] **Google OAuth setup** — a Google Cloud project, an OAuth client, and the provider enabled in Supabase. The button exists and will fail until this is done.
- [ ] **Turn email confirmation back on, with a verified Resend domain.** Confirmation is off for development; `onboarding@resend.dev` can only send to the Resend account's own address.
- [ ] **Admin review of the uploaded documents**, which is the next roadmap item.
- [ ] **Household naming and creation after payment**, which is the billing feature.
- [ ] **A link to caregiver sign-up from the landing page.** It is parent-facing throughout.
- [ ] **`gender`, `education_level`, `certifications[]`, `specialisations[]`, `timezone`** — the search feature.
- [ ] **Documents cannot be previewed.** The bucket is private and a URL would have to be signed; that belongs to the review screen.
