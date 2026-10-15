import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

/**
 * Whether the signed-in person is a caregiver.
 *
 * The row's existence is the whole test — there is no role column. The query is
 * filtered by the caller's own id rather than relying on the policy, because
 * the read policy also exposes approved caregivers to everyone, so an approved
 * caregiver would otherwise match several rows.
 */
export async function isCaregiver(supabase: SupabaseClient<Database>) {
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;

  if (!userId) return false;

  const { data } = await supabase
    .from("caregivers")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  return Boolean(data);
}
