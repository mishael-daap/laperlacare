import { cn } from "cn";

/**
 * The mark's smile, drawn at page scale.
 *
 * The brand book's icon is a gold pearl resting in a round-capped smile. This
 * component is that same geometry, enlarged until it can hold a screen. It is
 * not an illustration of anything: it is the mark the company already owns, so
 * the page repeats its own logo instead of importing a decorative language.
 *
 * The stroke is `currentColor` so a section can draw it in soft sage on the
 * forest field and in soft sage on paper. The pearl keeps the kit's gold and
 * its cream highlight, and the whole thing is hidden from assistive technology
 * because the wordmark beside it already carries the name.
 */
export function Smile({
  className,
  pearl = true,
  strokeWidth = 8,
}: {
  className?: string;
  pearl?: boolean;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 1200 240"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      focusable="false"
      className={cn("block", className)}
    >
      <path
        d="M40 20C170 170 390 195 600 195C810 195 1030 170 1160 20"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {pearl ? (
        <g>
          <circle cx="600" cy="195" r="30" fill="var(--brand-gold)" />
          <circle cx="590" cy="184" r="8" fill="var(--brand-pearl)" />
        </g>
      ) : null}
    </svg>
  );
}
