# Tasks: Data model

- [x] Add the seven tables with their columns, constraints, foreign keys, indexes, and RLS enabled; verified all seven exist with the expected shape and RLS on.
- [x] Create the `private` schema and the `current_household_id()` and `is_admin()` helper functions; verified both are callable and return HTTP 404 from the Data API, so the schema is unreachable.
- [x] Add `private.create_household()`, a policy for each of the seven tables, and the grants; verified with real personas — parent A saw only Child A, parent B only Child B, a member saw an approved caregiver's contacts but not a pending one's, an admin saw no contacts, a signed-in user could not self-join a household, and `create_household()` created exactly one household and refused a second call.
- [x] Create the public `avatars` bucket with a 2 MB cap and `image/jpeg`, `image/png`, `image/webp` allowed, plus its storage policies; verified a write inside the caller's own folder succeeds while another user's folder and a signed-out write are both refused.
- [x] Run `supabase db advisors`; verified no performance issues and no schema security issue.
- [x] Regenerate `src/types/supabase.ts`; verified all seven tables appear, and `pnpm typecheck` and `pnpm build` pass.
- [x] Clean up the RLS test data; verified every table returned to zero rows.

Deferred, with the reason:

- [ ] **Narrow the default table privileges.** `anon` and `authenticated` hold full privileges (including `DELETE` and `TRUNCATE`) on every new table in `public`, so RLS is the only layer. Revoking from `anon` on everything except the catalog would add defence in depth behind the policies. Deferred by request.
- [ ] **Enable leaked-password protection** in Supabase Auth. `db advisors` flags it. Better done when auth is configured, in the household accounts feature.
- [ ] **App-level assertions** — saving a weekly board, searching an availability window, uploading and replacing an avatar, and the iPhone camera-roll check. These need UI and queries this feature does not build; see the second list in `spec.md`.
