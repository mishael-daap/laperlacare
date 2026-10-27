import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/brand/logo";

/**
 * Admin sign-in.
 *
 * The operation is the ordinary Supabase sign-in. What makes it admin is the
 * `admins` row, checked by the layout on the way in, not by this page. A
 * caregiver or parent who signs in here simply lands where they always do.
 *
 * Outside the `(dashboard)` route group on purpose: the guard would otherwise
 * redirect this page to itself.
 */
export const instant = false;

export const metadata: Metadata = {
  title: "Admin sign in — Perla Care",
  robots: { index: false, follow: false },
};

export default async function AdminSignInPage(props: PageProps<"/admin/sign-in">) {
  const { next } = await props.searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:py-24">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-block">
          <Logo className="h-7" />
        </Link>

        <h1 className="mt-8 font-heading text-3xl tracking-tight">
          Admin sign in
        </h1>

        <p className="mt-3 text-muted-foreground">
          Caregiver review and decisions.
        </p>

        <div className="mt-10">
          <AuthForm
            mode="in"
            admin
            next={typeof next === "string" ? next : undefined}
          />
        </div>
      </div>
    </main>
  );
}
