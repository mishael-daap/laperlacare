import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Caregivers — La Perla Care",
  description: "Browse vetted caregivers across California.",
};

/**
 * The catalogue, which is where signing in lands you.
 *
 * Empty on purpose for now. The list arrives with caregiver onboarding and
 * verification, because there is nothing to show until caregivers exist to be
 * shown. Until then this is the destination that makes the sign-in flow
 * complete rather than a dead end.
 */
export default function CaregiversPage() {
  return (
    <main className="flex-1 px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
          Caregivers
        </h1>
      </div>
    </main>
  );
}
