"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isAdmin } from "@/lib/admin/is-admin";
import { ensureHousehold } from "@/lib/auth/ensure-household";
import { isCaregiver } from "@/lib/caregiver/is-caregiver";
import { createClient } from "@/lib/supabase/server";

export type ShortlistState = { error?: string; ok?: boolean };

const id = z.uuid({ error: "That caregiver id is not valid." });

/**
 * A signed-in parent, or null.
 *
 * The page already refuses caregivers and admins, but an action is reachable by
 * a direct POST, and `ensureHousehold` would happily hand a household to any
 * authenticated caller.
 */
async function parentClient() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims?.sub) return null;
  if (await isAdmin(supabase)) return null;
  if (await isCaregiver(supabase)) return null;

  return supabase;
}

export async function saveCaregiverAction(caregiverId: string): Promise<ShortlistState> {
  const parsed = id.safeParse(caregiverId);

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid id." };

  const supabase = await parentClient();
  if (!supabase) return { error: "Not authorized." };

  const householdId = await ensureHousehold(supabase);

  // `ignoreDuplicates` so pressing save twice is a no-op rather than an error:
  // the pair is the primary key, and saving something already saved is not a
  // mistake worth reporting.
  const { error } = await supabase.from("caregiver_shortlist").upsert(
    { household_id: householdId, caregiver_id: parsed.data },
    { onConflict: "household_id,caregiver_id", ignoreDuplicates: true },
  );

  if (error) return { error: error.message };

  revalidatePath("/matches");

  return { ok: true };
}

export async function removeCaregiverAction(caregiverId: string): Promise<ShortlistState> {
  const parsed = id.safeParse(caregiverId);

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid id." };

  const supabase = await parentClient();
  if (!supabase) return { error: "Not authorized." };

  const householdId = await ensureHousehold(supabase);

  const { error } = await supabase
    .from("caregiver_shortlist")
    .delete()
    .eq("household_id", householdId)
    .eq("caregiver_id", parsed.data);

  if (error) return { error: error.message };

  revalidatePath("/matches");

  return { ok: true };
}
