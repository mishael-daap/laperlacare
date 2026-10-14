import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";

/**
 * Refreshes the Supabase session on every request.
 *
 * Next.js 16 renamed the `middleware` file convention to `proxy`. A file still
 * named `middleware.ts` is silently never called on 16, which stops sessions
 * refreshing and signs users out at random.
 *
 * This is the only place tokens are refreshed. Refreshing in a second place
 * trips Supabase's refresh-token reuse detection, which revokes the whole
 * session — it surfaces as random logouts rather than an error.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );

          // The library hands over Cache-Control, Expires, and Pragma for the
          // refreshed cookies. Dropping them lets a CDN cache one user's
          // session response and serve it to somebody else.
          for (const [key, value] of Object.entries(headers)) {
            supabaseResponse.headers.set(key, value);
          }
        },
      },
    },
  );

  // Do not insert code between creating the client and this call. It is what
  // refreshes an expiring token, and moving it breaks session handling in ways
  // that are hard to trace.
  await supabase.auth.getClaims();

  // Return this exact object. A different response would not carry the
  // refreshed cookies, and the browser and server would fall out of sync.
  return supabaseResponse;
}
