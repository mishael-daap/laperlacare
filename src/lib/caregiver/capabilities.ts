import { z } from "zod";

/**
 * The rules every caregiver capability write shares, and the vocabulary the
 * profile renders.
 *
 * Nothing here is required. A caregiver can save a profile with no needs, no
 * supports, no date of birth, no gender, and no working age range — completeness
 * counts what is missing, and refusing the save would only add a wall in front of
 * somebody filling it in over several sittings.
 *
 * The two lists themselves are not defined here: they live in the database, and
 * the page reads them. Only the gender values are a closed set the app owns,
 * because they mirror the household's preference and are compared to it.
 */

export const GENDERS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "nonbinary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

export const caregiverGender = z.enum(["female", "male", "nonbinary", "prefer_not_to_say"]);

export type CaregiverGender = z.infer<typeof caregiverGender>;

export function genderLabel(value: string | null) {
  return GENDERS.find((gender) => gender.value === value)?.label ?? null;
}

/** The youngest and oldest child a caregiver will take on. */
export const MIN_AGE = 0;
export const MAX_AGE = 21;

/** A calendar date, not a timestamp. The input is `type="date"`. */
function isFutureDate(value: string, today = new Date()) {
  const [year, month, day] = value.split("-").map(Number);
  const date = Date.UTC(year, month - 1, day);
  const now = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

  return date > now;
}

/** An empty input is a cleared field, not a malformed one. */
const optionalDate = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .pipe(z.iso.date({ error: "Enter a valid date." }).nullable())
  .refine(
    (value) => value === null || !isFutureDate(value),
    "Date of birth cannot be in the future.",
  );

/**
 * A number input hands over a string, and an empty one means blank. The bounds
 * are the same ones the database enforces, so a value that reaches Postgres has
 * already been refused here with a sentence rather than a constraint name.
 */
const optionalAge = z
  .union([z.number(), z.string()])
  .transform((value) =>
    typeof value === "string" && value.trim() === "" ? null : Number(value),
  )
  .pipe(
    z
      .number({ error: "Enter a whole number of years." })
      .int("Enter a whole number of years.")
      .min(MIN_AGE, `The youngest age cannot be below ${MIN_AGE}.`)
      .max(MAX_AGE, `The oldest age cannot be above ${MAX_AGE}.`)
      .nullable(),
  );

export const capabilitiesInput = z
  .object({
    needSlugs: z.array(z.string()).default([]),
    supportSlugs: z.array(z.string()).default([]),
    dateOfBirth: optionalDate.default(null),
    gender: z
      .union([z.literal(""), caregiverGender])
      .transform((value) => (value === "" ? null : value))
      .default(null),
    ageMin: optionalAge.default(null),
    ageMax: optionalAge.default(null),
  })
  .superRefine((value, ctx) => {
    // Half a range cannot be compared against a child's age, so it is refused
    // rather than quietly widened to something the caregiver did not say.
    if ((value.ageMin === null) !== (value.ageMax === null)) {
      ctx.addIssue({
        code: "custom",
        message: "Set both ages, or leave both blank.",
        path: ["ageMax"],
      });
      return;
    }

    if (value.ageMin !== null && value.ageMax !== null && value.ageMax < value.ageMin) {
      ctx.addIssue({
        code: "custom",
        message: "The oldest age cannot be below the youngest.",
        path: ["ageMax"],
      });
    }
  });

export type CapabilitiesInput = z.infer<typeof capabilitiesInput>;

/** Delivered to the browser, so the dialog can offer the same choices. */
export type CapabilityLists = {
  needs: { slug: string; label: string }[];
  supports: { slug: string; label: string }[];
};
