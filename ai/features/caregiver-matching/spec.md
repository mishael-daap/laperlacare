# Feature: Caregiver matching

## Purpose
A parent's household is already the brief, so matching turns it into a shortlist
instead of asking them to describe it again in a search form. One button on
`/household` returns approved caregivers ranked by how well they fit, each one
explaining why it is there and what it does not cover, with a few levers to relax
the household's own constraints when the list is empty or too short.

## User Flow
1. A parent who has at least one child and at least one care window opens
   `/household` and sees **Find caregivers**. With no child or no window the
   button reads what is missing and links to that section instead.
2. They press it and land on `/matches`, headed *"Caregivers who fit your
   family"* with the household's own facts summarised above the list: how many
   children, which needs, which days.
3. Each result is a card: photo, name, rate, ages, languages, and **Great fit /
   Good fit / Partial fit**, with **Why you match** (their own facts, quoted
   back) and any **gaps** stated plainly.
4. Above the list sit four levers, all prefilled from the household: **Hours are
   flexible** (exact · ±1 hour · any time that day), **Include partial coverage**,
   **Max hourly rate**, and **Gender** (the household preference, or any).
5. Changing a lever re-ranks the list in place; the lever values live in the URL
   so back and refresh keep them.
6. A parent saves a caregiver with **Save**, and the **Saved** lever narrows the
   list to their shortlist. Saved caregivers survive leaving the page.
7. Tapping a card opens the caregiver's profile. Contact details are not here:
   the page shows **Contact details are part of membership**, linking to
   `/pricing`.
8. If nothing matches, the page never dead-ends: it names the constraint that
   removed the most caregivers and offers up to three one-press relaxations, each
   of which flips a lever.

## Rules
- Only caregivers who pass `private.caregiver_is_public` appear: `approved_at is
  not null and declined_at is null`. Onboarding, pending and rejected caregivers
  never appear, and neither does any caregiver with an approved profile but a
  lapsed background check if the status function says otherwise.
- The household is taken from the session (`private.current_household_id()`),
  never from a request parameter. A parent cannot match against someone else's
  children by editing the request.
- **Age** is hard: the child's age must fall inside the caregiver's
  `age_min`–`age_max`. A caregiver who does not work with a 10-year-old is not a
  match for a 10-year-old at any lever setting.
- **Needs and supports** are hard by default: the caregiver must cover the union
  of every child's needs and supports. `Include partial coverage` relaxes this to
  cover at least half of them, and the card then names what is missing.
- **Availability** is measured in minutes of overlap between
  `household_availability` and `caregiver_availability` on the same day. Exact
  means every window is fully covered; ±1 hour widens each window by an hour at
  each end before overlapping; any time that day requires any overlap on that
  day. `Include partial coverage` admits a caregiver covering at least half of
  the household's weekly minutes.
- **Gender**: the household preference applies unless the lever is set to any. A
  caregiver who left gender blank never matches a stated preference.
- **Rate**: when a max rate is set, a caregiver has to have an `hourly_rate` and
  it has to be at or under it. A caregiver with no rate is excluded rather than
  assumed cheap, and the card says *Rate not set* when no cap is applied.
- **Tier** is decided in this order, and the first rule that fits wins:
  - **Great fit** — every need and support covered, every window fully covered,
    and the gender matches the household preference (or there is no preference).
  - **Good fit** — every need and support covered and every window fully covered,
    but the caregiver's gender differs from a stated preference; or every need
    and support covered while the windows are only admitted by `Include partial
    coverage`.
  - **Partial fit** — needs or supports missing, which only happens with `Include
    partial coverage`; or a household window set that is only half covered.
- **Order** is tier, then weekly overlap minutes descending, then rate ascending
  with missing rates last, then name.
- **No geography in v1.** There is no household location, so counties and travel
  are shown on the card but never used to filter or rank. `households.county` and
  the mobile app's coordinates are a later feature, not an unfinished part of
  this one.
- **Contact details never leave the database for a non-member.** The match
  function does not select phones or emails, so a locked profile is locked in the
  payload and not only in the markup.
- A lever that returns nothing leaves the other levers as they were; the empty
  state is a set of suggestions, not an automatic change.

## Acceptance Criteria
- [ ] A parent with no children, or no care window, does not see an enabled
      **Find caregivers** button.
- [ ] A parent with a complete household sees a ranked list within one press,
      with no form to fill in on `/matches`.
- [ ] Every card states at least one reason it matched, quoted from the parent's
      own household data.
- [ ] A card that leaves a gap names that gap in the same place.
- [ ] Changing any lever changes the list, and the URL carries the lever values.
- [ ] With all levers at their defaults, a caregiver missing one of the child's
      needs does not appear.
- [ ] `Include partial coverage` makes that caregiver appear, marked **Partial
      fit**, with the missing need named.
- [ ] A pending or rejected caregiver never appears for any combination of
      levers.
- [ ] A caregiver outside the child's age range never appears.
- [ ] An empty result offers at least one relaxation, and pressing it returns
      results.
- [ ] Saved caregivers survive a reload, and **Saved** shows only those.
- [ ] A caregiver's phone and email are absent from the page source and from the
      match payload before membership.
- [ ] The caregiver profile page shows a membership prompt instead of contact
      details.
- [ ] Nothing on the page scrolls sideways at 320px.

## Demo fixtures

The seed exists to make the three tiers visible on a household that was typed in
by hand, so the walkthrough proves matching works from entered data and not from
planted rows.

```bash
pnpm seed:demo
```

It removes every previous demo account first, then creates six caregivers and the
one admin, so the list is identical on every run. Every fixture is created
`approved` (an approved background check, `approved_at` set, `declined_at` null)
and has its capability rows and availability blocks written directly, because
`private.caregiver_is_public` is what decides who is matchable.

The demo parent is **not** seeded. The parent signs up during the walkthrough and
fills the household by hand with exactly these facts:

| Household fact | Value |
|---|---|
| Child | Maria Lopez, March 12, 2016 — 10 years old |
| Second child | Diego Lopez, August 2, 2019 — needs `big-feelings`, support `communication`, so the union across children does not change |
| Needs | `communication` (Limited speech or non-speaking), `big-feelings` (Big feelings or frequent meltdowns) |
| Supports | `behaviour` (Behavioural support and de-escalation), `communication` (Communication support (AAC or sign)) |
| Care windows | Monday 08:00–12:00, Thursday 13:00–17:00 — 8 hours a week |
| Preferred caregiver gender | Female |

| Fixture | Email | Gender | Ages | Rate | Covers | Available | What it proves |
|---|---|---|---|---|---|---|---|
| Rosa Alvarez | `demo-great@example.com` | Female | 5–14 | $26 | both needs, both supports | Mon 08:00–12:00, Thu 13:00–17:00 | **Great fit** at default levers |
| Daniel Okafor | `demo-good@example.com` | Male | 6–14 | $30 | both needs, both supports | Mon 08:00–12:00, Thu 13:00–17:00 | **Good fit**: full coverage, gender differs from the stated preference |
| Grace Mwangi | `demo-partial@example.com` | Female | 4–11 | $24 | one of two needs (`communication` only), both supports | Mon 08:00–12:00, Thu 13:00–15:00 | **Partial fit**: misses `big-feelings` and 2 of 8 hours, so it appears only once `Include partial coverage` is on, carrying both kinds of gap |
| Peter Njenga | `demo-miss@example.com` | Female | 5–14 | $22 | neither need, neither support (`sensory-sensitivities`, `cooking`) | Mon 08:00–12:00, Thu 13:00–17:00 | never appears: covers none of the household's four facts |
| Linda Park | `demo-adults@example.com` | Female | 14–21 | $28 | both needs, both supports | Mon 08:00–12:00, Thu 13:00–17:00 | never appears: the age range excludes a 10-year-old |
| Noor Haddad | `demo-unapproved@example.com` | Female | 5–14 | $25 | both needs, both supports | Mon 08:00–12:00, Thu 13:00–17:00 | never appears: profile is left pending on purpose |

Age bands deliberately run wide (5–14, 4–11) so the fixtures keep matching as the
child's derived age moves, since age is computed from the date of birth on every
render.

- [ ] `pnpm seed:demo` leaves exactly six caregivers and one admin, and running
      it twice leaves the same six.
- [ ] On the demo household at default levers: exactly one **Great fit** and one
      **Good fit**, and no other caregiver.
- [ ] `Include partial coverage` adds exactly one **Partial fit**, Grace, naming
      both gaps: the need she is not cleared for and the Thursday hours.
- [ ] Daniel is a **Good fit** and still appears: a stated gender lowers the tier
      and never hides the card.
- [ ] Peter, Linda and Noor never appear under any combination of levers, or in
      the **Saved** list.
- [ ] Setting `Max hourly rate` to `25` with partial coverage on leaves Grace
      alone; at `23` the list empties and offers the relaxation.

## Cut line
The shortlist is the last thing built and the first thing to drop. Matching,
levers, reasons and gaps stand without it; saving is what makes coming back
possible, and what item 10 needs to build on.
