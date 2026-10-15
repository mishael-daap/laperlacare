"use client";

import { FileTextIcon } from "lucide-react";
import { useRef } from "react";

import { useProfileDraft } from "@/components/caregiver/profile-draft";
import { Button } from "@/components/ui/button";

/**
 * The background check, and only the background check for now.
 *
 * The chosen file is held until Save rather than uploaded on pick, so this
 * behaves like every other field on the page — pick one, change your mind, and
 * nothing has happened.
 *
 * Each uploaded document shows the name the caregiver chose. It used to say
 * "Background check" for every row, which told them nothing they did not
 * already know and made two documents indistinguishable.
 *
 * There is no review badge here. A caregiver cannot approve anything, so every
 * row would say "Waiting" until an admin acted — a status that never changes is
 * noise, and the count in the avatar pill already covers where the profile
 * stands. Review state stays in the data for the admin screen.
 *
 * There is also no preview link: the bucket is private, so a URL would have to
 * be signed on the server and expire. That belongs to the review screen.
 */
export function DocumentsSection() {
  const { documents, documentName, setDocumentFile } = useProfileDraft();
  const input = useRef<HTMLInputElement>(null);

  const backgrounds = documents.filter((document) => document.kind === "background_check");

  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted-foreground">
        Your background check is the document the review looks at. An admin
        checks it before your profile appears in the network, and it is never
        shown to families.
      </p>

      {backgrounds.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {backgrounds.map((document) => (
            <li
              key={document.id}
              className="flex items-center gap-3 rounded-lg border border-border px-4 py-3"
            >
              <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm">
                {document.fileName ?? "Background check"}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Not behind the edit toggle. Uploading a background check is the one
          thing on this page a caregiver has a reason to do at any moment, and
          hiding it behind a mode meant it could not be found at all. */}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) setDocumentFile(file);
        }}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="contrast"
          size="sm"
          onClick={() => input.current?.click()}
        >
          {backgrounds.length > 0 ? "Replace" : "Upload"}
        </Button>

        {documentName ? (
          <p className="text-sm text-muted-foreground">
            {documentName} — saved when you press Save.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Image or PDF, up to 5 MB.</p>
        )}
      </div>
    </div>
  );
}
