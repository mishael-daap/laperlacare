import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "cn";

type ActionProps = {
  href: string;
  children: React.ReactNode;
  /**
   * The surface the button sits on. The recipe is one button: a pill at 52px
   * with a filled background. Only the two ink values swap, because a forest
   * fill on the forest band would disappear, and a pearl fill on pearl paper
   * would do the same. This is the dark-panel rule in the design system, not a
   * second button style.
   */
  tone?: "on-light" | "on-dark";
  className?: string;
};

export function Action({ href, children, tone = "on-light", className }: ActionProps) {
  return (
    <Button
      size="xl"
      variant="ghost"
      className={cn(
        "landing-action h-[3.25rem] min-h-[3.25rem] px-7",
        tone === "on-dark" && "landing-action-on-dark",
        className,
      )}
      render={<Link href={href} />}
    >
      {children}
    </Button>
  );
}
