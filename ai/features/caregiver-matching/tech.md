# Technical Plan: Caregiver matching

## Components
- `supabase/migrations/<ts>_caregiver_shortlist.sql` — the shortlist table, its
  RLS policies and grants.
- `supabase/migrations/<ts>_match_caregivers.sql` — `public.match_caregivers`,
  the ranking function: joins the household's children, needs, supports and
  windows against the caregiver's, and returns a row per caregiver with reasons,
  gaps and tier.
- `src/lib/matching/options.ts` — the lever vocabulary (values, labels, parsing
  from `searchParams`, defaults) and the types the RPC returns.
- `src/lib/matching/queries.ts` — `getMatches(supabase, options)` and
  `getMatchCounts`, the only callers of the RPC.
- `src/lib/matching/actions.ts` — `saveCaregiverAction` / `removeSavedAction`,
  household-scoped, `revalidatePath('/matches')`.
- `src/app/(landing)/matches/page.tsx` — server page: reads `searchParams`, calls
  the RPC, renders the levers, the list and the empty state.
- `src/app/(landing)/matches/[id]/page.tsx` — the caregiver profile, with the
  membership prompt where contact details would be.
- `src/components/matching/` — `match-card.tsx`, `match-levers.tsx`,
  `match-reasons.tsx`, `empty-state.tsx`, `save-button.tsx`.
- `src/components/household/find-caregivers.tsx` — the button on `/household`,
  enabled only when the household has a child and a window.
- `scripts/seed-demo.mjs` — the demo fixtures, exposed as `pnpm seed:demo`: clears
  the previous demo accounts, then writes six caregivers, their capabilities and
  availability, and the admin.

## Settled while building
- **Gender is a rank, not a filter.** The first version filtered on the
  household's preferred gender, and the male caregiver who covered every need and
  every hour never reached the page — the exact case the **Good fit** tier exists
  for. Corrected in `20261101102000_match_gender_rank.sql`; the tier and the
  reason line do the work instead.
- **The profile link carries the levers.** `/matches/[id]?partial=1` opens a
  caregiver who only appears under partial coverage. Without the query string she
  would 404 on a name the parent had just pressed, so the page also falls back to
  the most forgiving levers for a bare shared link.
- **The rate lever is `?rate=`.** The option is called `maxRate` in TypeScript;
  the parser reads `rate` and renames it, which is the sort of mismatch that
  silently disables a lever — the empty-state test is what caught it.

## Data Model

```sql
create table public.caregiver_shortlist (
  household_id uuid not null references public.households (id) on delete cascade,
  caregiver_id uuid not null references public.caregivers (user_id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (household_id, caregiver_id)
);
```

```sql
-- one row per matching caregiver
public.match_caregivers(
  p_hours      text,      -- 'exact' | 'flexible' | 'day'
  p_partial    boolean,   -- include partial coverage
  p_max_rate   integer,   -- null = no cap
  p_gender     text       -- 'household' | 'any' | 'female' | 'male'
) returns table (
  caregiver_id     uuid,
  display_name     text,
  avatar_path      text,
  bio              text,
  hourly_rate      integer,
  age_min          smallint,
  age_max          smallint,
  gender           text,
  languages        text[],
  counties         text[],
  needs_covered    smallint,
  needs_total      smallint,
  missing_needs    text[],   -- labels
  overlap_minutes  integer,
  window_minutes   integer,
  tier             text,     -- 'great' | 'good' | 'partial'
  reasons          text[],   -- filled in SQL, not in the page
  gaps             text[]
)
```

## Flow
`/matches?hours=flexible&partial=1&rate=30&gender=household` → page parses
`searchParams` with zod → `getMatches` calls the RPC → the RPC resolves the
household from the session, filters to public caregivers, scores and ranks →
page renders cards and, when empty, derives the suggestions from the counts the
RPC also returns → save toggle calls `saveCaregiverAction` → revalidate.

## Notes
- The function is `security definer` with `set search_path = ''`, because
  `caregiver_needs`, `caregiver_supports` and `caregiver_availability` are
  readable only by the caregiver themselves. It therefore must filter on
  `private.caregiver_is_public(c.user_id)` itself — being definer is what makes
  that filter mandatory rather than optional. The household always comes from
  `private.current_household_id()`, never from a parameter.
- Contact details are not in the return shape at all. Locking at the markup would
  still ship them to the browser; leaving them out of the projection is the lock.
- Reasons and gaps are produced in SQL because they quote the household's rows
  (*"Covers all 8 hours you need"*, *"Not yet cleared for: Medical or health
  needs"*). Building them in the page would mean moving the child's needs into
  the response.
- Levers are `searchParams`, not client state: the empty-state suggestions are
  plain links, the back button works, and the page stays a server component.
- `cities`/counties are selected for display only. No ordering or filtering on
  them until a household has a location; the mobile app will supply coordinates,
  and this function gets a `ST_DWithin` clause then.
- Ordering happens in SQL (`tier, overlap_minutes desc, rate asc nulls last,
  display_name`), so paging later does not reshuffle the list.
- The seed script needs at least one caregiver that covers a full household
  window exactly, and one that misses a single need, or the demo cannot show
  either the **Great fit** card or the relaxation path.
- `scripts/seed-demo.mjs` writes through the service role, so it must set
  `verification_status = 'approved'`, `approved_at`, and an approved
  `background_check` document row itself; an approved flag alone does not satisfy
  `private.caregiver_is_public`. Capabilities go into `caregiver_needs` and
  `caregiver_supports` by slug, availability into `caregiver_availability` as one
  row per block, and `age_min` / `age_max` / `hourly_rate` / `gender` onto the
  caregiver row. `demo-unapproved` gets none of the approval fields, which is the
  negative case.
- The script deletes demo accounts by the `@example.com` domain before creating
  the fixtures — the same rule `seed-caregivers.mjs` uses, so the two scripts stay
  mutually exclusive rather than additive. It does not truncate live tables; a
  full wipe is a separate, deliberate act.
- Fixture emails are stable, so the demo doc can name them, and the three negatives
  carry names that read like people rather than like test rows.

## Deferred
- Geography and distance ranking (needs `households.county`; the mobile app
  supplies coordinates).
- Membership gating as *enforced* access: item 8 replaces the prompt with a
  check. Until then the prompt is copy, and the payload is already clean.
- Paging: the seed population is small enough to return in one call; the order is
  stable when it is not.
