"use client";

import Link from "next/link";
import { useActionState } from "react";

import { GoogleIcon } from "@/components/icons/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { googleAction, signInAction, signUpAction, type AuthState } from "@/lib/auth/actions";

const COPY = {
  up: { submit: "Create account", pending: "Creating account…", password: "new-password" },
  in: { submit: "Sign in", pending: "Signing in…", password: "current-password" },
} as const;

/**
 * One form for both sign-up and sign-in. They differ in the action, three
 * labels, and one autocomplete hint, so two components would be the same code
 * written twice.
 */
export function AuthForm({ mode, next }: { mode: "up" | "in"; next?: string }) {
  const action = mode === "up" ? signUpAction : signInAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    undefined,
  );
  const copy = COPY[mode];

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
            autoComplete={copy.password}
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
        <Button type="submit" variant="outline" size="xl" className="w-full">
          <GoogleIcon className="size-5" />
          Continue with Google
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "up" ? (
          <>
            Already have an account?{" "}
            <Link href="/sign-in" className="text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </>
        ) : (
          <>
            No account yet?{" "}
            <Link href="/sign-up" className="text-foreground underline underline-offset-4">
              Create one
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
