# Technical Plan: Accounts and sign-in

## Components
- **`src/app/sign-up/page.tsx`** — email and password form, plus a Google button.
- **`src/app/sign-in/page.tsx`** — same shape, for returning users.
- **`src/app/auth/callback/route.ts`** — exchanges the OAuth code for a session.
- **`src/app/auth/confirm/route.ts`** — verifies an email token. Unused until confirmation is switched on, built now so switching it on is not a code change.
- **`src/app/auth/error/page.tsx`** — where a failed confirmation link lands.
- **`src/lib/auth/ensure-household.ts`** — calls `ensure_household()` once per session and is safe to call repeatedly.
- **Sign-out** — a server action, triggered from the footer, shown only when signed in.
- **shadcn** — `Button`, `Input`, `Label`, `Field`, `Card` for both forms.
- **A migration** exposing `public.ensure_household()`. See below.

## API
- `GET /auth/callback?code=…` — exchanges the OAuth code, then redirects.
- `GET /auth/confirm?token_hash=…&type=…` — verifies an email token, then redirects.
- `POST` server action for sign-out.

## Data Model
No new tables. One new function, and it is the interesting part.

`private.create_household()` already exists and is tested, but it lives in the `private` schema and **that schema is not exposed to the Data API**, so the app cannot call it — a call to it returns 404, which was verified when the data model was built.

So this feature adds a thin wrapper in the exposed schema:

```
public.ensure_household()  returns uuid
  security definer, set search_path = ''
  → caller = auth.uid(); raise if null
  → return the caller's existing household if they have one
  → otherwise delegate to private.create_household()
```

It is idempotent, which is the property that matters: it can be called on every sign-in without creating a second household. `security definer` is required because it reads `parents`, and the caller cannot read other people's rows. It is safe in `public` because it does its own `auth.uid()` check first and takes no arguments — there is nothing to pass it that could point at somebody else's data.

## Flow
Visitor → `/sign-up` → Google redirect, or email and password → `/auth/callback` or straight in → `ensureHousehold()` → redirect to the app.

## Notes
- **Google is a manual setup step.** A Google Cloud project, an OAuth client, and the provider enabled in the Supabase dashboard with the client id and secret. The code cannot do it. Email and password needs none of this, so the order is: email first, confirmed working, then Google.
- **Redirect URLs must be configured in the dashboard** or confirmation and OAuth links bounce to localhost. Both `http://localhost:3000/auth/callback` and `http://localhost:3000/auth/confirm` need registering, plus the production equivalents.
- **Verifying the user.** `getClaims()` in server code, never `getSession()`. Already the rule from the scaffolding notes, and it applies to every check this feature adds.
- **Where sign-in lands.** `/` for now, because the catalogue does not exist. When the catalogue arrives this becomes the catalogue, and that is a one-line change.
- **Sign-out lives in the footer**, because there is no navigation and no profile page, and it has to be reachable somewhere. It renders only when signed in, so a signed-out visitor sees the footer exactly as it is today.
- **Deferred, deliberately:** inviting a second parent, child profiles, editing a household, and any profile page. The schema supports all of them; none of them is needed to let a parent sign in.
