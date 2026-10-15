import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Join as a caregiver — La Perla Care",
  description: "Create a caregiver profile and be found by families near you.",
};

/**
 * Caregiver sign-up. Joining is free, so there is no payment anywhere in this
 * path — only the profile work that follows.
 */
export default function CaregiverSignUpPage() {
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
          Join as a caregiver
        </h1>

        <p className="mt-3 text-muted-foreground">
          Free to join. You will build your profile next, and nothing is public
          until it has been reviewed.
        </p>

        <div className="mt-10">
          <AuthForm mode="up" caregiver />
        </div>
      </div>
    </main>
  );
}
