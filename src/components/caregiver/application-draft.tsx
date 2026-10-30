"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  saveApplicationDetailsAction,
  saveBackgroundCheckAgreementAction,
  saveConditionsAction,
  saveExperienceAction,
  saveQuestionsAction,
  saveReferencesAction,
} from "@/lib/caregiver/application-actions";

export type DraftExperience = {
  employer: string;
  role: string;
  /** `YYYY-MM`, which is what a month input hands over. */
  startedOn: string;
  /** `YYYY-MM`, or empty for "still here". */
  endedOn: string;
  agesAndNeeds: string;
};

export type DraftReference = {
  fullName: string;
  relationship: string;
  organisation: string;
  phone: string;
  email: string;
  knownFor: string;
};

export const EMPTY_REFERENCE: DraftReference = {
  fullName: "",
  relationship: "",
  organisation: "",
  phone: "",
  email: "",
  knownFor: "",
};

type Draft = {
  legalName: string;
  setLegalName: (value: string) => void;
  addressStreet: string;
  setAddressStreet: (value: string) => void;
  addressCity: string;
  setAddressCity: (value: string) => void;
  addressPostalCode: string;
  setAddressPostalCode: (value: string) => void;
  referralSource: string;
  setReferralSource: (value: string) => void;

  conditions: Set<string>;
  toggleCondition: (slug: string) => void;
  otherCondition: string;
  setOtherCondition: (value: string) => void;

  whySpecialNeeds: string;
  setWhySpecialNeeds: (value: string) => void;
  difficultMoment: string;
  setDifficultMoment: (value: string) => void;

  experience: DraftExperience[];
  addExperience: () => void;
  updateExperience: (index: number, patch: Partial<DraftExperience>) => void;
  removeExperience: (index: number) => void;

  references: DraftReference[];
  updateReference: (index: number, patch: Partial<DraftReference>) => void;

  backgroundCheckAgreed: boolean;
  setBackgroundCheckAgreed: (value: boolean) => void;

  /** True once the application has been submitted and not returned. */
  locked: boolean;

  dirty: boolean;
  saving: boolean;
  error: string | null;
  save: () => Promise<void>;
  cancel: () => void;
};

const ApplicationDraftContext = createContext<Draft | null>(null);

export function useApplicationDraft() {
  const draft = useContext(ApplicationDraftContext);

  if (!draft) {
    throw new Error("useApplicationDraft must be used inside ApplicationDraftProvider.");
  }

  return draft;
}

function sameSet(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false;
  for (const value of a) if (!b.has(value)) return false;
  return true;
}

type Baseline = {
  legalName: string;
  addressStreet: string;
  addressCity: string;
  addressPostalCode: string;
  referralSource: string;
  conditions: Set<string>;
  otherCondition: string;
  whySpecialNeeds: string;
  difficultMoment: string;
  experience: DraftExperience[];
  references: DraftReference[];
};

/**
 * The draft for `/application`.
 *
 * Modelled on the profile's provider, and for the same reason: one save bar, and
 * "unsaved" derived by comparing against what the server last sent rather than
 * by a flag somebody has to remember to clear.
 *
 * The signature and the consent checkbox are deliberately outside the draft.
 * They are not edits — they are an attestation, they are written once, and
 * putting them in a draft that a Cancel button can roll back would mean a
 * signature that could be un-signed by pressing a different button.
 */
export function ApplicationDraftProvider({
  initial,
  locked,
  children,
}: {
  initial: {
    legalName: string | null;
    addressStreet: string | null;
    addressCity: string | null;
    addressPostalCode: string | null;
    referralSource: string | null;
    conditions: string[];
    otherCondition: string | null;
    whySpecialNeeds: string | null;
    difficultMoment: string | null;
    experience: DraftExperience[];
    references: DraftReference[];
  };
  locked: boolean;
  children: ReactNode;
}) {
  const router = useRouter();

  const [legalName, setLegalName] = useState(initial.legalName ?? "");
  const [addressStreet, setAddressStreet] = useState(initial.addressStreet ?? "");
  const [addressCity, setAddressCity] = useState(initial.addressCity ?? "");
  const [addressPostalCode, setAddressPostalCode] = useState(
    initial.addressPostalCode ?? "",
  );
  const [referralSource, setReferralSource] = useState(initial.referralSource ?? "");

  const [conditions, setConditions] = useState(() => new Set(initial.conditions));
  const [otherCondition, setOtherCondition] = useState(initial.otherCondition ?? "");

  const [whySpecialNeeds, setWhySpecialNeeds] = useState(initial.whySpecialNeeds ?? "");
  const [difficultMoment, setDifficultMoment] = useState(initial.difficultMoment ?? "");

  const [experience, setExperience] = useState<DraftExperience[]>(initial.experience);
  const [references, setReferences] = useState<DraftReference[]>(initial.references);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const [baseline, setBaseline] = useState<Baseline>(() => ({
    legalName: initial.legalName ?? "",
    addressStreet: initial.addressStreet ?? "",
    addressCity: initial.addressCity ?? "",
    addressPostalCode: initial.addressPostalCode ?? "",
    referralSource: initial.referralSource ?? "",
    conditions: new Set(initial.conditions),
    otherCondition: initial.otherCondition ?? "",
    whySpecialNeeds: initial.whySpecialNeeds ?? "",
    difficultMoment: initial.difficultMoment ?? "",
    experience: initial.experience,
    references: initial.references,
  }));

  /**
   * Rows are compared by value. They carry no id, because a replace-set gives
   * them no stable key across a save.
   */
  const dirty =
    legalName !== baseline.legalName ||
    addressStreet !== baseline.addressStreet ||
    addressCity !== baseline.addressCity ||
    addressPostalCode !== baseline.addressPostalCode ||
    referralSource !== baseline.referralSource ||
    !sameSet(conditions, baseline.conditions) ||
    otherCondition !== baseline.otherCondition ||
    whySpecialNeeds !== baseline.whySpecialNeeds ||
    difficultMoment !== baseline.difficultMoment ||
    JSON.stringify(experience) !== JSON.stringify(baseline.experience) ||
    JSON.stringify(references) !== JSON.stringify(baseline.references);

  const toggleCondition = useCallback((slug: string) => {
    setConditions((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    setError(null);
  }, []);

  const addExperience = useCallback(() => {
    setExperience((current) => [
      ...current,
      { employer: "", role: "", startedOn: "", endedOn: "", agesAndNeeds: "" },
    ]);
    setError(null);
  }, []);

  const updateExperience = useCallback(
    (index: number, patch: Partial<DraftExperience>) => {
      setExperience((current) =>
        current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
      );
      setError(null);
    },
    [],
  );

  const removeExperience = useCallback((index: number) => {
    setExperience((current) => current.filter((_, i) => i !== index));
    setError(null);
  }, []);

  /**
   * The two reference cards are always both on screen. "Exactly two" is a rule,
   * so rendering two empty cards is clearer than an Add button that stops
   * working after the second press.
   */
  const updateReference = useCallback(
    (index: number, patch: Partial<DraftReference>) => {
      setReferences((current) => {
        const rows = current.length === 2 ? [...current] : [current[0] ?? EMPTY_REFERENCE, current[1] ?? EMPTY_REFERENCE];
        rows[index] = { ...rows[index], ...patch };
        return rows;
      });
      setError(null);
    },
    [],
  );

  const cancel = useCallback(() => {
    setLegalName(baseline.legalName);
    setAddressStreet(baseline.addressStreet);
    setAddressCity(baseline.addressCity);
    setAddressPostalCode(baseline.addressPostalCode);
    setReferralSource(baseline.referralSource);
    setConditions(new Set(baseline.conditions));
    setOtherCondition(baseline.otherCondition);
    setWhySpecialNeeds(baseline.whySpecialNeeds);
    setDifficultMoment(baseline.difficultMoment);
    setExperience(baseline.experience);
    setReferences(baseline.references);
    setError(null);
  }, [baseline]);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      // Only what changed is written, one section at a time. They cannot fail
      // each other, which matters when five of the six are already correct.
      const personalChanged =
        legalName !== baseline.legalName ||
        addressStreet !== baseline.addressStreet ||
        addressCity !== baseline.addressCity ||
        addressPostalCode !== baseline.addressPostalCode ||
        referralSource !== baseline.referralSource;
      const conditionsChanged =
        !sameSet(conditions, baseline.conditions) ||
        otherCondition !== baseline.otherCondition;
      const questionsChanged =
        whySpecialNeeds !== baseline.whySpecialNeeds ||
        difficultMoment !== baseline.difficultMoment;
      const experienceChanged =
        JSON.stringify(experience) !== JSON.stringify(baseline.experience);
      const referencesChanged =
        JSON.stringify(references) !== JSON.stringify(baseline.references);

      const results = await Promise.all([
        personalChanged
          ? saveApplicationDetailsAction({
              legalName,
              addressStreet,
              addressCity,
              addressPostalCode,
              referralSource,
            })
          : null,
        conditionsChanged
          ? saveConditionsAction({
              conditions: [...conditions],
              otherCondition,
            })
          : null,
        questionsChanged
          ? saveQuestionsAction({ whySpecialNeeds, difficultMoment })
          : null,
        experienceChanged
          ? saveExperienceAction({
              rows: experience.map((row) => ({
                employer: row.employer,
                role: row.role,
                startedOn: row.startedOn,
                // "Still here" is a state the page shows and the schema does not
                // know about, so it crosses the boundary as an empty end month.
                endedOn: row.endedOn === "present" ? "" : row.endedOn,
                agesAndNeeds: row.agesAndNeeds,
              })),
            })
          : null,
        referencesChanged
          ? saveReferencesAction({
              rows: references
                .filter((row) => row.fullName.trim() !== "")
                .map((row) => ({
                  fullName: row.fullName,
                  relationship: row.relationship,
                  organisation: row.organisation,
                  phone: row.phone,
                  email: row.email,
                  knownFor: row.knownFor,
                })),
            })
          : null,
      ]);

      const failure = results.find((result) => result?.error)?.error;

      if (failure) {
        setError(failure);
        return;
      }

      setBaseline({
        legalName,
        addressStreet,
        addressCity,
        addressPostalCode,
        referralSource,
        conditions: new Set(conditions),
        otherCondition,
        whySpecialNeeds,
        difficultMoment,
        experience,
        references,
      });

      router.refresh();
    } finally {
      setSaving(false);
    }
  }, [
    legalName,
    addressStreet,
    addressCity,
    addressPostalCode,
    referralSource,
    conditions,
    otherCondition,
    whySpecialNeeds,
    difficultMoment,
    experience,
    references,
    baseline,
    router,
  ]);

  /**
   * The consent checkbox writes on the spot rather than through the save bar.
   * It is a single decision, and a consent that only takes effect on a second
   * button press is a consent somebody can walk away from believing they gave.
   */
  const setBackgroundCheckAgreed = useCallback(
    (value: boolean) => {
      setAgreed(value);
      void saveBackgroundCheckAgreementAction(value).then((result) => {
        if (result?.error) setError(result.error);
        else router.refresh();
      });
    },
    [router],
  );

  const value = useMemo<Draft>(
    () => ({
      legalName,
      setLegalName,
      addressStreet,
      setAddressStreet,
      addressCity,
      setAddressCity,
      addressPostalCode,
      setAddressPostalCode,
      referralSource,
      setReferralSource,
      conditions,
      toggleCondition,
      otherCondition,
      setOtherCondition,
      whySpecialNeeds,
      setWhySpecialNeeds,
      difficultMoment,
      setDifficultMoment,
      experience,
      addExperience,
      updateExperience,
      removeExperience,
      references,
      updateReference,
      backgroundCheckAgreed: agreed,
      setBackgroundCheckAgreed,
      locked,
      dirty,
      saving,
      error,
      save,
      cancel,
    }),
    [
      legalName,
      addressStreet,
      addressCity,
      addressPostalCode,
      referralSource,
      conditions,
      toggleCondition,
      otherCondition,
      whySpecialNeeds,
      difficultMoment,
      experience,
      addExperience,
      updateExperience,
      removeExperience,
      references,
      updateReference,
      agreed,
      setBackgroundCheckAgreed,
      locked,
      dirty,
      saving,
      error,
      save,
      cancel,
    ],
  );

  return (
    <ApplicationDraftContext.Provider value={value}>
      {children}
    </ApplicationDraftContext.Provider>
  );
}
