# Brainstorm, 2026-10-20

The first batch, moved out of the old single-file `ai/ideas.md`. Several of these
have since graduated: needs and supports became roadmap 7.1 and 7.2, and
per-document review shipped with 7.2.

---
## 2026-10-20 — Needs and supports checklist

A fixed list of checkboxes, split into two kinds:

- **Needs** — what the child requires. Ticked by the parent, per child.
- **Supports** — what the caregiver can provide. Ticked by the caregiver on their
  own profile.

Matching is the overlap between a child's needs and a caregiver's supports.

Examples given: *heavy behaviour* is a need; *cooking* is a support.

Open questions to settle before this can become a spec:

- Is it one shared vocabulary with a `kind` on each entry, or two separate lists?
- Does a need ticked by a parent match only a support the caregiver ticked, or can
  a need also be met by a need-style tag on the caregiver (e.g. both sides declare
  "heavy behaviour")?
- Who maintains the list — is it a seeded reference table an admin can extend, or
  fixed in code?
- Free-text "other", or strictly closed set? A closed set is what makes filtering
  and matching work; free text would not match anything.
- Is the level of a need recorded (heavy / light), or is one checkbox enough?
- Matching by any overlap, or by all of a child's needs being covered?

## 2026-10-20 — Parent-side availability request

A section on the parent's side where they record the days and hours they want a
caregiver around. **Add days** opens a day-of-week picker and a time range (e.g.
2–4), and the button adds another block, so a parent can build up several in one
sitting. Same shape as the caregiver's weekly board: one row per block.

Clarified 2026-10-20: it is a **standing weekly pattern** — day of week, from, to —
not a set of calendar dates.

Notes:

- `caregiver_availability` already stores exactly this shape (day, start, end), so
  this is its mirror image. The comparison is a time-interval overlap, not an
  equality check.
- Timing is what makes it useful: parent wants Tuesday 3–7pm, so a caregiver free
  Tuesday 2–6pm is a partial match and Tuesday 9–5pm a full one. Which counts as a
  match is undecided.
- The roadmap's search filter says "availability by date and time", which a
  standing weekly pattern cannot answer on its own. Either that wording softens to
  "day and time", or the parent side needs real dates as well.

Open questions:

- Is the request per child or per household? One child may need different hours
  from another, and `caregiver_availability` has no child dimension either.
- Is the parent's timezone explicit? The architecture stores caregiver availability
  in UTC alongside an IANA zone; a parent request has the same problem and there is
  no timezone on `households` yet.
- Overlap or containment: does any overlap count, or must the caregiver cover the
  whole requested block?
- Can a block span midnight? The current caregiver constraint forbids `end > start`
  across the boundary, and the same constraint would apply here.

## 2026-10-20 — Gender preference and caregiver gender

The parent picks a preferred caregiver gender; the caregiver records their own.
Both are already named in `ai/overview.md` and the roadmap's search filters, but
neither exists in the schema yet (`caregivers` has no gender column).

Open questions:

- **Preferred or required?** The word matters. A preference is a soft filter that
  ranks or annotates results; a requirement silently empties the catalogue. The
  interface should probably say which it is doing.
- Is the preference per child or per household? A parent may have a reason that
  applies to one child only.
- What is the field, exactly? A closed set with a "no preference" option avoids
  the free-text gender field that every such profile eventually regrets.
- Is caregiver gender optional on the profile? If it is required to match, a
  caregiver who skips it disappears from every filtered search, which needs to be
  said on their side rather than discovered later.
- Legal: sex is a protected characteristic under California FEHA. Parental
  preference in childcare is a recognised exception in practice, but this is one
  for the legal review already owed by the overview's constraints section.

## 2026-10-20 — The child profile: first name, age, needs, support

Each child gets a free-text field where the parent can describe them in their own
words, and a parent can add more than one child.

**The fields per child: full name, date of birth, needs, support** — the parent
enters the date of birth and any age shown is derived from it, so it does not go
stale. The point of needs and support being on the profile rather than only in a
filter is that some caregivers cannot work with children who need special
support, so a caregiver should be able to see what a child needs *before* meeting
them, rather than finding out at the first visit.

This settles who the child data is for: **caregivers see it.** Today they see
nothing — `children` is household-scoped and the RLS has no caregiver access at
all — so this is a new exposure of the most sensitive data in the product, not
just a form.

Notes:

- `children` exists already (`full_name`, `date_of_birth`) but has no descriptive
  column, and there is no screen that manages children at all — `/me` is
  caregiver-only and bounces parents to the catalogue. The parent profile is a gap
  in its own right, not just these fields.
- `mishael-s-notes.md` already records the same complaint from an earlier form:
  "the parent will only be able to add one child which is not what we want".
- The overview promises "parent-managed profiles for every family member".
  Children are the ones that exist today; there is no adults-in-the-household
  surface either.
- `full_name` and `date_of_birth` are already on `children` and are the right
  shape, so the new columns are needs, support, and the descriptive text.

Possibly skipped, in rough order of how likely it is to be needed:

- A photo. `parents` and `caregivers` both have `avatar_path`; `children` has none.
- Gender, given the caregiver-gender preference idea above.
- Language the child speaks or is comfortable in.
- School, grade, or the hours they are in care — it is what availability is really
  about.
- Allergies or medical information. The honest answer may be "deliberately not
  collected", since it is health data and the platform is not a care provider.
- Preferred caregiver gender per child, if that preference turns out to be per
  child rather than per household.
- The days and times that apply to this child, if the availability request is per
  child rather than per household.

Open questions:

- A parent typing freely about a child's needs is writing health and disability
  information. Sensitive personal information under CCPA/CPRA, and a child under
  13 puts COPPA in scope. Showing it to caregivers is a deliberate decision with a
  legal review attached, not a default.
- Does every caregiver see every child's needs, or only after expressing interest?
  Before contact is a very different disclosure from after.
- Is there a limit on the free text? An unbounded field invites medical records and
  becomes impossible to display in a list.
- Relationship to the needs/supports checklist: is "needs" the checklist, the free
  text, or both?
- Can a caregiver filter or exclude themselves by what they cannot handle, rather
  than only reading it and self-selecting out?

## 2026-10-20 — Caregiver age range

A caregiver records the ages they are comfortable working with, e.g. 2–5.

Notes:

- The child's age is derived from `children.date_of_birth` (see the child profile
  entry above), so the comparison happens in Postgres against a computed age, not
  against a stored number on either side.
- This is the same kind of statement as the needs/supports checklist — what a
  caregiver can and cannot take on — so the two should look and behave alike.

Open questions:

- One range, or several bands? A caregiver comfortable with 2–5 and 8–12 but not
  6–7 is describing a real thing a single range cannot express.
- Inclusive bounds? "2–5" should not silently exclude a child who has just turned
  5 and a half.
- Are the bounds in months or years? Toddler ages are quoted in months, and 2–5 in
  years is a coarse filter at the bottom of the range.
- Required or optional? If optional and a missing range means "no match", a
  caregiver who skips it disappears from every search — the same trap as an
  optional gender.

## 2026-10-20 — Licences and certifications, reviewed one by one

Caregivers hold licences and certifications — driver's licence, CPR, BT
certification — upload the document for each, and the admin approves **each
document on its own**, one after the other.

This reverses the current review model, which is a meaningful change rather than
an addition:

- Today an admin approves the **caregiver**, not the files.
  `setVerificationStatusAction` says so explicitly: "Documents are not touched.
  The admin approves the caregiver; per-document review stays unused."
- The columns for document review already exist and are dormant:
  `caregiver_documents.review_status`, `reviewed_by`, `reviewed_at`, plus an
  "an admin may review documents" update policy. So the schema was built for
  this; only the action and the UI are missing.
- `caregiver_documents.kind` currently allows `background_check`, `certification`,
  `other`. A driver's licence and a CPR card do not fit `certification` cleanly, so
  the kinds probably need to become rows in a reference table rather than a check
  constraint.
- `reset_verification_on_new_document` only resets the caregiver to pending when a
  **background_check** is replaced. Per-document review implies the reset has to
  become per-kind: replacing the CPR card should invalidate the CPR approval only.
- `ai/architecture.md` names a **Certification** entity (BT/RBT, education level)
  that has never been built.

Open questions:

- Is the caregiver's overall status derived from their documents (all required
  kinds approved), or is it still a separate decision an admin makes? Deriving it
  is tidier and removes a way for the two to disagree.
- Which kinds are required to appear in the catalogue, and which are optional
  extras that only show as badges? Driver's licence and CPR are probably
  requirements; a BT certification may not be.
- **Expiry.** CPR cards expire, and a background check has a shelf life. Without an
  `expires_at` the platform will happily show an expired certification as
  approved, which is the specific thing a parent is trusting. This is the biggest
  missing column in the idea.
- Can a caregiver re-upload after a rejection, and are they told which document
  was rejected? `mishael-s-notes.md` already asks the same about caregiver
  rejection generally.
- Does the catalogue show per-certification badges, or only "verified"?
- Is a driver's licence being reviewed for identity, for driving, or both?
