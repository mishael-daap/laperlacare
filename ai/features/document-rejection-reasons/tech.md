# Technical Plan: Document rejection reasons and review history

## Components
- **Migration** — two columns on `caregiver_documents`, the `caregiver_document_reviews` table, its trigger, RLS, grants, and indexes.
- **`src/lib/caregiver/credentials.ts`** — the six reason slugs and their labels, plus the reason line in `statusSentence`.
- **`src/lib/email/document-rejection.ts`** — sends the rejection email through Resend.
- **`src/lib/admin/actions.ts`** — `reviewDocumentAction` validates the decision, writes it, and sends the email on rejection.
- **`src/components/admin/document-review.tsx`** — Approve stays one click; Reject opens a dialog.
- **`src/app/admin/(dashboard)/caregiver/[id]/page.tsx`** — reason and message on the row, plus the history section.
- **`src/components/caregiver/credentials-section.tsx`** — reason and message under a rejected row.
- **`src/lib/admin/queries.ts`** — reads the history for the detail page.
- **`scripts/seed-caregivers.mjs`** — repaired for derived status, and seeds one rejection with a reason.

## API
No new routes. One server action, extended:

- `reviewDocumentAction(previous, formData)` — fields `documentId`, `status`, `reason`, `message`.

Returns `{ error }` on failure, `{ ok: true }` on success, or `{ ok: true, warning }` when the decision saved but the email failed.

## Data Model

```
caregiver_documents
  + rejection_reason   text null check in (six slugs)
  + rejection_message  text null check (char_length <= 1000)

caregiver_document_reviews
  id           uuid pk default gen_random_uuid()
  document_id  uuid null references caregiver_documents (id) on delete set null
  caregiver_id uuid not null references caregivers (user_id) on delete cascade
  kind         text not null
  file_name    text null
  decision     text not null check in ('approved', 'rejected')
  reason       text null check in (six slugs)
  message      text null check (char_length <= 1000)
  reviewed_by  uuid null references auth.users (id) on delete set null
  reviewed_at  timestamptz not null default now()
```

Indexes: `caregiver_id`, `document_id`.

The reason list is duplicated in SQL and TypeScript, following the existing `DOCUMENT_KINDS` / `kind` check precedent. The SQL constraint allows null so legacy rejected rows remain valid; "a rejection must carry a reason" is enforced in the action.

## Flow
Admin confirms in the dialog → action validates with Zod → `update caregiver_documents` (trigger appends a history row) → on reject, read the caregiver's account email through `admin_caregiver_detail` → `Resend.emails.send` → revalidate `/admin/caregiver`, `/admin/caregiver/[id]`, `/me`.

## Notes
- **Trigger, not the action, writes the history.** `after update of review_status` on `caregiver_documents`, firing when the new value is `approved` or `rejected` and differs from the old. It is `SECURITY DEFINER` so the insert needs no grant, and it makes the record atomic with the decision and impossible to skip from SQL.
- **Snapshot `kind` and `file_name`.** The document row is deleted when the caregiver replaces it, so an FK alone would leave an unreadable record. `on delete set null` keeps the decision; the snapshot keeps it legible.
- **Append-only is enforced by omission.** No insert, update, or delete policy and no grant beyond `select`. A caregiver reads rows where `caregiver_id = auth.uid()`; an admin reads all.
- **`admin_caregiver_detail` already returns the account email** and is admin-gated, so the email needs no new RPC. No service key in the app.
- **Email is sent after the write.** The decision is committed first; a Resend error comes back as `warning`, never as a failed rejection.
- **The dialog reuses `DropdownMenu`** for the reason, matching the credential-kind picker; there is no `select` component in `src/components/ui/`.
- **History display filters the current decision.** A history row whose `document_id` matches a current document and whose `reviewed_at` equals that document's `reviewed_at` is the decision already shown on the row, so it is omitted from the history list.
- **No reviewer name in the UI.** `reviewed_by` is stored, but rendering the email needs another admin RPC over `auth.users`; deferred.
- **Seed script repair is in scope** because the current one writes columns that 7.2 dropped and cannot produce a rejected document to test with.
