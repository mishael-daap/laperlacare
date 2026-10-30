"use client";

import { useProfileDraft } from "@/components/caregiver/profile-draft";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LANGUAGES } from "@/lib/caregiver/answers";

/**
 * The languages a caregiver can work in.
 *
 * Its own section rather than a line in the work details: it is the one filter a
 * family searches on that has nothing to do with money, hours or geography, and
 * burying it under a heading about rates is how it gets skipped.
 */
export function LanguagesSection() {
  const { work, setWork, toggleInWork, profileEditing } = useProfileDraft();

  return (
    <section id="languages" className="flex scroll-mt-24 flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-xl tracking-tight">Languages</h2>
        <p className="text-muted-foreground">
          Families who need a language you speak will search for it.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((language) => {
          const checked = work.languages.includes(language.value);

          return (
            <button
              key={language.value}
              type="button"
              disabled={!profileEditing}
              aria-pressed={checked}
              onClick={() => toggleInWork("languages", language.value)}
              className={[
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                checked
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-sage-600 hover:text-foreground",
                profileEditing ? "" : "cursor-default opacity-90",
              ].join(" ")}
            >
              {language.label}
            </button>
          );
        })}
      </div>

      {work.languages.includes("other") ? (
        <div className="flex max-w-sm flex-col gap-2">
          <Label htmlFor="other-language">Which language?</Label>
          <Input
            id="other-language"
            value={work.otherLanguage}
            disabled={!profileEditing}
            onChange={(event) => setWork({ otherLanguage: event.target.value })}
          />
        </div>
      ) : null}
    </section>
  );
}
