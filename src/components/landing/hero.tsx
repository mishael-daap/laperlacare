import Image, { getImageProps } from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Section 1. Three stacked layers, painted in DOM order:
 *
 *   1. the photograph, full-bleed behind everything
 *   2. the cut-out, centred with its bottom edge on the bottom of the viewport
 *   3. the copy, on top
 *
 * The photograph keeps its two crops, switched by media query rather than by
 * CSS: rendering both with `hidden`/`block` would make the browser download
 * both, so this uses <picture> with getImageProps and only one is fetched.
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

      {/* Layer 2 — the cut-out, centred and bottom-aligned. Decorative: the
          headline carries the meaning, so it takes an empty alt. */}
      <Image
        src="/hero/lpc-hero.png"
        alt=""
        width={466}
        height={536}
        className="pointer-events-none absolute bottom-0 left-1/2 h-auto w-[76vw] max-w-[300px] -translate-x-1/2 select-none sm:w-[46vw] sm:max-w-[440px]"
      />

      {/* Layer 3 — the copy, anchored bottom-left. */}
      <div className="relative flex max-w-2xl flex-col items-start gap-6 text-left">
        <h1 className="font-heading text-3xl font-medium tracking-tight text-balance text-background sm:text-5xl md:text-6xl">
          California&rsquo;s most loving caregivers
        </h1>

        <p className="max-w-lg text-base text-pretty text-background sm:text-lg">
          Every caregiver is vetted before they appear — background checks,
          licences, and certifications, reviewed one by one.
        </p>

        <Button variant="contrast" size="xl" render={<Link href="/sign-up" />}>
          Get started
        </Button>
      </div>
    </section>
  );
}
