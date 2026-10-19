import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { cn } from "cn";

import { CaregiverSearch } from "@/components/admin/caregiver-search";
import { PageSizeControl } from "@/components/admin/page-size";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatusFilters } from "@/components/admin/status-filters";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/admin/format";
import {
  BUCKETS,
  caregiverCounts,
  DEFAULT_PAGE_SIZE,
  DEFAULT_STATUS,
  listCaregivers,
  PAGE_SIZES,
  parsePage,
  parsePageSize,
  parseStatus,
  type PageSize,
  type StatusBucket,
} from "@/lib/admin/queries";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export const metadata: Metadata = {
  title: "Caregivers — Admin",
  robots: { index: false, follow: false },
};

/**
 * The review queue.
 *
 * Everything that narrows the list — the status bucket, the search, the page —
 * lives in the URL, so a refresh keeps the view and a link can be sent to
 * somebody else. The page and the counts are fetched together; filtering happens
 * in the directory function, which is also where the account email comes from.
 */
export default async function AdminCaregiversPage(props: PageProps<"/admin/caregiver">) {
  await connection();

  const searchParams = await props.searchParams;
  const status = parseStatus(searchParams.status);
  const query = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const page = parsePage(searchParams.page);
  const pageSize = parsePageSize(searchParams.per);

  const supabase = await createClient();
  const [{ rows, total }, counts] = await Promise.all([
    listCaregivers(supabase, { status, query, page, pageSize }),
    caregiverCounts(supabase),
  ]);

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const firstRow = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRow = Math.min(page * pageSize, total);

  function hrefFor(next: { status?: StatusBucket; page?: number; pageSize?: PageSize }) {
    const params = new URLSearchParams();
    const nextStatus = next.status ?? status;
    const nextPageSize = next.pageSize ?? pageSize;

    if (nextStatus !== DEFAULT_STATUS) params.set("status", nextStatus);
    if (query) params.set("q", query);
    if (nextPageSize !== DEFAULT_PAGE_SIZE) params.set("per", String(nextPageSize));
    if ((next.page ?? 1) > 1) params.set("page", String(next.page));

    const queryString = params.toString();
    return queryString ? `/admin/caregiver?${queryString}` : "/admin/caregiver";
  }

  const filterHrefs = Object.fromEntries(
    BUCKETS.map((bucket) => [bucket.value, hrefFor({ status: bucket.value })]),
  ) as Record<StatusBucket, string>;

  const pageSizeHrefs = Object.fromEntries(
    PAGE_SIZES.map((size) => [size, hrefFor({ pageSize: size })]),
  ) as Record<PageSize, string>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-medium tracking-tight">Caregivers</h1>
        <p className="text-muted-foreground">
          Pending submissions by default. Use the filters to see everyone.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <StatusFilters active={status} counts={counts} hrefs={filterHrefs} />
        <CaregiverSearch status={status} query={query} pageSize={pageSize} />
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col gap-2 rounded-xl border border-border px-6 py-12 text-center">
          <p className="font-medium">No caregivers in this view.</p>
          <p className="text-sm text-muted-foreground">
            {query
              ? `Nothing matches “${query}”.`
              : "When somebody signs up as a caregiver, they appear here."}
          </p>
          {page > 1 || query || status !== DEFAULT_STATUS ? (
            <Link
              href="/admin/caregiver"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mx-auto mt-2")}
            >
              Clear filters
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.user_id}>
                  <TableCell>
                    <Link
                      href={`/admin/caregiver/${row.user_id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {row.display_name || "No name yet"}
                    </Link>
                  </TableCell>

                  <TableCell className="text-muted-foreground">{row.email}</TableCell>

                  <TableCell>
                    <StatusBadge
                      status={row.verification_status}
                      submitted={Boolean(row.submitted_at)}
                    />
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {formatDate(row.submitted_at) ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {total === 0
            ? "No caregivers"
            : `Showing ${firstRow}–${lastRow} of ${total}${pages > 1 ? ` · page ${Math.min(page, pages)} of ${pages}` : ""}`}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <PageSizeControl current={pageSize} hrefs={pageSizeHrefs} />

          {pages > 1 ? (
            <div className="flex items-center gap-2">
              <Link
                href={hrefFor({ page: Math.max(1, page - 1) })}
                aria-disabled={page <= 1}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  page <= 1 && "pointer-events-none opacity-50",
                )}
              >
                Previous
              </Link>

              <Link
                href={hrefFor({ page: Math.min(pages, page + 1) })}
                aria-disabled={page >= pages}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  page >= pages && "pointer-events-none opacity-50",
                )}
              >
                Next
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
