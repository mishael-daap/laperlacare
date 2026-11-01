import Link from "next/link";

import { Action } from "@/components/landing/action";

/**
 * The one button matching needs.
 *
 * It appears once there is something to match against, and until then it says
 * what is missing and points at the section that fixes it — a disabled button
 * with no explanation is a dead end, and a link that opens an empty page is
 * worse. The counts come from the household page, which already has them.
 */
export function FindCaregivers({
  childCount,
  windowCount,
}: {
  childCount: number;
  windowCount: number;
}) {
  if (childCount === 0) {
    return (
      <div className="rounded-[1.5rem] bg-brand-sage-100 p-6 ring-1 ring-inset ring-brand-sage-300">
        <h2 className="font-heading text-xl tracking-tight">Find caregivers</h2>
        <p className="mt-2 max-w-[52ch] text-pretty text-brand-sage-700">
          Matching reads your household. Add a child above and this becomes the
          button that shows you who fits.
        </p>
        <Link
          href="#children"
          className="mt-4 inline-block text-sm font-semibold text-brand-forest underline underline-offset-4"
        >
          Add your first child
        </Link>
      </div>
    );
  }

  if (windowCount === 0) {
    return (
      <div className="rounded-[1.5rem] bg-brand-sage-100 p-6 ring-1 ring-inset ring-brand-sage-300">
        <h2 className="font-heading text-xl tracking-tight">Find caregivers</h2>
        <p className="mt-2 max-w-[52ch] text-pretty text-brand-sage-700">
          One more thing: matching needs the days and hours you want care, so a
          caregiver&rsquo;s week can be compared with yours.
        </p>
        <Link
          href="#schedule"
          className="mt-4 inline-block text-sm font-semibold text-brand-forest underline underline-offset-4"
        >
          Add a day and time
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] bg-brand-pearl p-6 ring-1 ring-inset ring-brand-sage-300 sm:flex sm:items-center sm:justify-between sm:gap-8">
      <div>
        <h2 className="font-heading text-xl tracking-tight">Find caregivers</h2>
        <p className="mt-2 max-w-[52ch] text-pretty text-brand-sage-700">
          We will compare your {childCount === 1 ? "child" : "children"}, your
          needs and your hours with every caregiver we have approved.
        </p>
      </div>

      <Action href="/matches" className="mt-5 shrink-0 sm:mt-0">
        Find caregivers
      </Action>
    </div>
  );
}
