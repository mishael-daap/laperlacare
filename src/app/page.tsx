import { CallToAction } from "@/components/landing/call-to-action";
import { Faq } from "@/components/landing/faq";
import { FinalCallToAction } from "@/components/landing/final-call-to-action";
import { SiteFooter } from "@/components/landing/footer";
import { Guarantee } from "@/components/landing/guarantee";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { WhyUs } from "@/components/landing/why-us";

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <WhyUs />
        <CallToAction />
        <Guarantee />
        <Faq />
        <FinalCallToAction />
      </main>
      <SiteFooter />
    </>
  );
}
