/**
 * The sixteen sections a caregiver fills in, and how far they have got.
 *
 * This is the only place the number is written. The progress counter, the
 * onboarding flow, the rail on `/me` and the admin's view all read this list, so
 * adding a section is one array entry and nothing else.
 *
 * Nothing here is a column. "Complete" is derived from the data every time it is
 * read, which is why it cannot drift out of step with the thing it describes —
 * the same reason the caregiver's badge is a query rather than a field.
 *
 * The rules are deliberately not the same as the submission rules. Some of these
 * sections are optional to submit (languages, transport, home environment), and
 * "complete" for them means "answered", not "required". The counter is an
 * encouragement, not a gate; `submit_caregiver_application` is the gate, and it
 * is the only place that refuses.
 */

export type SectionKey =
  | "profile"
  | "work"
  | "languages"
  | "transportation"
  | "home"
  | "needs"
  | "supports"
  | "availability"
  | "contacts"
  | "personal"
  | "experience"
  | "conditions"
  | "references"
  | "questions"
  | "credentials"
  | "signature";

export type SectionState = {
  /** 1–16, and the order they appear on the pages. */
  number: number;
  key: SectionKey;
  label: string;
  /** The page the section lives on, and the anchor that opens it. */
  href: string;
  done: boolean;
};

export type ProgressInput = {
  // 1 Profile
  displayName: string | null;
  bio: string | null;
  dateOfBirth: string | null;
  gender: string | null;

  // 2 Work details
  hourlyRate: number | null;
  counties: string[];
  ageMin: number | null;
  ageMax: number | null;

  // 3 Languages
  languages: string[];

  // 4 Transportation — null is unanswered, which is not the same as "no"
  carAndInsurance: boolean | null;
  willingToDrive: boolean | null;
  maxTravelMiles: number | null;

  // 5 Home environment
  pets: string | null;
  nonSmoker: boolean | null;

  // 6 and 7
  needCount: number;
  supportCount: number;

  // 8
  availabilityCount: number;

  // 9
  contactCount: number;

  // 10 Personal details
  legalName: string | null;
  addressStreet: string | null;
  addressCity: string | null;
  addressPostalCode: string | null;

  // 11
  experienceCount: number;

  // 12
  conditions: string[];

  // 13
  referenceCount: number;

  // 14
  whySpecialNeeds: string | null;
  difficultMoment: string | null;

  // 15
  credentialCount: number;

  // 16
  backgroundCheckAgreed: boolean;
  signatureName: string | null;
};

const filled = (value: string | null | undefined) => Boolean(value && value.trim());

/**
 * The order is the order a caregiver meets them in: who they are, what they can
 * do, when they are free, and then the once-only application.
 */
export function sections(input: ProgressInput): SectionState[] {
  return [
    {
      number: 1,
      key: "profile",
      label: "Profile",
      href: "/me#profile",
      done:
        filled(input.displayName) &&
        filled(input.bio) &&
        Boolean(input.dateOfBirth) &&
        filled(input.gender),
    },
    {
      number: 2,
      key: "work",
      label: "Work details",
      href: "/me#work-details",
      done:
        input.hourlyRate !== null &&
        input.counties.length > 0 &&
        input.ageMin !== null &&
        input.ageMax !== null,
    },
    {
      number: 3,
      key: "languages",
      label: "Languages",
      href: "/me#languages",
      done: input.languages.length > 0,
    },
    {
      number: 4,
      key: "transportation",
      label: "Transportation",
      href: "/me#transportation",
      done:
        input.carAndInsurance !== null &&
        input.willingToDrive !== null &&
        input.maxTravelMiles !== null,
    },
    {
      number: 5,
      key: "home",
      label: "Home environment",
      href: "/me#home-environment",
      done: input.pets !== null && input.nonSmoker !== null,
    },
    {
      number: 6,
      key: "needs",
      label: "Children you can support",
      href: "/me#needs",
      done: input.needCount > 0,
    },
    {
      number: 7,
      key: "supports",
      label: "What you can provide",
      href: "/me#supports",
      done: input.supportCount > 0,
    },
    {
      number: 8,
      key: "availability",
      label: "Weekly availability",
      href: "/me#availability",
      done: input.availabilityCount > 0,
    },
    {
      number: 9,
      key: "contacts",
      label: "Contact details",
      href: "/me#contacts",
      done: input.contactCount > 0,
    },
    {
      number: 10,
      key: "personal",
      label: "Personal details",
      href: "/application#personal-details",
      done:
        filled(input.legalName) &&
        filled(input.addressStreet) &&
        filled(input.addressCity) &&
        filled(input.addressPostalCode),
    },
    {
      number: 11,
      key: "experience",
      label: "Experience",
      href: "/application#experience",
      done: input.experienceCount > 0,
    },
    {
      number: 12,
      key: "conditions",
      label: "Experience with needs",
      href: "/application#conditions",
      done: input.conditions.length > 0,
    },
    {
      number: 13,
      key: "references",
      label: "References",
      href: "/application#references",
      done: input.referenceCount === 2,
    },
    {
      number: 14,
      key: "questions",
      label: "Your questions",
      href: "/application#questions",
      done: filled(input.whySpecialNeeds) && filled(input.difficultMoment),
    },
    {
      number: 15,
      key: "credentials",
      label: "Credentials",
      href: "/application#credentials",
      done: input.credentialCount > 0,
    },
    {
      number: 16,
      key: "signature",
      label: "Background check and signature",
      href: "/application#signature",
      // Complete only once they have signed and sent it, which happens in this
      // very section. That is why the flow reads "15 of 16" while the last
      // section is open, and why the action there is "Sign and submit" rather
      // than "Continue".
      done: input.backgroundCheckAgreed && filled(input.signatureName),
    },
  ];
}

export function progress(state: SectionState[]) {
  const done = state.filter((section) => section.done).length;

  return {
    done,
    total: state.length,
    /** The first thing still missing, which is what the action should open. */
    next: state.find((section) => !section.done) ?? null,
    complete: done === state.length,
  };
}
