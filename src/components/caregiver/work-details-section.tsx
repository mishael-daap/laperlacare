"use client";

import { useProfileDraft } from "@/components/caregiver/profile-draft";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COUNTIES } from "@/lib/caregiver/answers";

/**
 * What a caregiver charges, where they will go, and when they could start.
 *
 * The age range lives here rather than in the profile header because it is a
 * fact about the work, not about the person — the same reason the rate does.
 * It is saved with the capabilities (age_min and age_max travel with the needs
 * and supports through one function) but it is answered here, which is the only
 * place a caregiver would look for it.
 *
 * A number input is left as a string in the draft. Parsing on every keystroke
 * turns "1" into a real answer while the caret is still in the box, and the
 * question then reads as answered when it is not.
 */
export function WorkDetailsSection() {
  const { work, setWork, toggleInWork, workingAges, setWorkingAges, profileEditing } =
    useProfileDraft();

  return (
    <section id="work-details" className="flex scroll-mt-24 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-xl tracking-tight">Work details</h2>
        <p className="text-muted-foreground">
          Families filter on these, so a blank answer is a family who never sees
          you.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="rate">Your hourly rate</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">$</span>
            <Input
              id="rate"
              inputMode="numeric"
              placeholder="30"
              value={work.hourlyRate}
              disabled={!profileEditing}
              onChange={(event) =>
                setWork({ hourlyRate: event.target.value.replace(/[^\d]/g, "") })
              }
            />
            <span className="text-muted-foreground">/ hour</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Most Bay Area respite caregivers charge $25–40. Families pay you
            directly.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="earliest-start">Earliest start date</Label>
          <Input
            id="earliest-start"
            type="date"
            value={work.earliestStartDate}
            disabled={!profileEditing}
            onChange={(event) => setWork({ earliestStartDate: event.target.value })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="age-min">Ages you work with</Label>
          <div className="flex items-center gap-2">
            <Input
              id="age-min"
              inputMode="numeric"
              placeholder="0"
              value={workingAges.min}
              disabled={!profileEditing}
              onChange={(event) =>
                setWorkingAges({
                  ...workingAges,
                  min: event.target.value.replace(/[^\d]/g, ""),
                })
              }
            />
            <span className="text-muted-foreground">to</span>
            <Input
              inputMode="numeric"
              placeholder="21"
              value={workingAges.max}
              disabled={!profileEditing}
              onChange={(event) =>
                setWorkingAges({
                  ...workingAges,
                  max: event.target.value.replace(/[^\d]/g, ""),
                })
              }
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Set both, or leave both blank.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="regional-center">Regional Center</Label>
          <Input
            id="regional-center"
            placeholder="Which one?"
            value={work.regionalCenterName}
            disabled={!profileEditing || work.regionalCenterWorker !== "yes"}
            onChange={(event) => setWork({ regionalCenterName: event.target.value })}
          />

          <div className="mt-1 flex items-center gap-2">
            <Checkbox
              id="regional-center-worker"
              checked={work.regionalCenterWorker === "yes"}
              disabled={!profileEditing}
              onCheckedChange={(checked) =>
                setWork({ regionalCenterWorker: checked === true ? "yes" : "no" })
              }
            />
            <Label htmlFor="regional-center-worker" className="font-normal">
              I already work as a Regional Center respite worker
            </Label>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Label>Counties you can work in</Label>

        <div className="flex flex-wrap gap-2">
          {COUNTIES.map((county) => {
            const checked = work.counties.includes(county.value);

            return (
              <button
                key={county.value}
                type="button"
                disabled={!profileEditing}
                aria-pressed={checked}
                onClick={() => toggleInWork("counties", county.value)}
                className={[
                  "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  checked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-sage-600 hover:text-foreground",
                  profileEditing ? "" : "cursor-default opacity-90",
                ].join(" ")}
              >
                {county.label}
              </button>
            );
          })}
        </div>

        {work.counties.includes("other") ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="other-county">Which county?</Label>
            <Input
              id="other-county"
              value={work.otherCounty}
              disabled={!profileEditing}
              onChange={(event) => setWork({ otherCounty: event.target.value })}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
