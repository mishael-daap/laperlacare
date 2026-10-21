"use client";

import { TrashIcon } from "lucide-react";
import { useState, useTransition } from "react";

import { ChildDialog } from "@/components/household/child-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteChildAction } from "@/lib/household/actions";
import { formatAge } from "@/lib/household/age";
import type { HouseholdChild, HouseholdList } from "@/lib/household/get-household-profile";

type ChildCardProps = {
  child: HouseholdChild;
  needs: HouseholdList;
  supports: HouseholdList;
};

/**
 * One child, as the parent will see them on their own page.
 *
 * The age is derived on every render. The notes carry the things the fixed lists
 * cannot, so they are shown in full rather than clipped.
 */
export function ChildCard({ child, needs, supports }: ChildCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const selectedNeeds = needs.filter((need) => child.needSlugs.includes(need.slug));
  const selectedSupports = supports.filter((support) =>
    child.supportSlugs.includes(support.slug),
  );

  function remove() {
    setError(null);

    startTransition(async () => {
      const result = await deleteChildAction(child.id);

      if (result.error) {
        setError(result.error);
        return;
      }

      setConfirmOpen(false);
    });
  }

  return (
    <Card className="gap-4 px-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="font-heading text-lg font-medium tracking-tight break-words">
            {child.fullName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {formatAge(child.dateOfBirth)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <ChildDialog
            mode="edit"
            child={child}
            needs={needs}
            supports={supports}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${child.fullName}`}
            onClick={() => {
              setError(null);
              setConfirmOpen(true);
            }}
          >
            <TrashIcon />
          </Button>
        </div>
      </div>

      {selectedNeeds.length > 0 || selectedSupports.length > 0 ? (
        <div className="flex flex-col gap-3">
          {selectedNeeds.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                What a caregiver should know
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedNeeds.map((need) => (
                  <Badge key={need.slug} variant="secondary">
                    {need.label}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          {selectedSupports.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Support they need
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedSupports.map((support) => (
                  <Badge key={support.slug} variant="outline">
                    {support.label}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No needs or supports added yet.
        </p>
      )}

      {child.notes ? (
        <div className="flex flex-col gap-1 border-t border-border pt-3">
          <p className="text-xs font-medium text-muted-foreground">
            Anything else a caregiver should know
          </p>
          <p className="text-sm whitespace-pre-wrap break-words">{child.notes}</p>
        </div>
      ) : null}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {child.fullName}?</DialogTitle>
            <DialogDescription>
              This removes their profile and everything you ticked for them. It
              cannot be undone.
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
              onClick={() => setConfirmOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={remove}
              disabled={pending}
            >
              {pending ? "Removing…" : "Remove child"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
