"use client";

import { Badge } from "@/components/ui/badge";
import { useProfileDraft } from "@/components/caregiver/profile-draft";
import { DAYS, HOURS, cellKey } from "@/lib/caregiver/availability";

/**
 * The weekly board. Deliberately outside the onboarding modal: it is the one
 * part of the profile worth revisiting often, and burying a grid of 168 cells
 * inside a dialog would make it feel like paperwork.
 *
 * It holds no state of its own. Lighting hours writes into the page's draft, and
 * the save drawer commits the week along with everything else — so changing your
 * bio and your hours means one save, not two.
 */
export function AvailabilityBoard() {
  const { cells, toggleCell } = useProfileDraft();

  return (
    <div className="flex flex-col gap-5">
      {/* The count used to be a line of text under the grid, and the wording
          about local time and a repeating week sat under that. One badge says
          the useful half of both, at the top where it is read first. */}
      <Badge className="self-start">
        {cells.size === 0
          ? "No hours set yet"
          : `${cells.size} hour${cells.size === 1 ? "" : "s"} a week`}
      </Badge>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="flex">
            <span className="w-12 shrink-0" />
            <div className="flex flex-1">
              {HOURS.map((hour) => (
                <span
                  key={hour}
                  className="flex-1 text-center text-[10px] text-muted-foreground"
                >
                  {hour % 3 === 0 ? String(hour).padStart(2, "0") : ""}
                </span>
              ))}
            </div>
          </div>

          {DAYS.map((day) => (
            <div key={day.value} className="flex items-center">
              <span className="w-12 shrink-0 text-xs text-muted-foreground">
                {day.label}
              </span>
              <div className="flex flex-1 border-t border-border py-0.5">
                {HOURS.map((hour) => {
                  const lit = cells.has(cellKey(day.value, hour));

                  return (
                    <button
                      key={hour}
                      type="button"
                      aria-pressed={lit}
                      aria-label={`${day.long} ${String(hour).padStart(2, "0")}:00`}
                      onClick={() => toggleCell(day.value, hour)}
                      className={
                        lit
                          ? "h-6 flex-1 border-r border-background bg-success last:border-r-0"
                          : "h-6 flex-1 border-r border-background bg-muted last:border-r-0 hover:bg-accent"
                      }
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
