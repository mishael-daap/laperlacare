"use client";

import { PlusIcon, TrashIcon } from "lucide-react";

import { useApplicationDraft } from "@/components/caregiver/application-draft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Where a caregiver has worked, newest first.
 *
 * Total years is computed from the rows rather than asked for, which is the one
 * place the paper form asks a question the app can answer itself — and the one
 * place a person would guess. It is read-only and it updates as rows are typed.
 *
 * Months, not days. The database stores a date; the first of the month is what a
 * month input means.
 */
export function ExperienceEditor() {
  const draft = useApplicationDraft();

  return (
    <section id="experience" className="flex scroll-mt-24 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-xl tracking-tight">Experience</h2>
        <p className="text-muted-foreground">
          Start with the most recent. Paid or volunteer — both count.
        </p>
      </div>

      {draft.experience.length === 0 ? (
        <p className="text-muted-foreground">
          Nothing added yet. A role with a family counts the same as one with an
          organisation.
        </p>
      ) : null}

      <div className="flex flex-col gap-6">
        {draft.experience.map((row, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 rounded-xl border border-border px-5 py-5"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Role {index + 1}</p>

              {draft.locked ? null : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => draft.removeExperience(index)}
                >
                  <TrashIcon />
                  Remove
                </Button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`employer-${index}`}>Employer or family</Label>
                <Input
                  id={`employer-${index}`}
                  value={row.employer}
                  disabled={draft.locked}
                  onChange={(event) =>
                    draft.updateExperience(index, { employer: event.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor={`role-${index}`}>Role</Label>
                <Input
                  id={`role-${index}`}
                  value={row.role}
                  disabled={draft.locked}
                  onChange={(event) =>
                    draft.updateExperience(index, { role: event.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor={`from-${index}`}>From</Label>
                <Input
                  id={`from-${index}`}
                  type="month"
                  value={row.startedOn}
                  disabled={draft.locked}
                  onChange={(event) =>
                    draft.updateExperience(index, { startedOn: event.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor={`to-${index}`}>To</Label>
                <Input
                  id={`to-${index}`}
                  type="month"
                  value={row.endedOn}
                  disabled={draft.locked || row.endedOn === ""}
                 onChange={(event) =>
                    draft.updateExperience(index, { endedOn: event.target.value })
                  }
                />
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    className="size-3.5 accent-primary"
                    checked={row.endedOn === "present"}
                    disabled={draft.locked}
                    onChange={(event) =>
                      draft.updateExperience(index, {
                        endedOn: event.target.checked ? "present" : "",
                      })
                    }
                  />
                  Still here
                </label>
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor={`ages-${index}`}>Ages and needs supported</Label>
                <Input
                  id={`ages-${index}`}
                  placeholder="Ages 6–10, autism, non-speaking, AAC"
                  value={row.agesAndNeeds}
                  disabled={draft.locked}
                  onChange={(event) =>
                    draft.updateExperience(index, { agesAndNeeds: event.target.value })
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {draft.locked ? null : (
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={draft.addExperience}
        >
          <PlusIcon />
          Add a role
        </Button>
      )}

      {/* Nothing to total until there is a dated role, and "0 years of
          experience" read as a judgement rather than as an empty state. */}
      {totalYears(draft.experience) ? (
        <p className="text-sm text-muted-foreground tabular-nums">
          That is about {totalYears(draft.experience)} of experience, counted from
          your earliest start to the most recent end.
        </p>
      ) : null}
    </section>
  );
}

/**
 * The span from the earliest start to the latest end, in whole years.
 *
 * A span rather than a sum: two roles held at the same time are two years of
 * experience, not four, and counting them twice would inflate every caregiver
 * who worked two jobs.
 *
 * A row still running counts to today. A row with an end before its start is
 * ignored rather than allowed to subtract.
 */
function totalYears(rows: { startedOn: string; endedOn: string }[]): string | null {
  const months = (value: string) => {
    const [year, month] = value.split("-").map(Number);
    return Number.isFinite(year) && Number.isFinite(month) ? year * 12 + month : null;
  };

  const now = new Date();
  const today = now.getUTCFullYear() * 12 + (now.getUTCMonth() + 1);

  let earliest: number | null = null;
  let latest: number | null = null;

  for (const row of rows) {
    const start = months(row.startedOn);
    if (start === null) continue;

    const end = row.endedOn === "present" || row.endedOn === "" ? today : months(row.endedOn);
    if (end === null || end < start) continue;

    earliest = earliest === null ? start : Math.min(earliest, start);
    latest = latest === null ? end : Math.max(latest, end);
  }

  if (earliest === null || latest === null) return null;

  const years = Math.max(0, Math.round(((latest - earliest) / 12) * 10) / 10);

  if (years === 0) {
    const monthsHeld = Math.max(1, latest - earliest);
    return `${monthsHeld} month${monthsHeld === 1 ? "" : "s"}`;
  }

  return `${years} year${years === 1 ? "" : "s"}`;
}
