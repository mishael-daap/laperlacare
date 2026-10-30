# Credential file name overflows the dialog

**Found** 2026-10-23, testing feature 7.2 on a caregiver account. Not a design
question — a layout bug.

**Status** completed — fixed as part of [roadmap 7.2, Caregiver capabilities and
credentials](../roadmap.md#72-caregiver-capabilities-and-credentials).

## What happens

Adding a credential with a long file name pushes the name out of the dialog. The
text runs past the right edge instead of wrapping or being cut.

## Why

The chosen name is rendered in a `<span className="min-w-0 truncate">` inside a
flex row with the *Choose file* button. Two problems in that:

- `truncate` is `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`.
  `text-overflow` only applies to a block container, and a `<span>` is inline, so
  it never clips — it just overflows.
- `min-w-0` only lets the item shrink; without `flex-1` and a block display there
  is nothing to shrink into.

The same name is also shown in the credential list and on the admin detail page,
where it is truncated properly, so the fix is only in the dialog.

## What is wanted

- In the dialog the name **wraps**, because there is no column to truncate into.
- Everywhere a document name is shown, it is **capped** and ends with an ellipsis
  rather than being allowed to run on. A 120-character scan name is noise.

## Notes

- The name is stored as given (`caregiver_documents.file_name`); only the display
  is shortened.
- `shortFileName` belongs next to the other credential vocabulary in
  `src/lib/caregiver/credentials.ts`.
