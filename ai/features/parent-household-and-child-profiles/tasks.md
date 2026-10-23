# Tasks: Parent household and child profiles

- [x] Migrations: add `households.preferred_caregiver_gender` and `children.notes`; create `needs`, `supports`, `child_needs`, `child_supports`, and `household_availability`; add indexes, RLS policies, and grants; seed 14 needs and 14 supports.
- [x] Verify the seed counts are 14 and 14, and that a caregiver, an admin, an anonymous caller, and a second household are all refused by the new policies.
- [x] Add the `public.save_child(...)` RPC, with defaults on its optional arguments. Verify create, edit, atomic tag replacement, rejection of a foreign child id, rejection of an unknown slug, and rejection when the caller has no household.
- [x] Regenerate `src/types/supabase.ts` with `pnpm db:types`.
- [x] Add `src/lib/household/validation.ts` with Zod schemas for the child, the care window, and the gender value, including a future-date check.
- [x] Add `src/lib/household/age.ts` with UTC-safe age derivation and the “Under 1 year old” display.
- [x] Add `src/lib/household/get-household-profile.ts`: household, children, the two lists, and care windows in parallel, then the child tags.
- [x] Add `src/lib/household/actions.ts` with the five server actions. Each reads the session, returns inline errors, and revalidates `/household`.
- [x] Build `/household`: session guard, admin and caregiver redirects, `ensureHousehold()`, the three sections, and both empty states.
- [x] Build the child dialog: name, date of birth, needs checkbox group, supports checkbox group, notes with a character count, inline validation errors, and close on success.
- [x] Build the child cards: name, derived age, need and support badges, notes, edit, and delete behind a confirmation.
- [x] Build the gender preference control. It saves on selection and shows the current value.
- [x] Build the care schedule: the window list, the add-day form with a day and a time range, `end > start` validation, and remove.
- [x] Add `/household/loading.tsx` with a skeleton that matches the page.
- [x] Change the parent landing path in `src/lib/auth/actions.ts` to `/household`, and make `ensureHousehold()` return the household id with its stale comment removed.
- [x] Walk the acceptance criteria, including the cross-household API checks, then run `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
- [x] Ask the user to validate before marking roadmap item 7.1 completed.

Deferred:

- [ ] Inviting a second parent into a household.
- [ ] Naming the household. Billing can own it when it arrives.
- [ ] Per-child preferred caregiver gender.
- [ ] Custom needs or supports. Notes carries anything the fixed lists miss.
- [ ] Child photos or care-plan uploads. The data model deliberately has no child avatar.
- [ ] Admin access to children, notes, or care windows. None is needed for caregiver review.
- [ ] Timezones on availability. Belongs with search, when both sides are compared.
- [ ] Matching, catalog, and billing.
