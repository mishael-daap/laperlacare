"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { reviewDocumentAction, type ReviewState } from "@/lib/admin/actions";

/**
 * Approve or reject one document.
 *
 * Both buttons submit the same form and carry the decision in their `value`, so
 * there is one action and one pending state. The button for the current status
 * is disabled — not because the decision is final, but because pressing it again
 * would write the same row and look like it did something.
 *
 * There is no third button for "pending". Undoing an approval means rejecting
 * it; a replacement uploaded by the caregiver returns to pending on its own.
 */
export function DocumentReview({
  documentId,
  status,
}: {
  documentId: string;
  status: string;
}) {
  const [state, formAction, pending] = useActionState<ReviewState, FormData>(
    reviewDocumentAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="documentId" value={documentId} />

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          name="status"
          value="approved"
          variant={status === "approved" ? "contrast" : "outline"}
          size="sm"
          disabled={pending || status === "approved"}
        >
          Approve
        </Button>

        <Button
          type="submit"
          name="status"
          value="rejected"
          variant={status === "rejected" ? "destructive" : "outline"}
          size="sm"
          disabled={pending || status === "rejected"}
        >
          Reject
        </Button>
      </div>

      {state?.error ? (
        <p role="alert" className="text-xs text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
