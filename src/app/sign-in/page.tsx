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
  title: "Sign in — Perla Care",
  description: "Sign in to your Perla Care account.",
};

export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  const { next } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:py-24">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-block">
          <Logo className="h-7" />
        </Link>

        <h1 className="mt-8 font-heading text-3xl tracking-tight">
          Sign in
        </h1>

        <p className="mt-3 text-muted-foreground">
          Welcome back.
        </p>

        <div className="mt-10">
          <AuthForm mode="in" next={typeof next === "string" ? next : undefined} />
        </div>
      </div>
    </main>
  );
}
