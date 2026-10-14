<!-- Fill this in during Phase 1 (see ai/workflow.md). When the content is final, delete all comments.
Done well when: a stranger understands the project in under 30 seconds, with no architecture or implementation details leaking in. -->

# Overview

## Product
laperlacare is a membership platform where households find verified caregivers. Parents search a network of caregivers, narrow it with filters, and contact the ones they want directly. Caregivers are document-verified before they appear, and families pay a flat monthly membership for access.

## Target Users
- **Parents and guardians** looking for childcare — the paying members. One membership per household. Families caring for children with special needs are a core segment of this group, not the whole of it.
- **Family members** under that household, including the child, whose profile the parent manages.
- **Caregivers** — special-needs childcare providers such as behavioural technicians. Free to join, verified before listing.
- **Internal admin** — reviews caregiver documents, manages users, listings, and memberships.

## Problem
Households assemble childcare by hand today: calling regional centres, posting in Facebook groups, asking other parents. Nothing lets them filter caregivers by the things that actually matter — availability on a given date, credentials, experience — and nothing gives them confidence that a caregiver's certifications are real. Families of children with special needs feel this hardest, because the fit matters more and the options are fewer.

## Core Features
- **Household accounts** — one account per family, with parent-managed profiles for every family member including the child.
- **Caregiver onboarding** — registration, document upload (driver's licence, background check, certifications), and availability entry.
- **Admin verification** — review queue where an admin approves or rejects each caregiver, plus user and listing management.
- **Caregiver catalog** — verified caregivers only, with browsable profiles.
- **Search and filters** — availability by date and time, gender, education level, certifications such as BT/RBT, and experience with special needs.
- **Membership** — a flat monthly fee that unlocks full network access.
- **Contact and interest** — members see caregiver contact details, send interest, and the caregiver is notified and can accept or decline, with responses tracked.

## Constraints
- Launching in California, so US payments and privacy law apply along with state childcare background-check rules.
- Storing child profiles means storing children's data. A child under 13 brings COPPA into scope, and special-needs information recorded on a child profile is sensitive personal information under CCPA/CPRA. Both need legal review before launch.
- The platform is a directory and introduction service, not a care provider. The terms must say so plainly.
- Admin tooling is custom for now. A Salesforce migration is planned later, so admin data should stay migration-friendly.
