# Landing page copy

The copy as it currently renders at `/`, in page order. Verbatim from the components in `src/components/landing/` — nothing reworded, nothing added. Line breaks inside a paragraph are the component's wrapping, not the sentence's.

## Page metadata

- **Title:** Perla Care — Specialized caregiver matching
- **Description:** Specialized caregiver matching for families of children with special needs. Serving Contra Costa County, California.

---

## 1. Hero

**Headline**
> Finding the right caregiver shouldn't be another challenge.

**Subhead**
> Specialized caregiver matching for families of children with special needs. Serving Contra Costa County, California.

**Button** → `/sign-up`
> Find a caregiver

---

## 2. How Perla Care works

**Section heading**
> How Perla Care works

**Step 1 — Tell us about your family**
> Complete our Family Care Questionnaire and tell us about your child's needs, schedule, and the type of caregiver you're looking for.

**Step 2 — We search for your match**
> Perla Care identifies and screens potential caregivers based on your family's needs and preferences.

**Step 3 — Meet your candidates**
> Meet potential matches, ask questions, and decide who feels right for your family.

**Step 4 — You choose your caregiver**
> You make the final decision. Your family selects, hires, and pays the caregiver directly.

---

## 3. Why families choose Perla Care

**Section heading**
> Why families choose Perla Care

**Intro**
> Finding the right caregiver is about more than availability. It's about finding someone who understands your child and feels right for your family.

**Reason 1 — Personalized matching**
> We consider your child's needs, personality, routines, schedule, and your family's preferences when identifying potential caregivers.

**Reason 2 — Special-needs experience**
> Connect with caregivers who have relevant experience supporting children with developmental, communication, behavioral, sensory, or physical support needs.

**Reason 3 — You stay in control**
> Meet potential caregivers, ask questions, and decide who feels right for your family. You make the final hiring decision.

**Reason 4 — Local and personal**
> Focused on Contra Costa County, Perla Care is building a local network designed around families and caregivers in our community.

---

## 4. The offer

**Heading**
> Get access to the network

**Price line**
> One membership per household. $10 a month.

**Button** → `/sign-up`
> Join

---

## 5. Guarantee

**Heading**
> Money back within 30 days

**Body**
> If the network is not useful to you, ask for a refund within 30 days and we will return what you paid.

---

## 6. FAQ

**Section heading**
> FAQ

**How are caregivers vetted?**
> Every caregiver uploads a background check, a licence, and their certifications. We review each document before their profile appears, so only verified caregivers are in the network.

**What does the membership include?**
> One membership covers your whole household. It unlocks caregiver matching and caregiver contact details.

**Is this a childcare agency?**
> No. We are a directory and introduction service. We connect you with caregivers — you choose who to hire and arrange everything with them directly.

**What if it is not right for us?**
> Ask for a refund within 30 days and we will return what you paid.

**Where are you available?**
> Across Contra Costa County, California.

---

## 7. Final call to action

**Heading**
> Ready to find your caregiver

**Body**
> Tell us about your child, your family's needs, and the kind of support you are looking for. Perla Care will help you connect with caregivers who may be a good fit for your family.

**Price line**
> $10 a month, with 30 days to change your mind.

**Button** → `/sign-up`
> Find your caregiver

---

## 8. Footer

- © 2026 Perla Care
- About → `/about`
- Contact → `/contact`
- Terms → `/terms`
- Sign out (only when signed in)

---

## Open before launch

- **The price.** The page says **$10 a month**, twice. `ai/business-model.md` settles on **$99/month**, billed upfront. One of the two is wrong.
- **Step 2's claim.** "identifies and screens potential caregivers" is stronger than the architecture supports: the platform reviews the documents a caregiver supplies, it does not run background checks itself.
