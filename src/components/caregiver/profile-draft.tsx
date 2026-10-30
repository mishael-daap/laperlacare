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

import type { AvailabilityBlock } from "@/lib/caregiver/actions";
import {
  saveAvailabilityAction,
  saveCapabilitiesAction,
  saveContactsAction,
  saveHomeEnvironmentAction,
  saveLanguagesAction,
  saveProfileAction,
  saveTransportationAction,
  saveWorkDetailsAction,
} from "@/lib/caregiver/actions";
import { blocksToCells, cellsToBlocks } from "@/lib/caregiver/availability";
import { uploadAvatar } from "@/lib/caregiver/storage";

export type DraftContact = {
  /** Absent until it has been saved once. */
  id?: string;
  label: string;
  phone: string;
  email: string;
  /**
   * How the caregiver wants to be reached, on the contact it describes rather
   * than on the person. One of `phone`, `text`, `email`.
   */
  preferredContactMethod: string;
};

/**
 * Everything in the Work details, Languages, Transportation and Home environment
 * sections, held as one object.
 *
 * One object rather than twelve `useState` pairs because they are saved as four
 * groups and compared as one: twelve separate fields would mean twelve entries
 * in every dependency array, and the first one somebody forgets is a save that
 * silently drops an answer.
 *
 * Booleans are held as `""`, `"yes"` or `"no"`. An empty string is not answered,
 * which the columns model as null — a question nobody has put to somebody is not
 * the same as a no, and the progress counter depends on the difference. Ages and
 * money are strings for the same reason: that is what an input hands over, and
 * parsing on every keystroke turns "1" into a valid rate while the caret is still
 * in the box.
 */
export type DraftWork = {
  hourlyRate: string;
  counties: string[];
  otherCounty: string;
  regionalCenterWorker: string;
  regionalCenterName: string;
  earliestStartDate: string;
  languages: string[];
  otherLanguage: string;
  carAndInsurance: string;
  willingToDrive: string;
  maxTravelMiles: string;
  pets: string;
  nonSmoker: string;
};

export const EMPTY_WORK: DraftWork = {
  hourlyRate: "",
  counties: [],
  otherCounty: "",
  regionalCenterWorker: "",
  regionalCenterName: "",
  earliestStartDate: "",
  languages: [],
  otherLanguage: "",
  carAndInsurance: "",
  willingToDrive: "",
  maxTravelMiles: "",
  pets: "",
  nonSmoker: "",
};

type Draft = {
  userId: string;

  /**
   * Whether the profile fields are open for editing.
   *
   * The page is read-mostly: a caregiver looks at their own profile far more
   * often than they change it. Pencils and delete buttons sitting on everything
   * all the time made it look like a form waiting to be filled in rather than a
   * profile they had already filled in.
   *
   * Availability is the exception and stays live — it is the one thing people
   * genuinely adjust often, and burying it behind a mode would be a tax on the
   * common case. Credentials are the other: uploading a document is a thing
   * somebody does the moment they have it in their hand.
   */
  profileEditing: boolean;
  setProfileEditing: (value: boolean) => void;

  name: string;
  setName: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  photo: File | null;
  preview: string | null;
  setPhoto: (file: File) => void;

  /** Empty string means "not answered", which is a valid state for both. */
  dateOfBirth: string;
  setDateOfBirth: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;

  /** Held as strings because that is what an input hands over. */
  workingAges: { min: string; max: string };
  setWorkingAges: (value: { min: string; max: string }) => void;

  work: DraftWork;
  setWork: (patch: Partial<DraftWork>) => void;
  toggleInWork: (key: "counties" | "languages", value: string) => void;

  needSlugs: Set<string>;
  toggleNeed: (slug: string) => void;
  supportSlugs: Set<string>;
  toggleSupport: (slug: string) => void;

  contacts: DraftContact[];
  addContact: () => void;
  updateContact: (index: number, patch: Partial<DraftContact>) => void;
  removeContact: (index: number) => void;

  cells: Set<string>;
  toggleCell: (day: number, hour: number) => void;

  dirty: boolean;
  saving: boolean;
  error: string | null;
  save: () => Promise<void>;
  cancel: () => void;
};

const ProfileDraftContext = createContext<Draft | null>(null);

export function useProfileDraft() {
  const draft = useContext(ProfileDraftContext);

  if (!draft) {
    throw new Error("useProfileDraft must be used inside ProfileDraftProvider.");
  }

  return draft;
}

/** Lists in the draft keep the order they were ticked, so compare them sorted. */
function sameWork(a: DraftWork, b: DraftWork) {
  return (
    a.hourlyRate === b.hourlyRate &&
    a.counties.slice().sort().join() === b.counties.slice().sort().join() &&
    a.otherCounty === b.otherCounty &&
    a.regionalCenterWorker === b.regionalCenterWorker &&
    a.regionalCenterName === b.regionalCenterName &&
    a.earliestStartDate === b.earliestStartDate &&
    a.languages.slice().sort().join() === b.languages.slice().sort().join() &&
    a.otherLanguage === b.otherLanguage &&
    a.carAndInsurance === b.carAndInsurance &&
    a.willingToDrive === b.willingToDrive &&
    a.maxTravelMiles === b.maxTravelMiles &&
    a.pets === b.pets &&
    a.nonSmoker === b.nonSmoker
  );
}

function sameSet(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false;
  for (const value of a) if (!b.has(value)) return false;
  return true;
}

/** Contacts carry no stable key when new, so compare them by value. */
function sameContacts(a: DraftContact[], b: DraftContact[]) {
  if (a.length !== b.length) return false;

  return a.every((contact, index) => {
    const other = b[index];
    return (
      contact.id === other.id &&
      contact.label === other.label &&
      contact.phone === other.phone &&
      contact.email === other.email &&
      contact.preferredContactMethod === other.preferredContactMethod
    );
  });
}

type Baseline = {
  name: string;
  bio: string;
  dateOfBirth: string;
  gender: string;
  workingAges: { min: string; max: string };
  work: DraftWork;
  needSlugs: Set<string>;
  supportSlugs: Set<string>;
  contacts: DraftContact[];
  cells: Set<string>;
};

/**
 * Holds everything on the profile that can be edited, so one save bar can commit
 * all of it.
 *
 * Dirty is derived by comparing against what the server last sent, not with an
 * `isDirty` flag somebody has to remember to set. It also means saving needs no
 * cleanup: once the server has the new values, the comparison goes false on its
 * own.
 *
 * Credentials are deliberately absent. A document is uploaded the moment it is
 * chosen and reviewed on its own, so holding it in a draft would only postpone
 * the review.
 */
export function ProfileDraftProvider({
  userId,
  initialName,
  initialBio,
  initialDateOfBirth,
  initialGender,
  initialAgeMin,
  initialAgeMax,
  initialWork,
  initialNeedSlugs,
  initialSupportSlugs,
  initialContacts,
  initialBlocks,
  children,
}: {
  userId: string;
  initialName: string | null;
  initialBio: string | null;
  initialDateOfBirth: string | null;
  initialGender: string | null;
  initialAgeMin: number | null;
  initialAgeMax: number | null;
  initialWork: DraftWork;
  initialNeedSlugs: string[];
  initialSupportSlugs: string[];
  initialContacts: DraftContact[];
  /**
   * Blocks rather than a Set. A Set cannot cross the server-to-client boundary,
   * and building it here keeps the conversion in one place.
   */
  initialBlocks: AvailabilityBlock[];
  children: ReactNode;
}) {
  const router = useRouter();

  const [name, setName] = useState(initialName ?? "");
  const [bio, setBio] = useState(initialBio ?? "");
  const [photo, setPhotoState] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState(initialDateOfBirth ?? "");
  const [gender, setGender] = useState(initialGender ?? "");
  const [workingAges, setWorkingAges] = useState({
    min: initialAgeMin === null ? "" : String(initialAgeMin),
    max: initialAgeMax === null ? "" : String(initialAgeMax),
  });
  const [work, setWorkState] = useState<DraftWork>(initialWork);
  const [needSlugs, setNeedSlugs] = useState<Set<string>>(
    () => new Set(initialNeedSlugs),
  );
  const [supportSlugs, setSupportSlugs] = useState<Set<string>>(
    () => new Set(initialSupportSlugs),
  );
  const [contacts, setContacts] = useState<DraftContact[]>(initialContacts);
  const [cells, setCells] = useState<Set<string>>(() => blocksToCells(initialBlocks));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileEditing, setProfileEditing] = useState(false);

  /**
   * What "unchanged" is measured against.
   *
   * It starts as the server's values, but saving moves it forward immediately —
   * rather than waiting for `router.refresh()` to send the new values back down
   * as props. Waiting meant the bar stayed on screen after a successful save,
   * which reads as "that did not work" and invites a second press.
   *
   * Deliberately not synced from props afterwards: the props arrive a beat later
   * and would fight with what the caregiver is doing. The only thing that moves
   * this is a save that succeeded.
   */
  const [baseline, setBaseline] = useState<Baseline>(() => ({
    name: initialName ?? "",
    bio: initialBio ?? "",
    dateOfBirth: initialDateOfBirth ?? "",
    gender: initialGender ?? "",
    workingAges: {
      min: initialAgeMin === null ? "" : String(initialAgeMin),
      max: initialAgeMax === null ? "" : String(initialAgeMax),
    },
    work: initialWork,
    needSlugs: new Set(initialNeedSlugs),
    supportSlugs: new Set(initialSupportSlugs),
    contacts: initialContacts,
    cells: blocksToCells(initialBlocks),
  }));

  const dirty =
    photo !== null ||
    name !== baseline.name ||
    bio !== baseline.bio ||
    dateOfBirth !== baseline.dateOfBirth ||
    gender !== baseline.gender ||
    workingAges.min !== baseline.workingAges.min ||
    workingAges.max !== baseline.workingAges.max ||
    !sameWork(work, baseline.work) ||
    !sameSet(needSlugs, baseline.needSlugs) ||
    !sameSet(supportSlugs, baseline.supportSlugs) ||
    !sameContacts(contacts, baseline.contacts) ||
    !sameSet(cells, baseline.cells);

  const setPhoto = useCallback((file: File) => {
    setPhotoState(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  }, []);

  const setWork = useCallback((patch: Partial<DraftWork>) => {
    setWorkState((current) => ({ ...current, ...patch }));
    setError(null);
  }, []);

  const toggleInWork = useCallback(
    (key: "counties" | "languages", value: string) => {
      setWorkState((current) => {
        const list = current[key];
        return {
          ...current,
          [key]: list.includes(value)
            ? list.filter((entry) => entry !== value)
            : [...list, value],
        };
      });
      setError(null);
    },
    [],
  );

  const addContact = useCallback(() => {
    setContacts((current) => [
      ...current,
      { label: "Mobile", phone: "", email: "", preferredContactMethod: "phone" },
    ]);
    setError(null);
  }, []);

  const updateContact = useCallback((index: number, patch: Partial<DraftContact>) => {
    setContacts((current) =>
      current.map((contact, i) => (i === index ? { ...contact, ...patch } : contact)),
    );
    setError(null);
  }, []);

  const removeContact = useCallback((index: number) => {
    setContacts((current) => current.filter((_, i) => i !== index));
    setError(null);
  }, []);

  const toggleNeed = useCallback((slug: string) => {
    setNeedSlugs((current) => toggle(current, slug));
    setError(null);
  }, []);

  const toggleSupport = useCallback((slug: string) => {
    setSupportSlugs((current) => toggle(current, slug));
    setError(null);
  }, []);

  const toggleCell = useCallback((day: number, hour: number) => {
    setCells((current) => toggle(current, `${day}-${hour}`));
    setError(null);
  }, []);

  const cancel = useCallback(() => {
    setName(baseline.name);
    setBio(baseline.bio);
    setDateOfBirth(baseline.dateOfBirth);
    setGender(baseline.gender);
    setWorkingAges(baseline.workingAges);
    setWorkState(baseline.work);
    setNeedSlugs(new Set(baseline.needSlugs));
    setSupportSlugs(new Set(baseline.supportSlugs));
    setPhotoState(null);
    setPreview(null);
    setContacts(baseline.contacts);
    setCells(new Set(baseline.cells));
    setError(null);
  }, [baseline]);

  const save = useCallback(async () => {
    // Only the parts that changed are written. Two independent things should not
    // be able to fail each other, and saving your hours should never depend on
    // anything about your name.
    const profileChanged =
      photo !== null || name !== baseline.name || bio !== baseline.bio;
    const capabilitiesChanged =
      dateOfBirth !== baseline.dateOfBirth ||
      gender !== baseline.gender ||
      workingAges.min !== baseline.workingAges.min ||
      workingAges.max !== baseline.workingAges.max ||
      !sameSet(needSlugs, baseline.needSlugs) ||
      !sameSet(supportSlugs, baseline.supportSlugs);
    const contactsChanged = !sameContacts(contacts, baseline.contacts);
    const availabilityChanged = !sameSet(cells, baseline.cells);
    const workChanged =
      work.hourlyRate !== baseline.work.hourlyRate ||
      work.counties.slice().sort().join() !== baseline.work.counties.slice().sort().join() ||
      work.otherCounty !== baseline.work.otherCounty ||
      work.regionalCenterWorker !== baseline.work.regionalCenterWorker ||
      work.regionalCenterName !== baseline.work.regionalCenterName ||
      work.earliestStartDate !== baseline.work.earliestStartDate;
    const languagesChanged =
      work.languages.slice().sort().join() !== baseline.work.languages.slice().sort().join() ||
      work.otherLanguage !== baseline.work.otherLanguage;
    const transportChanged =
      work.carAndInsurance !== baseline.work.carAndInsurance ||
      work.willingToDrive !== baseline.work.willingToDrive ||
      work.maxTravelMiles !== baseline.work.maxTravelMiles;
    const homeChanged =
      work.pets !== baseline.work.pets || work.nonSmoker !== baseline.work.nonSmoker;

    if (
      !profileChanged &&
      !capabilitiesChanged &&
      !contactsChanged &&
      !availabilityChanged &&
      !workChanged &&
      !languagesChanged &&
      !transportChanged &&
      !homeChanged
    ) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Uploads first, then writes. A failed upload leaves an orphaned file,
      // which is harmless; the reverse would leave a broken image.
      const avatarPath = photo ? await uploadAvatar(userId, photo) : undefined;

      const results = await Promise.all([
        profileChanged ? saveProfileAction({ name, bio, avatarPath }) : null,
        capabilitiesChanged
          ? saveCapabilitiesAction({
              needSlugs: [...needSlugs],
              supportSlugs: [...supportSlugs],
              dateOfBirth,
              gender,
              ageMin: workingAges.min,
              ageMax: workingAges.max,
            })
          : null,
        contactsChanged ? saveContactsAction(contacts) : null,
        availabilityChanged ? saveAvailabilityAction(cellsToBlocks(cells)) : null,
        workChanged
          ? saveWorkDetailsAction({
              hourlyRate: work.hourlyRate,
              counties: work.counties,
              otherCounty: work.otherCounty,
              regionalCenterWorker: work.regionalCenterWorker,
              regionalCenterName: work.regionalCenterName,
              earliestStartDate: work.earliestStartDate,
            })
          : null,
        languagesChanged
          ? saveLanguagesAction({
              languages: work.languages,
              otherLanguage: work.otherLanguage,
            })
          : null,
        transportChanged
          ? saveTransportationAction({
              carAndInsurance: work.carAndInsurance,
              willingToDrive: work.willingToDrive,
              maxTravelMiles: work.maxTravelMiles,
            })
          : null,
        homeChanged
          ? saveHomeEnvironmentAction({ pets: work.pets, nonSmoker: work.nonSmoker })
          : null,
      ]);

      const failure = results.find((result) => result?.error)?.error;

      if (failure) {
        setError(failure);
        return;
      }

      // Move the baseline first, so the bar slides away on this frame. Then
      // refresh, which re-renders the page with the server's own copy.
      setBaseline({
        name,
        bio,
        dateOfBirth,
        gender,
        workingAges,
        work,
        needSlugs: new Set(needSlugs),
        supportSlugs: new Set(supportSlugs),
        contacts,
        cells,
      });
      setPhotoState(null);
      setPreview(null);
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }, [
    userId,
    photo,
    name,
    bio,
    dateOfBirth,
    gender,
    workingAges,
    work,
    needSlugs,
    supportSlugs,
    contacts,
    cells,
    router,
    baseline,
  ]);

  const value = useMemo<Draft>(
    () => ({
      userId,
      profileEditing,
      setProfileEditing,
      name,
      setName,
      bio,
      setBio,
      photo,
      preview,
      setPhoto,
      dateOfBirth,
      setDateOfBirth,
      gender,
      setGender,
      workingAges,
      setWorkingAges,
      work,
      setWork,
      toggleInWork,
      needSlugs,
      toggleNeed,
      supportSlugs,
      toggleSupport,
      contacts,
      addContact,
      updateContact,
      removeContact,
      cells,
      toggleCell,
      dirty,
      saving,
      error,
      save,
      cancel,
    }),
    [
      userId,
      profileEditing,
      name,
      bio,
      photo,
      preview,
      setPhoto,
      dateOfBirth,
      gender,
      workingAges,
      work,
      setWork,
      toggleInWork,
      needSlugs,
      toggleNeed,
      supportSlugs,
      toggleSupport,
      contacts,
      addContact,
      updateContact,
      removeContact,
      cells,
      toggleCell,
      dirty,
      saving,
      error,
      save,
      cancel,
    ],
  );

  return (
    <ProfileDraftContext.Provider value={value}>
      {children}
    </ProfileDraftContext.Provider>
  );
}

function toggle(current: Set<string>, value: string) {
  const next = new Set(current);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}
