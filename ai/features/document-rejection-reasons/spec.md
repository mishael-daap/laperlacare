# Feature: Document rejection reasons and review history

## Purpose
An admin rejecting a document says why, in words the caregiver can act on. The caregiver sees the reason where they fix it and receives it by email, and every decision — approved or rejected — is kept in a history that outlives the file.

## User Flow
1. An admin opens a caregiver and presses **Reject** on one document.
2. A dialog asks for a **reason** from a fixed list and an **optional message**. Confirm sends both with the decision.
3. The row reads **Rejected**, with the reason and the admin's message beneath it. The admin detail page shows the same.
4. The caregiver's `/me` shows the reason and the message on that credential row, and the sentence under the header names the document and the reason.
5. The caregiver is emailed: the document, the reason, the message, and a link to `/me`.
6. The caregiver replaces the file. The new row starts at **Pending review**; the old decision remains in the review history.
7. An admin later opening that caregiver sees **Review history** — every decision, newest first, including decisions on documents that no longer exist.

## Rules

### The reason
- **Six reasons, fixed:** `invalid_or_unreadable`, `not_california`, `expired`, `name_mismatch`, `wrong_type`, `other`.
- **A reason is required on every rejection.** A rejection without one is refused by the action.
- **`other` requires the message.** An admin choosing Other and writing nothing is refused, because "Other" alone tells the caregiver nothing.
- **The message is optional for the other five**, capped at 1000 characters.
- **Approving clears any earlier reason and message** on the document. Approval never carries a note.
- **The reason is stored with the decision**, so a second admin sees why the first refused it without asking.

### Where it appears
- **The caregiver sees it in the app, not only by email.** Email is a notification: it can fail, or be read a week later. The credential row is where they act, so the reason and message sit there, and the header sentence names the document and the reason.
- **The admin detail page shows the reason and message on the row**, and the review history beneath the credentials.
- **Nobody else sees it.** Not parents, not other caregivers. RLS decides this, not the UI.

### The email
- **One email per rejection decision.** Re-rejecting after a replacement sends another. Approvals send nothing.
- **Plain text**, matching the contact form. It states the document kind, the reason, the message when there is one, and links to `/me`.
- **Sent from the verified contact address**, with reply-to the same inbox so a reply reaches a person.
- **A failed send does not undo the decision.** The decision is the record; the email is a courtesy. The admin is told the decision was saved but the email failed.
- **No notification preferences, no reminders, no email on approval** in this feature.

### The history
- **Every transition to approved or rejected appends a row.** Pending is not a decision and is not recorded.
- **The row snapshots the document kind and file name**, so the record still reads correctly after the file is deleted. `document_id` becomes null when the document goes; the decision does not.
- **Append-only.** No caregiver or admin can insert, edit, or delete a history row through the API; only the database trigger writes them.
- **A caregiver reads their own history; an admin reads any.** Same ownership rules as the documents themselves.
- **Legacy rejected documents have no reason.** They are not backfilled and render without a reason line. The next decision on that document records one.

## Acceptance Criteria
- [ ] Rejecting a document without a reason is refused with a readable message.
- [ ] Choosing Other without a message is refused with a readable message.
- [ ] Choosing Other with a message, or any other reason with or without a message, saves.
- [ ] The rejected row on `/me` shows the reason and the message.
- [ ] The sentence under the header names the document and the reason.
- [ ] The admin detail page shows the reason and message on the row.
- [ ] The rejection email is sent to the caregiver's account address, with the document, reason, message, and a link to `/me`.
- [ ] The email's reply-to is the contact inbox.
- [ ] A failed email send leaves the rejection saved and reports the warning to the admin.
- [ ] Approving a previously rejected document clears its reason and message and sends no email.
- [ ] Approving or rejecting appends exactly one history row; re-submitting the same decision appends none.
- [ ] The history row survives the document being replaced, and `document_id` is null afterwards.
- [ ] The admin detail page shows the history, newest first, excluding the current decision already shown on the row.
- [ ] A caregiver's own history is readable through the API; another caregiver's is not; a parent's is not.
- [ ] No API call can insert, update, or delete a history row.
- [ ] `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass.
