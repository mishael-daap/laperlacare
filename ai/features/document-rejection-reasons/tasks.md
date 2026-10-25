# Tasks: Document rejection reasons and review history

- [x] Migration: add `caregiver_documents.rejection_reason` and `rejection_message`; create `caregiver_document_reviews`; add the trigger, indexes, policies, and grants.
- [x] Verify the column checks reject an unknown reason and a message over 1000 characters, and that no role can insert, update, or delete a history row directly.
- [x] Push the migration to the linked project and regenerate `src/types/supabase.ts` with `pnpm db:types`.
- [x] Add the six rejection reasons and their labels to `src/lib/caregiver/credentials.ts`.
- [x] Extend `statusSentence` to name the document and the reason instead of the generic rejection line.
- [x] Add `src/lib/email/document-rejection.ts`: plain-text email, from and reply-to the contact address, link to `/me`.
- [x] Extend `reviewDocumentAction`: validate reason and message, clear both on approve, refuse Other without a message, append nothing itself, and return a warning when the email fails.
- [x] Add the reject dialog to `document-review.tsx`: reason picker, message box, inline errors, confirm.
- [x] Show the reason and message on the admin detail row, and add the review history section.
- [x] Show the reason and message under a rejected row on `/me`.
- [x] Repair `scripts/seed-caregivers.mjs` for derived status and a seeded rejection reason, then reseed and check the four buckets still agree.
- [x] Walk the API-level acceptance criteria, including the cross-account checks, then run `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
- [ ] Confirm the emailed rejection and both UI surfaces in the browser: the dialog on the admin detail page, and the reason on the caregiver's row and header.
- [ ] Ask the user to validate before marking roadmap item 7.3 completed.

Deferred:

- [ ] Reviewer name in the history UI.
- [ ] Emails on approval.
- [ ] Notification preferences.
- [ ] Expiry reminders.
- [ ] Editing a reason after the fact.
- [ ] Backfilling reasons for documents rejected before this feature.
