import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge, EmptyState } from "@/components/ui";
import { EquipmentForm } from "@/components/reference-forms";
import { getWorkspaceContext } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function EquipmentPage() {
  const c = await getWorkspaceContext();
  if (!c || !c.audit) redirect("/onboarding");
  const { data: equipment } = await c.client.from("equipment").select("id,name,category,location,quantity,capacity,operating_hours,condition,quality_label,created_at").eq("workspace_id", c.workspaceId).eq("facility_id", c.audit.facility_id).order("created_at", { ascending: false });
  return <AppShell workspace={c.workspaceName} role={c.role}><main className="page-pad"><header className="app-page-header"><div><p className="kicker">{c.audit.name}</p><h1 className="mt-3">Equipment</h1></div><p>Keep an auditable equipment register without making the monthly energy workflow more complex.</p></header><div className="space-y-8"><EquipmentForm workspaceId={c.workspaceId} facilityId={c.audit.facility_id} /><section className="data-card p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-3xl">Registered systems</h2><p className="mt-2 muted">Values are user-entered until they are supported by source evidence and review.</p></div><Badge tone="blue">{equipment?.length ?? 0} items</Badge></div>{equipment?.length ? <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-[var(--border)] text-xs uppercase tracking-wide muted"><tr><th className="px-3 py-3">System</th><th className="px-3 py-3">Location</th><th className="px-3 py-3">Quantity</th><th className="px-3 py-3">Capacity</th><th className="px-3 py-3">Hours/year</th><th className="px-3 py-3">Condition</th></tr></thead><tbody className="divide-y divide-[var(--border)]">{equipment.map((item) => <tr key={item.id}><td className="px-3 py-4"><p className="font-medium">{item.name}</p><p className="mt-1 muted">{item.category || "Uncategorised"} · {item.quality_label}</p></td><td className="px-3 py-4">{item.location || "—"}</td><td className="px-3 py-4">{item.quantity}</td><td className="px-3 py-4">{item.capacity ?? "—"}</td><td className="px-3 py-4">{item.operating_hours ?? "—"}</td><td className="px-3 py-4">{item.condition || "—"}</td></tr>)}</tbody></table></div> : <EmptyState title="No equipment yet">Add the most important systems first, then extend the register as the walkthrough progresses.</EmptyState>}</section></div></main></AppShell>;
}
