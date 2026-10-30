"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useApplicationDraft } from "@/components/caregiver/application-draft";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BACKGROUND_CHECK_AGREEMENT,
  BACKGROUND_CHECK_TEXT,
  STATEMENT_TEXT,
  STATEMENT_VERSION,
} from "@/lib/caregiver/application-statement";
import { submitApplicationAction } from "@/lib/caregiver/application-actions";

/**
 * The last section, and the only one that cannot be undone by leaving the page.
 *
 * Typing a name is the submit. There is no "submit, then sign": a form that can
 * be sent unsigned is a form nobody swore to, and an application whose answers
 * were never attested to is the thing this whole feature exists to avoid.
 *
 * No image and no canvas. A typed name, the server's clock and the statement
 * version are the record, and the version is what makes the record survive a
 * rewording.
 *
 * The name prefills from the legal name and stays editable — a signature is
 * allowed to differ from the printed name, and forcing the two to match would
 * only produce a signature that is a copy of a field.
 */
export function ApplicationSignature({
  legalName,
  signedAt,
  signedVersion,
  submittedAt,
}: {
  legalName: string;
  signedAt: string | null;
  signedVersion: string | null;
  submittedAt: string | null;
}) {
  const draft = useApplicationDraft();
  const router = useRouter();
  const [name, setName] = useState(signedAt ? legalName : "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submitted = Boolean(submittedAt);

  if (submitted && signedAt) {
    return (
      <section id="signature" className="flex scroll-mt-24 flex-col gap-4">
        <h2 className="font-heading text-xl tracking-tight">Signed</h2>
        <p className="text-muted-foreground">
          Signed by <span className="font-semibold">{name || legalName}</span> on{" "}
          {new Date(signedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "America/Los_Angeles",
          })}
          . Statement version {signedVersion ?? STATEMENT_VERSION}.
        </p>
        <p className="text-sm text-muted-foreground">
          Your answers are locked. If something needs changing, ask us to return
          the application.
        </p>
      </section>
    );
  }

  return (
    <section id="signature" className="flex scroll-mt-24 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-xl tracking-tight">
          Background check and signature
        </h2>
        <p className="text-muted-foreground">{BACKGROUND_CHECK_TEXT}</p>
      </div>

      <div className="flex flex-col gap-6 rounded-xl border border-border px-5 py-5">
        <label className="flex items-start gap-3 text-sm">
          <Checkbox
            checked={draft.backgroundCheckAgreed}
            onCheckedChange={(checked) => draft.setBackgroundCheckAgreed(checked === true)}
            className="mt-0.5"
          />
          <span>{BACKGROUND_CHECK_AGREEMENT}</span>
        </label>

        <div className="flex flex-col gap-2">
          <p className="text-sm">{STATEMENT_TEXT}</p>

          <Label htmlFor="signature" className="mt-2">
            Type your full name to sign
          </Label>

          <Input
            id="signature"
            autoComplete="name"
            placeholder={legalName}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
          />

          <p className="text-sm text-muted-foreground">
            Printed name: {legalName || "not set"} · Date: today
          </p>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button
          type="button"
          disabled={pending || name.trim() === "" || !draft.backgroundCheckAgreed}
          onClick={() => {
            startTransition(async () => {
              const result = await submitApplicationAction({ signatureName: name });

              if (result?.error) {
                setError(result.error);
                return;
              }

              router.push("/me");
              router.refresh();
            });
          }}
        >
          {pending ? "Submitting…" : "Sign and submit"}
        </Button>

        <p className="text-sm text-muted-foreground">
          Submitting locks your answers. You can still replace a credential at any
          time.
        </p>
      </div>
    </section>
  );
}
