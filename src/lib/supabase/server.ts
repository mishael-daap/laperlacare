import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/env";
import type { Database } from "@/types/supabase";

/**
 * Supabase client for Server Components, Server Actions, and Route Handlers.
 *
 * Create a new client inside each function that needs one. Hoisting it to a
 * module-level variable would let one request's cookies leak into another's
 * response.
 *
 * To check who the caller is, use `supabase.auth.getClaims()`. Never trust
 * `getSession()` for authorization: it reads the cookie without revalidating it.
 *
 * `Database` is generated from the live schema by `pnpm db:types`. Regenerate
 * it after every migration so queries stay typed.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot write cookies, so this throws when the
            // library tries to refresh a session during render. That is safe to
            // ignore: the proxy refreshes the session and writes the updated
            // cookies on every request.
          }
        },
      },
    },
  );
}
