"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reviewDocumentAction, type ReviewState } from "@/lib/admin/actions";
import {
  kindInSentence,
  REJECTION_REASONS,
  rejectionReasonLabel,
  requiresRejectionMessage,
  type RejectionReason,
} from "@/lib/caregiver/credentials";

/**
 * Approve or reject one document.
 *
 * Approving is one click and carries no note, so it stays a plain submit.
 * Rejecting has to say why, so it opens a dialog: a reason from the fixed list,
 * and a message that is required only for "Other".
 *
 * Both forms share one action state. The dialog closes when the action reports
 * success — which also means an approve, harmlessly, since nothing is open.
 *
 * The button for the current status is disabled — not because the decision is
 * final, but because pressing it again would write the same row and append a
 * second history entry for a decision that did not change.
 *
 * There is no third button for "pending". Undoing an approval means rejecting
 * it; a replacement uploaded by the caregiver returns to pending on its own.
 */
export function DocumentReview({
  documentId,
  status,
  kind,
}: {
  documentId: string;
  status: string;
  kind: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<RejectionReason>("invalid_or_unreadable");
  const [message, setMessage] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  // The dialog closes from inside the action rather than an effect watching the
  // result: a successful decision is an event, and an effect that calls
  // setState on every state change is the pattern React warns about.
  async function decide(previous: ReviewState, formData: FormData) {
    const result = await reviewDocumentAction(previous, formData);

    if (result?.ok) {
      setOpen(false);
      setMessage("");
      setReason("invalid_or_unreadable");
      setClientError(null);
    }

    return result;
  }

  const [state, formAction, pending] = useActionState<ReviewState, FormData>(
    decide,
    undefined,
  );

  function close() {
    setOpen(false);
    setClientError(null);
    setMessage("");
    setReason("invalid_or_unreadable");
  }

  function guard(event: React.FormEvent<HTMLFormElement>) {
    // The server refuses this too. Checking here means the admin is told before
    // a round trip, and the form does not appear to do nothing.
    if (requiresRejectionMessage(reason) && !message.trim()) {
      event.preventDefault();
      setClientError("Say what is wrong with the document.");
      return;
    }

    setClientError(null);
  }

  const error = clientError ?? state?.error ?? null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <form action={formAction}>
          <input type="hidden" name="documentId" value={documentId} />
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
        </form>

        <Button
          type="button"
          variant={status === "rejected" ? "destructive" : "outline"}
          size="sm"
          disabled={pending || status === "rejected"}
          onClick={() => setOpen(true)}
        >
          Reject
        </Button>
      </div>

      {state?.warning ? (
        <p role="status" className="mt-1 text-xs text-muted-foreground">
          {state.warning}
        </p>
      ) : null}

      {!open && state?.error ? (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {state.error}
        </p>
      ) : null}

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) close();
          else setOpen(true);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject this {kindInSentence(kind)}?</DialogTitle>
            <DialogDescription>
              The caregiver sees the reason here and is emailed it. They can replace
              the file, and the replacement goes back into the queue.
            </DialogDescription>
          </DialogHeader>

          <form action={formAction} onSubmit={guard} className="flex flex-col gap-4">
            <input type="hidden" name="documentId" value={documentId} />
            <input type="hidden" name="status" value="rejected" />
            <input type="hidden" name="reason" value={reason} />

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Reason</span>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between"
                    />
                  }
                >
                  {rejectionReasonLabel(reason)}
                  <ChevronDownIcon />
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  {REJECTION_REASONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setReason(option.value)}
                    >
                      {option.label}
                      {reason === option.value ? <CheckIcon className="ml-auto" /> : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor={`rejection-message-${documentId}`}>
                Message {reason === "other" ? "" : "(optional)"}
              </Label>
              <Textarea
                id={`rejection-message-${documentId}`}
                name="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
                maxLength={1000}
                placeholder={
                  reason === "other"
                    ? "What is wrong with it?"
                    : "Anything that helps them fix it."
                }
              />
            </div>

            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={close} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={pending}>
                {pending ? "Rejecting…" : "Reject document"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
