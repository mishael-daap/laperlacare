import type { Metadata } from "next";

import { Closing } from "@/components/landing/closing";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
// The membership band is hidden at the client's request. The component still
// lives at `src/components/landing/membership.tsx`; restore the import with it.
// import { Membership } from "@/components/landing/membership";
import { Questions } from "@/components/landing/questions";
import { Reasons } from "@/components/landing/reasons";
import { SiteFooter } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Perla Care | Caregiver matching in Contra Costa County",
  description:
    "Specialized caregiver matching for children with special needs in Contra Costa County, California.",
};

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Reasons />
        {/*
          Hidden at the client's request: the green membership band. The
          component is untouched, so uncommenting this line and the import above
          brings the whole section back.
        */}
        {/* <Membership /> */}
        <Questions />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
