"use client";

import { useProfileDraft } from "@/components/caregiver/profile-draft";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Getting to a family, and how far.
 *
 * The driver's licence is deliberately absent. It is a credential — a file an
 * admin approves — and "can drive" is read from that document wherever it is
 * needed. Asking again here would give two answers to one question, and the
 * typed one would be the one nobody checked.
 *
 * The two yes/no answers are three-state. A caregiver who has not answered is
 * not the same as one who said no, which is why the columns are nullable and
 * why the checkboxes are rendered as a pair rather than a single tick.
 */
export function TransportationSection() {
  const { work, setWork, profileEditing } = useProfileDraft();

  return (
    <section id="transportation" className="flex scroll-mt-24 flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-xl tracking-tight">Transportation</h2>
        <p className="text-muted-foreground">
          How you get to a family, and how far you will travel.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label className="font-normal">Do you have a car and insurance?</Label>

          <div className="flex gap-2">
            <YesNo
              name="car"
              value={work.carAndInsurance}
              disabled={!profileEditing}
              onChange={(value) => setWork({ carAndInsurance: value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="font-normal">
            Willing to drive the person you care for?
          </Label>

          <div className="flex gap-2">
            <YesNo
              name="drive"
              value={work.willingToDrive}
              disabled={!profileEditing}
              onChange={(value) => setWork({ willingToDrive: value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="travel">Maximum travel distance</Label>
          <div className="flex max-w-xs items-center gap-2">
            <Input
              id="travel"
              inputMode="numeric"
              placeholder="20"
              value={work.maxTravelMiles}
              disabled={!profileEditing}
              onChange={(event) =>
                setWork({ maxTravelMiles: event.target.value.replace(/[^\d]/g, "") })
              }
            />
            <span className="text-muted-foreground">miles from home</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * "Not answered" is a state the caregiver can return to, so the pair behaves
 * like a checkbox that can be unticked rather than a radio that cannot.
 */
export function YesNo({
  name,
  value,
  disabled,
  onChange,
}: {
  name: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <>
      {[
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ].map((option) => {
        const checked = value === option.value;
        const id = `${name}-${option.value}`;

        return (
          <div key={option.value} className="flex items-center gap-2">
            <Checkbox
              id={id}
              checked={checked}
              disabled={disabled}
              onCheckedChange={(next) => onChange(next === true ? option.value : "")}
            />
            <Label htmlFor={id} className="font-normal">
              {option.label}
            </Label>
          </div>
        );
      })}
    </>
  );
}
