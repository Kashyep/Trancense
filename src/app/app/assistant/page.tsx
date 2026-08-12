import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AuditAssistantForm } from "@/components/reference-forms";
import { getWorkspaceContext } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const c = await getWorkspaceContext();
  if (!c || !c.audit) redirect("/onboarding");
  return <AppShell workspace={c.workspaceName} role={c.role}><main className="page-pad"><header className="app-page-header"><div><p className="kicker">{c.audit.name}</p><h1 className="mt-3">Assistant</h1></div><p>A small, grounded guide for the next audit step—not an autonomous decision-maker.</p></header><AuditAssistantForm workspaceId={c.workspaceId} auditId={c.audit.id} /></main></AppShell>;
}
