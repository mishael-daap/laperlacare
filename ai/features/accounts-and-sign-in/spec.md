# Feature: Accounts and sign-in

## Purpose
A parent can create an account with Google or email, sign in, and sign out. Every screen knows whether they are signed in. Nothing else — no profile page, and no household or child management.

## User Flow
1. A visitor taps any call to action on the landing page and lands on `/sign-up`.
2. They choose Google, or enter an email and a password.
3. With email, they are signed in immediately during development. With Google, they return through the callback route.
4. A household and a parent row are created for them silently, if they do not already have one.
5. They land back in the app, signed in.
6. A returning visitor uses `/sign-in`.
7. They can sign out from the footer.

## Rules
- Supabase Auth is the only identity provider. No second auth system, no custom session handling.
- **Every account gets a household and a parent row, created silently.** The subscription attaches to a household, so this cannot wait for a household-management screen that may never be built. The call is idempotent: signing in twice creates one household, not two.
- **No profile page, no child management, no household management.** The `children` table stays empty for now.
- **The landing page's call to action buttons stop being dead links.** They already point at `/sign-up`.
- Email confirmation stays off during development, and is turned on with Resend as custom SMTP before launch. The confirm route is built now regardless, so turning it on is a dashboard change rather than a code change.
- Signed-out visitors can read approved caregivers; that is RLS, already built. **How much of the catalogue to show signed-out is an application rule, not a database one.**
- The proxy refreshes sessions, as built. Route guards arrive with the screens that need them, not here.
- Errors are shown on the page rather than thrown: a wrong password, an unconfirmed email, and a taken address all need to say what happened and what to do.

## Acceptance Criteria
- [ ] A visitor can reach `/sign-up` from the landing page and back from `/sign-in`.
- [ ] Signing up with email and password creates an account and signs the user in.
- [ ] Signing in with Google returns through the callback route and signs the user in.
- [ ] The first sign-in creates exactly one household and one parent row, and signing in again creates none.
- [ ] A wrong password shows a readable message rather than an error page.
- [ ] Signing out ends the session and the app recognises the user as signed out.
- [ ] A signed-in user and a signed-out visitor are distinguishable on the server.
- [ ] The confirm route verifies an email token and signs the user in.
- [ ] No page exists for a profile, a household, or a child.
- [ ] `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass.
