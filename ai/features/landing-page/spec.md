# Feature: Landing page

## Purpose
The public front door at `/`. It explains the service to a visiting parent and gives them one action: subscribe to access the network.

## User Flow
1. A visitor lands on `/`.
2. Reads the headline and what the network is.
3. Scans the three benefits.
4. Reaches a call to action.
5. Reads the guarantee.
6. Reaches the final call to action.

There is no navigation, no footer, and no second path. One page, one destination.

## Sections, in order

**1. Hero** — headline, subheading, primary action reading "Get started".

> **California's most loving caregivers**
>
> Every caregiver in our network is vetted before they appear. Background checks, licences, and certifications, reviewed one by one — so you are choosing from the best, not from the whole internet.

**2. Features and benefits** — three, in this order:

| | Benefit | What it says |
|---|---|---|
| 1 | Browse caregivers | Filter by gender, qualifications, and availability, so you find exactly who you need rather than whoever happens to be nearby. |
| 2 | Community | Connect with other families, mums, and kids near you. Share what you know and lean on people in the same situation. |
| 3 | Events | Outings, sleepovers, and birthday parties nearby, so your child socialises and you get time back. |

**3. Call to action** — "Get access to the network"

**4. Guarantee** — full refund within 30 days if you do not find it useful.

**5. Call to action** — "Subscribe to access the network"

## Rules
- Follows `ai/design.md`: minimal, generous space, one primary action, shadcn components only.
- Light mode only. No `dark:` classes are added.
- **The vetted claim must stay true.** The platform records and reviews credentials that caregivers supply; it does not perform background checks itself. Wording must not imply the checks are ours.
- **The page may not promise care.** It is a directory and introduction service. Events are described as social occasions, never as supervision or childcare, and nothing suggests the platform or other parents take responsibility for a child.
- The price is **$10 a month**, stated plainly beside the calls to action rather than buried.
- The page must render with no network access and no database. It is static.
- One `h1`. Sections are landmarks. Body text meets contrast requirements against the theme tokens.
- Both calls to action lead to the same place.

## Acceptance Criteria
- [ ] `/` renders the five sections in order.
- [ ] The headline reads exactly "California's most loving caregivers".
- [ ] The three benefits appear in the stated order.
- [ ] Both calls to action appear and link to `/sign-up`.
- [ ] The 30-day guarantee is stated plainly and is not buried.
- [ ] The page reads well at 360px, 768px, and 1280px wide.
- [ ] No colour, radius, or shadow outside the tokens in `globals.css`.
- [ ] Exactly one `h1`; headings descend in order.
- [ ] The page renders with the network unavailable.
- [ ] `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass.
- [ ] Lighthouse accessibility and best-practices scores are 100.
