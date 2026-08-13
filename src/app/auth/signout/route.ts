import { createClient } from "@/lib/supabase/server";
import { assertRequestOrigin } from "@/lib/security";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    assertRequestOrigin(request);
  } catch {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), 303);
}
