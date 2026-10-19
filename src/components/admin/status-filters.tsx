import Link from "next/link";
import { cn } from "cn";

import { buttonVariants } from "@/components/ui/button";
import { BUCKETS, type StatusBucket } from "@/lib/admin/queries";

/**
 * The five status buckets as links.
 *
 * Links rather than buttons with click handlers, because the filter lives in the
 * URL: it survives a refresh, a bookmark, and the back button, and the page is
 * server-rendered either way. The count is inside the button so the size of
 * each queue is readable without opening it.
 */
export function StatusFilters({
  active,
  counts,
  hrefs,
}: {
  active: StatusBucket;
  counts: Record<StatusBucket, number>;
  hrefs: Record<StatusBucket, string>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by status">
      {BUCKETS.map((bucket) => {
        const current = bucket.value === active;

        return (
          <Link
            key={bucket.value}
            href={hrefs[bucket.value]}
            aria-current={current ? "page" : undefined}
            className={cn(
              buttonVariants({
                variant: current ? "contrast" : "outline",
                size: "sm",
              }),
              "gap-2",
            )}
          >
            {bucket.label}
            <span className={current ? "text-background/70" : "text-muted-foreground"}>
              {counts[bucket.value]}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
