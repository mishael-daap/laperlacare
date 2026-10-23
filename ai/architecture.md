<!-- Fill this in during Phase 1 (see ai/workflow.md). When the content is final, delete all comments.
Done well when: an agent can implement features without re-asking "how do we do X?". Keep it high-level, not code-level. -->

# Architecture

## Stack
- Frontend: Next.js (App Router) with TypeScript, styled with Tailwind CSS and shadcn/ui
- Backend: Next.js server routes and server actions; Supabase for database, storage, and edge functions
- Database: Supabase Postgres, with Row Level Security
- Auth: Supabase Auth, with cookie-based sessions refreshed in Next.js middleware
- Other: Stripe for subscription billing; Resend for transactional email; Supabase Storage for documents; pnpm as the package manager; deployment on Vercel through the Vercel CLI

## System Structure
<!-- The main parts of the system and each one's job. -->
- **Public app** — marketing pages, caregiver catalog and profiles, signup.
- **Member area** — household account, child and family profiles, filtered search, contact access, interest requests, billing.
- **Caregiver area** — registration, document upload, availability management, incoming interest requests.
- **Admin dashboard** — verification queue, user and listing management, subscription oversight.
- **Supabase** — Postgres with RLS, auth, and private storage for caregiver documents.
- **Stripe** — membership billing; webhooks mirror subscription state into Postgres.
- **Notification worker** — edge function that sends email on verification and interest events.

## Data Flow
<!-- One line: User → Frontend → API → Database → Response -->
Parent searches the catalog → server route confirms an active membership → verified caregivers returned → parent opens a profile → contact details served to active members → interest request created → caregiver emailed → accept or decline recorded.

## Core Entities
<!-- The main things the system stores or works with. One line each. -->
- **Household** — the paying account and the tenancy boundary; one per family, with membership held in Postgres.
- **Family member** — a parent or a child under the household; a child profile may hold care needs and any special-needs details the parent chooses to record.
- **Caregiver** — the provider profile and its verification status.
- **Caregiver document** — an uploaded licence, background check, or certification file.
- **Certification** — a credential record attached to a caregiver (BT/RBT, education level).
- **Specialisation** — special-needs experience and capability tags on a caregiver profile; filterable, and optional for the caregiver to declare. A caregiver ticks the same needs list parents tick, plus the supports they provide.
- **Availability** — a caregiver's free time, stored with a timezone.
- **Subscription** — Stripe-backed membership state for a household.
- **Interest request** — a household's interest in a caregiver, plus the caregiver's response.
- **Admin user** — an internal staff account.

## Key Decisions
<!-- Decisions that are settled and should not be re-litigated: auth method, API style, state management, hosting, etc. -->
- RLS is the enforcement layer. Every table gets policies as soon as it is created.
- Caregiver phone numbers are never returned by catalog queries. They are served only through a server route that verifies an active subscription.
- Caregiver documents live in a private bucket, reachable only by admins through short-lived signed URLs.
- Stripe owns billing. Subscription state is mirrored into Postgres by webhook and never edited by hand.
- Verification is derived from documents, not decided about a person. Each licence or certification is reviewed on its own, with an expiry date and an audit record of who approved it and when; the caregiver's status is calculated from those rows and never stored.
- Availability is stored in UTC alongside the caregiver's IANA timezone, so date and time filters are unambiguous across zones.
- Admin entities use conventional, Salesforce-mappable shapes to keep a later migration open.
- Special-needs capability is a set of filterable attributes on a caregiver, not a separate product surface. Special-needs families are a segment served by the same catalog, search, and billing as everyone else.
- Auth is Supabase Auth. A household is the tenancy boundary, held in our own `households` and `parents` tables; policies resolve membership through a `SECURITY DEFINER` helper so the membership table's own policies do not recurse.
- RLS reads the caller through `auth.uid()`, which returns a `uuid`. Every column referencing a user is a `uuid` foreign key to `auth.users`.
- `auth.users` is not extended in place. Parent fields live on `parents`, caregiver fields on `caregivers`, and admin status is a row in `admins`.
- A household is created the first time a signed-in parent opens `/household`, not at payment. Billing attaches a subscription to that household; caregiver contact details remain the paywall.
- Caregivers sit outside any household: caregiver-owned rows are authorised by `auth.uid()` matching the row's `user_id`. Admin access is authorised by an `is_admin()` `SECURITY DEFINER` function over `admins`.
- Schema changes are committed migration files applied with the Supabase CLI. No table is ever created by hand in the dashboard.

## Constraints
<!-- Must use X. Avoid Y. -->
- Must use Supabase and Next.js. Avoid introducing a second backend service; Stripe and Resend are the only third parties.
- California childcare checks are fingerprint-based, run through Live Scan (DOJ/FBI) and the TrustLine registry. The platform records and reviews claimed credentials; it does not perform the checks itself.
- Special-needs information recorded on a child profile is sensitive personal information under CCPA/CPRA, and a child under 13 puts COPPA in scope.
- Do not present the service as therapy, clinical, or medical care.
