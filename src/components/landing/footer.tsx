import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

/**
 * The footer, and the only part of the app that knows who is signed in.
 *
 * Rendered per page rather than in the root layout: the profile page must not
 * have it, and a layout cannot hand something back that the root layout already
 * rendered. Pages that want it render it; pages that do not, do not.
 *
 * It cannot be prerendered, which is why `SiteFooter` wraps it in Suspense —
 * the page shell stays static and this one strip is resolved per request.
 */
export async function Footer() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-foreground px-6 py-12 text-background sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
        <p className="text-sm text-background/70">© {year} La Perla Care</p>

        {data?.claims ? (
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-background/70 hover:bg-transparent hover:text-background"
            >
              Sign out
            </Button>
          </form>
        ) : null}
      </div>
    </footer>
  );
}

/**
 * Drop this at the bottom of a page to give it a footer. The fallback repeats
 * the real footer's padding and background so nothing shifts when it arrives.
 */
export function SiteFooter() {
  return (
    <Suspense fallback={<div className="bg-foreground px-6 py-12 sm:px-10 lg:px-16" />}>
      <Footer />
    </Suspense>
  );
}
