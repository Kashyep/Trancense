"use client";
import { createBrowserClient } from "@supabase/ssr";
import { publicEnv, supabaseConfigured } from "@/lib/env";
export function createClient() { if (!supabaseConfigured) throw new Error("Supabase is not configured."); return createBrowserClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL!, publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!); }
