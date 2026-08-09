import { NextResponse } from "next/server";
import { supabaseConfigured } from "@/lib/env";
export const dynamic='force-dynamic';
/** Deliberately unauthenticated and non-diagnostic: suitable for platform liveness checks. */
export async function GET() { return NextResponse.json({ status: supabaseConfigured ? "ok" : "misconfigured", version: process.env.npm_package_version ?? "0.1" }, { status: supabaseConfigured ? 200 : 503, headers: { "Cache-Control": "no-store" } }); }
