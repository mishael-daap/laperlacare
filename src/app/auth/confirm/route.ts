import type { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { ensureCaregiverRow } from "@/lib/caregiver/ensure-caregiver-row";
import { isCaregiver } from "@/lib/caregiver/is-caregiver";
import { createClient } from "@/lib/supabase/server";

/**
 * Where an email confirmation link lands.
 *
 * Unused while email confirmation is off, and built anyway: switching it on
 * before launch should be a dashboard setting rather than a coding task. The
 * email template has to point here with the token hash, not at Supabase's own
 * confirmation URL, or the session ends up in the URL fragment where a server
 * route cannot read it.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const requested = searchParams.get("next") ?? "";

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent("That link is missing its token.")}`,
    );
  }

  const store = await cookies();
  const startedAsCaregiver = store.get("signup_intent")?.value === "caregiver";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(error.message)}`,
    );
  }

  // This is the caregiver path when confirmation is on: sign-up could not write
  // the row because there was no session yet. The intent cookie survives the
  // round trip, so this is where it gets done.
  if (startedAsCaregiver && data.user) {
    await ensureCaregiverRow(supabase, data.user.id);
    store.delete("signup_intent");
  }

  let fallback = "/caregivers";

  if (await isCaregiver(supabase)) {
    const { data: claims } = await supabase.auth.getClaims();
    const { data: profile } = await supabase
      .from("caregivers")
      .select("submitted_at")
      .eq("user_id", claims?.claims?.sub ?? "")
      .maybeSingle();

    fallback = profile?.submitted_at ? "/me" : "/onboarding";
  }

  const next =
    requested.startsWith("/") && !requested.startsWith("//") ? requested : fallback;

  return NextResponse.redirect(`${origin}${next}`);
}
