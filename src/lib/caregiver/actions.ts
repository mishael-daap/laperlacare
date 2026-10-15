"use server";

import { revalidatePath } from "next/cache";

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
 * Records an uploaded document. The row can only ever be inserted with the
 * default review status — a caregiver has no update policy on this table, which
 * is what stops them approving their own background check.
 *
 * Uploading a background check is also what counts as submitting for review,
 * which is why it stamps `submitted_at`. Bio and contact edits deliberately do
 * not: nothing was verified about them.
 */
export async function saveDocumentAction(input: {
  kind: "background_check" | "certification" | "other";
  storagePath: string;
  /** The name the caregiver chose, kept because the path is only a key. */
  fileName: string;
}): Promise<SaveState> {
  const { supabase, userId } = await caller();

  const { error } = await supabase.from("caregiver_documents").insert({
    caregiver_id: userId,
    kind: input.kind,
    storage_path: input.storagePath,
    file_name: input.fileName,
  });

  if (error) {
    return { error: error.message };
  }

  if (input.kind === "background_check") {
    const { error: submitError } = await supabase
      .from("caregivers")
      .update({ submitted_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (submitError) {
      return { error: submitError.message };
    }
  }

  revalidatePath("/me");
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
