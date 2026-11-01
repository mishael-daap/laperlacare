import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { EmptyMatches } from "@/components/matching/empty-matches";
import { MatchCard } from "@/components/matching/match-card";
import { MatchLevers } from "@/components/matching/match-levers";
import { SiteFooter } from "@/components/landing/footer";
import { isAdmin } from "@/lib/admin/is-admin";
import { ensureHousehold } from "@/lib/auth/ensure-household";
import { isCaregiver } from "@/lib/caregiver/is-caregiver";
import { getHouseholdProfile } from "@/lib/household/get-household-profile";
import { parseMatchOptions } from "@/lib/matching/options";
import { getMatches, getShortlist } from "@/lib/matching/queries";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your matches — Perla Care",
  robots: { index: false, follow: false },
};

export const instant = false;

/**
 * The match list.
 *
 * No search form. The household is the form, and everything on this page either
 * quotes it back or argues with one part of it. The four levers are links, the
 * reasons come from the database, and a caregiver the family should meet is
 * never hidden by a preference — it is ranked lower and says why.
 */
export default async function MatchesPage(props: PageProps<"/matches">) {
  await connection();

  const searchParams = await props.searchParams;
  const options = parseMatchOptions(searchParams);

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims?.sub) {
    redirect("/sign-in?next=/matches");
  }

  if (await isAdmin(supabase)) {
    redirect("/admin/caregiver");
  }

  if (await isCaregiver(supabase)) {
    redirect("/me");
  }

  const householdId = await ensureHousehold(supabase);
  const [profile, shortlist, matches] = await Promise.all([
    getHouseholdProfile(supabase, householdId),
    getShortlist(supabase, householdId),
    getMatches(supabase, options),
  ]);

  const saved = new Set(shortlist);
  const visible = options.saved ? matches.filter((row) => saved.has(row.caregiver_id)) : matches;
  const householdHasChildren = profile.children.length > 0;
  const householdHasWindows = profile.availability.length > 0;

  const needLabels = [
    ...new Set(
      profile.children.flatMap((child) =>
        profile.needs.filter((need) => child.needSlugs.includes(need.slug)),
      ),
    ),
  ].map((need) => need.label);

  const weeklyHours =
    profile.availability.reduce((total, window) => {
      const [startHours, startMinutes] = window.start_time.split(":").map(Number);
      const [endHours, endMinutes] = window.end_time.split(":").map(Number);
      return total + (endHours * 60 + endMinutes - startHours * 60 - startMinutes);
    }, 0) / 60;

  // One string, not a chain of JSX fragments: the sentence is read aloud by
  // screen readers as one run, and a comma in its own text node spaces itself.
  const summary = `${profile.children.length} ${
    profile.children.length === 1 ? "child" : "children"
  }, ${weeklyHours} hours a week`;

  const avatarUrl = (path: string | null) =>
    path ? `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}` : null;

  return (
    <>
      <main className="flex-1">
        <div className="landing-shell pt-24 pb-28 sm:pt-32 sm:pb-36">
          <header className="max-w-[62ch]">
            <h1 className="section-head font-heading">Caregivers who fit your family</h1>

            {householdHasChildren ? (
              <>
                <p className="lead mt-4 text-pretty text-brand-sage-700">
                  {summary}. Matches are read from your household — change it
                  there and this list follows.
                </p>

                {needLabels.length > 0 ? (
                  <p className="mt-3 text-sm text-brand-sage-700">
                    Needs you have listed: {needLabels.join(" · ")}
                  </p>
                ) : null}
              </>
            ) : null}
          </header>

          <div className="mt-10">
            <MatchLevers options={options} caregivers={shortlist.length} />
          </div>

          <div className="mt-8 flex items-baseline justify-between gap-4">
            <p className="text-brand-sage-700">
              {visible.length}{" "}
              {visible.length === 1 ? "caregiver matches" : "caregivers match"}
              {options.saved ? " in your shortlist" : ""}
            </p>
            <a
              href="/household"
              className="text-sm text-brand-sage-700 underline underline-offset-4 hover:text-brand-forest"
            >
              Edit your household
            </a>
          </div>

          {visible.length === 0 ? (
            <div className="mt-6">
              <EmptyMatches
                options={options}
                householdHasChildren={householdHasChildren}
                householdHasWindows={householdHasWindows}
              />
            </div>
          ) : (
            <ul className="mt-6 flex flex-col gap-5">
              {visible.map((match) => (
                <li key={match.caregiver_id}>
                  <MatchCard
                    match={match}
                    options={options}
                    saved={saved.has(match.caregiver_id)}
                    avatarUrl={avatarUrl(match.avatar_path)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
