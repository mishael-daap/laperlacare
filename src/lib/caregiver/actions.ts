"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { capabilitiesInput } from "@/lib/caregiver/capabilities";
import { DOCUMENT_KINDS, type DocumentKind } from "@/lib/caregiver/credentials";
import { createClient } from "@/lib/supabase/server";

export type SaveState = { error?: string; ok?: boolean } | undefined;

/**
 * Every stage saves on its own, so the modal can be closed at any point without
 * losing what was already typed. Nothing here requires the other stages to be
 * done first, and nothing here is required to finish — the profile is editable
 * forever, and the modal is only a guided pass over it.
 *
 * None of these set `verification_status`. The database guard refuses that from
 * anybody who is not an admin, so a bug here could not approve anybody.
 */

async function caller() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) {
    throw new Error("Not signed in.");
  }

  return { supabase, userId };
}

/**
 * Syncs the whole list rather than saving one contact at a time.
 *
 * The page holds a draft list, so a caregiver can add two and delete one and
 * then press Save once. That means working out the difference here: rows that
 * disappeared get deleted, rows with an id get updated, rows without one are
 * new. Saving each edit as it happened would have meant a database write every
 * time somebody typed in a field, which is the opposite of what the save bar is
 * for.
 */
export async function saveContactsAction(
  contacts: {
    id?: string;
    label: string;
    phone: string;
    email: string;
    address: string;
  }[],
): Promise<SaveState> {
  const { supabase, userId } = await caller();

  const { data: existing, error: readError } = await supabase
    .from("contacts")
    .select("id")
    .eq("user_id", userId);

  if (readError) {
    return { error: readError.message };
  }

  const kept = new Set(contacts.map((contact) => contact.id).filter(Boolean));
  const removed = (existing ?? [])
    .map((row) => row.id)
    .filter((id) => !kept.has(id));

  if (removed.length > 0) {
    const { error } = await supabase.from("contacts").delete().in("id", removed);

    if (error) {
      return { error: error.message };
    }
  }

  for (const contact of contacts) {
    const values = {
      label: contact.label.trim() || "Contact",
      phone: contact.phone.trim() || null,
      email: contact.email.trim() || null,
      address: contact.address.trim() || null,
    };

    const { error } = contact.id
      ? await supabase.from("contacts").update(values).eq("id", contact.id)
      : await supabase.from("contacts").insert({ ...values, user_id: userId });

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/me");
  return { ok: true };
}

/**
 * Name, bio, and avatar are edited on the profile itself rather than through the
 * onboarding modal. They are the things a caregiver changes on a whim, and
 * putting them behind a three-step dialog made opening the dialog the price of
 * fixing a typo.
 *
 * Nothing here is required. A name used to be, and that was wrong: a caregiver
 * who only wanted to set their hours, or only their bio, would hit "add the name
 * families will see" for a field they had not touched. Completeness already
 * tells them what is still missing; refusing the save as well is just a wall.
 *
 * An empty name is stored as null, which the column allows.
 */
export async function saveProfileAction(input: {
  name: string;
  bio: string;
  /** Only present when a new photo was chosen. */
  avatarPath?: string;
}): Promise<SaveState> {
  const { supabase, userId } = await caller();

  const { error } = await supabase
    .from("caregivers")
    .update({
      display_name: input.name.trim() || null,
      bio: input.bio.trim() || null,
      ...(input.avatarPath ? { avatar_path: input.avatarPath } : {}),
    })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/me");
  return { ok: true };
}

/**
 * Called by the browser after it has uploaded the file, because the upload
 * happens directly against Storage and never passes through the server. The
 * path is written here rather than there so the revalidation happens in one
 * place.
 */
export async function saveAvatarPathAction(avatarPath: string): Promise<SaveState> {
  const { supabase, userId } = await caller();

  const { error } = await supabase
    .from("caregivers")
    .update({ avatar_path: avatarPath })
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/me");
  return { ok: true };
}

/**
 * Capabilities are saved whole, in one function call.
 *
 * The two tag sets, the date of birth, the gender, and the working age range go
 * together or not at all — a save that landed half-applied would leave a
 * caregiver searchable by needs they had just removed.
 */
export async function saveCapabilitiesAction(input: unknown): Promise<SaveState> {
  const parsed = capabilitiesInput.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const { supabase } = await caller();

  const { error } = await supabase.rpc("save_caregiver_capabilities", {
    p_needs: parsed.data.needSlugs,
    p_supports: parsed.data.supportSlugs,
    p_date_of_birth: parsed.data.dateOfBirth ?? undefined,
    p_gender: parsed.data.gender ?? undefined,
    p_age_min: parsed.data.ageMin ?? undefined,
    p_age_max: parsed.data.ageMax ?? undefined,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/me");
  return { ok: true };
}

const documentKinds = DOCUMENT_KINDS.map((kind) => kind.value) as [
  DocumentKind,
  ...DocumentKind[],
];

const documentInput = z.object({
  kind: z.enum(documentKinds, { error: "Choose a document kind." }),
  /** Optional: not every document has one. */
  expiresAt: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .pipe(z.iso.date({ error: "Enter a valid expiry date." }).nullable())
    .refine((value) => value === null || value >= new Date().toISOString().slice(0, 10), "That date has already passed."),
  storagePath: z.string().min(1, "Choose a file."),
  fileName: z.string().min(1, "Choose a file."),
});

/**
 * Records an uploaded document.
 *
 * The row can only ever be inserted with the default review status: RLS refuses
 * anything else, which is what stops a caregiver approving their own file.
 *
 * One document per kind is a rule of the app, not of the schema. Adding a CPR
 * card replaces the old one, so the reviewer is never looking at two files that
 * claim the same thing, and the kind returns to pending review on its own.
 *
 * Uploading a document is also what submits the profile, so `submitted_at` is
 * stamped the first time and never cleared.
 */
export async function addDocumentAction(input: unknown): Promise<SaveState> {
  const parsed = documentInput.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the file and try again." };
  }

  const { supabase, userId } = await caller();

  // The bucket policy already scopes writes to the caller's folder. Checking the
  // path here as well means a mis-keyed path fails before an upload has happened.
  if (!parsed.data.storagePath.startsWith(`${userId}/`)) {
    return { error: "That upload did not belong to this account." };
  }

  const { error: clearError } = await supabase
    .from("caregiver_documents")
    .delete()
    .eq("caregiver_id", userId)
    .eq("kind", parsed.data.kind);

  if (clearError) {
    return { error: clearError.message };
  }

  const { error } = await supabase.from("caregiver_documents").insert({
    caregiver_id: userId,
    kind: parsed.data.kind,
    storage_path: parsed.data.storagePath,
    file_name: parsed.data.fileName,
    expires_at: parsed.data.expiresAt,
  });

  if (error) {
    return { error: error.message };
  }

  const { data: profile } = await supabase
    .from("caregivers")
    .select("submitted_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (profile && !profile.submitted_at) {
    const { error: submitError } = await supabase
      .from("caregivers")
      .update({ submitted_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (submitError) {
      return { error: submitError.message };
    }
  }

  revalidatePath("/me");
  revalidatePath("/admin/caregiver");
  return { ok: true };
}

/**
 * Removing an approved document is allowed, and it costs the caregiver their
 * badge until a replacement is approved. The page says so before they press it.
 */
export async function removeDocumentAction(documentId: string): Promise<SaveState> {
  const parsed = z.uuid({ error: "That document id is not valid." }).safeParse(documentId);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const { supabase, userId } = await caller();

  const { error } = await supabase
    .from("caregiver_documents")
    .delete()
    .eq("id", parsed.data)
    .eq("caregiver_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/me");
  revalidatePath("/admin/caregiver");
  return { ok: true };
}

export type AvailabilityBlock = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

/**
 * The board is saved whole, which is what the data model specified: clear the
 * caregiver's rows and insert the new set. Diffing blocks would mean matching
 * up dozens of rows to work out which moved, for a grid the size of a week.
 *
 * One transaction is the point — a half-applied week would leave a caregiver
 * with availability that is neither the old set nor the new one.
 */
export async function saveAvailabilityAction(
  blocks: AvailabilityBlock[],
): Promise<SaveState> {
  const { supabase, userId } = await caller();

  const { error: clearError } = await supabase
    .from("caregiver_availability")
    .delete()
    .eq("caregiver_id", userId);

  if (clearError) {
    return { error: clearError.message };
  }

  if (blocks.length === 0) {
    revalidatePath("/me");
    return { ok: true };
  }

  const { error } = await supabase.from("caregiver_availability").insert(
    blocks.map((block) => ({
      caregiver_id: userId,
      day_of_week: block.day_of_week,
      start_time: block.start_time,
      end_time: block.end_time,
    })),
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/me");
  return { ok: true };
}
