"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { setVerificationStatusAction, type ReviewState } from "@/lib/admin/actions";

/**
 * Approve or reject.
 *
 * Both buttons submit the same form and carry the decision in their `value`, so
 * there is one action and one pending state. The button for the current status
 * is disabled — not because the decision is final, but because pressing it again
 * would write the same row and look like it did something.
 */
export function ReviewActions({
  caregiverId,
  status,
}: {
  caregiverId: string;
  status: string;
}) {
  const [state, formAction, pending] = useActionState<ReviewState, FormData>(
    setVerificationStatusAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <input type="hidden" name="caregiverId" value={caregiverId} />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="submit"
          name="status"
          value="approved"
          disabled={pending || status === "approved"}
        >
          {pending ? "Saving…" : "Approve"}
        </Button>

        <Button
          type="submit"
          name="status"
          value="rejected"
          variant="destructive"
          disabled={pending || status === "rejected"}
        >
          Reject
        </Button>
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
