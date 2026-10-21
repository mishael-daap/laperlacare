/**
 * Matches the shape of the household page: a header, the child list, the care
 * windows, and the short preference row.
 */
export default function Loading() {
  return (
    <main className="flex-1">
      <div className="mx-auto flex max-w-3xl flex-col gap-16 px-7 py-12 md:px-10">
        <div className="flex flex-col gap-3">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-8 w-56 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full max-w-lg animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="h-6 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
          <div className="h-36 w-full animate-pulse rounded-xl bg-muted" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-80 animate-pulse rounded bg-muted" />
          <div className="h-20 w-full animate-pulse rounded-xl bg-muted" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="h-6 w-44 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
          <div className="h-9 w-56 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </main>
  );
}
