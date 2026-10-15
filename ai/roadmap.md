<!-- The single source of truth for "what's next". Fill in during Phase 1 (see ai/workflow.md).
Each item's status is one of: pending · spec ready · in development · completed.
The next feature to build is the first item in this file that is not completed.
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
- **Status**: in development
- **Goal**: A public page that explains the service to parents and to caregivers and sends each to the right signup.

## 3. Household accounts
- **Status**: pending
- **Goal**: One family account with member profiles, including the child.

## 4. Caregiver onboarding
- **Status**: pending
- **Goal**: Caregivers register, build a profile with their specialisations, upload their documents, and record their availability.

## 5. Admin dashboard and verification
- **Status**: pending
- **Goal**: An admin can review each caregiver and approve or reject them.

## 6. Caregiver catalog and profiles
- **Status**: pending
- **Goal**: Verified caregivers are listed and browsable by the public.

## 7. Search and filters
- **Status**: pending
- **Goal**: Parents can narrow the catalog by availability, gender, education level, certifications, and special-needs experience.

## 8. Membership and billing
- **Status**: pending
- **Goal**: A household subscribes for a flat monthly fee and the platform tracks whether it is active.

## 9. Contact and interest requests
- **Status**: pending
- **Goal**: Members reach caregiver contact details, and caregivers are notified and can accept or decline.
