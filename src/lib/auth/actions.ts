"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/admin/is-admin";
import { ensureCaregiverRow } from "@/lib/caregiver/ensure-caregiver-row";
import { isCaregiver } from "@/lib/caregiver/is-caregiver";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string } | undefined;

/** Where a parent lands: the catalogue, which is the point of signing in. */
const CATALOGUE = "/caregivers";

/** Where a caregiver lands instead. Their own page. */
const PROFILE = "/me";

/** Where an admin lands. The review queue. */
const ADMIN = "/admin/caregiver";

/** Shown when somebody tries to create an account without accepting the terms. */
const TERMS_ERROR = "Please agree to the Terms & Conditions to continue.";

/**
 * Remembers that somebody started signing up as a caregiver, across the Google
 * round trip.
 *
 * A cookie rather than a query parameter on the callback URL, because the
 * redirect allow-list in Supabase would otherwise have to account for the extra
 * parameter — and a setting nobody remembers is a confusing failure later.
 */
const INTENT_COOKIE = "signup_intent";

const INTENT_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24,
} as const;

/**
 * Only a same-site path is allowed as a redirect target.
 *
 * Without this check a link like `/sign-in?next=https://evil.example` would
 * send someone to another site immediately after they signed in here, which is
 * the classic way a login page is used to lend credibility to a phishing page.
 */
function safeNext(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

/**
 * An admin belongs in the review queue, a caregiver on their own page, everybody
 * else on the catalogue.
 *
 * Admin is checked first. Holding an `admins` row is a deliberate act, and a
 * staff account that also happens to be a caregiver should not be sent to the
 * caregiver profile and left wondering where the queue went.
 */
async function landingPath(supabase: Awaited<ReturnType<typeof createClient>>) {
  if (await isAdmin(supabase)) return ADMIN;
  return (await isCaregiver(supabase)) ? PROFILE : CATALOGUE;
}

export async function signUpAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter an email and a password." };
  }

  if (formData.get("terms") !== "on") {
    return { error: TERMS_ERROR };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Without this Supabase sends the confirmation link back to the Site
    // URL, which is the bare root — the code then arrives at "/" where
    // nothing exchanges it, so no session is created and the whole
    // sign-up quietly does nothing.
    options: { emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  });

  if (error) {
    return { error: error.message };
  }

  // With email confirmation on, Supabase returns a user but no session. Nothing
  // is wrong and nothing is signed in yet, so say so rather than redirecting
  // into an app the visitor cannot see.
  if (!data.session) {
    return { message: "Check your email to confirm your account, then sign in." };
  }

  // No household here, deliberately. A household is created after payment, when
  // the parent is asked to name it. Creating one at sign-up would make every
  // account a parent — including caregivers, who must never be one.
  redirect(safeNext(String(formData.get("next") ?? ""), CATALOGUE));
}

export async function caregiverSignUpAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter an email and a password." };
  }

  if (formData.get("terms") !== "on") {
    return { error: TERMS_ERROR };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Without this Supabase sends the confirmation link back to the Site
    // URL, which is the bare root — the code then arrives at "/" where
    // nothing exchanges it, so no session is created and the whole
    // sign-up quietly does nothing.
    options: { emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session || !data.user) {
    // Confirmation is on. The row is created on the way back instead, by the
    // confirm route, which still sees the intent cookie.
    const store = await cookies();
    store.set(INTENT_COOKIE, "caregiver", INTENT_COOKIE_OPTIONS);
    return { message: "Check your email to confirm your account, then sign in." };
  }

  await ensureCaregiverRow(supabase, data.user.id);
  redirect(PROFILE);
}

export async function signInAction(
  _previous: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter an email and a password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const landing = await landingPath(supabase);
  redirect(safeNext(String(formData.get("next") ?? ""), landing));
}

export async function googleAction(formData: FormData) {
  // The Google button skips native validation because the email and password
  // fields do not apply to it. That also skips the required checkbox, so the
  // consent check is repeated here and the visitor is sent back to the form.
  if (formData.get("terms_required") === "1" && formData.get("terms") !== "on") {
    const params = new URLSearchParams({ error: "terms" });
    const next = formData.get("next");

    if (typeof next === "string" && next) {
      params.set("next", next);
    }

    const page =
      formData.get("intent") === "caregiver" ? "/caregivers/sign-up" : "/sign-up";

    redirect(`${page}?${params.toString()}`);
  }

  const store = await cookies();

  if (formData.get("intent") === "caregiver") {
    store.set(INTENT_COOKIE, "caregiver", INTENT_COOKIE_OPTIONS);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  });

  if (error || !data.url) {
    redirect("/auth/error?error=Could%20not%20reach%20Google");
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
