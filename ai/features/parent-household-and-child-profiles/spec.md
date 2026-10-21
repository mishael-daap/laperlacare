# Feature: Parent household and child profiles

## Purpose
A parent manages one household in one place: any number of children, what each child needs, the support they need, and the household's caregiver preference and weekly care windows.

## User Flow
1. A parent signs up or signs in and lands on `/household`.
2. Their household is created on the first visit. The page opens with empty states.
3. They press **Add child** and enter the child's name, date of birth, needs, the support they need, and anything else the caregiver should know. They save.
4. The child appears on the page with their age derived from the date of birth. They can add another child, edit one, or delete one.
5. They choose the household's preferred caregiver gender.
6. They press **Add day**, choose a day and a time range, and save. They repeat for as many windows as they need and can remove any of them.
7. The household and its children stay saved for the matching and billing features that follow.

## Rules
- **A household is created on the first visit to `/household`, not at payment.** This supersedes the earlier note that household creation waits for billing. Billing will attach a subscription to the household that already exists; caregiver contact details remain the paywall.
- **Creating a household is idempotent.** Opening the page twice creates one household, not two.
- **Only a parent gets a household.** A signed-out visitor is sent to `/sign-in?next=/household`. A caregiver is sent to `/me`. An admin is sent to `/admin/caregiver`. Neither a caregiver nor an admin has a household created for them.
- **One household per parent.** Inviting a second parent is not part of this feature.
- **A child has a full name, a date of birth, any number of needs and supports, and optional free text.**
- **Name is required.** Date of birth is required, must be a real date, and cannot be in the future.
- **Age is derived from the date of birth and never stored.** A child under one is shown as “Under 1 year old”.
- **Needs and supports come from fixed lists seeded in the database.** Parents cannot add their own entries. The notes field is for anything the lists do not cover.
- **Needs are written as behaviour and support, not diagnoses.** The section is framed as “What should a caregiver know about your child?” so a parent is not asked to label their child.
- **Supports are what the caregiver does**, and 7.2 will let caregivers tick the same list.
- **Nothing in either list is required.** A parent can save a child with no needs and no supports ticked.
- **Notes are optional and capped at 1,000 characters.** They are sensitive personal information under CCPA/CPRA: household-only in RLS, never returned in a catalog query, and never readable by an admin.
- **Preferred caregiver gender belongs to the household**, not to a child. The options are Female, Male, and No preference, and the default is No preference.
- **Care windows belong to the household**, not to a child. Each is a day of the week plus a start and end time.
- **A care window must end after it starts.** Several windows can share a day, and windows may overlap.
- **Times are wall-clock times**, stored the same way as `caregiver_availability`. The IANA timezone decision lands with the search feature, when both sides need to be compared.
- **The page is read-mostly.** Children are edited in a dialog and changes save when confirmed. A care window saves when it is added. Gender saves when it is chosen.
- **Empty states name the action.** No children says to add the first child. No care windows says to add the days and times care is needed.
- **No billing, no matching, and no catalog appear in this feature.** The data exists so those features have something to search.
- **RLS, not the UI, decides access.** Every new table is scoped to the caller's household.

## Acceptance Criteria
- [ ] A signed-out visitor to `/household` is sent to `/sign-in?next=/household`.
- [ ] A caregiver who visits `/household` is sent to `/me`, and no household or parents row is created for them.
- [ ] An admin who visits `/household` is sent to `/admin/caregiver`, and no household or parents row is created for them.
- [ ] The first visit by a parent creates exactly one household and one parents row; reloading the page creates no more.
- [ ] A parent can add a child with a name, date of birth, needs, supports, and notes, and the child appears immediately.
- [ ] The child's age is shown from their date of birth, including “Under 1 year old”.
- [ ] A blank name and a future date of birth are refused with a readable message.
- [ ] Notes longer than 1,000 characters are refused.
- [ ] A parent can add several children and edit and delete any of them.
- [ ] Deleting a child also deletes that child's need and support rows.
- [ ] Needs and supports can only be chosen from the fixed lists.
- [ ] The preferred caregiver gender saves and survives a reload.
- [ ] A parent can add several care windows across different days, and remove any of them.
- [ ] A care window whose end is before its start is refused.
- [ ] Another household cannot read or write this household's children, child needs, child supports, or care windows through the API.
- [ ] A signed-in caregiver or admin cannot read a household's children, notes, or care windows.
- [ ] Child notes never appear in an admin query or a catalog query.
- [ ] `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass.
