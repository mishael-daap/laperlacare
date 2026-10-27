import type { Metadata } from "next";
import { JetBrains_Mono, Poppins } from "next/font/google";
import localFont from "next/font/local";

import "./globals.css";

/**
 * The faces the design system names. globals.css points --font-heading and
 * --font-display at Bricolage Grotesque and --font-sans at Poppins, so the
 * stacks in the stylesheet only resolve if the fonts are loaded here.
 *
 * Bricolage Grotesque is loaded from the brand kit's variable file, not from
 * Google: the kit in brand-kit/ is the source of truth for the display face,
 * and the variable font carries every heading weight, including the 800 the
 * wordmark was drawn at. Poppins carries body copy, labels and controls, with
 * the four weights the kit ships. JetBrains Mono is the only third face, and
 * it appears on a file name, an id or a timestamp, never on a label.
 */
const bricolage = localFont({
  src: "./fonts/BricolageGrotesque-Variable.ttf",
  variable: "--font-bricolage",
  display: "swap",
  weight: "200 800",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Perla Care | Specialized caregiver matching",
  description:
    "Specialized caregiver matching for families of children with special needs. Serving Contra Costa County, California.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${bricolage.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
