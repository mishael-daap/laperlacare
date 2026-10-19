import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

/**
 * Whether the signed-in person is an internal admin.
 *
 * The same shape as `isCaregiver`: a row in the role table is the whole test,
 * and the query is filtered by the caller's own id rather than leaning on the
 * policy, which only ever exposes an admin their own row anyway.
 *
 * Server-side only by convention, not by marker. The `admins` table has no
 * policies that would let a browser read anything else, but the answer is used
 * to decide what to render, and that decision belongs on the server.
 */
export async function isAdmin(supabase: SupabaseClient<Database>) {
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;

  if (!userId) return false;

  const { data } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  return Boolean(data);
}
