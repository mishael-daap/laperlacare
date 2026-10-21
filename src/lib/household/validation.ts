import { z } from "zod";

/**
 * The rules every household write shares.
 *
 * They live here rather than in the actions so the page, the dialog, and the
 * server all speak about the same limits. The database enforces the important
 * ones as well; this is the layer that turns them into a sentence a parent can
 * act on.
 */

export const caregiverGender = z.enum(["female", "male", "no_preference"], {
  error: "Choose a valid caregiver preference.",
});

export type CaregiverGender = z.infer<typeof caregiverGender>;

/** A calendar date, not a timestamp. The input is `type="date"`. */
function isFutureDate(value: string, today = new Date()) {
  const [year, month, day] = value.split("-").map(Number);
  const date = Date.UTC(year, month - 1, day);
  const now = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

  return date > now;
}

export const childInput = z.object({
  childId: z.uuid({ error: "That child id is not valid." }).optional(),
  fullName: z
    .string()
    .trim()
    .min(1, "Enter your child's name.")
    .max(120, "That name is too long."),
  dateOfBirth: z
    .iso
    .date({ error: "Enter a date of birth." })
    .refine((value) => !isFutureDate(value), "Date of birth cannot be in the future."),
  notes: z
    .string()
    .trim()
    .max(1000, "Keep this under 1,000 characters.")
    .default(""),
  needSlugs: z.array(z.string()).default([]),
  supportSlugs: z.array(z.string()).default([]),
});

export type ChildInput = z.infer<typeof childInput>;

export const careWindowInput = z
  .object({
    dayOfWeek: z.coerce
      .number({ error: "Choose a day." })
      .int()
      .min(1, "Choose a day.")
      .max(7, "Choose a day."),
    startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Choose a start time."),
    endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Choose an end time."),
  })
  .refine((value) => minutes(value.endTime) > minutes(value.startTime), {
    message: "The end time must be after the start time.",
    path: ["endTime"],
  });

export type CareWindowInput = z.infer<typeof careWindowInput>;

function minutes(value: string) {
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
}

/** Postgres wants `HH:MM:SS`; the browser's time input gives `HH:MM`. */
export function normaliseTime(value: string) {
  const [hours, mins] = value.split(":");
  return `${hours.padStart(2, "0")}:${mins.padStart(2, "0")}:00`;
}
