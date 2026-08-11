import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace";
import { AppShell } from "@/components/app-shell";
import { Badge, EmptyState } from "@/components/ui";
import { EnergyForm, EvidenceForm } from "@/components/data-forms";
import { ReportForm } from "@/components/report-form";
import { CalculationSnapshotForm, EnergyReviewButtons, FindingForm, FindingReviewButtons, RecommendationAdvanceButton, RecommendationForm } from "@/components/workflow-forms";
import { calculateBaseline, calculateEnergy } from "@/domain/calculations";
import type { RecommendationState } from "@/domain/workflow";

export const dynamic = "force-dynamic";

const pages: Record<string, { title: string; description: string }> = {
  setup: { title: "Site & audit setup", description: "The active reporting boundary flows into every calculation and report." },
  evidence: { title: "Evidence & documents", description: "Private evidence is never automatically approved data." },
  energy: { title: "Energy data", description: "Preserve original input and units, then review compatible records." },
  equipment: { title: "Equipment", description: "Inventory equipment with source links and data-quality context." },
  analysis: { title: "Analysis & KPIs", description: "Every KPI is reproducible from approved compatible inputs." },
  findings: { title: "Findings", description: "Observations require evidence, confidence, and human review." },
  recommendations: { title: "Recommendations & actions", description: "Draft → Review → Approved → Planned → In progress → Completed → Verified." },
  reports: { title: "Reports", description: "Draft reports are generated only from authorized persisted audit data." },
  settings: { title: "Workspace settings", description: "Manage supported workspace preferences, team roles, factors, and tariffs." },
  account: { title: "Account", description: "Manage your profile and session security." },
};

function dateLabel(value: string | null | undefined) {
  return value ? new Date(value).toLocaleDateString("en-IN") : "—";
}

function PageHeader({ auditName, boundaryName, page }: { auditName: string; boundaryName: string; page: { title: string; description: string } }) {
  return <header className="app-page-header"><div><p className="kicker">{auditName} · {boundaryName}</p><h1 className="mt-3">{page.title}</h1></div><p className="max-w-md">{page.description}</p></header>;
}

export default async function WorkspacePage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const page = pages[section];
  if (!page) notFound();
  const c = await getWorkspaceContext();
  if (!c) redirect("/onboarding");
  if (!c.audit || !c.boundary) redirect("/onboarding");

  let content: React.ReactNode;

  if (section === "energy") {
    const { data: records } = await c.client.from("energy_records").select("id,period_start,period_end,source_category,raw_quantity,raw_unit,normalized_kwh,conversion_status,review_state,notes").eq("workspace_id", c.workspaceId).eq("audit_id", c.audit.id).eq("boundary_id", c.boundary.id).order("period_start", { ascending: true });
    content = <div className="space-y-8"><EnergyForm workspaceId={c.workspaceId} auditId={c.audit.id} boundaryId={c.boundary.id} /><section className="data-card overflow-hidden p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-3xl">Review queue</h2><p className="mt-2 muted">Original values stay visible beside normalized values. Only approved compatible records enter trusted totals.</p></div><Badge tone="blue">{records?.length ?? 0} records</Badge></div>{records?.length ? <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-[#e8e8e8] text-xs uppercase tracking-wide muted"><tr><th className="px-3 py-3">Period</th><th className="px-3 py-3">Source</th><th className="px-3 py-3">Original</th><th className="px-3 py-3">Normalized</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Review</th></tr></thead><tbody className="divide-y divide-[#e8e8e8]">{records.map(record => <tr key={record.id}><td className="px-3 py-4">{dateLabel(record.period_start)} – {dateLabel(record.period_end)}</td><td className="px-3 py-4">{String(record.source_category).replaceAll("_", " ")}</td><td className="px-3 py-4">{Number(record.raw_quantity).toLocaleString("en-IN")} {record.raw_unit}</td><td className="px-3 py-4">{record.normalized_kwh === null ? <span className="muted">Unavailable</span> : `${Number(record.normalized_kwh).toLocaleString("en-IN")} kWh`}</td><td className="px-3 py-4"><Badge tone={record.conversion_status === "missing_factor" ? "warning" : "neutral"}>{record.conversion_status}</Badge></td><td className="px-3 py-4"><EnergyReviewButtons workspaceId={c.workspaceId} auditId={c.audit!.id} recordId={record.id} state={record.review_state} /></td></tr>)}</tbody></table></div> : <EmptyState title="No energy records yet">Enter a monthly record above, then review it before it becomes part of a trusted calculation.</EmptyState>}</section></div>;
  } else if (section === "evidence") {
    const { data: evidence } = await c.client.from("evidence_documents").select("id,filename,content_type,byte_size,source_provider,notes,review_state,created_at").eq("workspace_id", c.workspaceId).eq("audit_id", c.audit.id).order("created_at", { ascending: false });
    content = <div className="space-y-8"><EvidenceForm workspaceId={c.workspaceId} auditId={c.audit.id} /><section className="data-card p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-3xl">Evidence index</h2><p className="mt-2 muted">Files remain private and untrusted until a reviewer connects them to approved data or a reviewed finding.</p></div><Badge tone="blue">{evidence?.length ?? 0} documents</Badge></div>{evidence?.length ? <ul className="mt-6 divide-y divide-[#e8e8e8]">{evidence.map(item => <li className="flex flex-wrap items-center justify-between gap-4 py-4" key={item.id}><div><p className="font-medium">{item.filename}</p><p className="mt-1 text-sm muted">{item.source_provider || "User upload"} · {item.content_type} · {Math.round(Number(item.byte_size) / 1024)} KB · {dateLabel(item.created_at)}</p>{item.notes && <p className="mt-2 text-sm">{item.notes}</p>}</div><div className="flex items-center gap-3"><Badge tone={item.review_state === "approved" ? "good" : "warning"}>{item.review_state}</Badge><Link href={`/api/evidence/${item.id}`} className="link-ember text-sm">Open securely</Link></div></li>)}</ul> : <EmptyState title="No source evidence yet">Upload the document that supports the audit context. A file upload does not make its contents trusted automatically.</EmptyState>}</section></div>;
  } else if (section === "analysis") {
    const [{ data: records }, { data: snapshots }, { data: findings }, { data: recommendations }] = await Promise.all([
      c.client.from("energy_records").select("id,period_start,period_end,normalized_kwh,review_state,conversion_status").eq("workspace_id", c.workspaceId).eq("audit_id", c.audit.id).eq("boundary_id", c.boundary.id).order("period_start", { ascending: true }),
      c.client.from("calculations").select("id,metric,value,unit,formula_name,formula_version,input_record_ids,excluded_record_ids,assumptions,warnings,quality_state,created_at").eq("workspace_id", c.workspaceId).eq("audit_id", c.audit.id).order("created_at", { ascending: false }).limit(1),
      c.client.from("findings").select("id,review_state").eq("workspace_id", c.workspaceId).eq("audit_id", c.audit.id),
      c.client.from("recommendations").select("id,state").eq("workspace_id", c.workspaceId).eq("audit_id", c.audit.id),
    ]);
    const rows = records ?? [];
    const energy = calculateEnergy(rows.map(record => ({ kwh: record.normalized_kwh === null ? null : Number(record.normalized_kwh), status: record.review_state })));
    const baseline = calculateBaseline(rows.filter(record => record.review_state === "approved" && record.normalized_kwh !== null).map(record => Number(record.normalized_kwh)));
    const snapshot = snapshots?.[0];
    content = <div className="space-y-8"><section className="grid gap-5 md:grid-cols-3"><div className="data-card p-6"><p className="muted">Approved energy</p><p className="mt-2 text-3xl">{energy.included ? `${energy.value.toLocaleString("en-IN")} kWh` : "Unavailable"}</p><p className="mt-2 text-sm muted">{energy.excluded} record(s) excluded</p></div><div className="data-card p-6"><p className="muted">Historical baseline</p><p className="mt-2 text-3xl">{baseline.available ? `${baseline.value} kWh` : "Unavailable"}</p><p className="mt-2 text-sm muted">{baseline.available ? "historical_average_v1" : baseline.warning}</p></div><div className="data-card p-6"><p className="muted">Review progress</p><p className="mt-2 text-3xl">{findings?.filter(item => item.review_state === "approved").length ?? 0} findings · {recommendations?.length ?? 0} actions</p><p className="mt-2 text-sm muted">Human review remains visible.</p></div></section><section className="data-card p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-3xl">Calculation provenance</h2><p className="mt-2 max-w-2xl muted">Generate a snapshot after reviewing inputs. The snapshot records the formula, included records, excluded records, assumptions, and warnings.</p></div><Badge tone={snapshot?.quality_state === "reviewable" ? "good" : "warning"}>{snapshot?.quality_state ?? "Not generated"}</Badge></div>{snapshot ? <div className="mt-6 grid gap-4 sm:grid-cols-2"><div><p className="eyebrow">Formula</p><p className="mt-1">{snapshot.formula_name} · v{snapshot.formula_version}</p></div><div><p className="eyebrow">Generated</p><p className="mt-1">{dateLabel(snapshot.created_at)}</p></div><div><p className="eyebrow">Included record IDs</p><p className="mt-1">{Array.isArray(snapshot.input_record_ids) ? snapshot.input_record_ids.length : 0}</p></div><div><p className="eyebrow">Excluded record IDs</p><p className="mt-1">{Array.isArray(snapshot.excluded_record_ids) ? snapshot.excluded_record_ids.length : 0}</p></div></div> : <p className="mt-6 text-sm muted">No persisted calculation snapshot exists yet.</p>}<CalculationSnapshotForm workspaceId={c.workspaceId} auditId={c.audit.id} boundaryId={c.boundary.id} /></section></div>;
  } else if (section === "findings") {
    const [{ data: findings }, { data: evidence }] = await Promise.all([
      c.client.from("findings").select("id,title,category,observation,confidence,review_state,created_at").eq("workspace_id", c.workspaceId).eq("audit_id", c.audit.id).order("created_at", { ascending: false }),
      c.client.from("evidence_documents").select("id,filename").eq("workspace_id", c.workspaceId).eq("audit_id", c.audit.id).order("created_at", { ascending: false }),
    ]);
    content = <div className="space-y-8"><FindingForm workspaceId={c.workspaceId} auditId={c.audit.id} evidence={evidence ?? []} /><section className="data-card p-6"><h2 className="text-3xl">Review queue</h2>{findings?.length ? <ul className="mt-6 divide-y divide-[#e8e8e8]">{findings.map(finding => <li className="py-5" key={finding.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">{finding.category || "Observation"} · {finding.confidence || "Unrated"} confidence</p><h3 className="mt-2 text-2xl">{finding.title}</h3><p className="mt-3 max-w-3xl text-[#4d4d4d]">{finding.observation}</p></div><FindingReviewButtons workspaceId={c.workspaceId} auditId={c.audit!.id} recordId={finding.id} state={finding.review_state} /></div></li>)}</ul> : <EmptyState title="No findings yet">Create the first observation after reviewing the evidence and energy inputs.</EmptyState>}</section></div>;
  } else if (section === "recommendations") {
    const [{ data: recommendations }, { data: findings }] = await Promise.all([
      c.client.from("recommendations").select("id,intervention,affected_system,priority,estimated_savings_kwh,implementation_cost,state,created_at,finding_id").eq("workspace_id", c.workspaceId).eq("audit_id", c.audit.id).order("created_at", { ascending: false }),
      c.client.from("findings").select("id,title").eq("workspace_id", c.workspaceId).eq("audit_id", c.audit.id),
    ]);
    const findingTitles = new Map((findings ?? []).map(finding => [finding.id, finding.title]));
    content = <div className="space-y-8"><RecommendationForm workspaceId={c.workspaceId} auditId={c.audit.id} findings={findings ?? []} /><section className="data-card p-6"><h2 className="text-3xl">Action state machine</h2><p className="mt-2 muted">Each action advances one state at a time. Reviewer-only transitions are visibly separated from execution steps.</p>{recommendations?.length ? <ul className="mt-6 divide-y divide-[#e8e8e8]">{recommendations.map(item => <li className="py-5" key={item.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">{item.affected_system || "Action"} · {item.priority || "Unprioritized"}</p><h3 className="mt-2 text-2xl">{item.intervention}</h3><p className="mt-2 text-sm muted">{item.finding_id ? `Finding: ${findingTitles.get(item.finding_id) || "Linked finding"}` : "No linked finding"} · {item.estimated_savings_kwh ? `${Number(item.estimated_savings_kwh).toLocaleString("en-IN")} kWh estimated` : "No savings estimate"}</p></div><div className="text-right"><Badge tone={item.state === "verified" ? "good" : "neutral"}>{item.state.replaceAll("_", " ")}</Badge><div className="mt-3"><RecommendationAdvanceButton workspaceId={c.workspaceId} auditId={c.audit!.id} recommendationId={item.id} state={item.state as RecommendationState} role={c.role} /></div></div></div></li>)}</ul> : <EmptyState title="No recommendations yet">Turn a reviewed finding into an accountable action with assumptions, risks, and an owner.</EmptyState>}</section></div>;
  } else if (section === "reports") {
    const { data: reports } = await c.client.from("report_exports").select("id,status,version,generated_at,created_at").eq("workspace_id", c.workspaceId).eq("audit_id", c.audit.id).order("created_at", { ascending: false });
    content = <div className="space-y-8"><section className="data-card p-6"><h2 className="text-3xl">Draft report export</h2><p className="mt-3 muted">Exports use authorized persisted audit data and label unavailable, estimated, and unverified information.</p><div className="mt-5"><ReportForm workspaceId={c.workspaceId} auditId={c.audit.id} canGenerate={["owner", "reviewer"].includes(c.role)} /></div></section><section className="data-card p-6"><h2 className="text-3xl">Export history</h2>{reports?.length ? <ul className="mt-5 divide-y divide-[#e8e8e8]">{reports.map(report => <li className="flex flex-wrap items-center justify-between gap-4 py-4" key={report.id}><div><p className="font-medium">Trancense draft report · v{report.version}</p><p className="mt-1 text-sm muted">{report.status} · {dateLabel(report.generated_at || report.created_at)}</p></div>{report.status === "completed" && <Link href={`/api/reports/${report.id}`} className="link-ember text-sm">Download securely</Link>}</li>)}</ul> : <p className="mt-5 text-sm muted">No exports yet. Generate one after reviewing the audit inputs.</p>}</section></div>;
  } else {
    content = <EmptyState title={`No ${page.title.toLowerCase()} yet`}>{page.description} This screen is ready for records created through the secured workspace workflow.</EmptyState>;
  }

  return <AppShell workspace={c.workspaceName} role={c.role}><main className="page-pad"><PageHeader auditName={c.audit.name} boundaryName={c.boundary.name} page={page} /><div>{content}</div></main></AppShell>;
}
