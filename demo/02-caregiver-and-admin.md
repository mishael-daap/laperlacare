# 2. Caregiver + admin

One script, two windows. Every part says which window acts.

- **Window A** — the caregiver. Signed out at the start.
- **Window B** — the admin. Signed in at `/admin/sign-in` as
  `seed-admin@example.com`, password `SeedPass-2026!`.

---

## Part 1 — Caregiver creates the account

**Window A**

- [ ] Open `/caregivers/sign-up`
- [ ] Email `caregiver1@<your-inbox-domain>`, password `DemoPass-2026!`
- [ ] Tick the Terms box
- [ ] Click **Create account**
- [ ] Lands on `/me`; the rail at the top reads `n of 16 sections complete`

---

## Part 2 — Admin finds the account

**Window B**

- [ ] Open `/admin/caregiver`
- [ ] Status filter **Onboarding**
- [ ] Search `caregiver1@<your-inbox-domain>`
- [ ] One row, status `Onboarding` → click it
- [ ] **Credentials** is empty; **The decision** reads *"Not decided yet."*

---

## Part 3 — Caregiver fills the profile

**Window A**

- [ ] `/me` → **Edit profile**
- [ ] **Full name** `Alex Rivera`
- [ ] **Date of birth** `May 4, 1998`
- [ ] **Gender** → `Female`
- [ ] **Ages you work with** → `4` to `17`
- [ ] Click **Save** in the bottom bar
- [ ] **Children you can support** → tick `Limited speech or non-speaking` and
      `Big feelings or frequent meltdowns` → **Save**
- [ ] **What you can provide** → tick `Behavioural support and de-escalation` and
      `Communication support (AAC or sign)` → **Save**
- [ ] **Work details** → **Your hourly rate** `28` → **Save**
- [ ] **Your weekly availability** → click the Monday hour cells `08`, `09`, `10`,
      `11` and the Thursday cells `13`, `14`, `15`, `16` → **Save**
- [ ] **Contact details** → **Label** `Mobile`, **Phone** `510-555-0142`,
      **Email** `caregiver1@<your-inbox-domain>`, **Preferred contact method**
      `Text message` → **Save**

**Save** only appears in the bottom bar once something has changed.

---

## Part 4 — Caregiver uploads two documents

**Window A**

- [ ] `/me` → **Credentials** → **Add credential**
- [ ] **Document** → `Background check`
- [ ] **Expiry date (optional)** → `June 30, 2027`
- [ ] Attach any PDF or image → **Upload**
- [ ] The row reads `Pending review`
- [ ] **Add credential** → **Document** `CPR` → expiry `January 15, 2028` → a
      different file → **Upload**

---

## Part 5 — Admin rejects one document

**Window B**

- [ ] Reload the caregiver → **Credentials** lists both
- [ ] On `CPR`, click **Reject**
- [ ] `Expired`
- [ ] **Message (optional)** → `This card expired in January. Send the current one.`
- [ ] Confirm
- [ ] The row reads `Rejected` with the reason and the message
- [ ] **Review history** has one entry, with the file name and the date

---

## Part 6 — Caregiver replaces it

**Window A**

- [ ] Reload `/me`
- [ ] The CPR row reads `Rejected`, with the reason and the admin's message
- [ ] Open the inbox for `caregiver1@<your-inbox-domain>` — the rejection email is
      there, with a link to `/me`
- [ ] On the CPR row click **Replace** → attach a new file → **Upload**
- [ ] The row reads `Pending review`; the old decision stays in **Review history**

---

## Part 7 — Admin approves the documents

**Window B**

- [ ] Reload the caregiver → **Approve** on `CPR`
- [ ] **Approve** on `Background check`
- [ ] Both rows read `Approved`; **Review history** has three entries

---

## Part 8 — Caregiver signs and submits

**Window A**

- [ ] `/application` → **Full legal name** `Alex Rivera`, **Home address**
      `4120 Clayton Rd`, **City** `Concord`, **ZIP code** `94521`,
      **How did you hear about Perla Care?** `Friend`
- [ ] **Experience** → **Add a role** → fill the role, the place and the dates
- [ ] **Experience with needs** → tick `Autism spectrum` and `ADHD`
- [ ] **References** → two cards are already on screen. Fill **Full name**,
      **Phone** and **Relationship** on each
- [ ] **Your questions** → answer both:
      *Why do you want to work with people with special needs?* and
      *Describe a difficult moment with someone you cared for, and how you handled
      it.*
- [ ] **Save progress**
- [ ] **Background check and signature** → tick the agreement → type `Alex Rivera`
      → **Sign and submit**
- [ ] The application goes read-only, **Credentials** stays editable
- [ ] `/me` rail reads `16 of 16 sections complete`

---

## Part 9 — Admin approves the profile

**Window B**

- [ ] Reload the caregiver → status is `Pending`
- [ ] **Application record** → **Video interview** `November 2, 2026`, **Outcome**
      `Pass` → **Save record**
- [ ] On reference 1, click **Checked**
- [ ] **The decision** → **Approve profile**
- [ ] Status reads `Approved`

---

## Part 10 — Caregiver sees the result

**Window A**

- [ ] Reload `/me` — the header shows the approved state
- [ ] `/application` is still locked
- [ ] Open `/household` → turned away

---

## Optional

- [ ] **Window B** → another caregiver → **Reject** a document with `Other` and no
      message → refused
- [ ] **Window B** → **Decline** another caregiver with an empty reason →
      *"Say why."*
