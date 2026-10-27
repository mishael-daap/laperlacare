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
  title: "Join as a caregiver — Perla Care",
  description: "Create a caregiver profile and be found by families near you.",
};

/**
 * Caregiver sign-up. Joining is free, so there is no payment anywhere in this
 * path — only the profile work that follows.
 *
 * The `error` query is set when the Google path comes back without the terms
 * accepted, because that submit skips the browser's own required check.
 */
export default async function CaregiverSignUpPage({
  searchParams,
}: PageProps<"/caregivers/sign-up">) {
  const { error, next } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:py-24">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-block">
          <Logo className="h-7" />
        </Link>

        <h1 className="mt-8 font-heading text-3xl tracking-tight">
          Join as a caregiver
        </h1>

        <p className="mt-3 text-muted-foreground">
          Free to join. You will build your profile next, and nothing is public
          until it has been reviewed.
        </p>

        {error === "terms" ? (
          <p role="alert" className="mt-6 text-sm text-destructive">
            Please agree to the Terms &amp; Conditions to continue.
          </p>
        ) : null}

        <div className="mt-10">
          <AuthForm
            mode="up"
            caregiver
            next={typeof next === "string" ? next : undefined}
          />
        </div>
      </div>
    </main>
  );
}
