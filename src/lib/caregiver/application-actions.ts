"use server";

import { revalidatePath } from "next/cache";

import {
  conditionsInput,
  experienceInput,
  personalDetailsInput,
  questionsInput,
  referencesInput,
  signatureInput,
} from "@/lib/caregiver/application";
import { STATEMENT_VERSION } from "@/lib/caregiver/application-statement";
import { createClient } from "@/lib/supabase/server";

export type SaveState = { error?: string; ok?: boolean } | undefined;

/**
 * Every write on the application page.
 *
 * One action per section, because one section saves at a time — a caregiver
 * fills this in across several sittings and a save that refused because a
 * different section was half-typed would be a wall in front of the person doing
 * the work.
 *
 * None of these is reachable once the application is submitted. That is not
 * enforced here: the `caregivers_guard_application_lock` trigger refuses the
 * write and its message is what comes back, which means the rule holds for any
 * caller rather than only for this file.
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

function firstIssue(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Check the form and try again.";
}

const APPLICATION = "/application";

function revalidateApplication() {
  revalidatePath(APPLICATION);
  revalidatePath("/me");
  revalidatePath("/onboarding");
  revalidatePath("/admin/caregiver");
}

export async function saveApplicationDetailsAction(input: unknown): Promise<SaveState> {
  const parsed = personalDetailsInput.safeParse(input);

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { supabase, userId } = await caller();

  const { error } = await supabase
    .from("caregivers")
    .update({
      legal_name: parsed.data.legalName.trim() || null,
      address_street: parsed.data.addressStreet.trim() || null,
      address_city: parsed.data.addressCity.trim() || null,
      address_postal_code: parsed.data.addressPostalCode.trim() || null,
      referral_source: parsed.data.referralSource.trim() || null,
    })
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidateApplication();
  return { ok: true };
}

export async function saveConditionsAction(input: unknown): Promise<SaveState> {
  const parsed = conditionsInput.safeParse(input);

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { supabase, userId } = await caller();

  const { error } = await supabase
    .from("caregivers")
    .update({
      conditions: parsed.data.conditions,
      // A label with no tick is a leftover, not an answer. The database refuses
      // a tick with no label; this drops the reverse.
      other_condition: parsed.data.conditions.includes("other")
        ? parsed.data.otherCondition.trim() || null
        : null,
    })
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidateApplication();
  return { ok: true };
}

export async function saveQuestionsAction(input: unknown): Promise<SaveState> {
  const parsed = questionsInput.safeParse(input);

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { supabase, userId } = await caller();

  const { error } = await supabase
    .from("caregivers")
    .update({
      why_special_needs: parsed.data.whySpecialNeeds.trim() || null,
      difficult_moment: parsed.data.difficultMoment.trim() || null,
    })
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidateApplication();
  return { ok: true };
}

/**
 * Experience and references are replace-sets, so they go through a function:
 * a delete and an insert cannot be one transaction through the Data API.
 */
export async function saveExperienceAction(input: unknown): Promise<SaveState> {
  const parsed = experienceInput.safeParse(input);

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { supabase } = await caller();

  const { error } = await supabase.rpc("save_caregiver_experience", {
    p_rows: parsed.data.rows.map((row) => ({
      employer: row.employer,
      role: row.role,
      started_on: row.startedOn,
      ended_on: row.endedOn ?? "",
      ages_and_needs: row.agesAndNeeds,
    })),
  });

  if (error) return { error: error.message };

  revalidateApplication();
  return { ok: true };
}

export async function saveReferencesAction(input: unknown): Promise<SaveState> {
  const parsed = referencesInput.safeParse(input);

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { supabase } = await caller();

  const { error } = await supabase.rpc("save_caregiver_references", {
    p_rows: parsed.data.rows.map((row) => ({
      full_name: row.fullName,
      relationship: row.relationship,
      organisation: row.organisation,
      phone: row.phone,
      email: row.email,
      known_for: row.knownFor,
    })),
  });

  if (error) return { error: error.message };

  revalidateApplication();
  return { ok: true };
}

/**
 * The signature, and therefore the submission.
 *
 * The version comes from the statement module rather than from the form: it is
 * what was on screen, and a client that could name its own version could claim
 * somebody agreed to wording they never saw.
 *
 * The database does the rest of the checking — age, completeness, the references,
 * the two answers — because it has to read four tables to answer, and because a
 * rule that lives in one place cannot be bypassed by a second caller.
 */
export async function submitApplicationAction(input: unknown): Promise<SaveState> {
  const parsed = signatureInput.safeParse(input);

  if (!parsed.success) {
    return { error: firstIssue(parsed.error) };
  }

  const { supabase } = await caller();

  const { error } = await supabase.rpc("submit_caregiver_application", {
    p_signature_name: parsed.data.signatureName,
    p_statement_version: STATEMENT_VERSION,
  });

  if (error) return { error: error.message };

  revalidateApplication();
  return { ok: true };
}

/** The consent checkbox is its own small write, because it is its own decision. */
export async function saveBackgroundCheckAgreementAction(
  agreed: boolean,
): Promise<SaveState> {
  const { supabase, userId } = await caller();

  const { error } = await supabase
    .from("caregivers")
    .update({ background_check_agreed: agreed })
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidateApplication();
  return { ok: true };
}
