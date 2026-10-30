import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SectionState } from "@/lib/caregiver/completeness";

/**
 * "9 of 16 sections complete", and the sixteen listed underneath.
 *
 * Server-rendered. Nothing here is interactive: the sections are links, and the
 * count is worked out before the page is drawn. That keeps the number honest —
 * it cannot show a stale value because there is nothing holding one.
 *
 * The rail is the whole onboarding flow. A wizard that stepped a caregiver
 * through the same fields in a different order would need a second copy of every
 * form and a second place to keep the layout true, and the only thing it would
 * add is the feeling of being led. This leads by naming what is missing and
 * opening it.
 */
export function ApplicationProgress({
  sections,
  done,
  total,
  next,
  compact = false,
}: {
  sections: SectionState[];
  done: number;
  total: number;
  next: SectionState | null;
  compact?: boolean;
}) {
  const percent = Math.round((done / total) * 100);

  return (
    <section className="flex flex-col gap-6 rounded-xl border border-border bg-card px-6 py-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-heading text-2xl tracking-tight tabular-nums">
            {done} of {total} sections complete
          </p>

          <p className="text-sm text-muted-foreground">
            {next
              ? `Next: ${next.label.toLowerCase()}.`
              : "Everything is answered. Submit your application when you are ready."}
          </p>
        </div>

        {next ? (
          <Link
            href={next.href}
            className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
          >
            Continue
          </Link>
        ) : (
          <Link
            href="/application#signature"
            className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
          >
            Sign and submit
          </Link>
        )}
      </div>

      {/* The bar is decoration, and it is the only thing on the page that shows
          progress as distance rather than as a number. Hidden from a screen
          reader, which already gets the count in the heading. */}
      <div aria-hidden className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {compact ? null : (
        <ol className="flex flex-col">
          {sections.map((section) => (
            <li key={section.key}>
              <Link
                href={section.href}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted"
              >
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border text-[11px] tabular-nums",
                    section.done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {section.done ? "✓" : section.number}
                </span>

                <span
                  className={cn(
                    "min-w-0 flex-1 truncate",
                    section.done ? "text-muted-foreground" : "font-semibold",
                  )}
                >
                  {section.label}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
