# Technical Plan: Admin verification

## Components
- **`src/app/admin/sign-in/page.tsx`** — the admin sign-in, reusing `AuthForm` with the admin framing.
- **`src/app/admin/(dashboard)/layout.tsx`** — the guard and the admin chrome. The route group keeps `/admin/sign-in` outside the guard while leaving both URLs as they read.
- **`src/app/admin/(dashboard)/caregiver/page.tsx`** — the list. Reads `status`, `q`, and `page` from the search params.
- **`src/app/admin/(dashboard)/caregiver/[id]/page.tsx`** — the review screen.
- **`src/components/admin/status-filters.tsx`** — five buttons as links, carrying the current search and page resets.
- **`src/components/admin/caregiver-search.tsx`** — a plain GET form. The results are server-rendered and the filter lives in the URL, so a form submission does the same job with less machinery and works before hydration.
- **`src/components/admin/status-badge.tsx`** — one badge for a verification status, built on `Badge`'s `success` / `warning` / `destructive` variants.
- **`src/components/admin/review-actions.tsx`** — Approve and Reject, with pending state and an error line.
- **`src/lib/admin/is-admin.ts`** — the same shape as `is-caregiver.ts`.
- **`src/lib/admin/queries.ts`** — the two RPC calls plus the detail load.
- **`src/lib/admin/actions.ts`** — `setVerificationStatusAction`.
- **`src/lib/auth/actions.ts`**, **`src/app/auth/callback/route.ts`** — both landing decisions gain an admin check ahead of the caregiver one.
- **`src/components/auth/auth-form.tsx`** — gains a boolean that hides the "Create one" footer, because there are no admin accounts to create.

## API
- **RPC `public.admin_caregiver_directory(p_status, p_query, p_limit, p_offset)`** — one page of the directory, filtered and searched in SQL. Returns `user_id, display_name, email, verification_status, submitted_at, created_at, total_count`.
- **RPC `public.admin_caregiver_counts()`** — the five bucket counts, in one round trip, for the filter buttons.
- **RPC `public.admin_caregiver_detail(p_user_id)`** — one caregiver with the account email, for the detail page. Added because the directory returns a whole page and finding one row in it would have meant asking for every row.
- **Server action `setVerificationStatusAction(caregiverId, status)`** — validates with zod, re-checks admin server-side, writes status plus `reviewed_by` and `reviewed_at`, then revalidates the list and the detail.
- No route handlers. No public API.

## Data Model

**Two new columns on `caregivers`** — the audit record the architecture doc already promises:
```
caregivers
  reviewed_by  uuid → auth.users(id) on delete set null
  reviewed_at  timestamptz
```
`reviewed_by` matches the naming on `caregiver_documents`, which already has the same pair.

**Two functions, both in `public` because the Data API only exposes that schema, both `SECURITY DEFINER` with `set search_path = ''`, both refusing anybody who is not an admin:**
```
admin_caregiver_directory(p_status text, p_query text, p_limit int, p_offset int)
admin_caregiver_counts()
```
The directory is where the account email comes from. `auth.users` is not exposed to the API and never will be, so the join happens inside a function that only an admin can execute. `revoke all … from public` and `grant execute … to authenticated`; a signed-out caller cannot run it either.

**New policies** — all `to authenticated`, all gated on `(select private.is_admin())`:
- `caregivers` — select, and update.
- `contacts` — select, scoped to rows whose owner has a `caregivers` row. The first version of this policy granted every contact row, parents included; the follow-up migration narrowed it.
- `caregiver_availability` — select.
- `caregiver_documents` already has an admin select policy and needs no change.

The `caregivers` update policy is broad by necessity: RLS cannot restrict columns. `setVerificationStatusAction` writes only `verification_status`, `reviewed_by`, and `reviewed_at`, and the existing guard trigger still refuses a non-admin moving the status.

**This overturns one line in the data model spec** — "an admin reads no contacts" was true when admins only reviewed documents. They now review the caregiver, which includes how to reach them. The "no children, no households" half still holds.

## Flow
`/admin/caregiver?status=pending&q=dana` → guard (claims → `is_admin`) → `admin_caregiver_directory` → rows + total → render list.
Detail → read caregiver, contacts, availability, documents under the admin policies → sign each document URL (1 hour) → render.
Approve → server action → zod → admin check → update → `revalidatePath` list and detail → caregiver's `/me` reads the new status.

## Notes
- **Filter and search run in SQL, not in the browser.** The email lives in `auth.users` and paging is server-side, so fetching every caregiver and filtering in JS would be both wrong and unbounded.
- **ILIKE, not full-text.** Names, emails, and phones are substrings people half-remember; at this scale a sequential scan is free. If the directory ever gets large, a trigram index on the three columns is the next step, not a search engine.
- **`p_query` is trimmed and its wildcards left alone.** `%` typed into the box acts as a wildcard; that is acceptable for an internal screen and avoids an escape rule nobody remembers.
- **`total_count` rides on every row** via `count(*) over ()`, so the list does not need a second count query. An empty page has no rows and therefore no count, which is correct.
- **The default bucket is Pending**, encoded as the absence of `status` in the URL. `status=all` is written explicitly because the default is no longer All; a missing or unknown value must not silently widen the list.
- **Pagination is 10 per page by default**, with previous and next links that keep `status`, `q`, and `per`. The row count is a set of links (10 / 25 / 50 / 100) rather than a select, so it needs no client component; only the four listed values are accepted, and anything else in the URL falls back to 10.
- **Description of the buckets lives in one place** — the `case` inside the directory function. The buttons and the counts function use the same predicates; they must move together.
- **`submitted_at` is stamped on background-check upload**, not on finishing the profile, so Pending can hold an incomplete profile. The detail page reuses `completeness()` from `src/lib/caregiver/completeness.ts` to show what is and is not filled in, rather than trying to redefine the split.
- **404 for non-admins, via `notFound()` in the layout.** The layout cannot see the pathname on the server, so the signed-out redirect uses a fixed `next=/admin/caregiver` rather than the page the visitor wanted.
- **Signed URLs are generated at render, never stored.** The detail page is dynamic for this reason; one hour is long enough to read a document and short enough to be useless if it leaks.
- **The list is a table on every screen size**, scrolling horizontally on a phone. It is a directory with three columns, and a stack of cards would make scanning slower for the one thing the screen is for.
- **No admin link anywhere public.** The only way in is typing the URL.
- **A guard that throws after the shell has streamed returns 200, not 307/404.** With Cache Components the root layout's static shell is sent before the admin layout reads the session, so a signed-out visitor gets a 200 carrying Next's redirect payload and a non-admin gets a 200 carrying the 404 UI. The browser still redirects and the visitor still sees the 404; the status code is the only casualty. Moving the signed-out check into `proxy.ts` would restore a real 307, at the cost of an `admins` query on every admin request and a second place to keep the guard correct.
- **The review actions were exercised without JavaScript**, by posting the rendered form fields back to the page. Approve set the status, reviewer, and time; Reject reversed it.
