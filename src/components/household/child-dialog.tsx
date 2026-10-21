"use client";

import { PencilIcon, PlusIcon } from "lucide-react";
import { useState, useTransition, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveChildAction } from "@/lib/household/actions";
import type { HouseholdChild, HouseholdList } from "@/lib/household/get-household-profile";

type ChildDialogProps = {
  mode: "add" | "edit";
  child?: HouseholdChild;
  needs: HouseholdList;
  supports: HouseholdList;
};

/** The browser's date input wants YYYY-MM-DD, in the viewer's own calendar. */
function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Add or edit one child.
 *
 * The form saves on its own; there is no page-wide save bar. Ticking a need and
 * pressing save is one decision, and the dialog closes when it has landed.
 *
 * The state is reset from the child every time the dialog opens, so editing a
 * child after a previous edit shows what is actually stored rather than the
 * last thing typed.
 */
export function ChildDialog({ mode, child, needs, supports }: ChildDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(child?.needSlugs ?? []);
  const [selectedSupports, setSelectedSupports] = useState<string[]>(child?.supportSlugs ?? []);
  const [notes, setNotes] = useState(child?.notes ?? "");

  function openDialog() {
    setSelectedNeeds(child?.needSlugs ?? []);
    setSelectedSupports(child?.supportSlugs ?? []);
    setNotes(child?.notes ?? "");
    setError(null);
    setOpen(true);
  }

  function toggle(
    values: string[],
    setValues: (next: string[]) => void,
    slug: string,
  ) {
    setValues(
      values.includes(slug)
        ? values.filter((value) => value !== slug)
        : [...values, slug],
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    setError(null);

    startTransition(async () => {
      const result = await saveChildAction({
        childId: child?.id,
        fullName: String(form.get("fullName") ?? ""),
        dateOfBirth: String(form.get("dateOfBirth") ?? ""),
        notes,
        needSlugs: selectedNeeds,
        supportSlugs: selectedSupports,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {mode === "add" ? (
        <Button type="button" variant="contrast" onClick={openDialog}>
          <PlusIcon />
          Add child
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${child?.fullName ?? "child"}`}
          onClick={openDialog}
        >
          <PencilIcon />
        </Button>
      )}

      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <form
          key={`${child?.id ?? "new"}-${open ? "open" : "closed"}`}
          onSubmit={submit}
          className="flex flex-col gap-5"
        >
          <DialogHeader>
            <DialogTitle>{mode === "add" ? "Add a child" : "Edit child"}</DialogTitle>
            <DialogDescription>
              Tell us who the caregiver will be caring for. Everything here can be
              changed later.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="child-name">Full name</Label>
              <Input
                id="child-name"
                name="fullName"
                required
                maxLength={120}
                defaultValue={child?.fullName ?? ""}
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="child-dob">Date of birth</Label>
              <Input
                id="child-dob"
                name="dateOfBirth"
                type="date"
                required
                max={today()}
                defaultValue={child?.dateOfBirth ?? ""}
              />
            </div>
          </div>

          <FieldSet>
            <FieldLegend variant="label">
              What should a caregiver know about your child?
            </FieldLegend>
            <p className="-mt-2 text-sm text-muted-foreground">
              Tick anything that applies. This helps us find the right caregiver; it
              is not a diagnosis.
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              {needs.map((need) => (
                <div
                  key={need.slug}
                  className="flex items-start gap-3 rounded-lg border border-border px-3 py-2.5"
                >
                  <Checkbox
                    id={`need-${need.slug}`}
                    className="mt-0.5"
                    checked={selectedNeeds.includes(need.slug)}
                    onCheckedChange={() =>
                      toggle(selectedNeeds, setSelectedNeeds, need.slug)
                    }
                  />
                  <Label
                    htmlFor={`need-${need.slug}`}
                    className="font-normal leading-snug"
                  >
                    {need.label}
                  </Label>
                </div>
              ))}
            </div>
          </FieldSet>

          <FieldSet>
            <FieldLegend variant="label">What support do they need?</FieldLegend>
            <p className="-mt-2 text-sm text-muted-foreground">
              Tick what the caregiver will actually be doing.
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              {supports.map((support) => (
                <div
                  key={support.slug}
                  className="flex items-start gap-3 rounded-lg border border-border px-3 py-2.5"
                >
                  <Checkbox
                    id={`support-${support.slug}`}
                    className="mt-0.5"
                    checked={selectedSupports.includes(support.slug)}
                    onCheckedChange={() =>
                      toggle(selectedSupports, setSelectedSupports, support.slug)
                    }
                  />
                  <Label
                    htmlFor={`support-${support.slug}`}
                    className="font-normal leading-snug"
                  >
                    {support.label}
                  </Label>
                </div>
              ))}
            </div>
          </FieldSet>

          <div className="flex flex-col gap-2">
            <Label htmlFor="child-notes">Anything else a caregiver should know?</Label>
            <Textarea
              id="child-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Routines, triggers, what helps, what does not."
            />
            <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
              <span>Optional. Please do not include medical records or ID numbers.</span>
              <span>{notes.length}/1000</span>
            </div>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contrast" disabled={pending}>
              {pending ? "Saving…" : mode === "add" ? "Add child" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
