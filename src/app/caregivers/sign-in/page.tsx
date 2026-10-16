import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Caregiver sign in — Perla Care",
  description: "Sign in to manage your caregiver profile.",
};

/**
 * The caregiver side of the sign-in.
 *
 * The operation is identical to the parent sign-in — the app already works out
 * which one you are from your `caregivers` row, and sends you to the right page
 * either way. This exists so the caregiver pages stay a self-contained pair, and
 * somebody who came in through `/caregivers/sign-up` is not handed a form that
 * sends them back into the parent side when they want to get in again.
 */
/**
 * These pages read the query string, which is per-request, so they cannot be
 * prerendered. `instant = false` says so explicitly and lets the route block on
 * that read instead of failing the build.
 */
export const instant = false;

export default async function CaregiverSignInPage({
  searchParams,
}: PageProps<"/caregivers/sign-in">) {
  const { next } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:py-24">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="font-heading text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Perla Care
        </Link>

        <h1 className="mt-8 font-heading text-3xl font-medium tracking-tight">
          Caregiver sign in
        </h1>

        <p className="mt-3 text-muted-foreground">
          Welcome back. Your profile is where you left it.
        </p>

        <div className="mt-10">
          <AuthForm
            mode="in"
            caregiver
            next={typeof next === "string" ? next : undefined}
          />
        </div>
      </div>
    </main>
  );
}
