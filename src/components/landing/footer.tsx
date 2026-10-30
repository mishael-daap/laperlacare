import Link from "next/link";
import { Suspense } from "react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

const linkClass =
  "text-sm text-brand-sage-300 underline-offset-4 transition-colors hover:text-brand-pearl hover:underline";

/**
 * The forest mast, and the only navigation every page shares.
 *
 * Three things, one row: the mark, the three destinations, the year. Everything
 * else that used to live here — a tagline, a rule, a photograph credit — was
 * either copy the page did not have or a line that separated nothing.
 *
 * The reversed lockup is the reason the footer can stay forest: the delivered
 * wordmark is forest and sage text, which reads at 1.8:1 on this surface, so the
 * on-dark file carries the same outlined artwork in the light palette.
 *
 * It cannot be prerendered, which is why `SiteFooter` wraps it in Suspense: the
 * page shell stays static and this one strip is resolved per request.
 */
export async function Footer() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-forest text-brand-sage-100">
      <div className="landing-shell flex flex-col gap-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link href="/" aria-label="Perla Care home" className="inline-block">
            <Logo tone="onDark" alt="" className="h-8" />
          </Link>

          <p className="text-sm text-brand-sage-300">© {year} Perla Care</p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/about" className={linkClass}>
            About
          </Link>
          <Link href="/contact" className={linkClass}>
            Contact
          </Link>
          <Link href="/pricing" className={linkClass}>
            Pricing
          </Link>
          <Link href="/terms" className={linkClass}>
            Terms
          </Link>

          {data?.claims ? (
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="h-auto px-0 py-0 text-sm font-normal text-brand-sage-300 hover:bg-transparent hover:text-brand-pearl"
              >
                Sign out
              </Button>
            </form>
          ) : null}
        </nav>
      </div>
    </footer>
  );
}

/**
 * Drop this at the bottom of a page to give it a footer. The fallback repeats
 * the real footer's padding and height so nothing shifts when it arrives.
 */
export function SiteFooter() {
  return (
    <Suspense fallback={<div className="min-h-[7.5rem] bg-brand-forest" aria-hidden="true" />}>
      <Footer />
    </Suspense>
  );
}
