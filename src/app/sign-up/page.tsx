import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/brand/logo";

/**
 * These pages read the query string, which is per-request, so they cannot be
 * prerendered. `instant = false` says so explicitly and lets the route block on
 * that read instead of failing the build.
 */
export const instant = false;

export const metadata: Metadata = {
  title: "Create your account — Perla Care",
  description: "Join the network and start browsing vetted caregivers.",
};

export default async function SignUpPage({
  searchParams,
}: PageProps<"/sign-up">) {
  const { next, error } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:py-24">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-block">
          <Logo className="h-7" />
        </Link>

        <h1 className="mt-8 font-heading text-3xl tracking-tight">
          Create your account
        </h1>

        <p className="mt-3 text-muted-foreground">
          One membership covers your whole household.
        </p>

        {error === "terms" ? (
          <p role="alert" className="mt-6 text-sm text-destructive">
            Please agree to the Terms &amp; Conditions to continue.
          </p>
        ) : null}

        <div className="mt-10">
          <AuthForm mode="up" next={typeof next === "string" ? next : undefined} />
        </div>
      </div>
    </main>
  );
}
