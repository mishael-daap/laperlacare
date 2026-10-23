<!-- The single source of truth for "what's next". Fill in during Phase 1 (see ai/workflow.md).
Each item's status is one of: pending · spec ready · in development · completed · suspended.
The next feature to build is the first item that is not completed or suspended.
Keep this file to names, statuses, and one-line goals — all details live in ai/features/<name>/.
When the content is final, delete these comments. -->

# Roadmap

## 1. Project scaffolding
- **Status**: completed
- **Goal**: The Next.js app runs against a hosted Supabase project: config validated at boot, browser and server clients, session refresh in the proxy, and schema changes applied through CLI migrations.

## 2. Data model
- **Status**: completed
- **Goal**: The Postgres schema for every core entity, with RLS policies on each table.

## 2.1. Landing page
- **Status**: completed
- **Goal**: A public page that explains the service to parents and to caregivers and sends each to the right signup.

## 3. Accounts and sign-in
- **Status**: completed
- **Goal**: A parent can create an account with Google or email, sign in, and sign out, and every screen knows whether they are signed in. No profile page and no household or child management.

## 4. Caregiver onboarding
- **Status**: completed
- **Goal**: Caregivers register, build a profile with their specialisations, upload their documents, and record their availability.

## 5. Admin dashboard and verification
- **Status**: completed
- **Goal**: An admin signs in, reviews caregivers by status and search, opens their background check, and approves or rejects them.

## 6. Caregiver catalog and profiles
- **Status**: suspended
- **Goal**: A public, browsable catalog of verified caregivers. Paused while the parent household and matching flow is built; may return later.

## 7. Search and filters
- **Status**: suspended
- **Goal**: Parents can narrow the catalog by availability, gender, education level, certifications, and special-needs experience. Paused with the catalog; may return later.

## 7.1. Parent household and child profiles
- **Status**: completed
- **Goal**: A parent manages their household in one place — any number of children, each with full name, date of birth (age derived from it), and a checklist of needs ticked from a fixed list — plus the household's preferred caregiver gender and the weekly days and hours it needs care, so there is something concrete to search caregivers against.

## 7.2. Caregiver capabilities and credentials
- **Status**: in development
- **Goal**: A caregiver ticks the needs they can support and the supports they provide, from the same two fixed lists parents tick, records the ages they work with, their own date of birth, and their gender, and uploads one document per licence or certification — driver's licence, CPR, BT — each approved or rejected by an admin individually with an expiry date, so the profile says what a caregiver can actually do and what has actually been verified.

## 8. Membership and billing
- **Status**: pending
- **Goal**: A household subscribes for a flat monthly fee and the platform tracks whether it is active.

## 9. Contact and interest requests
- **Status**: pending
- **Goal**: Members reach caregiver contact details, and caregivers are notified and can accept or decline.
