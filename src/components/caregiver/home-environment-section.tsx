"use client";

import { useProfileDraft } from "@/components/caregiver/profile-draft";
import { YesNo } from "@/components/caregiver/transportation-section";
import { Label } from "@/components/ui/label";
import { PETS } from "@/lib/caregiver/answers";

/**
 * The two things a family wants to know before somebody walks into their house.
 *
 * Small on purpose, and separate from Transportation: a caregiver who does not
 * drive may still be a non-smoker who is fine with a dog, and folding the two
 * together made one of them look like a condition of the other.
 */
export function HomeEnvironmentSection() {
  const { work, setWork, profileEditing } = useProfileDraft();

  return (
    <section id="home-environment" className="flex scroll-mt-24 flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-xl tracking-tight">Home environment</h2>
        <p className="text-muted-foreground">
          Most families ask both of these on the first call.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Label className="font-normal">Comfortable with pets</Label>

          <div className="flex flex-wrap gap-2">
            {PETS.map((option) => {
              const checked = work.pets === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={!profileEditing}
                  aria-pressed={checked}
                  onClick={() => setWork({ pets: checked ? "" : option.value })}
                  className={[
                    "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                    checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-sage-600 hover:text-foreground",
                    profileEditing ? "" : "cursor-default opacity-90",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Label className="font-normal">Non-smoker</Label>

          <div className="flex gap-2">
            <YesNo
              name="smoker"
              value={work.nonSmoker}
              disabled={!profileEditing}
              onChange={(value) => setWork({ nonSmoker: value })}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
