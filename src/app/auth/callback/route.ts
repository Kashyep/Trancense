import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const signInUrl = new URL("/sign-in", url.origin);
  const code = url.searchParams.get("code");

  if (!code) {
    signInUrl.searchParams.set("error", "callback");
    return NextResponse.redirect(signInUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    signInUrl.searchParams.set("error", "callback");
    return NextResponse.redirect(signInUrl);
  }

  // Confirmation creates a temporary Supabase session. Clear it so the user
  // must explicitly sign in before entering onboarding or the workspace.
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/account-verified", url.origin));
}
