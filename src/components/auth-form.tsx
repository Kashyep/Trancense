"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { assessPassword } from "@/lib/password";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui";

type Mode = "sign-in" | "sign-up" | "forgot" | "reset";

function safeAuthMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("invalid login") || message.includes("invalid credentials")) return "We could not sign you in. Check your email and password, then try again.";
  if (message.includes("email not confirmed")) return "Confirm your email before signing in. You can request another confirmation link from your original sign-up flow.";
  if (message.includes("expired") || message.includes("invalid")) return "This link is no longer valid. Request a new one and try again.";
  if (message.includes("rate")) return "Please wait a moment before trying again.";
  return "We could not complete that request. Try again or contact support if it continues.";
}

export function AuthForm({ mode, notice }: { mode: Mode; notice?: string }) {
  const [message, setMessage] = useState(notice ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const assessment = useMemo(() => assessPassword(password), [password]);
  const needsConfirmation = mode === "sign-up" || mode === "reset";

  async function submit(formData: FormData) {
    setBusy(true); setMessage(""); setError("");
    const email = String(formData.get("email") || "").trim();
    const submittedPassword = String(formData.get("password") || "");
    if ((mode === "sign-up" || mode === "reset") && !assessment.meetsMinimum) { setError("Use a password of at least 8 characters."); setBusy(false); return; }
    if (needsConfirmation && submittedPassword !== confirmation) { setError("The passwords do not match."); setBusy(false); return; }
    try {
      const client = createClient();
      if (mode === "sign-in") {
        const { error: authError } = await client.auth.signInWithPassword({ email, password: submittedPassword });
        if (authError) throw authError;
        window.location.assign("/app");
        return;
      }
      if (mode === "sign-up") {
        const { error: authError } = await client.auth.signUp({ email, password: submittedPassword, options: { emailRedirectTo: `${window.location.origin}/auth/callback?flow=signup` } });
        if (authError) throw authError;
        setMessage("Check your email for a confirmation link. For your privacy, this message is the same whether or not a new account was created.");
        return;
      }
      if (mode === "forgot") {
        await client.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        setMessage("If an account exists for that email, a reset link has been sent.");
        return;
      }
      const { error: authError } = await client.auth.updateUser({ password: submittedPassword });
      if (authError) throw authError;
      setMessage("Password updated. You can now sign in.");
    } catch (caught) { setError(safeAuthMessage(caught)); } finally { setBusy(false); }
  }

  const title = mode === "sign-in" ? "Welcome back." : mode === "sign-up" ? "Create your workspace access." : mode === "forgot" ? "Reset your password." : "Choose a new password.";
  return <form action={submit} className="auth-card" aria-describedby="auth-status">
    <h1>{title}</h1><p className="mt-3">Use your work email. Trancense supports human-reviewed audit decisions.</p>
    {mode !== "reset" && <label className="form-label">Email address<input required name="email" type="email" className="form-input" autoComplete="email" inputMode="email" /></label>}
    {mode !== "forgot" && <label className="form-label">Password<div className="password-field"><input required minLength={8} name="password" value={password} onChange={(event) => setPassword(event.target.value)} type={show ? "text" : "password"} autoComplete={mode === "sign-in" ? "current-password" : "new-password"}/><button type="button" onClick={() => setShow((value) => !value)} aria-label={show ? "Hide password" : "Show password"}>{show ? "Hide" : "Show"}</button></div>{mode !== "sign-in" && <p className="field-help">{assessment.label}: {assessment.guidance}</p>}</label>}
    {needsConfirmation && <label className="form-label">Confirm password<div className="password-field"><input required minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} type={show ? "text" : "password"} autoComplete="new-password"/></div>{confirmation && confirmation !== password && <p className="field-error">Passwords do not match.</p>}</label>}
    <Button disabled={busy} className="mt-6">{busy ? "Please wait…" : mode === "sign-in" ? "Sign in" : mode === "sign-up" ? "Create account" : mode === "forgot" ? "Send reset link" : "Save new password"}</Button>
    <p id="auth-status" aria-live="polite" className="auth-status">{message}</p>{error && <p role="alert" className="field-error">{error}</p>}
    <p className="auth-links">{mode === "sign-in" ? <><Link href="/forgot-password">Forgot password?</Link> · <Link href="/sign-up">Create account</Link></> : <Link href="/sign-in">Back to sign in</Link>}</p>
  </form>;
}
