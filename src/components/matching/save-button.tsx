"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { removeCaregiverAction, saveCaregiverAction } from "@/lib/matching/actions";

/**
 * Save, or unsave, one caregiver.
 *
 * Optimistic on purpose: the save is a bookmark, not a commitment, and a spinner
 * on a bookmark reads as if the page is thinking about whether to allow it. The
 * server action revalidates the route, and a failure puts the label back.
 */
export function SaveButton({
  caregiverId,
  saved: initial,
  withLabel = false,
}: {
  caregiverId: string;
  saved: boolean;
  withLabel?: boolean;
}) {
  const [saved, setSaved] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !saved;
    setSaved(next);

    startTransition(async () => {
      const result = next
        ? await saveCaregiverAction(caregiverId)
        : await removeCaregiverAction(caregiverId);

      if (result.error) setSaved(!next);
    });
  }

  const Icon = saved ? BookmarkCheck : Bookmark;

  if (withLabel) {
    return (
      <Button
        type="button"
        variant="outline"
        className="h-[3.25rem] gap-2 rounded-full px-6"
        disabled={pending}
        onClick={toggle}
      >
        <Icon aria-hidden="true" className="size-4" />
        {saved ? "Saved" : "Save"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-pressed={saved}
      aria-label={saved ? "Remove from your shortlist" : "Save to your shortlist"}
      disabled={pending}
      onClick={toggle}
    >
      <Icon aria-hidden="true" className={saved ? "text-brand-forest" : undefined} />
    </Button>
  );
}
