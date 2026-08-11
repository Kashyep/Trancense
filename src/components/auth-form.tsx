"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui";

type AuthMode = "sign-in" | "sign-up" | "forgot" | "reset";

export function AuthForm({ mode, notice }: { mode: AuthMode; notice?: string }) {
  const [message, setMessage] = useState(notice ?? "");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  async function submit(formData: FormData) {
    setBusy(true);
    setMessage("");
    try {
      const client = createClient();
      const email = String(formData.get("email") || "");
      const password = String(formData.get("password") || "");

      if (mode === "sign-in") {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        location.assign("/app");
      } else if (mode === "sign-up") {
        const { error } = await client.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (error) throw error;
        setMessage("Check your email to confirm your account.");
      } else if (mode === "forgot") {
        await client.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/reset-password` });
        setMessage("If an account exists, a reset link has been sent.");
      } else {
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        setMessage("Password updated. You can now sign in.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "sign-in" ? "Welcome back" : mode === "sign-up" ? "Start a careful audit" : "Reset your password";

  return <form action={submit} className="utility-card w-full max-w-md p-7 sm:p-10" aria-describedby="auth-status">
    <h1 className="text-4xl">{title}</h1>
    <p className="mt-3 muted">Use your work email. Trancense supports human-reviewed audit decisions.</p>
    {mode !== "reset" && <label className="mt-6 block text-sm font-semibold">Email<input required name="email" type="email" className="mt-2 w-full border border-[#e8e8e8] bg-white p-3" autoComplete="email" /></label>}
    {mode !== "forgot" && <label className="mt-5 block text-sm font-semibold">Password<div className="mt-2 flex border border-[#e8e8e8] bg-white"><input required minLength={8} name="password" type={show ? "text" : "password"} className="min-w-0 flex-1 p-3" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} /><button type="button" onClick={() => setShow(!show)} className="px-3 text-sm text-[#816729]" aria-label={show ? "Hide password" : "Show password"}>{show ? "Hide" : "Show"}</button></div></label>}
    <Button disabled={busy} className="mt-6 w-full">{busy ? "Please wait…" : mode === "sign-in" ? "Sign in" : mode === "sign-up" ? "Create account" : mode === "forgot" ? "Send reset link" : "Save new password"}</Button>
    <p id="auth-status" role="status" className="mt-4 text-sm muted">{message}</p>
    <p className="mt-5 text-sm">{mode === "sign-in" ? <><Link className="text-[#816729]" href="/forgot-password">Forgot password?</Link> · <Link className="text-[#816729]" href="/sign-up">Create account</Link></> : <Link className="text-[#816729]" href="/sign-in">Back to sign in</Link>}</p>
  </form>;
}
