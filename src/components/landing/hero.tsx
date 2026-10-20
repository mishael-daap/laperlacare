import { getImageProps } from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Section 1. Three stacked layers, painted in DOM order:
 *
 *   1. the photograph, full-bleed behind everything
 *   2. the cut-out, full-bleed along the bottom edge
 *   3. the copy, on top
 *
 * The cut-out is not capped at a max width: it runs the full width of the screen,
 * scaled by its own aspect ratio, and sits on the bottom edge. Its transparent
 * top-left lets the photograph show through, which is why the backdrop is still
 * painted underneath it.
 *
 * Both photographs and the cut-out keep two crops, switched by media query rather
 * than by CSS: rendering both with `hidden`/`block` would make the browser
 * download both, so these use <picture> with getImageProps and only one is
 * fetched. The wide cut-out is landscape and the mobile one is nearly square, so
 * they are different images rather than one crop of the other.
 */

const backdropAlt = "";

const common = { alt: backdropAlt, sizes: "100vw", quality: 78 };

const {
  props: { srcSet: landscape },
} = getImageProps({
  ...common,
  src: "/hero/lpc-horizontal-2.jpg",
  width: 2400,
  height: 1600,
});

const {
  props: { srcSet: portrait, ...portraitRest },
} = getImageProps({
  ...common,
  src: "/hero/lpc-vertical.jpg",
  width: 1200,
  height: 1600,
});

const {
  props: { srcSet: cutoutWide },
} = getImageProps({
  ...common,
  src: "/hero/lpc-hero-wide.png",
  width: 735,
  height: 308,
});

const {
  props: { srcSet: cutoutMobile, ...cutoutMobileRest },
} = getImageProps({
  ...common,
  src: "/hero/lpc-hero-mobile.png",
  width: 323,
  height: 249,
});

export function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col justify-end overflow-hidden px-6 pb-16 sm:px-10 sm:pb-20 lg:px-16">
      {/* Layer 1 — the photograph, edge to edge. */}
      <picture>
        <source media="(min-width: 768px)" srcSet={landscape} />
        <img
          {...portraitRest}
          srcSet={portrait}
          alt=""
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>

      {/* Layer 2 — the cut-out, full width and flush with the bottom edge.
          Decorative: the headline carries the meaning, so it takes an empty
          alt. Two sources, same breakpoint as the backdrop. */}
      <picture>
        <source media="(min-width: 768px)" srcSet={cutoutWide} />
        <img
          {...cutoutMobileRest}
          srcSet={cutoutMobile}
          alt=""
          className="pointer-events-none absolute inset-x-0 bottom-0 h-auto w-full select-none"
        />
      </picture>

      {/* Layer 3 — the copy, anchored bottom-left. */}
      <div className="relative flex max-w-2xl flex-col items-start gap-6 text-left">
        <h1 className="font-heading text-3xl font-medium tracking-tight text-balance text-background sm:text-4xl md:text-5xl">
          Finding the{" "}
          <span className="font-cursive text-5xl leading-tight font-normal sm:text-6xl md:text-7xl">
            right
          </span>{" "}
          <span className="font-cursive text-5xl leading-tight font-normal sm:text-6xl md:text-7xl">
            caregiver
          </span>{" "}
          shouldn&rsquo;t be another challenge.
        </h1>

        <p className="max-w-lg text-base text-pretty text-background sm:text-lg">
          Specialized caregiver matching for families of children with special
          needs. Serving Contra Costa County, California.
        </p>

        <Button variant="contrast" size="xl" render={<Link href="/sign-up" />}>
          Find a caregiver
        </Button>
      </div>
    </section>
  );
}
