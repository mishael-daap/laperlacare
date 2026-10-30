"use client";

import { useApplicationDraft } from "@/components/caregiver/application-draft";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CONDITIONS } from "@/lib/caregiver/answers";

/**
 * The three written sections that are a single field or a single list.
 *
 * They share a file because they share a shape: a heading, a short line of
 * explanation, and inputs bound to the draft. The two that need rows of their
 * own — experience and references — have their own files, because they are a
 * different kind of thing.
 */

/** §1 of the paper form, minus the email and phone it repeats from `/me`. */
export function PersonalDetailsSection() {
  const draft = useApplicationDraft();
  const disabled = draft.locked;

  return (
    <section id="personal-details" className="flex scroll-mt-24 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-xl tracking-tight">Personal details</h2>
        <p className="text-muted-foreground">
          Your legal name has to match the documents you upload, or a background
          check cannot be run against it.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="legal-name">Full legal name</Label>
          <Input
            id="legal-name"
            value={draft.legalName}
            disabled={disabled}
            onChange={(event) => draft.setLegalName(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="street">Home address</Label>
          <Input
            id="street"
            placeholder="Street"
            value={draft.addressStreet}
            disabled={disabled}
            onChange={(event) => draft.setAddressStreet(event.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Only an admin sees this. It is never shown to a family.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={draft.addressCity}
            disabled={disabled}
            onChange={(event) => draft.setAddressCity(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="zip">ZIP code</Label>
          <Input
            id="zip"
            inputMode="numeric"
            value={draft.addressPostalCode}
            disabled={disabled}
            onChange={(event) => draft.setAddressPostalCode(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="referral">How did you hear about Perla Care?</Label>
          <Input
            id="referral"
            value={draft.referralSource}
            disabled={disabled}
            onChange={(event) => draft.setReferralSource(event.target.value)}
          />
        </div>
      </div>
    </section>
  );
}

/**
 * What a caregiver has worked with.
 *
 * Deliberately not merged with the needs and supports on `/me`, even though
 * seven entries read alike across the three lists. Those answer "what will you
 * do on a shift"; this answers "what have you handled before", and a caregiver
 * who has worked with a feeding tube is not thereby offering to manage one.
 */
export function ConditionsSection() {
  const draft = useApplicationDraft();

  return (
    <section id="conditions" className="flex scroll-mt-24 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-xl tracking-tight">
          Experience with needs
        </h2>
        <p className="text-muted-foreground">
          Tick everywhere you have hands-on experience. This is about your past
          work, not about what you are offering now — that is on your profile.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CONDITIONS.map((condition) => {
          const checked = draft.conditions.has(condition.value);

          return (
            <label
              key={condition.value}
              className={[
                "flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-sm transition-colors",
                checked ? "border-primary bg-muted/60" : "border-border hover:border-sage-600",
                draft.locked ? "cursor-default opacity-80" : "",
              ].join(" ")}
            >
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-primary"
                checked={checked}
                disabled={draft.locked}
                onChange={() => draft.toggleCondition(condition.value)}
              />
              <span>{condition.label}</span>
            </label>
          );
        })}
      </div>

      {draft.conditions.has("other") ? (
        <div className="flex max-w-sm flex-col gap-2">
          <Label htmlFor="other-condition">What else?</Label>
          <Input
            id="other-condition"
            value={draft.otherCondition}
            disabled={draft.locked}
            onChange={(event) => draft.setOtherCondition(event.target.value)}
          />
        </div>
      ) : null}
    </section>
  );
}

/** §6's two questions, which are read by a person rather than filtered on. */
export function QuestionsSection() {
  const draft = useApplicationDraft();

  return (
    <section id="questions" className="flex scroll-mt-24 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-xl tracking-tight">Your questions</h2>
        <p className="text-muted-foreground">
          Both are read by a person. A paragraph each is plenty.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="why">
          Why do you want to work with people with special needs?
        </Label>
        <Textarea
          id="why"
          rows={5}
          maxLength={2000}
          value={draft.whySpecialNeeds}
          disabled={draft.locked}
          onChange={(event) => draft.setWhySpecialNeeds(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="moment">
          Describe a difficult moment with someone you cared for, and how you
          handled it.
        </Label>
        <Textarea
          id="moment"
          rows={5}
          maxLength={2000}
          value={draft.difficultMoment}
          disabled={draft.locked}
          onChange={(event) => draft.setDifficultMoment(event.target.value)}
        />
      </div>
    </section>
  );
}
