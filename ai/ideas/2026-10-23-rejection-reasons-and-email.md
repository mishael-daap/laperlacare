# Rejection reasons, and the email that goes with them

**Captured** 2026-10-23, the same session the per-document review shipped.

**Status** completed — built as [roadmap 7.3, Document rejection reasons and review
history](../roadmap.md#73-document-rejection-reasons-and-review-history). The
reasons, the optional message, the email, and the append-only history all shipped;
the open questions below were settled in `ai/features/document-rejection-reasons/`.

## The idea

When an admin rejects a document, the rejection currently says nothing. The
caregiver sees *Rejected* and has to guess what was wrong with the file. Instead:

1. Pressing **Reject** opens a small modal.
2. The admin picks a reason from a fixed list — invalid document, not a
   California document, expired, unreadable scan, name does not match the
   account, other.
3. The modal also has an optional custom message box.
4. On confirm, the caregiver is **emailed**:
   - no custom message → a generic template chosen by the reason
   - custom message → the same email with the admin's own words in it

## Why

A rejection a caregiver cannot act on is a dead end. They re-upload the same
file, it is rejected again, and an admin reads it twice. Naming the problem is
the difference between a queue that drains and one that cycles.

It also gives the review a written trail: the reason is stored beside the
decision, so a second admin can see why the first one refused it.

## Open questions

- **Is the reason shown in the app as well as emailed?** The obvious answer is
  yes — email is not a place to keep a fact the product already knows. Assumed
  yes for now: the credential row carries the reason and the custom message.
- **Approve a document with a note?** Not asked for. Approving is silent.
- **Can a reason be edited after the fact?** No. Re-reviewing replaces it.
- **Who is the sender?** Reuse the verified contact address; a dedicated
  notifications address would need its own domain entry in Resend.
- **What if the email fails?** The decision must still stand — it is the record,
  the email is a courtesy. The admin is told the send failed.
- **Does a rejection email go out on every reject, including a second one for the
  same document?** Yes; each decision is its own event.
- **Is the reason editable from the admin list?** No, only from the detail page,
  where the file is visible.

## Not in scope

Reminders before credentials expire, a caregiver notification preferences screen,
and any email on approval.
