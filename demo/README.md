# Perla Care — demo

Two walkthroughs. Follow them in order; both are written as actions only.

| # | Walkthrough | File |
|---|---|---|
| 1 | Family account | [01-family-account.md](./01-family-account.md) |
| 2 | Caregiver + admin, interleaved | [02-caregiver-and-admin.md](./02-caregiver-and-admin.md) |

## Before you start

```bash
pnpm dev            # http://localhost:3000
```

Prod: <https://www.laperlacare.com>

**Two windows.** Window A is the family or caregiver, window B is the admin — use
a private window for B so both sessions can be open at once.

**New accounts every run.** One admin account is the only exception, because
admins cannot sign up. Seed the matching fixtures and the admin with:

```bash
pnpm seed:demo
```

| Account | Email | Password |
|---|---|---|
| Admin (seeded, window B) | `seed-admin@example.com` | `SeedPass-2026!` |
| Family (sign up in the demo) | `family1@<your-inbox-domain>` | `DemoPass-2026!` |
| Caregiver (sign up in the demo) | `caregiver1@<your-inbox-domain>` | `DemoPass-2026!` |

`pnpm seed:demo` clears every `@example.com` account and leaves six caregivers,
built so the household in walkthrough 1 produces one Great fit, one Good fit and
one Partial fit. `pnpm seed:caregivers` is the other seed: twenty caregivers in
every review state, for the admin screens. They clear each other, so run the one
the demo needs.

Both new accounts must be inboxes you can open: the family account may need an
email confirmation, and the caregiver is sent a document rejection later in
walkthrough 2. On the next run, use `family2@` and `caregiver2@`.
