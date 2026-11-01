import { z } from "zod";

/**
 * The four levers, and the only place their values are defined.
 *
 * They live in the URL rather than in component state: the empty state's
 * suggestions are plain links, the back button steps through the history of a
 * parent's thinking, and the page stays a server component with nothing to
 * hydrate. Parsing is forgiving — a hand-edited `?hours=banana` falls back to the
 * default instead of throwing at somebody mid-demo.
 */
export const HOURS = [
  { value: "exact", label: "Exactly my days and hours" },
  { value: "flexible", label: "Within an hour either side" },
  { value: "day", label: "Any time on those days" },
] as const;

export const GENDERS = [
  { value: "household", label: "As my household says" },
  { value: "any", label: "Any gender" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
] as const;

export type HoursOption = (typeof HOURS)[number]["value"];
export type GenderOption = (typeof GENDERS)[number]["value"];

export type MatchOptions = {
  hours: HoursOption;
  partial: boolean;
  maxRate: number | null;
  gender: GenderOption;
  saved: boolean;
};

export const DEFAULT_OPTIONS: MatchOptions = {
  hours: "exact",
  partial: false,
  maxRate: null,
  gender: "household",
  saved: false,
};

const hoursValues = HOURS.map((option) => option.value) as [HoursOption, ...HoursOption[]];
const genderValues = GENDERS.map((option) => option.value) as [GenderOption, ...GenderOption[]];

const schema = z.object({
  hours: z.enum(hoursValues).catch(DEFAULT_OPTIONS.hours),
  /** Anything but "1" is off; a lever is a switch, not a number to parse. */
  partial: z
    .string()
    .optional()
    .transform((value) => value === "1" || value === "true"),
  /** The URL says `rate`; the option is called `maxRate`, which is what it is. */
  rate: z
    .string()
    .optional()
    .transform((value) => {
      const rate = Number(value);
      return Number.isFinite(rate) && rate > 0 ? Math.round(rate) : null;
    }),
  gender: z.enum(genderValues).catch(DEFAULT_OPTIONS.gender),
  saved: z
    .string()
    .optional()
    .transform((value) => value === "1" || value === "true"),
});

export function parseMatchOptions(
  searchParams: Record<string, string | string[] | undefined>,
): MatchOptions {
  const flat = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  const parsed = schema.safeParse(flat);

  if (!parsed.success) return DEFAULT_OPTIONS;

  return {
    hours: parsed.data.hours,
    partial: parsed.data.partial,
    maxRate: parsed.data.rate,
    gender: parsed.data.gender,
    saved: parsed.data.saved,
  };
}

/** The URL for a set of levers, omitting anything already at its default. */
export function matchHref(options: MatchOptions, patch: Partial<MatchOptions> = {}) {
  const query = queryFor({ ...options, ...patch });

  return query ? `/matches?${query}` : "/matches";
}

/**
 * A caregiver's profile, carrying the levers that found them.
 *
 * Without the query string a caregiver who only appears with partial coverage on
 * would open as a 404 — she matched, the family pressed her name, and the page
 * would claim she does not exist.
 */
export function matchProfileHref(options: MatchOptions, caregiverId: string) {
  const query = queryFor(options);

  return query ? `/matches/${caregiverId}?${query}` : `/matches/${caregiverId}`;
}

function queryFor(options: MatchOptions) {
  const params = new URLSearchParams();

  if (options.hours !== DEFAULT_OPTIONS.hours) params.set("hours", options.hours);
  if (options.partial) params.set("partial", "1");
  if (options.maxRate !== null) params.set("rate", String(options.maxRate));
  if (options.gender !== DEFAULT_OPTIONS.gender) params.set("gender", options.gender);
  if (options.saved) params.set("saved", "1");

  return params.toString();
}

export type MatchTier = "great" | "good" | "partial";

export type MatchRow = {
  caregiver_id: string;
  display_name: string;
  avatar_path: string | null;
  bio: string | null;
  hourly_rate: number | null;
  age_min: number | null;
  age_max: number | null;
  gender: string | null;
  languages: string[];
  counties: string[];
  needs_covered: number;
  needs_total: number;
  supports_covered: number;
  supports_total: number;
  missing_needs: string[];
  missing_supports: string[];
  overlap_minutes: number;
  window_minutes: number;
  tier: MatchTier;
  reasons: string[];
  gaps: string[];
};

/** "6 of 8 hours" — the one place minutes become words. */
export function hoursLabel(overlapMinutes: number, windowMinutes: number) {
  const overlap = Math.round((overlapMinutes / 60) * 10) / 10;
  const total = Math.round((windowMinutes / 60) * 10) / 10;

  return `${overlap} of ${total} hours`;
}
