# Feature: Caregiver capabilities and credentials

## Purpose
A caregiver records what they can take on — the needs they can support, the supports they provide, the ages they work with, their own date of birth, and their gender — and uploads a document per licence or certification. An admin approves or rejects each document on its own, and the caregiver's verified badge follows from the documents rather than from a button.

## User Flow
1. A signed-in caregiver opens `/me`.
2. **Edit profile** now carries their date of birth, gender, and the age range they work with, alongside name and bio. Save writes them with everything else.
3. Below the header, two new sections: **Children you can support** (the 14 needs, framed from their side) and **What you can provide** (the 14 supports). Both tick, both save with the save bar.
4. **Credentials** replaces *Your background check*. The list shows every uploaded document with its kind, its status, and its expiry.
5. **Add credential** opens a dialog: kind, expiry date, and a file. The upload happens on confirm, not on the save bar, and the row appears straight away as *Pending review*.
6. An admin opens the caregiver and approves or rejects **each document separately**, seeing its expiry.
7. The caregiver's page shows the outcome per row, and their badge is calculated from those rows.

## Rules

### Capabilities
- **Needs and supports come from the fixed lists parents already use.** The needs are the same 14 rows a parent ticks per child; the caregiver sees them under “I can support children who…”, so the wording reads from their side. The supports are the other 14, unchanged.
- **Nothing is required to save.** A caregiver can save with no needs, no supports, no gender, no ages, and no date of birth. Completeness counts what is missing; it never blocks a save.
- **Date of birth is a calendar date, and age is derived from it, never stored.** The profile shows the age; the date itself is not shown to anyone but the caregiver and an admin.
- **Gender is one of Female, Male, Non-binary, Prefer not to say, or blank.** A search filtered by gender will not match a blank or “prefer not to say”, and the page says so.
- **The working age range is two whole years, inclusive at both ends.** Minimum 0, maximum 21, and the maximum must be at least the minimum. A range is either complete or absent; half a range is refused.
- **Capabilities save in one write.** The two tag sets, date of birth, gender, and the working age range go together through one function, so a save cannot land half-applied.
- **Capabilities are never shown to another caregiver.** Only the caregiver, and an admin reviewing them, can read them.

### Credentials
- **Every document has a kind**, from a fixed list: Background check, CPR, Driver's licence, Certification, Other. No kind is required.
- **One document per kind is live.** Adding a credential of a kind already present replaces it: the old row goes, the new one starts at *Pending review*.
- **A document may carry an expiry date, and it is optional.** An expiry date already in the past is refused at upload.
- **Review is per document.** An admin approves or rejects one document; the others are untouched.
- **The badge is derived from the documents, never set by hand.**
  - *Rejected* — any live document was rejected.
  - *Approved* — at least one document exists and every live document is approved and unexpired.
  - *Pending* — anything else, including no documents at all.
- **It is calculated when it is read**, so an expiring document stops counting the moment its date passes. Nothing runs on a timer and no stored copy can go stale.
- **Nobody can write `verification_status` through the API**, because there is no longer a column to write. The caregiver-level Approve and Reject buttons on the admin screen are removed.
- **Replacing a document resets only its own kind.** Swapping the CPR card returns CPR to review; an approved background check stays approved.
- **Uploading any document is what submits a profile for review.** It stamps `submitted_at` the first time and never clears it.
- **A caregiver can delete or replace any document**, including an approved one, and is told what it costs them.
- **The reviewer and the time are recorded per document.**
- **The caregiver sees each document's status and expiry.** A document expiring within 30 days says so; an expired one reads *Expired* and names itself in the line under the header.
- **Documents stay private.** They are read through signed URLs generated on the server; the bucket is unchanged.

### Both
- **The admin detail page shows capabilities** — needs, supports, date of birth with the derived age, gender, and working age range — because an admin cannot judge a fit without them.
- **No search, catalog, matching, billing, or notifications appear in this feature.** The data exists so those features have something to filter.
- **RLS, not the UI, decides access.** Every new table is scoped to its owner, and the admin reads what review requires.
- **This supersedes the rule in `admin-verification`** that an admin approves the caregiver and documents are untouched.

## Acceptance Criteria
- [ ] A caregiver can tick needs and supports, set a date of birth, a gender, and a working age range, and all of it survives a reload.
- [ ] A caregiver can save with nothing filled in.
- [ ] The profile shows an age derived from the date of birth, and a caregiver under one reads as “Under 1 year old”.
- [ ] A date of birth in the future is refused.
- [ ] A working age range whose maximum is below its minimum is refused with a readable message.
- [ ] Half an age range — a minimum with no maximum — is refused.
- [ ] Needs and supports can only be chosen from the fixed lists; an unknown slug is an error, not silently dropped.
- [ ] A caregiver can add a credential of each kind, and it appears immediately as Pending review.
- [ ] An expiry date in the past is refused.
- [ ] Adding a credential of a kind that already exists replaces the old row and returns that kind to Pending review.
- [ ] Replacing a CPR card leaves an approved background check approved.
- [ ] An admin approves one document without affecting the others.
- [ ] A caregiver whose documents are all approved reads as Approved.
- [ ] A caregiver with one rejected document and no pending ones reads as Rejected, and that row shows the rejection.
- [ ] A caregiver with a pending document and no rejected ones reads as Pending.
- [ ] A caregiver with no documents reads as Pending.
- [ ] A document whose expiry has passed reads as Expired and drops the caregiver out of Approved without any job running.
- [ ] Neither a caregiver nor an admin can write `verification_status` through the API, because the column no longer exists.
- [ ] The admin detail page shows needs, supports, age, gender, and working age range.
- [ ] The admin list still filters by the same four buckets, now calculated the same way.
- [ ] Another caregiver cannot read this caregiver's needs, supports, or documents through the API.
- [ ] A parent cannot read them either.
- [ ] `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass.
