# Tasks: Caregiver capabilities and credentials

- [x] Migration: add `caregivers.date_of_birth`, `gender`, `age_min`, `age_max`; create `caregiver_needs` and `caregiver_supports`; add `caregiver_documents.expires_at`; replace the `kind` check constraint with the five-value one; add indexes, policies, and grants.
- [x] Migration: add `private.caregiver_status` and `public.my_caregiver_status`, then drop `caregivers.verification_status`, `reviewed_by`, `reviewed_at`, the guard trigger, and the document reset trigger.
- [x] Migration: rewrite `admin_caregiver_directory`, `admin_caregiver_counts`, and `admin_caregiver_detail` against the computed status, add the four new columns to the detail, and rewrite the `approved caregivers are public` policy. Verify the four buckets and their counts still agree.
- [x] Add the `public.save_caregiver_capabilities` RPC with defaults. Verify: an unknown slug, a future date of birth, a half range, an inverted range, and an out-of-bounds age are each refused; both tag sets are replaced atomically; a caller with no caregiver row is refused.
- [x] Regenerate `src/types/supabase.ts` with `pnpm db:types`, then fix every compile error from the dropped columns.
- [x] Move `ageFromDateOfBirth` and `formatAge` to `src/lib/age.ts` and update the household imports.
- [x] Add `src/lib/caregiver/capabilities.ts` (Zod for the five inputs) and `src/lib/caregiver/credentials.ts` (kind labels, expiry warning, status sentence).
- [x] Extend `src/lib/caregiver/completeness.ts` to the ten items and update both call sites (`/me` and the admin detail page).
- [x] Extend `getCaregiverProfile` and `getCaregiverForReview` with the two tag sets, the kind list, and the computed status.
- [x] Add `saveCapabilitiesAction`, `addDocumentAction`, and `removeDocumentAction`; delete `saveDocumentAction` and the document fields from the draft.
- [x] Build `capability-checklist.tsx` and put the needs and supports sections on `/me`.
- [x] Add date of birth, gender, and working age range to the profile header's edit mode, and wire all five values through the draft and the save bar.
- [x] Build `credentials-section.tsx` and `credential-dialog.tsx`; replace the background-check section; show per-row status, expiry, and the replace and remove actions.
- [x] Show the computed status and the document sentence under the header, including the expiring-soon, expired, and rejected cases.
- [x] Add `reviewDocumentAction` and `document-review.tsx`; remove the per-caregiver Approve and Reject buttons, and show needs, supports, age, gender, and working age range on the admin detail page.
- [x] Walk the acceptance criteria, including the cross-account API checks and an expiry that has already passed, then run `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
- [x] Fix the credential file-name overflow: add `shortFileName` to `credentials.ts`, wrap the name in the dialog, and cap and truncate it in both credential lists.
- [ ] Ask the user to validate before marking roadmap item 7.2 completed.

Deferred:

- [ ] More than one document per kind.
- [ ] Marking a document kind as required.
- [ ] Age bands, and months for children under two.
- [ ] A rejection reason per document.
- [ ] Document thumbnails or an inline viewer.
- [ ] Re-review reminders for expiring credentials.
- [ ] Any email when a document is approved or rejected.
- [ ] Matching, catalog, search, billing, and interest requests.
