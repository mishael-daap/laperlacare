import { Benefits } from "@/components/landing/benefits";
import { CallToAction } from "@/components/landing/call-to-action";
import { Faq } from "@/components/landing/faq";
import { FinalCallToAction } from "@/components/landing/final-call-to-action";
import { Guarantee } from "@/components/landing/guarantee";
import { Hero } from "@/components/landing/hero";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Benefits />
      <CallToAction />
      <Guarantee />
      <Faq />
      <FinalCallToAction />
    </main>
  );
}
