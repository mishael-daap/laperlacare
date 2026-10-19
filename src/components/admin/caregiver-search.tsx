import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StatusBucket } from "@/lib/admin/queries";
import { DEFAULT_PAGE_SIZE, DEFAULT_STATUS, type PageSize } from "@/lib/admin/queries";

/**
 * Search over name, account email, and phone.
 *
 * A plain GET form, not a client component with a debounce. The results are
 * server-rendered and the filter lives in the URL, so a form submission does the
 * same job as a fetch with fewer moving parts — and the box still works with
 * JavaScript still loading.
 *
 * The active status rides along as a hidden field, so searching does not silently
 * drop the filter. The page parameter is deliberately absent, which resets the
 * list to page one.
 */
export function CaregiverSearch({
  status,
  query,
  pageSize,
}: {
  status: StatusBucket;
  query: string;
  pageSize: PageSize;
}) {
  return (
    <form
      action="/admin/caregiver"
      method="get"
      role="search"
      className="flex w-full items-center gap-2 sm:w-auto"
    >
      {status !== DEFAULT_STATUS ? (
        <input type="hidden" name="status" value={status} />
      ) : null}
      {pageSize !== DEFAULT_PAGE_SIZE ? (
        <input type="hidden" name="per" value={pageSize} />
      ) : null}

      <div className="relative w-full sm:w-72">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Name, email, or phone"
          aria-label="Search caregivers"
          className="h-9 pl-8"
        />
      </div>

      <Button type="submit" variant="outline" size="lg">
        Search
      </Button>
    </form>
  );
}
