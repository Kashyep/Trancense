import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge, EmptyState } from "@/components/ui";
import { SolarScenarioForm } from "@/components/reference-forms";
import { getWorkspaceContext } from "@/lib/workspace";

export const dynamic = "force-dynamic";

type ScenarioOutput = { capacityKw?: number; generation?: number; annualBenefit?: number; payback?: number | null; npv?: number };
const number = (value: unknown, digits = 0) => typeof value === "number" && Number.isFinite(value) ? value.toLocaleString("en-IN", { maximumFractionDigits: digits }) : "Unavailable";

export default async function SolarPage() {
  const c = await getWorkspaceContext();
  if (!c || !c.audit) redirect("/onboarding");
  const { data: scenarios } = await c.client.from("solar_scenarios").select("id,name,outputs,assumptions,created_at").eq("workspace_id", c.workspaceId).eq("audit_id", c.audit.id).order("created_at", { ascending: false });
  return <AppShell workspace={c.workspaceName} role={c.role}><main className="page-pad"><header className="app-page-header"><div><p className="kicker">{c.audit.name}</p><h1 className="mt-3">Solar planning</h1></div><p>Compare preliminary rooftop solar scenarios while retaining every input and assumption for later review.</p></header><div className="space-y-8"><SolarScenarioForm workspaceId={c.workspaceId} auditId={c.audit.id} /><section className="data-card p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-3xl">Saved scenarios</h2><p className="mt-2 muted">Benefits are estimates based on the saved scenario inputs, not verified savings or a construction design.</p></div><Badge tone="blue">{scenarios?.length ?? 0} scenarios</Badge></div>{scenarios?.length ? <ul className="mt-6 divide-y divide-[var(--border)]">{scenarios.map((scenario) => { const output = scenario.outputs as ScenarioOutput; return <li key={scenario.id} className="py-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">Saved {new Date(scenario.created_at).toLocaleDateString("en-IN")}</p><h3 className="mt-2 text-2xl">{scenario.name}</h3><p className="mt-2 text-sm muted">{Array.isArray(scenario.assumptions) ? scenario.assumptions.length : 0} recorded assumption(s)</p></div><div className="grid grid-cols-2 gap-x-6 gap-y-3 text-right text-sm sm:grid-cols-4"><div><p className="muted">Capacity</p><p className="font-medium">{number(output.capacityKw, 1)} kW</p></div><div><p className="muted">Generation</p><p className="font-medium">{number(output.generation)} kWh/year</p></div><div><p className="muted">Benefit</p><p className="font-medium">₹{number(output.annualBenefit)}/year</p></div><div><p className="muted">Payback</p><p className="font-medium">{output.payback === null ? "Unavailable" : `${number(output.payback, 1)} years`}</p></div></div></div></li>; })}</ul> : <EmptyState title="No saved scenarios">Use the planner above to capture a preliminary option. A roof survey and design validation are still required.</EmptyState>}</section></div></main></AppShell>;
}
