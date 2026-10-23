/**
 * What a caregiver has done and what is left, derived rather than stored.
 *
 * Nothing here is a column. The count cannot drift out of step with the data it
 * describes, because it *is* the data — which is also why there is no "draft"
 * status to keep in sync. `submitted_at` says whether they have sent it for
 * review; this says how much of it there is.
 *
 * Takes plain values rather than a client so it can be read without a database
 * round trip, and so the rule is in one place rather than spread across the
 * screens that display it.
 */
export type CompletenessInput = {
  displayName: string | null;
  bio: string | null;
  avatarPath: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  /** A working age range is either both bounds or neither. */
  workingAges: boolean;
  contactCount: number;
  needCount: number;
  supportCount: number;
  documentCount: number;
  availabilityCount: number;
};

export type CompletenessItem = {
  key:
    | "contacts"
    | "profile"
    | "avatar"
    | "dateOfBirth"
    | "gender"
    | "workingAges"
    | "needs"
    | "supports"
    | "documents"
    | "availability";
  label: string;
  done: boolean;
};

export function completeness(input: CompletenessInput): CompletenessItem[] {
  return [
    {
      key: "contacts",
      label: "Add your contact details",
      done: input.contactCount > 0,
    },
    {
      key: "profile",
      label: "Add your name and a short bio",
      done: Boolean(input.displayName && input.bio),
    },
    {
      key: "avatar",
      label: "Add a profile photo",
      done: Boolean(input.avatarPath),
    },
    {
      key: "dateOfBirth",
      label: "Add your date of birth",
      done: Boolean(input.dateOfBirth),
    },
    {
      key: "gender",
      label: "Say which families you are a fit for",
      done: Boolean(input.gender),
    },
    {
      key: "workingAges",
      label: "Choose the ages you work with",
      done: input.workingAges,
    },
    {
      key: "needs",
      label: "Tick the needs you can support",
      done: input.needCount > 0,
    },
    {
      key: "supports",
      label: "Tick what you can provide",
      done: input.supportCount > 0,
    },
    {
      key: "documents",
      label: "Upload a document for review",
      done: input.documentCount > 0,
    },
    {
      key: "availability",
      label: "Set your weekly availability",
      done: input.availabilityCount > 0,
    },
  ];
}

export function completenessSummary(items: CompletenessItem[]) {
  const done = items.filter((item) => item.done).length;

  return {
    done,
    total: items.length,
    /** The first thing still missing, which is what the invitation should name. */
    next: items.find((item) => !item.done) ?? null,
    complete: done === items.length,
  };
}
