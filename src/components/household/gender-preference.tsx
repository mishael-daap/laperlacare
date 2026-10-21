"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { saveGenderPreferenceAction } from "@/lib/household/actions";
import type { CaregiverGender } from "@/lib/household/validation";

const OPTIONS: { value: CaregiverGender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "no_preference", label: "No preference" },
];

function toGender(value: string): CaregiverGender {
  return value === "female" || value === "male" ? value : "no_preference";
}

/**
 * One preference for the household, not one per child.
 *
 * It saves on selection. A preference is not a draft that needs a second
 * confirmation; choosing it is the decision.
 */
export function GenderPreference({ value }: { value: string }) {
  const [selected, setSelected] = useState<CaregiverGender>(toGender(value));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const current = OPTIONS.find((option) => option.value === selected) ?? OPTIONS[2];

  function choose(next: CaregiverGender) {
    if (next === selected) return;

    const previous = selected;
    setSelected(next);
    setError(null);

    startTransition(async () => {
      const result = await saveGenderPreferenceAction(next);

      if (result.error) {
        setSelected(previous);
        setError(result.error);
      }
    });
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-xl font-medium tracking-tight">
          Preferred caregiver
        </h2>
        <p className="text-muted-foreground">
          This applies to your whole household.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="w-56 justify-between"
                disabled={pending}
              />
            }
          >
            {current.label}
            <ChevronDownIcon />
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            {OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => choose(option.value)}
              >
                {option.label}
                {selected === option.value ? <CheckIcon className="ml-auto" /> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
