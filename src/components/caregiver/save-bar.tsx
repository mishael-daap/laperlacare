"use client";

import { Button } from "@/components/ui/button";
import { useProfileDraft } from "@/components/caregiver/profile-draft";

/**
 * The save bar.
 *
 * A plain sliding bar rather than a Drawer. The drawer brought a backdrop, a
 * portal, swipe gesture handling, and a full sheet of chrome to hold two small
 * buttons — and every part of that had to be turned off or worked around. This
 * is one element that moves.
 *
 * Not modal and not a dialog: the page underneath stays clickable, and the bar
 * is fixed to the viewport so it does not care where you have scrolled to.
 *
 * `inert` while hidden matters. Translated off screen, it is still in the DOM,
 * so without it a keyboard user could tab into buttons they cannot see.
 * `pointer-events-none` does the same for the mouse.
 */
export function SaveBar() {
  const { dirty, saving, error, save, cancel } = useProfileDraft();

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
          {saving ? "Saving…" : "Save"}
        </Button>

        <Button type="button" variant="ghost" onClick={cancel} disabled={saving}>
          Cancel
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
