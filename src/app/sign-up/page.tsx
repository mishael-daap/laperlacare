import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";

/**
 * These pages read the query string, which is per-request, so they cannot be
 * prerendered. `instant = false` says so explicitly and lets the route block on
 * that read instead of failing the build.
 */
export const instant = false;

export const metadata: Metadata = {
  title: "Create your account — La Perla Care",
  description: "Join the network and start browsing vetted caregivers.",
};

export default async function SignUpPage({
  searchParams,
}: PageProps<"/sign-up">) {
  const { next } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:py-24">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="font-heading text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          La Perla Care
        </Link>

        <h1 className="mt-8 font-heading text-3xl font-medium tracking-tight">
          Create your account
        </h1>

        <p className="mt-3 text-muted-foreground">
          One membership covers your whole household.
        </p>

        <div className="mt-10">
          <AuthForm mode="up" next={typeof next === "string" ? next : undefined} />
        </div>
      </div>
    </main>
  );
}
