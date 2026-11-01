# 1. Family account

**Window A** · signed out.

The household below is not improvised: the seeded caregivers are built so this
household produces one Great fit, one Good fit and one Partial fit. Changing a
tick or a time changes who matches. See
`ai/features/caregiver-matching/spec.md` → *Demo fixtures*.

## Sign up

- [ ] Open `/sign-up`
- [ ] Email `family1@<your-inbox-domain>`, password `DemoPass-2026!`
- [ ] Tick the Terms box
- [ ] Click **Create account**
- [ ] Lands on `/household`

> If it says *"Check your email to confirm your account"*: open the email, click
> the link, sign in at `/sign-in`, and you land on `/household`.

## Add Maria

- [ ] **Your children** → **Add child**
- [ ] **Full name** `Maria Lopez`
- [ ] **Date of birth** `March 12, 2016`
- [ ] **What should a caregiver know about your child?** → tick
      `Limited speech or non-speaking` and `Big feelings or frequent meltdowns`
- [ ] **What support do they need?** → tick
      `Behavioural support and de-escalation` and
      `Communication support (AAC or sign)`
- [ ] **Anything else a caregiver should know?** → `Calms down with music. No loud rooms.`
- [ ] Click **Add child**
- [ ] The card shows the name, an age in years, the four ticks and the note

## Add Diego

- [ ] **Add child** → `Diego Lopez`, `August 2, 2019`
- [ ] Needs → tick `Big feelings or frequent meltdowns`
- [ ] Supports → tick `Communication support (AAC or sign)`
- [ ] Click **Add child**
- [ ] On Maria's card, click the pencil → change the name to `Maria L.` →
      **Save changes**

Both children tick facts the same caregivers cover, so the household's combined
list stays at four items and the match table still holds.

## Care days and times

- [ ] **When you need care** → **Add day**
- [ ] **Day** `Monday`, **From** `08:00`, **To** `12:00` → **Add day**
- [ ] **Add day** → `Thursday`, `13:00`–`17:00` → **Add day**
- [ ] Click the **×** on any third window you add by accident

Eight hours a week, across two days. Every fixture matches this exactly except
Grace, who stops at 15:00 on Thursday.

## Preferred caregiver

- [ ] **Preferred caregiver** → open the dropdown → choose **Female**
- [ ] The label on the dropdown changes to `Female` (it saves on selection, there
      is no Save button in this section)

Female is what splits Rosa from Daniel: same coverage, same hours, different tier.

## Check it held

- [ ] Reload `/household` — both children, the two windows and `Female` are all
      still there
- [ ] Open `/application`, `/me`, `/admin/caregiver` — each one turns this account
      away
- [ ] Sign out, sign in at `/sign-in` with the same email → `/household`

## Find caregivers

- [ ] Back on `/household`, scroll to the pearl card at the bottom → **Find
      caregivers**
- [ ] Lands on `/matches`, headed **Caregivers who fit your family**
- [ ] The line under it reads `2 children, 8 hours a week.` and the needs you
      listed
- [ ] Two caregivers are listed: **Rosa Alvarez** with `Great fit`, then **Daniel
      Okafor** with `Good fit`
- [ ] Rosa's card says *Covers all 8 hours you need*, *Supports every need you
      listed* and *Female, as you asked*
- [ ] Daniel's says the same hours, then *Male — you asked for female*

That is the whole idea of the page: a preference lowers a caregiver's rank and
says so, instead of hiding the person the family would have said yes to.

## Use the levers

- [ ] **Coverage** → press **Full coverage only** so it reads *Including partial
      coverage*
- [ ] A third card appears: **Grace Mwangi**, `Partial fit`
- [ ] It names both gaps: *No cover for Thursday 13:00–17:00* and *Not cleared for
      Big feelings or frequent meltdowns*
- [ ] **Max rate** → **Up to $25** — only Grace is left ($24)
- [ ] **Max rate** → **Up to $20** — the list empties and offers *Remove the rate
      limit*
- [ ] Press that suggestion — the list comes back
- [ ] **My hours** → **Any time** — hours stop discriminating and Grace moves up
- [ ] Reload the page: the levers are still where you left them, because they live
      in the URL

## Save a shortlist

- [ ] Press the bookmark on Rosa's card
- [ ] **Shortlist** → **Saved only** — Rosa alone
- [ ] Reload — she is still saved
- [ ] Press the bookmark again to clear it, then **Saved only** again to go back
      to everyone

## Open a profile

- [ ] Press Rosa's name, or Grace's while partial coverage is on
- [ ] Her profile opens with the same tier, reasons and gaps
- [ ] **Contact details are part of membership** sits where her phone number would
      be, with **See membership** → `/pricing`

Grace only opens from a list where partial coverage was on — that is why the
profile link carries the levers.
