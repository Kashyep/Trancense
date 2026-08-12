import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { EnergyImportForm } from "@/components/reference-forms";
import { getWorkspaceContext } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const c = await getWorkspaceContext();
  if (!c || !c.audit || !c.boundary) redirect("/onboarding");
  return <AppShell workspace={c.workspaceName} role={c.role}><main className="page-pad"><header className="app-page-header"><div><p className="kicker">{c.audit.name} · {c.boundary.name}</p><h1 className="mt-3">Import data</h1></div><p>Use bulk import for established history; use the quick monthly entry for the next bill or meter reading.</p></header><EnergyImportForm workspaceId={c.workspaceId} auditId={c.audit.id} boundaryId={c.boundary.id} /></main></AppShell>;
}
