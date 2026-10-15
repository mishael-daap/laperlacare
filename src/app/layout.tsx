import type { Metadata } from "next";
import { Suspense } from "react";
import { Great_Vibes, JetBrains_Mono, Playfair_Display, Poppins } from "next/font/google";

import { Footer } from "@/components/landing/footer";

import "./globals.css";

/**
 * The faces the design system names. globals.css points --font-sans,
 * --font-serif, --font-mono, and --font-cursive at these variables, so the
 * stacks in the stylesheet only resolve if the fonts are loaded here.
 */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * The one decorative face, used for a single word rather than for text.
 * Script fonts have a small x-height, so the word it wraps is sized a step up
 * to sit level with the words beside it.
 */
const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "La Perla Care — California's most loving caregivers",
  description:
    "A network of vetted caregivers across California. Every caregiver is reviewed before they appear, so you are choosing from the best.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}

        {/*
          The footer lives here rather than on each page so sign-out is reachable
          from everywhere. It is the only part of the app that reads the session,
          so it cannot be prerendered, and Suspense is what keeps the pages
          themselves static: the shell is prerendered as before and this strip is
          resolved per request. The fallback repeats the footer's own padding and
          background so nothing shifts when it arrives.
        */}
        <Suspense fallback={<div className="bg-foreground px-6 py-12 sm:px-10 lg:px-16" />}>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
