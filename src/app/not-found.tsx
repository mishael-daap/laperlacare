import Link from "next/link";

/**
 * The 404.
 *
 * Filled with the primary colour and centred, because a not-found page is the
 * one screen a visitor arrives at by accident — there is nothing to look at, so
 * the page's only job is to look deliberate and offer the way back.
 *
 * `flex-1` rather than `min-h-svh`: the footer sits in the root layout, so a
 * viewport-height block here would push it below the fold and leave a scrollbar
 * for nothing. This fills everything above the footer instead.
 */
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-primary px-6 py-24 text-center text-primary-foreground">
      <h1 className="font-mono text-2xl font-medium tracking-tight text-balance sm:text-3xl md:text-4xl">
        Oops, we couldn&rsquo;t find that
      </h1>

      <Link
        href="/"
        className="text-lg underline underline-offset-4 transition-opacity hover:opacity-80"
      >
        Return home
      </Link>
    </main>
  );
}
