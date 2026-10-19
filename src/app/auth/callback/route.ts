import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { isAdmin } from "@/lib/admin/is-admin";
import { ensureCaregiverRow } from "@/lib/caregiver/ensure-caregiver-row";
import { isCaregiver } from "@/lib/caregiver/is-caregiver";
import { createClient } from "@/lib/supabase/server";

/**
 * Where Google sends people back to.
 *
 * The URL carries a one-time `code`, not a session. Exchanging it is what
 * finally sets the session cookies, and it can only be done once.
 *
 * The destination is decided after the exchange, from whether the person turns
 * out to be a caregiver — not from where they started. Otherwise a caregiver
 * signing in through the ordinary sign-in page would land on the public
 * catalogue instead of their own page.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requested = searchParams.get("next") ?? "";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?error=Missing%20code`);
  }

  const store = await cookies();
  const startedAsCaregiver = store.get("signup_intent")?.value === "caregiver";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(error.message)}`,
    );
  }

  // Only now is there a session, so only now can the row be written.
  if (startedAsCaregiver && data.user) {
    await ensureCaregiverRow(supabase, data.user.id);
    store.delete("signup_intent");
  }

  // Admin first, for the same reason as the password path: an admin holds a row
  // in `admins`, which is a deliberate appointment rather than an accident of
  // also being a caregiver.
  const fallback = (await isAdmin(supabase))
    ? "/admin/caregiver"
    : (await isCaregiver(supabase))
      ? "/me"
      : "/caregivers";

  // Same-site paths only, or a crafted link could bounce someone to another
  // site straight after signing in here.
  const next =
    requested.startsWith("/") && !requested.startsWith("//") ? requested : fallback;

  return NextResponse.redirect(`${origin}${next}`);
}
