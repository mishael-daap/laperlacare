"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isAdmin } from "@/lib/admin/is-admin";
import { ensureHousehold } from "@/lib/auth/ensure-household";
import { isCaregiver } from "@/lib/caregiver/is-caregiver";
import { createClient } from "@/lib/supabase/server";

import { careWindowInput, caregiverGender, childInput, normaliseTime } from "./validation";

export type HouseholdState = { error?: string; ok?: boolean };

const id = z.uuid({ error: "That id is not valid." });

/**
 * A signed-in parent, or null.
 *
 * The page already redirects caregivers and admins, but a server action is
 * reachable by a direct POST. Checking here as well is what stops a caregiver
 * calling an action that creates a household for them.
 */
async function parentClient() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims?.sub) return null;

  if (await isAdmin(supabase)) return null;
  if (await isCaregiver(supabase)) return null;

  return supabase;
}

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Check the form and try again.";
}

export async function saveGenderPreferenceAction(gender: string): Promise<HouseholdState> {
  const parsed = caregiverGender.safeParse(gender);

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const supabase = await parentClient();

  if (!supabase) {
    return { error: "Not authorized." };
  }

  const householdId = await ensureHousehold(supabase);

  const { error, count } = await supabase
    .from("households")
    .update({ preferred_caregiver_gender: parsed.data }, { count: "exact" })
    .eq("id", householdId);

  if (error) {
    return { error: error.message };
  }

  if (count === 0) {
    return { error: "Could not find your household." };
  }

  revalidatePath("/household");
  return { ok: true };
}

/**
 * Creates or updates a child and replaces both tag sets in one transaction.
 *
 * `save_child` resolves the household from the session, so the only id the app
 * sends is the child's and only when editing.
 */
export async function saveChildAction(input: unknown): Promise<HouseholdState> {
  const parsed = childInput.safeParse(input);

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const supabase = await parentClient();

  if (!supabase) {
    return { error: "Not authorized." };
  }

  const args: {
    p_child_id?: string;
    p_full_name: string;
    p_date_of_birth: string;
    p_notes: string;
    p_needs: string[];
    p_supports: string[];
  } = {
    p_full_name: parsed.data.fullName,
    p_date_of_birth: parsed.data.dateOfBirth,
    p_notes: parsed.data.notes,
    p_needs: parsed.data.needSlugs,
    p_supports: parsed.data.supportSlugs,
  };

  if (parsed.data.childId) {
    args.p_child_id = parsed.data.childId;
  }

  const { error } = await supabase.rpc("save_child", args);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/household");
  return { ok: true };
}

export async function deleteChildAction(childId: string): Promise<HouseholdState> {
  const parsed = id.safeParse(childId);

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const supabase = await parentClient();

  if (!supabase) {
    return { error: "Not authorized." };
  }

  const { error, count } = await supabase
    .from("children")
    .delete({ count: "exact" })
    .eq("id", parsed.data);

  if (error) {
    return { error: error.message };
  }

  if (count === 0) {
    return { error: "That child no longer exists." };
  }

  revalidatePath("/household");
  return { ok: true };
}

export async function addCareWindowAction(input: unknown): Promise<HouseholdState> {
  const parsed = careWindowInput.safeParse(input);

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const supabase = await parentClient();

  if (!supabase) {
    return { error: "Not authorized." };
  }

  const householdId = await ensureHousehold(supabase);

  const { error } = await supabase.from("household_availability").insert({
    household_id: householdId,
    day_of_week: parsed.data.dayOfWeek,
    start_time: normaliseTime(parsed.data.startTime),
    end_time: normaliseTime(parsed.data.endTime),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/household");
  return { ok: true };
}

export async function removeCareWindowAction(windowId: string): Promise<HouseholdState> {
  const parsed = id.safeParse(windowId);

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const supabase = await parentClient();

  if (!supabase) {
    return { error: "Not authorized." };
  }

  const { error, count } = await supabase
    .from("household_availability")
    .delete({ count: "exact" })
    .eq("id", parsed.data);

  if (error) {
    return { error: error.message };
  }

  if (count === 0) {
    return { error: "That day no longer exists." };
  }

  revalidatePath("/household");
  return { ok: true };
}
