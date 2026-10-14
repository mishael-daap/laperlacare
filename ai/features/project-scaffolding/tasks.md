# Tasks: Project scaffolding

- [x] Save docs snapshots to `ai/dependencies/<name>/docs.md` for every library in use (`next`, `supabase`, `zod`, `tailwindcss`, `shadcn-ui`).
- [x] Scaffold the Next.js app (App Router, TypeScript, Tailwind, `src/`, alias `@/*`, pnpm); verify it builds.
- [x] Add `src/lib/env.ts` validating the Supabase config with Zod; verify a missing var fails fast with a readable message.
- [x] Write `.env.example`; confirm `.env.local` is gitignored.
- [x] Init shadcn/ui and add a base component set; verify a component renders with Tailwind styles.
- [x] Add `src/lib/supabase/client.ts` and `server.ts`; verify both typecheck.
- [x] Add `src/lib/supabase/proxy.ts` wired from `src/proxy.ts`; verify the proxy runs on matched routes.
- [x] Init the Supabase CLI (`supabase/config.toml`) and link the hosted project; verified the link succeeds.
- [x] Add the first migration enabling `pgcrypto`; verified `db push` applies it and `migration list` shows local and remote matching.
- [x] Verify the server client reaches the hosted project: `getClaims()` returns no error and the Data API answers with `PGRST205` (a real PostgREST response, not a network or auth failure).
- [x] Generate `src/types/supabase.ts` and wire `Database` into both clients so queries are typed.
- [x] Add pnpm scripts for `dev`, `build`, `lint`, `typecheck`, `db:push`, `db:pull`, `db:types`; verified `lint`, `typecheck`, and `build` pass from a clean checkout.
- [x] Update `ai/roadmap.md` status.
