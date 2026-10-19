"use client";

import Link from "next/link";
import { useActionState } from "react";

import { GoogleIcon } from "@/components/icons/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  caregiverSignUpAction,
  googleAction,
  signInAction,
  signUpAction,
  type AuthState,
} from "@/lib/auth/actions";

const COPY = {
  up: { submit: "Create account", pending: "Creating account…", autocomplete: "new-password" },
  in: { submit: "Sign in", pending: "Signing in…", autocomplete: "current-password" },
} as const;

/**
 * One form for four situations: signing up or in, as a parent or as a caregiver.
 *
 * They differ in the action, three labels, and which page the links point at —
 * so four components would be the same code written four times. Signing in is
 * genuinely the same operation either way; what differs is the framing and the
 * pair of routes it links between, so nobody gets bounced from the caregiver
 * pages into the parent ones.
 */
export function AuthForm({
  mode,
  caregiver = false,
  admin = false,
  next,
}: {
  mode: "up" | "in";
  caregiver?: boolean;
  /** Hides the sign-up links: there are no admin accounts to create. */
  admin?: boolean;
  next?: string;
}) {
  const action = mode === "up" && caregiver ? caregiverSignUpAction : mode === "up" ? signUpAction : signInAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    undefined,
  );
  const copy = COPY[mode];

  const signUpHref = caregiver ? "/caregivers/sign-up" : "/sign-up";
  const signInHref = caregiver ? "/caregivers/sign-in" : "/sign-in";

  return (
    <div className="flex flex-col gap-8">
      <form action={formAction} className="flex flex-col gap-6">
        {next ? <input type="hidden" name="next" value={next} /> : null}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-11"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={copy.autocomplete}
            required
            minLength={6}
            className="h-11"
          />
        </div>

        {state?.error ? (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        {state?.message ? (
          <p role="status" className="text-sm text-muted-foreground">
            {state.message}
          </p>
        ) : null}

        <Button type="submit" size="xl" disabled={pending} className="w-full">
          {pending ? copy.pending : copy.submit}
        </Button>
      </form>

      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form action={googleAction}>
        {/* Tells the callback to create a caregivers row on the way back. A
            cookie carries it, not the URL, so the redirect allow-list does not
            need to know about it. Only on sign-up: signing in must never create
            a caregiver out of somebody who is not one. */}
        {mode === "up" && caregiver ? (
          <input type="hidden" name="intent" value="caregiver" />
        ) : null}
        <Button type="submit" variant="outline" size="xl" className="w-full">
          <GoogleIcon className="size-5" />
          Continue with Google
        </Button>
      </form>

      {admin ? null : (
        <p className="text-center text-sm text-muted-foreground">
          {mode === "in" ? (
            <>
              No account yet?{" "}
              <Link href={signUpHref} className="text-foreground underline underline-offset-4">
                Create one
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href={signInHref} className="text-foreground underline underline-offset-4">
                Sign in
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}
