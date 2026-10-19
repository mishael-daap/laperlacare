import Link from "next/link";
import { cn } from "cn";

import { buttonVariants } from "@/components/ui/button";
import { PAGE_SIZES, type PageSize } from "@/lib/admin/queries";

/**
 * Rows per page.
 *
 * Links, like the status filters, for the same reason: the size lives in the URL
 * and the server does the paging. Changing it returns to page one, because
 * staying on page four of a list that just got shorter would show nothing.
 */
export function PageSizeControl({
  current,
  hrefs,
}: {
  current: PageSize;
  hrefs: Record<PageSize, string>;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Rows per page">
      <span className="mr-1 text-xs text-muted-foreground">Rows</span>

      {PAGE_SIZES.map((size) => (
        <Link
          key={size}
          href={hrefs[size]}
          aria-current={current === size ? "true" : undefined}
          className={cn(
            buttonVariants({
              variant: current === size ? "contrast" : "ghost",
              size: "xs",
            }),
          )}
        >
          {size}
        </Link>
      ))}
    </div>
  );
}
