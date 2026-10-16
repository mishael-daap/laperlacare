import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How are caregivers vetted?",
    a: "Every caregiver uploads a background check, a licence, and their certifications. We review each document before their profile appears, so only verified caregivers are in the network.",
  },
  {
    q: "What does the membership include?",
    a: "One membership covers your whole household. It unlocks caregiver matching and caregiver contact details.",
  },
  {
    q: "Is this a childcare agency?",
    a: "No. We are a directory and introduction service. We connect you with caregivers — you choose who to hire and arrange everything with them directly.",
  },
  {
    q: "What if it is not right for us?",
    a: "Ask for a refund within 30 days and we will return what you paid.",
  },
  {
    q: "Where are you available?",
    a: "Across Contra Costa County, California.",
  },
];

/**
 * Section 5. Five questions, using the shadcn Accordion.
 *
 * The answers stay short on purpose: someone reading an FAQ has one specific
 * worry, and a paragraph buries the answer to it. The list is capped at
 * max-w-3xl so the questions stay at a comfortable reading measure even on a
 * wide monitor.
 *
 * One answer deliberately says we are not a childcare agency. That is the
 * directory framing the architecture requires, and an FAQ is where a customer
 * will actually look for it.
 */
export function Faq() {
  return (
    <section className="px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
          FAQ
        </h2>

        <Accordion className="mt-12">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.q} value={`item-${index}`}>
              <AccordionTrigger className="text-lg font-semibold hover:no-underline sm:text-xl">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground sm:text-lg">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
