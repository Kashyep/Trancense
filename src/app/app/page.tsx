import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace";
import { AppShell } from "@/components/app-shell";
import { ActionLink, Badge, EmptyState } from "@/components/ui";
import { calculateEnergy, calculateBaseline } from "@/domain/calculations";

export const dynamic = "force-dynamic";

export default async function Overview() {
  const c = await getWorkspaceContext();
  if (!c) redirect("/onboarding");
  if (!c.audit || !c.boundary) redirect("/onboarding");

  const [{ data: records }, { data: events }, { data: recommendations }] = await Promise.all([
    c.client.from("energy_records").select("normalized_kwh,review_state").eq("audit_id", c.audit.id),
    c.client.from("audit_events").select("action,created_at").eq("audit_id", c.audit.id).order("created_at", { ascending: false }).limit(5),
    c.client.from("recommendations").select("state").eq("audit_id", c.audit.id),
  ]);
  const energy = calculateEnergy((records ?? []).map((record) => ({ kwh: record.normalized_kwh, status: record.review_state })));
  const baseline = calculateBaseline((records ?? []).filter((record) => record.review_state === "approved" && record.normalized_kwh !== null).map((record) => Number(record.normalized_kwh)));
  const hasEntries = (records?.length ?? 0) > 0;

  return <AppShell workspace={c.workspaceName} role={c.role}><main className="page-pad">
    <header className="app-page-header"><div><p className="kicker">{c.audit.name} · {c.boundary.name}</p><h1 className="mt-3">Keep the audit moving.</h1></div><p>Enter a monthly reading, review it, then use approved data in your analysis and report.</p></header>
    <section className="feature-card p-6 sm:p-8"><p className="kicker">Next step</p><h2 className="mt-2 text-3xl">{hasEntries ? "Add the next monthly reading" : "Add your first bill or meter reading"}</h2><p className="mt-3 max-w-2xl">One entry captures the month, original reading, and an optional supporting bill. It stays a draft so review remains separate and visible.</p><ActionLink href="/app/energy" className="mt-5">Add monthly data</ActionLink></section>
    <div className="mt-5 grid gap-5 md:grid-cols-3"><section className="data-card p-6"><p className="kicker">Approved energy</p><p className="mt-3 text-3xl font-heading">{energy.included ? `${energy.value.toLocaleString()} kWh` : "Not available"}</p><p className="mt-2 text-sm muted">{energy.included ? `${energy.excluded} records still need review.` : "Approve compatible entries to calculate."}</p></section><section className="data-card p-6"><p className="kicker">Historical baseline</p><p className="mt-3 text-3xl font-heading">{baseline.available ? `${baseline.value} kWh` : "Not available"}</p><p className="mt-2 text-sm muted">{baseline.available ? "Based on approved monthly records." : "Three approved months are required."}</p></section><section className="data-card p-6"><p className="kicker">Action progress</p><p className="mt-3 text-3xl font-heading">{recommendations?.filter((recommendation) => ["completed", "verified"].includes(recommendation.state)).length ?? 0} / {recommendations?.length ?? 0}</p><p className="mt-2 text-sm muted">Completed is not verification.</p></section></div>
    <section className="mt-8 data-card p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="kicker">Simple workflow</p><h2 className="mt-2 text-3xl">Enter → review → use</h2><p className="mt-2 muted">Approved readings support analysis. Findings and actions can then support a draft report.</p></div><Badge tone={energy.included >= 3 ? "good" : "warning"}>{energy.included >= 3 ? "Inputs progressing" : "More approved inputs needed"}</Badge></div><ul className="mt-5 grid gap-3 border-t border-[var(--border)] pt-5 text-sm sm:grid-cols-3"><li>1. Add a monthly reading</li><li>2. Review compatible entries</li><li>3. Generate analysis or a report</li></ul></section>
    <section className="mt-8">{events?.length ? <><p className="kicker">Audit history</p><h2 className="mt-2 text-3xl">Recent activity</h2><ul className="mt-4 data-card divide-y divide-[var(--border)]">{events.map((event) => <li className="p-4" key={`${event.action}${event.created_at}`}>{event.action.replaceAll("_", " ")} <span className="muted">· {new Date(event.created_at).toLocaleString("en-IN")}</span></li>)}</ul></> : <EmptyState title="No activity yet">Add the first monthly reading above. A supporting bill is optional and remains private.</EmptyState>}</section>
  </main></AppShell>;
}
