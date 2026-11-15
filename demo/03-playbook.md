# Demo playbook

| Role | Account |
|---|---|
| Admin | `da'apm5694@student.babcock.edu.ng` |
| Parent | `mishael60567@gmail.com` |
| Caregiver | `themishaeldaap@gmail.com` |

Run `pnpm seed:demo` first — the three caregivers in the Parent part exist only
because of it, and the admin needs a row in `admins`.

## Parent

Window A. Signed out.

### 1. Account creation — *Create your account* (`/sign-up`)

<https://www.laperlacare.com/sign-up>

- [ ] Email `mishael60567@gmail.com` with its password
- [ ] Tick the Terms box — **Create account** stays disabled until you do
- [ ] **Create account**
- [ ] Expect: `/household`, headed *Your household*

> If it says *Check your email to confirm your account*, open the link, sign in
> at `/sign-in`, and you land on `/household`.
>
> If the account already exists, sign in instead and skip to step 2.

### 2. *Your children* → **Add child**

**Maria**

- [ ] **Full name** `Maria Lopez`
- [ ] **Date of birth** `March 12, 2016`
- [ ] *What should a caregiver know about your child?* → tick
      `Limited speech or non-speaking`, `Big feelings or frequent meltdowns`
- [ ] *What support do they need?* → tick
      `Behavioural support and de-escalation`, `Communication support (AAC or sign)`
- [ ] *Anything else a caregiver should know?* → `Calms down with music. No loud rooms.`
- [ ] **Add child**

**Diego**

- [ ] **Add child** → `Diego Lopez`, `August 2, 2019`
- [ ] Needs → `Big feelings or frequent meltdowns`
- [ ] Supports → `Communication support (AAC or sign)`
- [ ] **Add child**
- [ ] Expect: two cards, each showing name, age in years, the ticks, the note
- [ ] Pencil on Maria → `Maria L.` → **Save changes**

### 3. *When you need care*

- [ ] **Add day** → `Monday`, From `08:00`, To `12:00` → **Add day**
- [ ] **Add day** → `Thursday`, From `13:00`, To `17:00` → **Add day**
- [ ] Expect: two rows, `Monday 08:00 to 12:00` and `Thursday 13:00 to 17:00`
- [ ] Trash a window you added by accident → it disappears and saves on click

Eight hours a week, two days. Every caregiver in the seed matches this except
Grace, who stops at 15:00 on Thursday.

### 4. *Preferred caregiver*

- [ ] Dropdown → **Female**
- [ ] Expect: the label changes to `Female`, with no Save button — it saves on pick

This is what splits Rosa from Daniel: same coverage, same hours, different tier.

### 5. *Caregivers who fit your family* (`/matches`)

- [ ] Scroll to the pearl card → **Find caregivers**
- [ ] Expect: header *Caregivers who fit your family*, then
      `2 children, 8 hours a week` and the four needs you ticked
- [ ] Expect exactly two cards, in this order:

| Card | Tier | Why you match |
|---|---|---|
| **Rosa Alvarez** · $26/hour · ages 5–14 · English, Spanish | **Great fit** | Covers all 8 hours you need · Supports every need you listed · Provides every kind of support you listed · Female, as you asked |
| **Daniel Okafor** · $30/hour · ages 6–14 · English | **Good fit** | the same three, then **Male — you asked for female** |

Never on the page: Peter (covers none of the needs), Linda (works with ages
14–21), Noor (profile not approved).

**Filters — press each and check the result**

| Lever | Press | Expect |
|---|---|---|
| **Coverage** | `Full coverage only` → `Including partial coverage` | **Grace Mwangi** $24, **Partial fit**, `Covers 6 of 8 hours you need`, `Supports 1 of 2 needs`, gaps `No cover for Thursday 13:00–17:00` and `Not cleared for Big feelings or frequent meltdowns` |
| **Max rate** | `Up to $25` | Grace alone |
| **Max rate** | `Up to $20` | empty list → suggestion **Remove the rate limit** → press it, list comes back |
| **My hours** | `Exact` → `Any time` | Grace reads `Covers all 8 hours you need` and the Thursday gap disappears; tier stays Partial |
| **Caregiver** | `Any` | Daniel becomes **Great fit** and loses the *Male — you asked for female* line |
| **Caregiver** | `Male` | Daniel **Great fit**; Rosa **Good fit** with `Female — you asked for male` |
| **Shortlist** | bookmark Rosa → `Saved only` | Rosa alone; reload keeps her saved |

- `±1 hour` changes nothing with these three — it only rescues a near-miss start,
  and none of them is near-miss.
- Reload at any point: the levers stay where you left them, because they live in
  the URL.

## Caregiver & Admin

Run this **after** Parent: the caregiver you create here ends up in that
family's matches.

<https://www.laperlacare.com/caregivers/sign-up>

- **Window A** — the caregiver, signed out at the start.
- **Window B** — the admin: `/admin/sign-in`,
  `da'apm5694@student.babcock.edu.ng`.

Most of the caregiver's work is checked here on the admin side, so the steps are
marked **A** or **B**.

### 1. Profile — *Edit profile*

**A**

- [ ] `/caregivers/sign-up` → email `themishaeldaap@gmail.com` with its password,
      tick Terms → **Create account**
- [ ] Expect: `/onboarding`, headed *Let us get your profile finished*, with
      `n of 16 sections complete` and a **Next** link
- [ ] Open `/me` → **Edit profile** (top right; the button then reads
      *Editing profile*)
- [ ] Name → `Alex Rivera`
- [ ] Bio → `Nine years supporting autistic children at home and in school. AAC every day, and I let the child set the pace.`
- [ ] **Date of birth** → `May 4, 1998`
- [ ] **Ages you work with** → `4` to `17`
- [ ] **Save** in the bottom bar — it only appears once something changed
- [ ] Expect: header shows `Alex Rivera`, `28`, `Ages 4–17`; the rail counts up

### 2. Contact details

**A**

- [ ] Still editing → **Contact details** → **Add another contact**
- [ ] **Label** `Mobile`, **Phone** `510-555-0142`, **Email**
      `themishaeldaap@gmail.com`, **Preferred contact method** → `Text message`
- [ ] **Save**

**B**

- [ ] `/admin/caregiver` → status **All** → search `themishaeldaap@gmail.com`
- [ ] Open the row → **Contact details** shows `Mobile`, the phone, the email,
      `Prefers text message`

### 3. *Children you can support* / *What you can provide*

**A**

- [ ] Tick `Limited speech or non-speaking` and `Big feelings or frequent meltdowns`
- [ ] Tick `Behavioural support and de-escalation` and `Communication support (AAC or sign)`
- [ ] **Save**
- [ ] Expect: the two counts in the progress rail move

**B**

- [ ] Reload the caregiver → **What they can support** lists the same four

### 4. *Your weekly availability*

**A**

- [ ] The row for **Mon**: click the 9th, 10th, 11th and 12th cells
      (08:00, 09:00, 10:00, 11:00)
- [ ] The row for **Thu**: click the 14th to 17th cells (13:00–16:00)
- [ ] **Save**
- [ ] Expect: the line above the grid reads `8 hours a week`

The grid is unlabelled — cell 1 is 00:00, so 08:00 is the ninth.

**B**

- [ ] Reload → **Weekly availability** lists Monday and Thursday with the times

### 5. Work details — *Your hourly rate*

**A**

- [ ] **Work details** → **Your hourly rate** → `28` (leave the rest blank)
- [ ] **Save**

**B**

- [ ] Reload → the profile header and **Application** both show `$28/hour`

### 6. Gender

**A**

- [ ] **Edit profile** → **Gender** → `Female`
- [ ] **Save**

This is the fact the parent's *Caregiver* filter compares against, and the one
that decides Great fit from Good fit.

### 7. Credentials

**A** — `/application#credentials` (the rail's **Credentials** link opens it)

- [ ] **Add credential** → Document `Background check` → Expiry `June 30, 2027`
      → attach any PDF or image → **Upload**
- [ ] **Add credential** → Document `CPR` → Expiry `January 15, 2028` → a
      different file → **Upload**
- [ ] Expect: both rows read `Pending review`

Files must be JPEG, PNG, WebP or PDF, under 5 MB.

**B**

- [ ] Reload → **Credentials** lists both → **Reject** on `CPR`
- [ ] Reason `Expired` → **Message** `This card expired in January. Send the current one.`
- [ ] **Reject document**
- [ ] Expect: the row reads `Rejected` with the reason and message; **Review
      history** gains an entry with the file name and the date

**A**

- [ ] Reload `/application#credentials` → the CPR row reads `Rejected`, with the
      reason and the admin's message
- [ ] `/me` shows the sentence `CPR was not accepted: Expired…`
- [ ] Open the inbox for `themishaeldaap@…` — the rejection email is there
- [ ] **Replace** on the CPR row → attach a new file → **Upload**
- [ ] Expect: `Pending review`; the old decision stays in **Review history**

**B**

- [ ] Reload → **Approve** on `CPR`, then **Approve** on `Background check`
- [ ] Expect: both rows `Approved`; **Review history** has three entries

### 8. Experience and references

**A**

- [ ] `/application#experience` → **Add a role** → Employer
      `Contra Costa SELPA`, Role `Behaviour technician`, From `August 2022`,
      To `June 2024`, Ages and needs `Ages 6–10, autism, non-speaking, AAC`
- [ ] **Experience with needs** → tick `Autism spectrum` and `ADHD`
- [ ] **References** — the two cards on screen. Fill **Full name**,
      **Relationship**, **Phone** on both:
      `Dana Whitfield` / `Supervisor` / `510-555-0177` and
      `Luis Ortega` / `Family` / `510-555-0188`
- [ ] **Save progress**

Both references are required before signing, and a role is too.

**B**

- [ ] Reload → **Application** shows the role and the two areas
- [ ] **References** shows both with `Not checked` → press **Checked** on the first
- [ ] Expect: the badge becomes `Checked`; **Application record** ticks
      *Reference 1 checked*

### 9. Background check and signature

**A** — first the two sections the submit refuses without

- [ ] **Personal details** → legal name `Alex Rivera`, `4120 Clayton Rd`,
      `Concord`, `94521`, referral `Friend`
- [ ] **Your questions** → answer both:
      *Why do you want to work with people with special needs?* and
      *Describe a difficult moment with someone you cared for, and how you handled it.*
- [ ] **Save progress**
- [ ] **Background check and signature** → tick the agreement → type `Alex Rivera`
      → **Sign and submit**
- [ ] Expect: back on `/me`, rail reads `16 of 16 sections complete`

**B**

- [ ] Reload → `Application received` and `Signed` are ticked in **Application
      record**; reference 1 still checked
- [ ] **Video interview** `November 2, 2026`, **Outcome** `Pass` → **Save record**
- [ ] **The decision** → **Approve profile**
- [ ] Expect: status `Approved`; the profile is now public

**A → back to the parent window**

- [ ] `/matches` → **Alex Rivera** now appears as a **Great fit** at $28/hour,
      quoting the same hours and needs back
