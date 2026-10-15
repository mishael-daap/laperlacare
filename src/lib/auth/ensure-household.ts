import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

/**
 * Makes sure the signed-in person has a household.
 *
 * Called after a session first exists — on sign-up, on sign-in, and on the
 * OAuth callback. Safe to call every time: the function behind it returns the
 * existing household when there is one and only creates on the first call.
 *
 * It has to happen silently. There is no household screen and there may never
 * be one, but the subscription attaches to a household, so an account without
 * one could not be billed later.
 */
export async function ensureHousehold(supabase: SupabaseClient<Database>) {
  const { error } = await supabase.rpc("ensure_household");

  if (error) {
    throw new Error(`Could not set up the account: ${error.message}`);
  }
}
