import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

/**
 * Makes sure the signed-in person has a household.
 *
 * NOT CALLED ANYWHERE YET, and that is deliberate. It used to run on every
 * sign-up and sign-in, which made every account a parent with a household —
 * including caregivers, who must never be either. Household creation now waits
 * until after payment, where the parent is asked to name it. That is the
 * billing feature's job; this stays here for it to call.
 */
export async function ensureHousehold(supabase: SupabaseClient<Database>) {
  const { error } = await supabase.rpc("ensure_household");

  if (error) {
    throw new Error(`Could not set up the account: ${error.message}`);
  }
}
