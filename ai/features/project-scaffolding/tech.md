# Technical Plan: Project scaffolding

## Components
- **Next.js 16** — App Router, TypeScript, Tailwind 4, `src/` directory, import alias `@/*`, pnpm.
- **shadcn/ui** — `components.json`, `src/lib/utils.ts`, and a base component set.
- **`src/lib/env.ts`** — Supabase config validated with Zod at boot.
- **`src/lib/supabase/client.ts`** — browser client.
- **`src/lib/supabase/server.ts`** — server client for Server Components, Server Actions, and Route Handlers.
- **`src/lib/supabase/proxy.ts`** and **`src/proxy.ts`** — session refresh on every matched request.
- **`supabase/config.toml`** and **`supabase/migrations/`** — the only path for schema changes.

## Data Model
None. The data model feature owns the schema.

## Flow
Request → `proxy()` refreshes the session → server component creates a client → Postgres evaluates RLS → response.

## Notes
- **Manual setup.** Create the hosted Supabase project, then set the Site URL and redirect URLs in Supabase → Authentication → URL Configuration. Until that is done, auth links resolve to localhost.
- **One Supabase project, or two?** Recommended: a dev project separate from production. `db push` targets whichever project is linked, so a single project sends every migration straight to production.
- **Next.js 16 renamed the `middleware` file convention to `proxy`.** The file is `src/proxy.ts` and the export is `proxy()`. A file named `middleware.ts` is silently never called on 16, so sessions stop refreshing and users get signed out at random.
- **Verify identity with `getClaims()`.** `getSession()` reads the cookie without revalidating it and must never back an authorization decision.
- **Refresh tokens in the proxy only.** A refresh token can generally be used once; refreshing in two places trips reuse detection and revokes the session.
- **`setAll` receives a second `headers` argument** carrying `Cache-Control`, `Expires`, and `Pragma`. Those must be copied onto the response or a CDN can serve one user's session to another.
- **Keys.** Supabase retires the `anon` and `service_role` JWTs by the end of 2026. This project uses `sb_publishable_...`; `env.ts` rejects legacy `eyJ...` values with an explanation.
