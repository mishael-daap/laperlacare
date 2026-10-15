import type { NextConfig } from "next";

/**
 * The Supabase Storage host, derived from the project URL rather than written
 * out by hand.
 *
 * Hardcoding it would mean the config is right for exactly one project. This
 * way a second Supabase project for staging, or a different local value, needs
 * no change here — and there is no second place to update when the project
 * moves.
 *
 * If the variable is absent, the list is empty and `next/image` will refuse a
 * remote source rather than silently allowing any host. `src/lib/env.ts` treats
 * a missing URL as fatal anyway, so an empty list here cannot be reached.
 */
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            // Public objects only. Signed URLs come from the same host but a
            // different path, and nothing renders one through next/image.
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
