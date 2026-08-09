import { z } from "zod";
const publicSchema = z.object({ NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(), NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional() });
export const publicEnv = publicSchema.parse({ NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY });
export const supabaseConfigured = Boolean(publicEnv.NEXT_PUBLIC_SUPABASE_URL && publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
export const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
