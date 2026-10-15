import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

/**
 * Section 7. One line on black, plus a sign-out control when signed in.
 *
 * No columns of links, no social icons, no newsletter box — none of it exists
 * to link to yet, and a footer that is mostly empty space with placeholder
 * links is worse than one line.
 *
 * This is the only part of the page that knows who is signed in, so it cannot
 * be cached and it cannot be prerendered. `page.tsx` wraps it in Suspense,
 * which is what keeps the rest of the landing page static: the shell is
 * prerendered as before and this one strip is resolved per request.
 *
 * That also means `new Date()` is fine here. It is only rejected during
 * prerendering, and this never prerenders.
 */
export async function Footer() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-foreground px-6 py-12 text-background sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
        <p className="text-sm text-background/70">© {year} La Perla Care</p>

        {data?.claims ? (
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-background/70 hover:bg-transparent hover:text-background"
            >
              Sign out
            </Button>
          </form>
        ) : null}
      </div>
    </footer>
  );
}
