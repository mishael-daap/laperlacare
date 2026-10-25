"use client";

import { FileTextIcon, TrashIcon } from "lucide-react";
import { useState, useTransition } from "react";

import { CredentialDialog } from "@/components/caregiver/credential-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { removeDocumentAction } from "@/lib/caregiver/actions";
import {
  credentialLabel,
  credentialState,
  daysUntil,
  EXPIRING_SOON_DAYS,
  formatExpiry,
  kindLabel,
  rejectionReasonLabel,
  shortFileName,
  type DocumentKind,
} from "@/lib/caregiver/credentials";
import type { CaregiverDocument } from "@/lib/caregiver/get-caregiver-profile";

/**
 * The documents a caregiver holds, each with its own decision.
 *
 * This replaces the single background-check slot. An admin approves one document
 * at a time now, so the list is the honest shape: a CPR card waiting for review
 * says so while an approved licence beside it does not change.
 *
 * The files themselves are never shown here. The bucket is private, so a preview
 * would mean a signed URL that expires while the page is open; the admin screen
 * is the only place a document is read.
 */
export function CredentialsSection({ documents }: { documents: CaregiverDocument[] }) {
  const [pending, startTransition] = useTransition();
  const [removing, setRemoving] = useState<CaregiverDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  function remove() {
    if (!removing) return;

    setError(null);

    startTransition(async () => {
      const result = await removeDocumentAction(removing.id);

      if (result?.error) {
        setError(result.error);
        return;
      }

      setRemoving(null);
    });
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-xl font-medium tracking-tight">Credentials</h2>
          <p className="text-muted-foreground">
            Upload each licence and certificate you hold. An admin reviews every
            document on its own, and families only ever see that it was checked —
            never the file.
          </p>
        </div>

        <CredentialDialog mode="add" />
      </div>

      {documents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing uploaded yet. Add your background check first — it is the
            document the review starts with.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col">
          {documents.map((document) => {
            const state = credentialState(document);
            const days = document.expires_at ? daysUntil(document.expires_at) : null;

            return (
              <li
                key={document.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <FileTextIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {kindLabel(document.kind)}
                    </p>
                    <p
                      title={document.file_name ?? undefined}
                      className="truncate text-sm text-muted-foreground"
                    >
                      {shortFileName(document.file_name ?? "Document")}
                    </p>
                    {document.expires_at ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {state === "expired"
                          ? `Expired ${formatExpiry(document.expires_at)}`
                          : `Expires ${formatExpiry(document.expires_at)}`}
                        {days !== null && days >= 0 && days <= EXPIRING_SOON_DAYS
                          ? ` · ${days === 0 ? "today" : `${days} day${days === 1 ? "" : "s"} left`}`
                          : ""}
                      </p>
                    ) : null}

                    {state === "rejected" && document.rejection_reason ? (
                      <div className="mt-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                        <p className="text-sm font-medium">
                          {rejectionReasonLabel(document.rejection_reason)}
                        </p>
                        {document.rejection_message ? (
                          <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                            {document.rejection_message}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Badge
                    variant={
                      state === "approved"
                        ? "success"
                        : state === "rejected"
                          ? "destructive"
                          : "warning"
                    }
                  >
                    {credentialLabel(state)}
                  </Badge>

                  <CredentialDialog
                    mode="replace"
                    kind={document.kind as DocumentKind}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${kindLabel(document.kind)}`}
                    onClick={() => {
                      setError(null);
                      setRemoving(document);
                    }}
                  >
                    <TrashIcon />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={removing !== null}
        onOpenChange={(next) => {
          if (!next) setRemoving(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove this document?</DialogTitle>
            <DialogDescription>
              {removing ? kindLabel(removing.kind) : "This document"} is deleted and
              the decision on it goes with it. If it was approved, your profile stops
              showing as verified until a replacement is reviewed.
            </DialogDescription>
          </DialogHeader>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRemoving(null)}
              disabled={pending}
            >
              Keep it
            </Button>
            <Button type="button" variant="destructive" onClick={remove} disabled={pending}>
              {pending ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
