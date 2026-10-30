# Feature: Caregiver application

## Purpose
The paper application the team already sends out becomes the source of truth for what a caregiver is asked, and it becomes two pages in the app. The facts a caregiver keeps current sit on `/me`; the facts we set down once and review sit on `/application`, so a decision is made against a form that cannot quietly change underneath it. A guided pass walks a new caregiver through both, counting the sixteen sections as they go.

## What we collect

Everything below comes from `ai/ideas/2026-10-28-caregiver-application-form.md`. Nothing on the form is dropped. Four things are restructured rather than asked:

- The four age bands become one numeric range.
- Ten fields the app can already work out are never asked at all.
- Every licence and certification becomes a credential — a file an admin approves — instead of a tick box.
- The "willing to get it" answers are dropped. A credential exists or it does not.

### `/me` — the profile

Editable at any time, save bar as today. Credentials leave this page and move to the application.

**1 · Profile**

| Field | Notes |
|---|---|
| Photo | as today |
| Preferred name | `display_name`, as today |
| Short bio | as today |
| Date of birth | calendar date; the age is derived, never stored |
| Gender | Female, Male, Non-binary, Prefer not to say, or blank |

**2 · Work details**

| Field | Notes |
|---|---|
| Hourly rate | whole dollars |
| Ages you work with | minimum and maximum, 0–21, both or neither — covers the form's four bands |
| Counties you can work in | San Francisco, San Mateo, Santa Clara, Alameda, Contra Costa, Marin, Other |
| Other county | free text, only when Other is ticked |
| Regional Center worker | yes/no |
| Regional Center name | free text, only when yes |
| Earliest start date | calendar date |

**3 · Languages**

| Field | Notes |
|---|---|
| Languages you speak fluently | English, Spanish, Mandarin, Cantonese, Vietnamese, Tagalog, Other |
| Other language | free text, only when Other is ticked |

**4 · Transportation**

| Field | Notes |
|---|---|
| Car and insurance | yes/no |
| Willing to drive the person you care for | yes/no |
| Maximum travel distance | miles from home |

The driver's licence is **not** here. It is a credential, and "can drive" is read from it wherever it is needed.

**5 · Home environment**

| Field | Notes |
|---|---|
| Comfortable with pets | dogs, cats, both, or none |
| Non-smoker | yes/no |

**6 · Children you can support** — the 14 needs, unchanged.

**7 · What you can provide** — the 14 supports, unchanged.

**8 · Weekly availability** — the existing day/time grid, with hours per week shown read-only beneath it.

**9 · Contact details**

| Field | Notes |
|---|---|
| Label | as today |
| Phone | as today |
| Email | **prefilled from the account**, editable, so it is asked once |
| Preferred contact method | phone, text, or email |
| Address | **removed** — the home address lives on the application |

### `/application` — the application

Editable at any time. What an edit costs is a new signature, not a lock.

**10 · Personal details**

| Field | Notes |
|---|---|
| Full legal name | the name on a licence or background check; prefilled from the preferred name, editable |
| Home address | street, city and ZIP in one block — three columns, one ask |
| How you heard about Perla Care | free text |

**11 · Experience** — a list, added a row at a time

| Field | Notes |
|---|---|
| Employer or family | free text |
| Role | free text |
| From | month and year |
| To | month and year, or "still here" |
| Ages and needs supported | free text, one field as on the form |
| Total years | **derived** from the rows, shown read-only |

**12 · Experience with needs** — fifteen boxes, fixed list

Autism spectrum · Down syndrome · Cerebral palsy · Intellectual disability · ADHD · Epilepsy and seizures · Non-verbal communication (AAC, PECS, sign) · Challenging behaviours · Sensory processing needs · Feeding support, including G-tube · Toileting and personal care · Lifting and transfers, wheelchair · Medication reminders · Following a behaviour plan (ABA) · Other

`Other` carries a free-text label.

**13 · References** — exactly two

| Field | Notes |
|---|---|
| Full name | |
| Relationship | required; relatives are refused in words, not by a check |
| Organisation or family | |
| Phone | |
| Email | |
| How long they have known you | free text |

**14 · Your questions**

| Field | Notes |
|---|---|
| Why do you want to work with people with special needs? | long text |
| Describe a difficult moment and how you handled it | long text |

**15 · Credentials** — moved here from `/me`

Add, replace, remove; each row carries its kind, its expiry, its review status and any rejection reason. The fixed list of kinds is the whole certification section of the form:

`background_check` · `cpr` · `first_aid` · `rbt` · `cna_nursing` · `trustline` · `drivers_licence` · `other`

Nothing about a credential is typed. Having CPR means an approved CPR document exists; the expiry is entered once, at upload, on the document row.

**16 · Background check and signature** — the last section

| Field | Notes |
|---|---|
| Statement | fixed text, versioned in `src/lib/caregiver/application-statement.ts` |
| Background check agreement | one checkbox, with the form's own wording |
| Signature | typed name, prefilled from the legal name, editable |
| Signed at | **derived** — the server clock at submission, never the client |
| Printed name | **derived** — the legal name |
| Date | **derived** — the same timestamp |

The signature is the submit. There is no "submitted but unsigned" state.

### Admin — the application record

**Derived, never entered:** application received (`submitted_at`), reference 1 and reference 2 (from the reference rows), background check (from that credential's review status), CPR and First Aid proof (from those credentials), profile published and the overall decision (from `private.caregiver_status`).

**Recorded by an admin:**

| Field | Notes |
|---|---|
| Video interview | date + pass/fail |
| TrustLine | cleared, pending, or not applicable |
| Profile approved | date + who. Once, and not revisited |
| Profile declined | date + reason. Undone only by the caregiver signing again |

## The sixteen sections

One list, used by the progress counter, the onboarding flow and the admin page. Every section is counted on its own, and the order here is the order they appear on the pages.

| # | Section | Where |
|---|---|---|
| 1 | Profile | `/me` |
| 2 | Work details | `/me` |
| 3 | Languages | `/me` |
| 4 | Transportation | `/me` |
| 5 | Home environment | `/me` |
| 6 | Children you can support | `/me` |
| 7 | What you can provide | `/me` |
| 8 | Weekly availability | `/me` |
| 9 | Contact details | `/me` |
| 10 | Personal details | `/application` |
| 11 | Experience | `/application` |
| 12 | Experience with needs | `/application` |
| 13 | References | `/application` |
| 14 | Your questions | `/application` |
| 15 | Credentials | `/application` |
| 16 | Background check and signature | `/application` |

Credentials sit at 15, between the written answers and the signature, because documents are uploaded before the form is signed and stay editable afterwards.

## User Flow

1. A caregiver signs up. Sign-up is unchanged: email, password, terms.
2. They land on `/onboarding`, not `/me`. It reads **0 of 16 sections complete**, lists the sixteen with their state, and offers one action: start with the first incomplete one.
3. Each section is the same component the pages use, reached by anchor. The counter stays visible while they work.
4. The rail can be left at any point. `/me` shows the same counter and reopens the flow.
5. The primary action always names the first incomplete section, so nobody has to work out what is left.
6. The last section is the signature. Typing a name and pressing **Sign and submit** is the submission, and the database refuses it while an answer is missing.
7. Submitting stamps `submitted_at` and puts the caregiver in the admin's Pending bucket.
8. An admin opens the caregiver. The application reads down the page, followed by Credentials, Review history, Application record and Availability. Each document is still approved or rejected on its own.
9. An admin decides the profile once — **Approve profile**, which needs a cleared background check, or **Decline** with a reason. After that each credential is approved or rejected on its own, forever.
10. The caregiver can change any answer at any time. Changing one clears the signature, which drops the application out of Pending until it is signed again. The admin only ever reads the current version, so there is nothing to return and no reason to ask.
10. The caregiver is Approved when every credential is approved and unexpired **and a background check is among them**.

## Rules

### The split
- **A fact lives where it changes.** Price, area, hours, languages, transport, pets and smoking change on a whim, so they are on `/me`. Vetting facts — legal name, experience, references, signature — are sworn once, so they are on `/application`.
- **Nothing locks.** The application is editable forever, and so is every credential.
- **An edit costs a signature.** Changing any attested answer clears the signature and `submitted_at`, which puts the application back in the queue on its own. Nobody has to ask for it and no admin has to return it.
- **The admin reads the current version, always.** There is no version to approve that can differ from what is stored.
- **Submitting the application is what puts a caregiver in the review queue.** Uploading a document no longer does.

### Credentials
- **One fixed list of kinds, eight of them**, in `src/lib/caregiver/credentials.ts` and the `kind` check constraint. They are the certification section of the form.
- **A credential is a file, a kind, an optional expiry, and a review status.** Nothing else.
- **Held is never typed and never stored.** No document means not uploaded, whatever the caregiver believes.
- **The admin's "Clear / Review" for the background check, and the CPR and First Aid proof rows, are derived** from the credential's review status. No field.
- **The profile is approved once, and the background check is what approves it.** An admin cannot approve a profile without a cleared background check. Once approved, the profile stays approved — a credential that later expires or is rejected is that credential's problem, not a withdrawn approval.
- **Rejecting a credential does not change the caregiver's status.** It changes that row, and the row says so.

### Background check
- **Three separate things.** The agreement is a checkbox and is consent, not evidence. The check itself is a `background_check` credential the caregiver uploads. Clearing it is that credential being approved.
- **We never run the check.** The screening partner does; `ai/architecture.md` already says the platform records and reviews claimed credentials.
- **No FCRA disclosure flow.** The form's words say a separate disclosure arrives from the partner, and the checkbox only records that the caregiver read that sentence.

### Signature
- **Typed name, server timestamp, statement version.** No image, no canvas.
- **Write-once.** No update path exists for `signature_name`, `signed_at`, or `signed_statement_version`.
- **Any edit after a return clears it**, and resubmitting requires signing again. The statement says the information is true; change the information and the attestation is stale.
- **The statement is versioned.** Changing the wording means a new version; existing signatures keep pointing at what was signed.
- **IP and user agent are recorded** alongside it, as an audit trail.

### Onboarding
- **Sixteen sections, one list, one counter.** The list lives in `src/lib/caregiver/completeness.ts` and is the only place the number is defined.
- **"Complete" is derived, never stored.** No column tracks progress, and a section is complete when its required answers are present, by the same rules submission enforces.
- **Every section counts once**, and no section contains another.
- **The flow is a guide, not a second set of forms.** It renders the same components the pages render.
- **It can be skipped.** `/me` always shows the counter.

### Derivation
- **We do not ask for anything the app can work out.** Age, total years, printed name, signing date, and every admin pipeline step that reads off existing data are computed.
- **Total years is the span of the experience rows**, earliest start to latest end, counting gaps once.
- **Hours per week is the sum of the weekly grid**, shown read-only.
- **Derived values are never stored.** They are computed when they are read, so they cannot go stale.

### One fact, one home
- **A credential is the only record of a certification.** No claim row, no yes/no beside it, no second expiry.
- **The driver's licence is not a Transportation field.** "Can drive" is read from an approved `drivers_licence` credential.
- **Email is asked once.** The account address prefills the contact email and stays editable.
- **The legal name prefills from the preferred name.** Nobody types their name twice to say it is the same name.
- **The home address is one block** of street, city and ZIP.
- **Conditions and supports mean different things** — a condition is what a caregiver has worked with, a support is what they will do on a shift. Seven entries read alike across the two lists, and the page says which is which.

### Validation
- **The caregiver must be 18 or older at submission.** A date of birth implying an age under 18 refuses submission with a sentence that says so.
- **A legal name is required to submit**, prefilled from the preferred name and confirmed.
- **At least one experience row**, each needing an employer, a role and a start month.
- **At least one condition, two complete references, and both written answers are required.** The form asks for every section, so an incomplete one cannot be sent.
- **A relationship is required on a reference. Relatives are refused in the form's own words**, and an admin judges the answer; a name-based check would be a guess.
- **Other county, other language and other condition each require their label** when ticked.
- **`Other` is the only open value anywhere.** Everything else comes from a fixed list, and an unknown slug is an error rather than a silent no-op.
- **A rate is a whole number of dollars**, above zero and below a ceiling, so a typo cannot advertise $4,000 an hour.
- **A travel distance is a whole number of miles**, above zero.
- **An experience end date cannot precede its start**, and a start month cannot be in the future.
- **An earliest start date in the past is accepted** — a caregiver may already be available.
- **Two thousand characters for a written answer, two hundred for a label.**

### Editing after submission
- Fixing a bio or changing a rate is a `/me` save, not an application edit.
- Replacing a credential is a credential action at any time.
- Correcting a legal name, an experience row or a reference is an ordinary edit. It clears the signature; signing again is the whole cost.

### Privacy
- **References are third parties who have not signed up.** Readable by the caregiver who entered them and by an admin, and by nobody else. The privacy policy names them, and they are deleted with the account.
- **The home address is not shown to any family.**
- **Conditions are experience, not a diagnosis of anyone the caregiver lives with**, and are not shown publicly in this feature.
- **The signature record carries an IP address**, which the privacy policy has to mention.

### Scope
- **No matching, catalog, search, billing or notifications.** The data exists so those have something to filter.
- **No anonymous application.** The account comes first, always.
- **No wizard copy.** The onboarding flow reuses the page sections rather than reimplementing them.

### Supersedes
- **Roadmap 7.2 placed credentials on `/me`.** They move to `/application`. The review machinery and the derived status are unchanged; only the page moves.
- **Roadmap 7.2 made uploading a document the act of submitting.** Submitting the application replaces it.
- **Roadmap 7.2's five credential kinds** become eight.
- **The data model spec's `contacts.address`** is dropped, for parents too — no parent screen ever read it. Contact details become label, phone, email and preferred contact method.

## Acceptance Criteria
- [ ] A new caregiver lands on `/onboarding` and reads **0 of 16 sections complete**.
- [ ] Completing a section updates the count without a manual refresh, and the count is derived, not stored.
- [ ] All sixteen sections are counted individually and are reachable from the flow, each rendering the same component the page does.
- [ ] At 16 of 16 the primary action is **Submit applicant**.
- [ ] A caregiver can set rate, counties, languages, transport facts, pets, smoking, Regional Center facts and an earliest start, and each survives a reload.
- [ ] Languages, Transportation and Home environment are separate sections.
- [ ] The driver's licence is not asked for in Transportation; it is a credential, and "can drive" reads from an approved one.
- [ ] The eight credential kinds are the only options, and an unknown kind is refused.
- [ ] A credential's expiry is entered once, at upload, and nowhere else.
- [ ] Adding a credential requires a file; there is no way to record a credential without one.
- [ ] A caregiver with every credential approved but no background check is **not** Approved.
- [ ] A caregiver with an approved background check and every other credential approved and unexpired is Approved.
- [ ] The contact email prefills from the account email and accepts an edit.
- [ ] The legal name prefills from the preferred name and accepts an edit.
- [ ] The home address is one block of street, city and ZIP; no screen asks for a city twice.
- [ ] Ticking Other on counties, languages or conditions demands its label.
- [ ] Hours per week reads the sum of the weekly grid and cannot be typed into.
- [ ] Contact details offer no address, and no screen renders one.
- [ ] Every field on the paper form appears somewhere in the feature.
- [ ] **Submit applicant** refuses while a required answer is missing and names the first one.
- [ ] A date of birth putting the caregiver under 18 blocks submission with a readable message.
- [ ] Submitting needs a typed signature, and stores name, timestamp, statement version, IP and user agent.
- [ ] The signature record cannot be changed through the API afterwards.
- [ ] The application can be edited after submission, and everything the caregiver types survives a reload.
- [ ] Editing any attested answer clears the signature and takes the caregiver out of the Pending bucket.
- [ ] Signing again after an edit returns them to Pending, and the admin sees the edited values.
- [ ] An admin approves the profile once; the approve action refuses without an approved background check.
- [ ] Declining with a reason marks the profile declined, and the caregiver signing again clears it.
- [ ] Rejecting one credential does not change the caregiver's profile status, at any point.
- [ ] Total years is computed from the experience rows and matches them.
- [ ] Credentials can still be added, replaced and removed after submission and after approval.
- [ ] The admin page shows the application, the derived pipeline rows, and the three recorded ones.
- [ ] A reference is readable by its caregiver and an admin, and by no other caregiver and no parent.
- [ ] An unknown county, language or condition slug is an error, not a silent drop.
- [ ] `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass.
