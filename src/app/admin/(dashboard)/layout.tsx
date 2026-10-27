import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/admin/is-admin";
import { signOutAction } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

/**
 * The admin area's guard and chrome.
 *
 * The session read sits at the top of the layout, which is exactly what Cache
 * Components wants to avoid in a shared layout — but every route underneath is
 * behind this check, so `instant = false` is the honest setting and the whole
 * segment is allowed to block.
 *
 * A signed-in non-admin gets a 404 rather than a "not allowed" screen. The
 * latter confirms the route exists; not-found it is.
 *
 * `(dashboard)` is a route group, so the URLs stay `/admin/caregiver` and
 * `/admin/sign-in` while the sign-in page sits outside this layout and is not
 * guarded by it.
 */
export const instant = false;

export const metadata: Metadata = {
  title: "Admin — Perla Care",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims?.sub) {
    // The layout cannot see the pathname on the server, so the target is fixed
    // rather than the page the visitor actually wanted.
    redirect("/admin/sign-in?next=/admin/caregiver");
  }

  if (!(await isAdmin(supabase))) {
    notFound();
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-6">
          <Link href="/admin/caregiver" className="flex items-center gap-3">
            <Logo className="h-7" />
            <span className="text-sm text-muted-foreground">Admin</span>
          </Link>

          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
