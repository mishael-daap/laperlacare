# Tasks: Caregiver matching

## 1. Schema
- [x] Migration `caregiver_shortlist`: table, RLS (a household reads and writes
      only its own), grants to `authenticated`.
- [x] Migration `match_caregivers`: the RPC, `security definer`,
      `set search_path = ''`, filtering on `private.caregiver_is_public`, household
      from `private.current_household_id()`.
- [x] Verify in the SQL editor against a seeded household: every returned
      `caregiver_id` is approved, none is pending or rejected.

## 2. Scoring
- [x] Age range as a hard filter; confirm a caregiver whose range excludes the
      child never returns.
- [x] Needs and supports coverage with `needs_covered` / `needs_total` and
      `missing_needs`; hard by default, at-least-half when `p_partial`.
- [x] Window overlap in minutes for `exact`, `flexible` (±1 hour) and `day`;
      `window_minutes` returned so the page can say *"6 of 8 hours"*.
- [x] Gender, rate cap, reasons, gaps and tier, in the order the spec fixes.

## 3. Demo data
- [x] `scripts/seed-demo.mjs` and `pnpm seed:demo`: delete the previous demo
      accounts, then create the six fixtures and the admin.
- [x] The three positives (Rosa, Daniel, Grace): approved profile, approved
      background check, capabilities by slug, availability blocks, ages and rate.
- [x] The three negatives: `demo-miss` (no shared facts), `demo-adults` (age range
      excludes the child), `demo-unapproved` (no approval fields).
- [x] Verify the expected tiers in SQL before any UI exists: the demo household's
      needs, supports and windows are written into the query by hand and the tiers
      match the fixture table.
- [x] Confirm running it twice leaves the same six caregivers.

## 4. Entry point
- [x] `FindCaregivers` on `/household`: enabled with a child and a window,
      otherwise it names what is missing and links to that section.

## 5. Results page
- [x] `/matches`: parse levers from `searchParams` with zod (`options.ts`).
- [x] `MatchCard`: photo, name, rate, ages, languages, tier badge.
- [x] `MatchReasons`: "Why you match" and the gaps on the same card.
- [x] `MatchLevers`: the four levers, prefilled, writing to the URL.
- [x] Empty state: the constraint that removed the most and up to three
      suggestions, each a working link.
- [x] Stable ordering rendered, and the household summary above the list.

## 6. Shortlist
- [x] `saveCaregiverAction` / `removeSavedAction`, household-scoped.
- [x] `SaveButton` on the card, with the saved state read from the RPC.
- [x] `Saved` lever filters to the shortlist.

## 7. Profile and gate
- [x] `/matches/[id]`: the caregiver's public profile.
- [x] Membership prompt in place of contact details; confirm no phone or email is
      in the HTML or the RPC payload.

## 8. Checks before handover
- [ ] 320px: nothing scrolls sideways.
- [ ] Every acceptance criterion in `spec.md` walked through once on the seeded
      data.
- [ ] `pnpm build`, `pnpm exec tsc --noEmit` and `pnpm exec eslint` clean.
- [x] `demo/01-family-account.md`: the household values already match the fixture
      table; add the **Find caregivers** walkthrough once `/matches` exists, with
      the lever changes and the saved shortlist.
