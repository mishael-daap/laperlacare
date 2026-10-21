import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

/**
 * Makes sure the signed-in person has a household, and returns its id.
 *
 * Called by the household page after it has established that the caller is a
 * parent. Caregivers and admins are redirected before this runs, which matters:
 * this function will happily create a household for any authenticated user, and
 * a caregiver must never be given one.
 *
 * Idempotent by design. Opening the page twice returns the same household
 * instead of creating a second one.
 */
export async function ensureHousehold(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.rpc("ensure_household");

  if (error) {
    throw new Error(`Could not set up the account: ${error.message}`);
  }

  if (!data) {
    throw new Error("Could not set up the account: no household was returned.");
  }

  return data;
}
