import type { Metadata } from "next";

import { Closing } from "@/components/landing/closing";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Membership } from "@/components/landing/membership";
import { PhotoStatement } from "@/components/landing/photo-statement";
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
        <PhotoStatement />
        <HowItWorks />
        <Reasons />
        <Membership />
        <Questions />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
