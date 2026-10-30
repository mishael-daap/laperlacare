"use client";

import { useApplicationDraft } from "@/components/caregiver/application-draft";
import { Button } from "@/components/ui/button";

/**
 * The application's save bar.
 *
 * A second copy of the profile's bar rather than a shared one, because the two
 * providers hold different drafts and a component that could read either would
 * have to take one as a prop and be typed for both. Twelve lines duplicated is
 * cheaper than the indirection.
 *
 * It reads "Save progress" rather than "Save" for a reason: this page is filled
 * in across several sittings, and nothing here is sent for review until the
 * signature at the bottom.
 */
export function ApplicationSaveBar() {
  const { dirty, saving, error, save, cancel } = useApplicationDraft();

  return (
    <div
      inert={!dirty}
      className={[
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm",
        "px-6 py-4 sm:px-10 lg:px-16",
        "transition-transform duration-300 ease-out",
        dirty ? "translate-y-0" : "pointer-events-none translate-y-full",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save progress"}
        </Button>

        <Button type="button" variant="ghost" onClick={cancel} disabled={saving}>
          Discard changes
        </Button>

        {error ? (
          <p role="alert" aria-live="polite" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
