import { AuthLayout } from "@/components/auth-layout";
import { CreateWorkspace, CompleteSetup } from "@/components/onboarding";
import { supabaseConfigured } from "@/lib/env";
import { currentUser } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspace";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Workspace setup", robots: { index: false, follow: false } };

export default async function Onboarding() {
  if (!supabaseConfigured) {
    return <main className="p-8"><h1>Configure Supabase to start</h1><p>Copy .env.example to `.env.local` and add your project URL and publishable key.</p></main>;
  }

  try {
    await currentUser();
  } catch {
    redirect("/sign-in");
  }

  const context = await getWorkspaceContext();
  if (context?.audit) redirect("/app");

  return <AuthLayout eyebrow="First workspace setup">{!context ? <CreateWorkspace /> : <CompleteSetup workspaceId={context.workspaceId} />}</AuthLayout>;
}
