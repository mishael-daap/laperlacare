# Tasks: Accounts and sign-in

- [x] Add a migration exposing `public.ensure_household()` as a `security definer` wrapper over `private.create_household()`; verified it is reachable over the API and that an anonymous call is refused with `not authenticated`. It is idempotent, and takes an advisory lock so two sign-ins racing cannot both try to insert.
- [x] Add `src/lib/auth/ensure-household.ts`; called after a session first exists, on sign-up, sign-in, and the OAuth callback.
- [x] Build `/sign-up` and `/sign-in` from one component, since they differ only in the action and three labels, with email, password, and a Google button.
- [x] Add `/auth/callback` to exchange the OAuth code, and `/auth/confirm` to verify an email token. Both built now so turning confirmation on later is a dashboard setting rather than a coding task.
- [x] Add `/auth/error`, which says what went wrong and offers signing in again rather than a bare failure.
- [x] Add the sign-out server action, rendered in the footer only when signed in.
- [x] Point the landing page calls to action at the finished flow; they are no longer dead links.
- [x] Verify a signed-in user and a signed-out visitor are distinguishable on the server, using `getClaims()` rather than `getSession()`.
- [x] Confirm no profile, household, or child page exists.
- [x] `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass.

Added while building, beyond the plan:

- [x] `/caregivers`, where signing in lands. Empty on purpose until caregivers exist to list.
- [x] A custom 404 in the primary colour, in the mono face.
- [x] Move the footer into the root layout. On `/` alone it meant landing on `/caregivers` signed in with no way to sign out.

Two things that cost build cycles and are worth remembering:

- `connection()` cannot be used inside a `"use cache"` scope. The working shape is the reverse: the footer is uncached and `page.tsx` wraps it in Suspense. Both `/` and `/caregivers` stay partially prerendered, with only the footer strip resolved per request.
- Pages that read `searchParams` cannot be prerendered, so the three auth pages carry `export const instant = false`.

Deferred, and not forgotten:

- [ ] **Google OAuth setup** — a Google Cloud project, an OAuth client, and the provider enabled in Supabase with its client id and secret. The button exists and will fail until this is done.
- [ ] Register `localhost` and production `/auth/callback` and `/auth/confirm` in the Supabase dashboard.
- [ ] Turn email confirmation on and configure Resend as custom SMTP before launch. Confirmation is currently intended to be off for development.
- [ ] Inviting a second parent into a household.
- [ ] Child profiles, and any household or profile management. Not in the roadmap at all.
