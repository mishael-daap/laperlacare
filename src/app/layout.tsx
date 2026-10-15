import type { Metadata } from "next";
import { JetBrains_Mono, Playfair_Display, Poppins } from "next/font/google";

import "./globals.css";

/**
 * The three faces the design system names. globals.css points --font-sans,
 * --font-serif, and --font-mono at these variables, so the stack in the
 * stylesheet only resolves if the fonts are loaded here.
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

export const metadata: Metadata = {
  title: "La Perla Care — California's most loving caregivers",
  description:
    "A network of vetted caregivers across California. Every caregiver is reviewed before they appear, so you are choosing from the best.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
