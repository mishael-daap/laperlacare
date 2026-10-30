# Tasks: Caregiver application

- [x] Migration: add the work details, languages, transportation, home environment, application, signature and admin-record columns to `caregivers`, with their check constraints.
- [x] Migration: create `caregiver_experience` and `caregiver_references`, with indexes, RLS scoped to `caregiver_id = auth.uid()`, and grants.
- [x] Migration: add `private.valid_slugs`, then apply it to the `counties`, `languages` and `conditions` arrays.
- [x] Migration: drop `contacts.address`, add `preferred_contact_method`, and widen the `caregiver_documents.kind` constraint to the eight kinds.
- [x] Migration: require an approved `background_check` in `private.caregiver_status`. Verify a caregiver with all other documents approved now reads Pending.
- [x] Migration: add `private.guard_application_lock` on `caregivers` and `private.guard_application_children` on both child tables. Verify a locked row refuses a legal-name change and a locked reference refuses an update.
- [x] Migration: add `save_caregiver_experience`, `save_caregiver_references`, `submit_caregiver_application`, `admin_return_caregiver_application` and `admin_set_application_record`, with their revokes and grants.
- [x] Regenerate `src/types/supabase.ts` with `pnpm db:types`, then fix every compile error from the dropped and added columns.
- [x] Rewrite `src/lib/caregiver/credentials.ts` for the eight kinds, and add `src/lib/caregiver/answers.ts` for counties, languages and conditions.
- [x] Add `src/lib/caregiver/application.ts` (Zod per section) and `src/lib/caregiver/application-statement.ts` (versioned text).
- [x] Rewrite `src/lib/caregiver/completeness.ts` as the sixteen sections, with a per-section `complete` derived from the same rules submission enforces.
- [x] Rewrite the caregiver read: `getCaregiverProfile` loads experience, references, conditions and the new columns.
- [x] Restructure `/me`: Work details, Languages, Transportation and Home environment as their own sections; weekly availability with the derived hours beneath it; contact details lose the address and gain the preferred method; Credentials removed. Prefill the contact email from the account.
- [x] Build `application-progress.tsx` — the counter and the sixteen-row rail — and pin it on `/me`.
- [x] Build `/onboarding`: guard it, render the counter at 0 of 16, list the sixteen with their state, and make the primary action follow the progress. Point the caregiver landing path here from the sign-in, callback and confirm routes.
- [x] Build `/application` with `application-draft.tsx` and the six written sections: Personal details (legal name prefilled, address block, referral), Experience, Experience with needs, References, Your questions, Background check and signature.
- [x] Move `credentials-section.tsx` and `credential-dialog.tsx` onto `/application` and confirm add, replace and remove still work against the eight kinds.
- [x] Build `application-signature.tsx`: statement, consent checkbox, name field, submit. Wire `submitApplicationAction` and show the refusal message verbatim.
- [x] Add `returnApplicationAction` and `saveApplicationRecordAction`, and add the application, the derived record rows and the three recorded fields to the admin detail page.
- [x] Update `scripts/seed-caregivers.mjs` for the new columns, the two child tables and the address removal, so the seed still runs twice cleanly.
- [x] Walk every acceptance criterion, including the under-18 refusal, the locked-row API checks, the signature that cannot be rewritten, and a returned application that requires re-signing. Then run `pnpm lint`, `pnpm typecheck` and `pnpm build`.
- [ ] Ask the user to validate before marking roadmap item 7.5 completed.

Deferred:

- [x] More than one document per kind.
- [x] Marking a credential kind as required, other than the background check.
- [x] Emails on submission, approval and rejection of the application itself.
- [x] Expiry reminders for credentials.
- [x] Reviewer name shown in the review history.
- [x] Matching, catalog, search, billing and interest requests.
