import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

/**
 * Runs before every request that is not a static asset. The auth work lives in
 * `updateSession` so it can be read and tested on its own.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match every path except:
     * - _next/static, _next/image  (build output and image optimisation)
     * - favicon.ico
     * - image files
     * Without this the proxy would run on assets, and an auth redirect could
     * block CSS or images from loading.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
