import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

/**
 * These pages read the query string, which is per-request, so they cannot be
 * prerendered. `instant = false` says so explicitly and lets the route block on
 * that read instead of failing the build.
 */
export const instant = false;

export const metadata: Metadata = {
  title: "That link did not work — Perla Care",
};

/**
 * Where a failed confirmation or callback lands.
 *
 * Says what went wrong and offers the two things worth trying, rather than a
 * bare "error" a visitor cannot act on.
 */
export default async function AuthErrorPage({
  searchParams,
}: PageProps<"/auth/error">) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? error : "Something went wrong.";

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:py-24">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-heading text-2xl tracking-tight">
          That link did not work
        </h1>

        <p className="mt-3 text-muted-foreground">{message}</p>

        <p className="mt-3 text-sm text-muted-foreground">
          Confirmation links expire and can only be used once. Signing in again
          sends a new one.
        </p>

        <div className="mt-10 flex flex-col gap-3">
          <Link href="/sign-in" className={buttonVariants({ size: "xl" })}>
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className={buttonVariants({ variant: "outline", size: "xl" })}
          >
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}
