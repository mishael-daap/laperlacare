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
  saveContactsAction,
  saveDocumentAction,
  saveProfileAction,
} from "@/lib/caregiver/actions";
import { blocksToCells, cellsToBlocks } from "@/lib/caregiver/availability";
import { uploadAvatar, uploadCaregiverDocument } from "@/lib/caregiver/storage";

export type DraftContact = {
  /** Absent until it has been saved once. */
  id?: string;
  label: string;
  phone: string;
  email: string;
  address: string;
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
   * common case.
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

  contacts: DraftContact[];
  addContact: () => void;
  updateContact: (index: number, patch: Partial<DraftContact>) => void;
  removeContact: (index: number) => void;

  documents: { id: string; kind: string; fileName: string | null }[];
  documentFile: File | null;
  documentName: string | null;
  setDocumentFile: (file: File) => void;

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

function sameCells(a: Set<string>, b: Set<string>) {
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
      contact.address === other.address
    );
  });
}

/**
 * Holds everything on the profile that can be edited, so one save bar can commit
 * all of it.
 *
 * Dirty is derived by comparing against what the server last sent, not with an
 * `isDirty` flag somebody has to remember to set. It also means saving needs no
 * cleanup: once the server has the new values, the comparison goes false on its
 * own.
 */
export function ProfileDraftProvider({
  userId,
  initialName,
  initialBio,
  initialContacts,
  initialDocuments,
  initialBlocks,
  children,
}: {
  userId: string;
  initialName: string | null;
  initialBio: string | null;
  initialContacts: DraftContact[];
  initialDocuments: { id: string; kind: string; fileName: string | null }[];
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
  const [contacts, setContacts] = useState<DraftContact[]>(initialContacts);
  const [documentFile, setDocumentFileState] = useState<File | null>(null);
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
  const [baseline, setBaseline] = useState(() => ({
    name: initialName ?? "",
    bio: initialBio ?? "",
    contacts: initialContacts,
    cells: blocksToCells(initialBlocks),
  }));

  const dirty =
    photo !== null ||
    documentFile !== null ||
    name !== baseline.name ||
    bio !== baseline.bio ||
    !sameContacts(contacts, baseline.contacts) ||
    !sameCells(cells, baseline.cells);

  const setPhoto = useCallback((file: File) => {
    setPhotoState(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  }, []);

  const setDocumentFile = useCallback((file: File) => {
    setDocumentFileState(file);
    setError(null);
  }, []);

  const addContact = useCallback(() => {
    setContacts((current) => [
      ...current,
      { label: "Mobile", phone: "", email: "", address: "" },
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

  const toggleCell = useCallback((day: number, hour: number) => {
    setCells((current) => {
      const next = new Set(current);
      const key = `${day}-${hour}`;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setError(null);
  }, []);

  const cancel = useCallback(() => {
    setName(baseline.name);
    setBio(baseline.bio);
    setPhotoState(null);
    setPreview(null);
    setContacts(baseline.contacts);
    setDocumentFileState(null);
    setCells(baseline.cells);
    setError(null);
  }, [baseline]);

  const save = useCallback(async () => {
    // Only the parts that changed are written. Two independent things should not
    // be able to fail each other, and saving your hours should never depend on
    // anything about your name.
    const profileChanged =
      photo !== null || name !== baseline.name || bio !== baseline.bio;
    const contactsChanged = !sameContacts(contacts, baseline.contacts);
    const availabilityChanged = !sameCells(cells, baseline.cells);

    if (!profileChanged && !contactsChanged && !availabilityChanged && !documentFile) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Uploads first, then writes. A failed upload leaves an orphaned file,
      // which is harmless; the reverse would leave a broken image or a document
      // row pointing at nothing.
      const avatarPath = photo ? await uploadAvatar(userId, photo) : undefined;
      const documentPath = documentFile
        ? await uploadCaregiverDocument(userId, documentFile)
        : null;

      const results = await Promise.all([
        profileChanged ? saveProfileAction({ name, bio, avatarPath }) : null,
        contactsChanged ? saveContactsAction(contacts) : null,
        availabilityChanged ? saveAvailabilityAction(cellsToBlocks(cells)) : null,
        documentPath
          ? saveDocumentAction({
              kind: "background_check",
              storagePath: documentPath,
              fileName: documentFile?.name ?? "document",
            })
          : null,
      ]);

      const failure = results.find((result) => result?.error)?.error;

      if (failure) {
        setError(failure);
        return;
      }

      // Move the baseline first, so the bar slides away on this frame. Then
      // refresh, which re-renders the page with the server's own copy.
      setBaseline({ name, bio, contacts, cells });
      setPhotoState(null);
      setPreview(null);
      setDocumentFileState(null);
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }, [userId, photo, name, bio, contacts, documentFile, cells, router, baseline]);

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
      contacts,
      addContact,
      updateContact,
      removeContact,
      documents: initialDocuments,
      documentFile,
      documentName: documentFile?.name ?? null,
      setDocumentFile,
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
      contacts,
      addContact,
      updateContact,
      removeContact,
      initialDocuments,
      documentFile,
      setDocumentFile,
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
