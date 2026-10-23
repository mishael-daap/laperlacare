"use client";

import { CheckIcon, ChevronDownIcon, PlusIcon, UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { useProfileDraft } from "@/components/caregiver/profile-draft";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDocumentAction } from "@/lib/caregiver/actions";
import { DOCUMENT_KINDS, kindLabel, type DocumentKind } from "@/lib/caregiver/credentials";
import { uploadCaregiverDocument } from "@/lib/caregiver/storage";

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Add one credential, or replace the file behind one.
 *
 * Uploading and saving are the same action here, unlike the rest of the page.
 * A document is not a field with a value to confirm — the file either reached
 * storage or it did not — and holding it in the save bar would only postpone
 * the review that the caregiver is waiting on.
 *
 * The kind is fixed when replacing: a replacement says "here is a newer CPR
 * card", not "this is now a driver's licence".
 */
export function CredentialDialog({
  mode,
  kind: fixedKind,
}: {
  mode: "add" | "replace";
  kind?: DocumentKind;
}) {
  const { userId } = useProfileDraft();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<DocumentKind>(fixedKind ?? "background_check");
  const [file, setFile] = useState<File | null>(null);
  const [expiresAt, setExpiresAt] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  function reset() {
    setError(null);
    setFile(null);
    setFileName(null);
    setExpiresAt("");
    setKind(fixedKind ?? "background_check");
    if (fileInput.current) fileInput.current.value = "";
  }

  function pick(event: React.ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0] ?? null;

    if (chosen && chosen.size > MAX_BYTES) {
      setFile(null);
      setFileName(null);
      setError("That file is larger than 5 MB.");
      return;
    }

    setError(null);
    setFile(chosen);
    setFileName(chosen?.name ?? null);
  }

  function submit() {
    if (!file) {
      setError("Choose a file first.");
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const path = await uploadCaregiverDocument(userId, file, kind);
        const result = await addDocumentAction({
          kind,
          expiresAt,
          storagePath: path,
          fileName: file.name,
        });

        if (result?.error) {
          setError(result.error);
          return;
        }

        reset();
        setOpen(false);
        router.refresh();
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      {mode === "add" ? (
        <Button type="button" variant="contrast" onClick={() => setOpen(true)}>
          <PlusIcon />
          Add credential
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`Replace ${kindLabel(kind)}`}
          onClick={() => setOpen(true)}
        >
          Replace
        </Button>
      )}

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add a credential" : "Replace document"}</DialogTitle>
          <DialogDescription>
            An admin reviews each document on its own. Adding one here is what puts
            it in the queue.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {mode === "add" ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Document</span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button type="button" variant="outline" className="w-full justify-between" />
                  }
                >
                  {kindLabel(kind)}
                  <ChevronDownIcon />
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  {DOCUMENT_KINDS.map((option) => (
                    <DropdownMenuItem key={option.value} onClick={() => setKind(option.value)}>
                      {option.label}
                      {kind === option.value ? <CheckIcon className="ml-auto" /> : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{kindLabel(kind)}</span>
              <p className="text-sm text-muted-foreground">
                The new file goes back into the review queue. The old one is removed.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="credential-expiry">Expiry date (optional)</Label>
            <Input
              id="credential-expiry"
              type="date"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              A CPR card has one. Leave it blank if the document does not expire.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">File</span>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="sr-only"
              onChange={pick}
            />
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => fileInput.current?.click()}>
                <UploadIcon />
                Choose file
              </Button>
              <span className="min-w-0 truncate text-sm text-muted-foreground">
                {fileName ?? "Image or PDF, up to 5 MB."}
              </span>
            </div>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" variant="contrast" onClick={submit} disabled={pending}>
            {pending ? "Uploading…" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
