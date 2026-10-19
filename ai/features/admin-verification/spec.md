# Feature: Admin verification

## Purpose
An internal admin signs in and reviews caregivers: every caregiver is listed, filterable by status and searchable by name, email, or phone, and each one can be opened to read their profile and their background check before approving or rejecting them.

## User Flow
1. An admin goes to `/admin/sign-in` and signs in with Google, or with an email and password.
2. They land on `/admin/caregiver`, the list of every caregiver.
3. The list shows each caregiver's name, email, and verification status. Filter buttons above it cover **All, Onboarding, Pending, Approved, Rejected**, and a search box sits beside them.
4. Typing in the search box narrows the list by name, email, or phone number, keeping the current filter.
5. Clicking a row opens `/admin/caregiver/[id]`: avatar, name, bio, contacts, weekly availability, and the uploaded documents.
6. They open the background check in a new tab and read it.
7. They approve or reject the caregiver. The caregiver's own page reflects the decision immediately.
8. The admin can change a decision later by opening the profile again.

## Rules
- **An admin is a row in `admins`.** No role column, no admin signup page, no invite flow. The first admin is inserted by hand in SQL; every later one is too. There is deliberately no way to make yourself an admin from the app.
- **`/admin/sign-in` is sign-in only**, for both Google and email/password. It reuses the existing form and the existing actions; it has no "create an account" link.
- **The route guard is the layout.** Signed out → `/admin/sign-in`. Signed in but not an admin → **404**, not a "you are not allowed" page, because that page confirms the route exists.
- **Admins land on `/admin/caregiver` from any sign-in route.** The decision is made after the session exists, the same way caregivers are routed to `/me`. Admin wins if a person is somehow both.
- **The status buckets are disjoint.**
  - **Onboarding** — `submitted_at is null`. They have not uploaded a background check, and uploading one is what submitting for review means. There is nothing to review yet.
  - **Pending** — `submitted_at is not null` and `verification_status = 'pending'`. Waiting on us.
  - **Approved** and **Rejected** — by `verification_status`, whatever `submitted_at` says.
  - **All** — everything.
- **Pending does not mean complete.** `submitted_at` is stamped when a background check is uploaded, which can happen before the rest of the profile is filled in. The detail page shows which of the five onboarding items are done, so the admin can see a half-finished submission and decide what to do with it.
- **The list opens on Pending.** All is one click away; opening on everything would bury the rows that need a decision.
- **The list shows 10 caregivers per page.** The admin can switch to 25, 50, or 100 on the same screen. The choice lives in the URL alongside the filter and search, and changing it returns to page one.
- **The email is the address on the account**, read from `auth.users`, not from `contacts`. Contact emails and phones are separate optional rows and are shown on the detail page, but the account address is the one that identifies the caregiver.
- **Search is case-insensitive and matches substrings** across `caregivers.display_name`, the account email, and any of the caregiver's `contacts.phone` or `contacts.email`. A caregiver with no name yet is still findable by email.
- **Only the status changes.** The admin cannot edit a caregiver's name, bio, contacts, or documents. Reviewing is not editing.
- **The admin approves the caregiver, not their documents.** `caregiver_documents.review_status` stays at its default and is not part of this screen. Approving a person is the decision.
- **Every decision records who and when**, in `caregivers.reviewed_by` and `reviewed_at`, on approval and on rejection alike.
- **A decision can be reversed.** There is no "approved means final" rule; the buttons are always available and overwrite the previous decision.
- **There is no rejection reason yet.** The caregiver sees their status change and nothing else. Deferred, pending an answer from the business.
- **The background check is opened through a signed URL**, one hour long, generated on the server at render. The bucket is private, so there is no stable link to store or share.
- **A rejected caregiver who uploads a new background check returns to Pending automatically.** The existing trigger does this, so they reappear in the queue without an admin doing anything.
- **No emails are sent.** Approving or rejecting is silent for now; the notification worker is a later feature.
- **The admin area has no footer and no marketing chrome.** A minimal header with the wordmark and a sign-out button.
- **RLS, not the UI, decides access.** The admin policies are what let the list see pending caregivers at all; the pages assume the policies are in place.

## Acceptance Criteria
- [ ] An admin signs in with email and password and lands on `/admin/caregiver`.
- [ ] The same admin signs in with Google and lands on `/admin/caregiver`.
- [ ] A signed-out visitor to `/admin/caregiver` is sent to `/admin/sign-in`.
- [ ] A signed-in caregiver or parent who visits `/admin/caregiver` gets a 404.
- [ ] The list opens on the Pending bucket.
- [ ] All shows every caregiver, whatever their status.
- [ ] Each row shows name, email, status, and links to the profile.
- [ ] A caregiver who never finished onboarding has no name, is grouped under Onboarding, and is still findable by their account email.
- [ ] Onboarding and Pending never contain the same caregiver.
- [ ] Each filter button returns only its bucket, and shows its count.
- [ ] The list shows 10 rows by default, and page 2 shows the next 10.
- [ ] Switching rows per page to 25, 50, or 100 changes the page size, keeps the filter and search, and returns to page one.
- [ ] Searching by full name, by partial email, and by a phone number each narrow the list correctly, within the active filter.
- [ ] The detail page shows the caregiver's contacts, weekly availability, and which of the five onboarding items are complete.
- [ ] The background check opens in a new tab for an admin.
- [ ] Approving sets `verification_status = 'approved'`, `reviewed_by`, and `reviewed_at`, and the caregiver's `/me` shows Verified.
- [ ] Rejecting sets the status to `rejected` with the same audit fields, and `/me` shows Not approved.
- [ ] Reversing a decision works.
- [ ] Approving a caregiver leaves `caregiver_documents.review_status` unchanged.
- [ ] An admin still reads no children and no households.
- [ ] A non-admin cannot list caregivers, or read a caregiver's contacts or availability, through the API.
- [ ] `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass.
