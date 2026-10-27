import Link from "next/link";

import { Logo } from "@/components/brand/logo";

/**
 * The page's one piece of chrome, and it lives inside the hero.
 *
 * A white pill floating on the forest field: the mark on the left, two
 * in-page links in the middle at desktop, and the action as a quiet text link
 * on the right. It is not sticky. The landing page is short enough to scroll
 * and the footer repeats every destination, so a bar that follows the reader
 * would be a second navigation system for a one-page job.
 *
 * The action is a text link rather than a filled button because the hero
 * already owns the page's one filled action. The pill is the shape; the button
 * is the decision.
 */
export function Masthead() {
  return (
    <header className="relative z-20">
      <div className="landing-shell pt-4 sm:pt-5">
        <div className="ring-on-light flex items-center justify-between gap-3 rounded-full bg-brand-white py-2.5 pr-2.5 pl-4 shadow-sm ring-1 ring-brand-sage-300">
          <Link
            href="/"
            aria-label="Perla Care home"
            className="shrink-0 rounded-full"
          >
            <Logo variant="horizontal" alt="" className="h-7 sm:h-8" priority />
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-7 md:flex"
          >
            <Link
              href="#how"
              className="text-sm text-brand-sage-700 transition-colors hover:text-brand-forest"
            >
              How it works
            </Link>
            <Link
              href="#membership"
              className="text-sm text-brand-sage-700 transition-colors hover:text-brand-forest"
            >
              Membership
            </Link>
          </nav>

          <Link
            href="/sign-up"
            className="rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap text-brand-forest underline decoration-brand-sage-300 decoration-2 underline-offset-4 transition-colors hover:decoration-brand-forest"
          >
            Find a caregiver
          </Link>
        </div>
      </div>
    </header>
  );
}
