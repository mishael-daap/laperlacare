/**
 * Section 7. One line on black.
 *
 * Nothing else. No columns of links, no social icons, no newsletter box — none
 * of it exists to link to yet, and a footer that is mostly empty space with
 * placeholder links is worse than one line. When there is something real to put
 * here, it goes here.
 *
 * Uses foreground/background rather than literal black and white, so it stays
 * on the theme's tokens like everything else.
 *
 * `"use cache"` is required, not decorative. Cache Components rejects
 * `new Date()` during prerendering because it can differ between renders, so
 * the year has to be captured once and cached rather than read at request time.
 */
export async function Footer() {
  "use cache";

  const year = new Date().getFullYear();

  return (
    <footer className="bg-foreground px-6 py-12 text-background sm:px-10 lg:px-16">
      <p className="text-sm text-background/70">© {year} La Perla Care</p>
    </footer>
  );
}
