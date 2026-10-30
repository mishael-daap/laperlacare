import { z } from "zod";

import { CONDITIONS, CONTACT_METHODS, COUNTIES, LANGUAGES, PETS } from "@/lib/caregiver/answers";

/**
 * The rules every application and work-details write shares.
 *
 * One schema per section, because one section saves at a time. The database
 * enforces all of this as well — check constraints, the slug predicates, the
 * not-nulls. This layer exists to turn a constraint into a sentence a caregiver
 * can act on, and to refuse a bad slug before it reaches Postgres, where the
 * error would name a constraint instead of a field.
 *
 * Nothing here is required except where noted. The page is filled in over
 * several sittings, and a section that refuses to save until it is complete is a
 * wall in front of somebody doing the right thing. `submit_caregiver_application`
 * is where completeness is finally enforced, in one place.
 */

const slugs = (options: { value: string }[], message: string) =>
  z
    .array(z.string())
    .default([])
    .transform((values) => [...new Set(values)])
    .refine((values) => values.every((value) => options.some((o) => o.value === value)), message);

const label = (max: number, message: string) =>
  z.string().trim().max(max, message).default("");

/** A calendar date, not a timestamp. The input is `type="date"`. */
const isoDate = (message: string) => z.string().trim().pipe(z.iso.date({ error: message }));

const optionalDate = (message: string) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .pipe(isoDate(message).nullable());

/** Postgres gives a whole number or nothing; an empty input means nothing. */
const optionalWhole = (min: number, max: number, message: string) =>
  z
    .union([z.number(), z.string()])
    .transform((value) =>
      typeof value === "string" && value.trim() === "" ? null : Number(value),
    )
    .pipe(
      z
        .number({ error: message })
        .int(message)
        .min(min, message)
        .max(max, message)
        .nullable(),
    );

/**
 * A yes/no question, with unanswered as a real third state.
 *
 * The columns are nullable for exactly this reason: "I do not have a car" and
 * "nobody has asked me yet" are different answers, and a progress counter that
 * cannot tell them apart tells the caregiver they answered something they did
 * not.
 */
const yesNo = z
  .union([z.literal(""), z.literal("yes"), z.literal("no")])
  .transform((value) => (value === "" ? null : value === "yes"))
  .default(null);

/**
 * An "other" answer without its label is a tick that says nothing, so the pair
 * travels together. The database refuses the row without one; this refuses it
 * with a sentence first.
 */
function requireOther(
  values: string[],
  other: string,
  ctx: z.RefinementCtx,
  message: string,
) {
  if (values.includes("other") && other.trim() === "") {
    ctx.addIssue({ code: "custom", path: ["other"], message });
  }
}

// ---------------------------------------------------------------------------
// Work details
// ---------------------------------------------------------------------------

export const workDetailsInput = z.object({
  hourlyRate: optionalWhole(15, 500, "Enter a whole number of dollars between 15 and 500."),
  counties: slugs(COUNTIES, "Choose a county from the list."),
  otherCounty: label(200, "Keep this under 200 characters."),
  regionalCenterWorker: yesNo,
  regionalCenterName: label(200, "Keep this under 200 characters."),
  earliestStartDate: optionalDate("Enter a valid date."),
}).superRefine((value, ctx) => {
  requireOther(value.counties, value.otherCounty, ctx, "Say which county.");
});

export type WorkDetailsInput = z.infer<typeof workDetailsInput>;

// ---------------------------------------------------------------------------
// Languages
// ---------------------------------------------------------------------------

export const languagesInput = z.object({
  languages: slugs(LANGUAGES, "Choose a language from the list."),
  otherLanguage: label(200, "Keep this under 200 characters."),
}).superRefine((value, ctx) => {
  requireOther(value.languages, value.otherLanguage, ctx, "Say which language.");
});

// ---------------------------------------------------------------------------
// Transportation
// ---------------------------------------------------------------------------

export const transportationInput = z.object({
  carAndInsurance: yesNo,
  willingToDrive: yesNo,
  maxTravelMiles: optionalWhole(1, 500, "Enter a whole number of miles between 1 and 500."),
});

// ---------------------------------------------------------------------------
// Home environment
// ---------------------------------------------------------------------------

export const homeEnvironmentInput = z.object({
  pets: z
    .union([z.literal(""), z.enum(PETS.map((p) => p.value) as [string, ...string[]])])
    .transform((value) => (value === "" ? null : value))
    .default(null),
  nonSmoker: yesNo,
});

// ---------------------------------------------------------------------------
// Application: personal details
// ---------------------------------------------------------------------------

export const personalDetailsInput = z.object({
  legalName: label(200, "Keep your legal name under 200 characters."),
  addressStreet: label(200, "Keep the street address under 200 characters."),
  addressCity: label(120, "Keep the city under 120 characters."),
  addressPostalCode: z
    .string()
    .trim()
    .max(20, "That ZIP code is too long.")
    .default("")
    .refine(
      (value) => value === "" || /^\d{5}(-\d{4})?$/.test(value),
      "Enter a five-digit ZIP code.",
    ),
  referralSource: label(200, "Keep this under 200 characters."),
});

// ---------------------------------------------------------------------------
// Application: conditions
// ---------------------------------------------------------------------------

export const conditionsInput = z.object({
  conditions: slugs(CONDITIONS, "Choose an area from the list."),
  otherCondition: label(200, "Keep this under 200 characters."),
}).superRefine((value, ctx) => {
  requireOther(value.conditions, value.otherCondition, ctx, "Say which area.");
});

// ---------------------------------------------------------------------------
// Application: the two written answers
// ---------------------------------------------------------------------------

export const questionsInput = z.object({
  whySpecialNeeds: z
    .string()
    .trim()
    .max(2000, "Keep this under 2,000 characters.")
    .default(""),
  difficultMoment: z
    .string()
    .trim()
    .max(2000, "Keep this under 2,000 characters.")
    .default(""),
});

// ---------------------------------------------------------------------------
// Application: experience
// ---------------------------------------------------------------------------

/**
 * Months, not days. The database stores a date, and the first of the month is
 * what a month input means — storing the 17th because the form said August would
 * be inventing a precision nobody offered.
 */
const monthStart = (message: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}$/, message)
    .transform((value) => `${value}-01`)
    .refine((value) => value <= new Date().toISOString().slice(0, 10), "A role cannot start in the future.");

export const experienceRow = z
  .object({
    employer: z.string().trim().min(1, "Enter who you worked for.").max(200, "That name is too long."),
    role: z.string().trim().min(1, "Enter the role.").max(200, "That title is too long."),
    startedOn: monthStart("Choose a start month."),
    endedOn: z
      .string()
      .trim()
      .transform((value) => (value === "" ? null : `${value}-01`))
      .nullable()
      .default(null)
      .refine((value) => value === null || /^\d{4}-\d{2}-01$/.test(value), "Choose an end month."),
    agesAndNeeds: z.string().trim().max(500, "Keep this under 500 characters.").default(""),
  })
  .refine(
    (row) => row.endedOn === null || row.endedOn >= row.startedOn,
    { message: "A role cannot end before it starts.", path: ["endedOn"] },
  );

export const experienceInput = z.object({
  rows: z.array(experienceRow).default([]),
});

export type ExperienceRow = z.infer<typeof experienceRow>;

// ---------------------------------------------------------------------------
// Application: references
// ---------------------------------------------------------------------------

export const referenceRow = z
  .object({
    fullName: z.string().trim().min(1, "Enter their name.").max(200, "That name is too long."),
    relationship: z
      .string()
      .trim()
      .min(1, "Say how they know you.")
      .max(200, "Keep this under 200 characters."),
    organisation: z.string().trim().max(200, "Keep this under 200 characters.").default(""),
    phone: z.string().trim().max(40, "That number is too long.").default(""),
    email: z
      .string()
      .trim()
      .max(200, "That email is too long.")
      .default("")
      .refine(
        (value) => value === "" || z.email().safeParse(value).success,
        "Enter a valid email address.",
      ),
    knownFor: z.string().trim().max(200, "Keep this under 200 characters.").default(""),
  })
  .refine((row) => row.phone !== "" || row.email !== "", {
    message: "Give a phone number or an email, or we cannot reach them.",
    path: ["phone"],
  });

export const referencesInput = z.object({
  rows: z
    .array(referenceRow)
    .max(2, "Two references are enough.")
    .default([]),
});

export type ReferenceRow = z.infer<typeof referenceRow>;

// ---------------------------------------------------------------------------
// Submit
// ---------------------------------------------------------------------------

/**
 * The signature. The rest of the completeness check lives in the database, in
 * `submit_caregiver_application`, because it has to read four tables to answer —
 * but the name is checked here so an empty submit says so before a round trip.
 */
export const signatureInput = z.object({
  signatureName: z.string().trim().min(1, "Type your name to sign."),
});

/** The values the contact-method picker offers, for the contacts action. */
export const contactMethods = CONTACT_METHODS;
