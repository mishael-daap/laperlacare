import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { MatchOptions, MatchRow } from "./options";

/**
 * The two reads the matching page needs, and the only callers of the RPC.
 *
 * `match_caregivers` returns reasons and gaps as words, because they quote the
 * household's own rows; building them here would mean shipping the child's needs
 * to the browser just to print a sentence.
 */
export async function getMatches(
  supabase: SupabaseClient<Database>,
  options: MatchOptions,
): Promise<MatchRow[]> {
  const { data, error } = await supabase.rpc("match_caregivers", {
    p_hours: options.hours,
    p_partial: options.partial,
    p_max_rate: options.maxRate ?? undefined,
    p_gender: options.gender,
  });

  if (error) throw new Error(error.message);

  return (data ?? []) as MatchRow[];
}

/** The caregiver ids this household has kept, in the order they were saved. */
export async function getShortlist(
  supabase: SupabaseClient<Database>,
  householdId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("caregiver_shortlist")
    .select("caregiver_id")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => row.caregiver_id);
}

/**
 * One caregiver, if they are public.
 *
 * The profile page reuses the match projection rather than reading the caregiver
 * table directly: the tier, the reasons and the gaps are the point of the page,
 * and reading them from the same function keeps one definition of "matches".
 */
export async function getMatch(
  supabase: SupabaseClient<Database>,
  caregiverId: string,
  options: MatchOptions,
): Promise<MatchRow | null> {
  const rows = await getMatches(supabase, options);

  return rows.find((row) => row.caregiver_id === caregiverId) ?? null;
}
