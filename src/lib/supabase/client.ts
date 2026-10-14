import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";
import type { Database } from "@/types/supabase";

/**
 * Supabase client for the browser.
 *
 * `createBrowserClient` keeps a singleton internally, so calling this on each
 * render is cheap. Configuration comes from the validated env module, so a
 * misconfigured deploy fails at boot rather than on the first query.
 *
 * `Database` is generated from the live schema by `pnpm db:types`. Regenerate
 * it after every migration so queries stay typed.
 */
export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
