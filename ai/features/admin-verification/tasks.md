# Tasks: Admin verification

- [x] Migration: add `caregivers.reviewed_by` and `caregivers.reviewed_at`, plus admin select and update policies on `caregivers`, admin select on `contacts`, and admin select on `caregiver_availability`. Verify: an admin reads a pending caregiver and their contacts; a caregiver cannot read another's; anon reads nothing new.
- [x] Migration: `public.admin_caregiver_directory` and `public.admin_caregiver_counts`, both `SECURITY DEFINER`, `set search_path = ''`, admin-gated, with `revoke all from public` and `grant execute to authenticated`. Verify all five buckets and a search across name, email, and phone.
- [x] Regenerate `src/types/supabase.ts` with `pnpm db:types`.
- [x] `src/lib/admin/is-admin.ts`, and the guarded `src/app/admin/(dashboard)/layout.tsx`: signed out → `/admin/sign-in?next=/admin/caregiver`, non-admin → 404.
- [x] `/admin/sign-in`, reusing `AuthForm` with the admin framing and no "Create one" link.
- [x] Send admins to `/admin/caregiver` from `landingPath` and from the auth callback, ahead of the caregiver check.
- [x] `/admin/caregiver`: call the directory RPC and render a table of name, email, and status, each row linking to the detail.
- [x] Status filter buttons with counts, as links that preserve `q`, with Pending as the default view.
- [x] Search box over name, email, and phone, as a GET form that preserves `status` and resets the page.
- [x] Pagination at 10 by default, preserving `status`, `q`, and `per`, with a 10 / 25 / 50 / 100 row-count control.
- [x] `/admin/caregiver/[id]`: profile summary, contacts, weekly availability read-only, and the completeness count reusing `completeness()`.
- [x] Documents on the detail page, each with an Open link to a server-generated signed URL opening in a new tab.
- [x] `setVerificationStatusAction` and the Approve/Reject buttons, writing status plus `reviewed_by`/`reviewed_at` and revalidating.
- [x] Verify the decision end to end: the row carries the status, reviewer, and time, the list and counts follow, and reversing works.
- [x] Verify a non-admin cannot reach the list, the detail, or the RPCs, and that approving does not touch `caregiver_documents.review_status`.
- [x] `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass.
