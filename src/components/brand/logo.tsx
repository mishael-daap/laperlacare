import Image from "next/image";
import { cn } from "cn";

/**
 * The brand mark, and the only place a logo file is referenced.
 *
 * Three variants and two tones, because that is the whole set the brand book
 * ships: a horizontal lockup for headers, a stacked one for a cover, and the
 * mark alone for surfaces too small for a wordmark. The tone picks the file
 * rather than tinting one, since the kit is outlined artwork with its colours
 * baked into the paths — there is nothing to recolour at render time.
 *
 * Sizes are the artwork's own viewBox, so `width` and `height` are always the
 * true aspect ratio and no caller can stretch the mark. Callers size it with a
 * height class and `w-auto`; the brand book's minimums are 120px for either
 * lockup and 24px for the icon, and the defaults below sit on them.
 *
 * `next/image` leaves SVG sources unoptimised, which is what we want: these are
 * a few kilobytes of vector and resizing them in the image pipeline would only
 * lose the point.
 */

const RATIO = {
  horizontal: { width: 204, height: 34 },
  stacked: { width: 260, height: 185 },
  icon: { width: 116, height: 89 },
} as const;

/** The file for each variant and tone. `stacked` has no reversed version yet. */
const FILES = {
  horizontal: {
    default: "/brand/logo-horizontal.svg",
    onDark: "/brand/logo-horizontal-on-dark.svg",
  },
  stacked: {
    default: "/brand/logo-stacked.svg",
    onDark: "/brand/logo-stacked.svg",
  },
  icon: {
    default: "/brand/icon-forest.svg",
    onDark: "/brand/icon-light.svg",
  },
} as const;

export type LogoVariant = keyof typeof FILES;
export type LogoTone = keyof (typeof FILES)["horizontal"];

/** Default heights: the smallest legible size for each lockup, from the brand book. */
const DEFAULT_HEIGHT = {
  horizontal: "h-8",
  stacked: "h-28",
  icon: "h-8",
} as const;

type LogoProps = {
  variant?: LogoVariant;
  tone?: LogoTone;
  /**
   * Empty when a heading beside the mark already says the name. The default is
   * the brand name, because a logo is the one image whose alt text is its name.
   */
  alt?: string;
  className?: string;
  priority?: boolean;
};

export function Logo({
  variant = "horizontal",
  tone = "default",
  alt = "Perla Care",
  className,
  priority = false,
}: LogoProps) {
  const { width, height } = RATIO[variant];

  return (
    <Image
      src={FILES[variant][tone]}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn(DEFAULT_HEIGHT[variant], "w-auto", className)}
    />
  );
}
