# Feature: Project scaffolding

## Purpose
A running Next.js app wired to Supabase: validated config, browser and server clients, and session refresh. No user-facing pages.

## User Flow
1. Clone the repo and run `pnpm install`.
2. Copy `.env.example` to `.env.local` and fill in the Supabase URL and publishable key.
3. Run `pnpm dev` and the app serves.
4. Run `pnpm db:push` to apply migrations to the linked Supabase project.

## Rules
- A hosted Supabase project only. There is no local database.
- Supabase Auth is the only identity provider.
- Migrations are the only way the schema changes. No table is created by hand in the dashboard.
- No domain tables and no product features. The data model feature owns the schema.
- Missing or malformed config fails at boot with a readable message.
- No secret reaches client code.
- The build must not need a reachable database.

## Acceptance Criteria
- [ ] `pnpm install && pnpm build` succeeds from a clean checkout.
- [ ] `pnpm lint` and `pnpm typecheck` pass.
- [ ] `pnpm dev` serves the app.
- [ ] Missing or malformed config fails at boot with a readable message.
- [ ] The Supabase browser and server clients compile and reach the hosted project.
- [ ] The proxy refreshes the session on every matched route.
- [ ] `supabase/migrations/` applies to the linked project via the CLI.
- [ ] `.env.example` documents every variable and `.env.local` is gitignored.
