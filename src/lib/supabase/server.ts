import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv, supabaseConfigured } from "@/lib/env";

export async function createClient() {
  if (!supabaseConfigured) throw new Error("Supabase is not configured. Add the variables in .env.local.");
  const cookieStore = await cookies();
  return createServerClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL!, publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { cookies: { getAll: () => cookieStore.getAll(), setAll: (items: { name: string; value: string; options: CookieOptions }[]) => { try { items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* Server Components cannot set cookies. */ } } } });
}
export async function currentUser() { const client = await createClient(); const { data: { user }, error } = await client.auth.getUser(); if (error || !user) throw new Error("Your session has expired. Please sign in again."); return { client, user }; }
