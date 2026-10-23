# Technical Plan: Caregiver capabilities and credentials

## Components
- **`src/app/me/page.tsx`** — two new sections, `Credentials` replacing `Your background check`, and the derived-status line under the header.
- **`src/components/caregiver/profile-header.tsx`** — date of birth, gender, and working age range join name and bio behind *Edit profile*.
- **`src/components/caregiver/capability-checklist.tsx`** — one checkbox group, used twice: needs (“I can support children who…”) and supports.
- **`src/components/caregiver/credentials-section.tsx`** — the list, per-row status and expiry, add, replace, remove.
- **`src/components/caregiver/credential-dialog.tsx`** — kind, expiry, file. Saves on confirm; outside the save bar.
- **`src/components/caregiver/profile-draft.tsx`** — draft gains date of birth, gender, working age range, and both slug sets. Documents leave the draft.
- **`src/components/admin/document-review.tsx`** — approve/reject per document row.
- **`src/app/admin/(dashboard)/caregiver/[id]/page.tsx`** — capabilities section, per-document review rows, caregiver-level buttons removed.
- **`src/lib/caregiver/capabilities.ts`** — validation shared by the action and the dialogs.
- **`src/lib/caregiver/credentials.ts`** — kind labels, expiry warning text, and the sentence the status line uses.
- **`src/lib/age.ts`** — `ageFromDateOfBirth` and `formatAge` moved out of `src/lib/household/age.ts`, since children and caregivers now share them.
- **`src/lib/caregiver/completeness.ts`** — 5 items become 10.
- **`src/lib/caregiver/actions.ts`** — `saveCapabilitiesAction`, `addDocumentAction`, `removeDocumentAction`; `saveDocumentAction` and its draft plumbing go.
- **`src/lib/admin/actions.ts`** — `reviewDocumentAction` replaces `setVerificationStatusAction`.
- **`src/lib/caregiver/get-caregiver-profile.ts`** and **`src/lib/admin/queries.ts`** — load the two tag sets, the kind list, and the computed status.
- **UI** — `Checkbox`, `FieldSet`, `FieldLegend`, `Dialog`, `DropdownMenu`, `Input`, `Badge`, `Button`. No new shadcn component.

## API
All writes are server actions; there are no route handlers.

- `saveCapabilitiesAction({ needSlugs, supportSlugs, dateOfBirth, gender, ageMin, ageMax })` — calls `public.save_caregiver_capabilities(...)`.
- `addDocumentAction({ kind, expiresAt, storagePath, fileName })` — deletes any live row of that kind, inserts the new one, stamps `submitted_at` if it is null.
- `removeDocumentAction(documentId)` — deletes one row.
- `reviewDocumentAction(documentId, decision)` — admin only; writes `review_status`, `reviewed_by`, `reviewed_at`.

Each returns `{ error?: string; ok?: boolean }`, reads the caller with `getClaims()`, and revalidates `/me` and the admin detail path.

## Data Model

### Columns

```
caregivers
  date_of_birth date null
  gender        text null check in ('female','male','nonbinary','prefer_not_to_say')
  age_min       smallint null check between 0 and 21
  age_max       smallint null check between 0 and 21
  check (age_min is null) = (age_max is null)
  check (age_min is null or age_max >= age_min)

caregiver_documents
  expires_at  date null
```

`age_min` and `age_max` are the **children** a caregiver works with. `date_of_birth` is the caregiver's own, and their age is derived from it — never stored, the same rule `children.date_of_birth` follows.

### Dropped

```
caregivers.verification_status
caregivers.reviewed_by
caregivers.reviewed_at
trigger caregivers_guard_verification        -- nothing left to guard
trigger caregiver_documents_reset_verification
function private.guard_caregiver_verification()
function private.reset_verification_on_new_document()
```

Review state now lives only on the document, and the caregiver's badge is a query.

### Kinds

```
caregiver_documents
  kind  text not null check (kind in (
          'background_check', 'cpr', 'drivers_licence', 'certification', 'other'
        ))
```

The existing check constraint is dropped and replaced with the five-value one. `certification` and `other` stay, so existing rows keep their meaning and no data migration is needed. The union and the display labels live in `src/lib/caregiver/credentials.ts`.

A reference table was considered and rejected: the set is closed, product-defined, and a kind carries no attributes, so it would be five label rows joined back for nothing. Promote it to a table only if admins ever edit the list, if a kind grows policy of its own, or if a document can hold several kinds.

### Tag tables

```
caregiver_needs
  caregiver_id uuid not null references caregivers (user_id) on delete cascade
  need_id      uuid not null references needs (id) on delete cascade
  primary key (caregiver_id, need_id)
  index on need_id

caregiver_supports
  caregiver_id uuid not null references caregivers (user_id) on delete cascade
  support_id   uuid not null references supports (id) on delete cascade
  primary key (caregiver_id, support_id)
  index on support_id
```

Both mirror `child_needs` and `child_supports`: no update policy, a save replaces the set.

### The status rule

```
private.caregiver_status(p_user_id uuid) returns text
language sql stable security definer
```

- `'rejected'` — any live document has `review_status = 'rejected'`.
- `'approved'` — at least one live document, and every one is `approved` with `expires_at is null or expires_at >= current_date`.
- `'pending'` — otherwise, including no documents.

Expiry is part of the comparison, so it needs no timer and no stored copy. `security definer` because the rule must read documents the caller may not be allowed to see, and it returns one word rather than any document.

Wrapped for the app:

```
public.my_caregiver_status() returns text   -- private.caregiver_status(auth.uid())
```

### Functions rewritten

- `admin_caregiver_directory` — selects `private.caregiver_status(c.user_id)` as `verification_status`, and filters and orders by that expression. Existing bucket definitions are unchanged: *Onboarding* is `submitted_at is null`, the rest are the derived value or `all`.
- `admin_caregiver_counts` — same expression, same five counts.
- `admin_caregiver_detail` — returns the derived status plus `date_of_birth`, `gender`, `age_min`, `age_max`; loses `reviewed_by` and `reviewed_at`, whose columns are gone.
- The `approved caregivers are public` policy on `caregivers` — `private.caregiver_status(caregivers.user_id) = 'approved'`, since the column it used no longer exists.

### RLS and grants

- `document_kinds`: not created — see Kinds above.
- `caregiver_needs`, `caregiver_supports`: select, insert, delete for `authenticated` where `caregiver_id = auth.uid()`. No admin policy; the admin reads capabilities through the detail function.
- `caregivers`: `an admin may decide on a caregiver` is dropped — there is no status for an admin to write. The caregiver's own update policy stays.
- `caregiver_documents`: `an admin may review documents` already exists and is what `reviewDocumentAction` uses. A caregiver still has no update policy, so review state can only be the default on the way in.

## RPC

```
public.save_caregiver_capabilities(
  p_needs        text[]   default '{}',   -- slugs
  p_supports     text[]   default '{}',   -- slugs
  p_date_of_birth date    default null,
  p_gender       text     default null,
  p_age_min      smallint default null,
  p_age_max      smallint default null
) returns void
language plpgsql
security invoker
set search_path = ''
```

- Resolves the caregiver from `auth.uid()`; raises if there is no `caregivers` row. The caller never supplies an id.
- Rejects a date of birth in the future, an unknown gender value, a half-filled range, an inverted range, and a bound outside 0–21.
- Verifies every slug exists before writing, so an unknown slug is an error rather than a silent no-op.
- Deletes both tag sets and reinserts the selected rows, then updates the five columns. One transaction.

## Flow
Caregiver opens `/me` → ticks needs and supports, sets date of birth, gender, and range → save bar → `saveCapabilitiesAction` → `save_caregiver_capabilities` → revalidate → add credential → browser uploads to `caregiver-documents` → `addDocumentAction` writes the row → admin opens the profile → `reviewDocumentAction` per document → `private.caregiver_status` answers differently on the next read, with no write to any status column.

## Notes
- **The badge is a query, not a column.** A stored status could disagree with the documents forever; a computed one cannot disagree at all. It also deletes the guard trigger, the reset trigger, and the timer that expiry would otherwise need.
- **Dropping `verification_status` is the largest edit in the feature**, because the admin directory, its counts, the detail function, and one RLS policy all read it. They are listed above; there is no other reader.
- **One live document per kind is enforced in the action, not the schema.** A unique index would have to cope with existing rows that already repeat a kind, and the derived rule reads the newest approved row anyway.
- **`submitted_at` keeps its meaning.** Uploading any document is submitting; nothing else is.
- **Capabilities are not readable by other caregivers**, unlike approved profile fields. They describe what someone can handle, and the catalog is suspended anyway.
- **No matching in this feature.** Whether a child's needs must all be covered or any one is enough belongs to the search feature, where it becomes a query. The data shape supports both.
- **Age bounds are years, inclusive.** Bands, and months for the under-twos, are deferred.
- **A caregiver's date of birth is shown as an age**, not as a date, except to an admin. It is the fact a family cares about and the date itself is a stronger identifier than the age.
- **No new dependency.** No `pg_cron`, no new library.
- **Deferred:** multiple documents of one kind, age bands, per-document rejection reasons, document thumbnails, re-review reminders, and any email when a decision lands.
