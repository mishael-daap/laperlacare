"use client";

import { MinusIcon } from "lucide-react";

import { useApplicationDraft } from "@/components/caregiver/application-draft";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Exactly two people who have seen this caregiver look after somebody.
 *
 * Both cards are always on screen rather than behind an Add button. "Two" is a
 * rule, not a preference, and a form that reveals the second card only after the
 * first is filled in makes the rule look like a suggestion.
 *
 * These are third parties who never signed up for this. Their details are
 * readable by the caregiver who entered them and by an admin, and nobody else —
 * which is why the section says so.
 */
export function ReferencesEditor() {
  const draft = useApplicationDraft();
  const rows = draft.references;

  return (
    <section id="references" className="flex scroll-mt-24 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-xl tracking-tight">References</h2>
        <p className="text-muted-foreground">
          Two people who have seen you care for someone with special needs — a
          supervisor, a teacher, or a family you worked for. Relatives are not
          accepted.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {[0, 1].map((index) => {
          const row = rows[index];

          return (
            <div
              key={index}
              className="flex flex-col gap-4 rounded-xl border border-border px-5 py-5"
            >
              <p className="text-sm font-semibold">Reference {index + 1}</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`ref-name-${index}`}>Full name</Label>
                  <Input
                    id={`ref-name-${index}`}
                    value={row?.fullName ?? ""}
                    disabled={draft.locked}
                    onChange={(event) =>
                      draft.updateReference(index, { fullName: event.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor={`ref-relationship-${index}`}>
                    How do they know you?
                  </Label>
                  <Input
                    id={`ref-relationship-${index}`}
                    placeholder="Supervisor, teacher, family"
                    value={row?.relationship ?? ""}
                    disabled={draft.locked}
                    onChange={(event) =>
                      draft.updateReference(index, { relationship: event.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor={`ref-org-${index}`}>Organisation or family</Label>
                  <Input
                    id={`ref-org-${index}`}
                    value={row?.organisation ?? ""}
                    disabled={draft.locked}
                    onChange={(event) =>
                      draft.updateReference(index, { organisation: event.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor={`ref-known-${index}`}>How long have they known you?</Label>
                  <Input
                    id={`ref-known-${index}`}
                    placeholder="Four years"
                    value={row?.knownFor ?? ""}
                    disabled={draft.locked}
                    onChange={(event) =>
                      draft.updateReference(index, { knownFor: event.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor={`ref-phone-${index}`}>Phone</Label>
                  <Input
                    id={`ref-phone-${index}`}
                    type="tel"
                    value={row?.phone ?? ""}
                    disabled={draft.locked}
                    onChange={(event) =>
                      draft.updateReference(index, { phone: event.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor={`ref-email-${index}`}>Email</Label>
                  <Input
                    id={`ref-email-${index}`}
                    type="email"
                    value={row?.email ?? ""}
                    disabled={draft.locked}
                    onChange={(event) =>
                      draft.updateReference(index, { email: event.target.value })
                    }
                  />
                </div>
              </div>

              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MinusIcon className="size-3.5" />
                Phone or email, so we can actually reach them.
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
