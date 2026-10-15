"use server";

import { redirect } from "next/navigation";

import { env } from "@/lib/env";
import { ensureHousehold } from "@/lib/auth/ensure-household";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string } | undefined;

/** Where signing in lands. The catalogue, which is the point of signing in. */
const CATALOGUE = "/caregivers";

/**
 * Only a same-site path is allowed as a redirect target.
 *
 * Without this check a link like `/sign-in?next=https://evil.example` would
 * send someone to another site immediately after they signed in here, which is
 * the classic way a login page is used to lend credibility to a phishing page.
 */
function safeNext(value: string | null | undefined) {
  if (!value) return CATALOGUE;
  if (!value.startsWith("/") || value.startsWith("//")) return CATALOGUE;
  return value;
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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  // With email confirmation on, Supabase returns a user but no session. Nothing
  // is wrong and nothing is signed in yet, so say so rather than redirecting
  // into an app the visitor cannot see.
  if (!data.session) {
    return { message: "Check your email to confirm your account, then sign in." };
  }

  await ensureHousehold(supabase);
  // No `?? "/"` here: safeNext owns the default, and defaulting before it
  // meant "/" was always passed in, so the catalogue was never reached.
  const next = formData.get("next");
  redirect(safeNext(typeof next === "string" ? next : null));
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

  await ensureHousehold(supabase);
  // No `?? "/"` here: safeNext owns the default, and defaulting before it
  // meant "/" was always passed in, so the catalogue was never reached.
  const next = formData.get("next");
  redirect(safeNext(typeof next === "string" ? next : null));
}

export async function googleAction() {
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
