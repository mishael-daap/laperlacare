import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { ensureHousehold } from "@/lib/auth/ensure-household";
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
  const requested = searchParams.get("next") ?? "/caregivers";

  const next =
    requested.startsWith("/") && !requested.startsWith("//") ? requested : "/caregivers";

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent("That link is missing its token.")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(error.message)}`,
    );
  }

  await ensureHousehold(supabase);

  return NextResponse.redirect(`${origin}${next}`);
}
