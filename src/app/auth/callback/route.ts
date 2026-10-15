import { NextResponse, type NextRequest } from "next/server";

import { ensureHousehold } from "@/lib/auth/ensure-household";
import { createClient } from "@/lib/supabase/server";

/**
 * Where Google sends people back to.
 *
 * The URL carries a one-time `code`, not a session. Exchanging it is what
 * finally sets the session cookies, and it can only be done once.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requested = searchParams.get("next") ?? "/caregivers";

  // Same-site paths only, or a crafted link could bounce someone to another
  // site straight after signing in here.
  const next =
    requested.startsWith("/") && !requested.startsWith("//") ? requested : "/caregivers";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?error=Missing%20code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(error.message)}`,
    );
  }

  await ensureHousehold(supabase);

  return NextResponse.redirect(`${origin}${next}`);
}
