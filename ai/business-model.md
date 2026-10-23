# Business model

Decided 2026-10-23. Supersedes the two spreadsheets from the October modelling
session (`Perla care lancement 7000.xlsx`, `Perla care modele financier.xlsx`).
Those are re-run at the numbers below, not rebuilt.

## The model

**A family subscription.** A household pays a flat fee, billed upfront, for
access to a bench of verified caregivers and a replacement when theirs falls
through. Perla Care never touches the money paid for hours, takes no commission,
and never employs a caregiver.

This is **model B** from the October evaluation of five candidate models. Model C
— matching families to Regional Center–funded respite hours — is not a separate
revenue stream. It is the argument that justifies the price.

## Who pays, and for what

The family. The state-funded respite hours are already theirs; they cannot find
anyone to work them, and the worker has to be cleared before the FMS will pay.

| | |
|---|---|
| Price | **$99/month** |
| Target volume | **~120 households** (not 1,200) |
| Revenue at target | **~$143k/year** |
| Operating cost | **~$11k/year** |
| Result at target | **~$130k/year** |

## Why the price is $99 and not $19.99

A family authorised for 30 respite hours a month holds **~$860/month, ~$10,300/year
of state-funded labour**. At $19.99 the platform charges ~0.3% of the value it
unlocks. The comparison is not Care.com's $12.99 (a generalist babysitting
marketplace). The comparison is private care at **$27.56–40/hour**: $99/month pays
for itself in three hours of care the family no longer has to buy.

The old model reached $136k in **year three** with 1,200 families and $25–32k of
capital. This one reaches ~$130k in **year one** with 120 families and $5–8k.

The structural reason: at $20/month the business is volume, and volume needs paid
acquisition. At $99/month it is a niche, and a niche grows on trust built by hand.
With $7,000 and no ad budget, only the second is fundable.

## Decisions

- **Subscription only. No commission on hours.** A commission earns ~$70/family/
  month at 10 private hours, less than the subscription, while adding refunds,
  disputes, 1099s, and hourly operations. *(model A)*
- **Never take custody of the hourly money.** Collecting payment and setting the
  rate is the pattern that reads as employment under AB5. It is also the weakest
  possible anti-circumvention lock: the exchange happens at the meet-and-greet,
  not in the payment flow. *(see Rejected)*
- **Caregivers are independent contractors. Never employees.** Not a lean choice —
  a legal one. Employment means payroll tax, workers' comp, licensing, and a
  revenue cap at the $28.69 state rate. *(model D)*
- **Price against the funded hours, not against Care.com.** See above.
- **Volume target is 120 households, not 1,200.** Ten times the customers for
  three times the money is a worse trade per hour of the founder's life.
- **Bill upfront** (annual, or a one-time placement fee). Money already banked
  cannot be un-banked, and it is the only anti-circumvention measure that works.
- **The software does matching; the human only vets.** Manual matching is the part
  that does not scale. At 120 households with a match needed every 12–18 months,
  that is ~8 matches/month for one person.
- **Caregivers pay for their own Live Scan and TrustLine.** It is the cheapest
  option, the clearance is portable and stays theirs, and paying for a worker's
  credential is itself an employment signal. Revisit only if recruiting stalls.
- **Retention comes from turnover, not from the background check.** A clearance is
  one-time and tied to the worker. What makes the subscription recurring is the
  bench: replacement when the worker quits, backup when they are sick.

## Considered and rejected

| Model | What it is | Why not |
|---|---|---|
| A — commission | 15–25% of hours booked in-app | ~$70/family/month, plus money handling and AB5 exposure. Only ever applies to private top-up hours; Regional Center hours carry no commission by law. |
| D — vendored agency | Bill the Regional Center at $28.69/h | Real revenue, but per-hour labour means cost grows linearly with revenue. Licensing, W-2 staff, insurance, audits. Phase 3 at the earliest, and outside this model. |
| E — B2B SaaS | Sell scheduling software to agencies | Different customer, long sales cycles, small agencies with no budget. Not the original idea. |
| Being the payment pipe | Parent pays us, we pay the caregiver | Solves circumvention it cannot actually prevent, and buys the employment risk we are avoiding. |
| $19.99/month | Consumer-marketplace pricing | Prices the product at 0.3% of the value it unlocks, and forces a 1,200-family volume business the capital cannot fund. |

## Capital

Recurring costs are near-zero. Capital is startup cost, plus three items that are
not negligible: the $800 franchise tax, insurance, and background checks.

| Item | Range | Note |
|---|---|---|
| CA LLC — filing $70, SOI $20 | ~$90 | one time |
| CA franchise tax | $800/yr | **verify the first-year exemption** |
| E&O / professional liability | $800–2,500/yr | the biggest unknown |
| General liability | $400–800/yr | often required |
| Lawyer-reviewed ToS + privacy | $1,500–5,000 | not optional with child data |
| Live Scan, per caregiver | $50–80 | ~$2,400 for 40, if we pay |
| TrustLine, per caregiver | $25–40 | separate from Live Scan |
| Hosting, domain, email | ~$300/yr | free tiers cover the early stage |
| Stripe | 2.9% + $0.30 | 3.2% at $99 |

Floor **~$3,500** if caregivers pay for their own checks. **~$9,000–12,000** if we
pay for checks and get the terms reviewed.

## Labour

Money is not the binding constraint. **Getting to 40–60 vetted caregivers is
~150–250 hours** of recruiting and vetting before there is anything worth selling.

1. Caregiver recruitment — 2–3 h each, and more work than vetting
2. Vetting — 1–2 h each: documents, Live Scan, references, TrustLine
3. Family intake calls — 30–60 min each
4. Build — catalog, search and filters, Stripe subscriptions. Auth, verification,
   and profiles already exist in the codebase
5. Support — replacements, no-shows, questions. The one line that scales with families
6. Content — a plain guide to using Regional Center respite hours

## Unit economics

Costs are almost entirely fixed, so the marginal household costs ~$3.20/month and
brings $99.

| Households | Revenue/year | Cost/year | Result |
|---|---|---|---|
| 10 | $11,880 | $1,430–5,580 | **$6,300–10,450** |
| 40–50 | $47,500–59,400 | $600–2,800 | the point the model starts working |
| 120 | ~$143,000 | ~$11,000 | ~$130,000 |

Break-even is ~3 households at $99. Ten households is not the business — it is the
proof that anyone will pay, and it is a validation stage rather than an income.

## Assumptions to verify before relying on this

- **Will families pay $99/month?** Unproven. Testable in two weeks with 10–15
  phone calls; the 1,200-family alternative needs years and a budget we do not have.
- **First-year California franchise tax exemption** — confirm against the
  registration date.
- **Whether the family or the platform is the requesting party** for a Live Scan
  under participant-directed respite. The family is the employer of record.
- **Whether the worker's wage can be set below the $28.69 rate**, with the
  difference retained. This decides whether model D is viable at all later.
- Insurance quotes. The $800–2,500 range is a guess.

## References

- DDS respite rate, codes 420/864, effective 2026-01-01: **$28.69/h** — East Bay,
  Golden Gate, San Andreas. dds.ca.gov
- Care.com Premium: $12.99/month on annual billing
- Special-needs home care, SF region: **$27.56–40/h** (BrightStar Care, Sept 2025)
- AB5 / ABC test — control, usual-course-of-business, independently established trade

## Impact elsewhere

- `ai/roadmap.md` item 8 (membership and billing) inherits the $99 price and the
  upfront billing decision.
- `ai/overview.md` describes a flat monthly membership. Consistent; the price is
  deliberately not stated there.
- `ai/architecture.md` says Stripe mirrors subscription state into Postgres. Still
  correct — Stripe is now only used to bill families, never to pay caregivers.
