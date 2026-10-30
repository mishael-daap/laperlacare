/**
 * The fixed vocabularies the application asks about.
 *
 * Every one of these is a closed set: a slug is stored, a label is rendered. The
 * data lives here rather than in a table, for the reason the migration that
 * created the columns gives — nothing joins on them, no row carries an attribute
 * beyond its slug and its position, and the labels are product copy. The
 * database still refuses an unknown slug: `private.valid_slugs` pins each list
 * in a check constraint, so these arrays and those constraints have to change
 * together.
 *
 * Same shape as `DOCUMENT_KINDS` in `credentials.ts`, which is what lets one
 * checklist component render any of them.
 *
 * `other` is the only open value anywhere. When it is ticked, its label is
 * required, and the database refuses the row without one.
 */

export type Option = { value: string; label: string };

/** The six counties the paper form names, plus Other. */
export const COUNTIES: Option[] = [
  { value: "san_francisco", label: "San Francisco" },
  { value: "san_mateo", label: "San Mateo" },
  { value: "santa_clara", label: "Santa Clara" },
  { value: "alameda", label: "Alameda" },
  { value: "contra_costa", label: "Contra Costa" },
  { value: "marin", label: "Marin" },
  { value: "other", label: "Other" },
];

export const LANGUAGES: Option[] = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
  { value: "mandarin", label: "Mandarin" },
  { value: "cantonese", label: "Cantonese" },
  { value: "vietnamese", label: "Vietnamese" },
  { value: "tagalog", label: "Tagalog" },
  { value: "other", label: "Other" },
];

/**
 * What a caregiver has worked with.
 *
 * Seven of these rhyme with an entry in `needs` or `supports` — feeding,
 * toileting, transfers, medication, communication, behaviour, sensory. They are
 * kept separate anyway, and deliberately: this list answers "what have you
 * handled before", and those answer "what will you do on a shift". A caregiver
 * who has worked with feeding support is not thereby offering to do it.
 */
export const CONDITIONS: Option[] = [
  { value: "autism", label: "Autism spectrum" },
  { value: "down_syndrome", label: "Down syndrome" },
  { value: "cerebral_palsy", label: "Cerebral palsy" },
  { value: "intellectual_disability", label: "Intellectual disability" },
  { value: "adhd", label: "ADHD" },
  { value: "epilepsy", label: "Epilepsy and seizures" },
  {
    value: "non_verbal_communication",
    label: "Non-verbal communication (AAC, PECS, sign)",
  },
  { value: "challenging_behaviours", label: "Challenging behaviours" },
  { value: "sensory_processing", label: "Sensory processing needs" },
  { value: "feeding_support", label: "Feeding support, including G-tube" },
  { value: "toileting_personal_care", label: "Toileting and personal care" },
  { value: "lifting_transfers", label: "Lifting and transfers, wheelchair" },
  { value: "medication_reminders", label: "Medication reminders" },
  { value: "behaviour_plan_aba", label: "Following a behaviour plan (ABA)" },
  { value: "other", label: "Other" },
];

/** Mirrors the `preferred_contact_method` check on `contacts`. */
export const CONTACT_METHODS: Option[] = [
  { value: "phone", label: "Phone call" },
  { value: "text", label: "Text message" },
  { value: "email", label: "Email" },
];

/** Mirrors the `pets` check on `caregivers`. Null is unanswered, `none` is not. */
export const PETS: Option[] = [
  { value: "dogs", label: "Dogs" },
  { value: "cats", label: "Cats" },
  { value: "both", label: "Dogs and cats" },
  { value: "none", label: "No pets, please" },
];

export function labelFor(options: Option[], value: string | null | undefined) {
  return options.find((option) => option.value === value)?.label ?? null;
}

/** The label a set of slugs reads as, in list order. */
export function labelsFor(options: Option[], values: string[] | null | undefined) {
  const chosen = new Set(values ?? []);
  return options.filter((option) => chosen.has(option.value)).map((option) => option.label);
}
