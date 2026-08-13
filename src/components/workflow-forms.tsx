"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  advanceRecommendation,
  createFinding,
  createRecommendation,
  generateCalculationSnapshot,
  reviewEnergyRecord,
  reviewFinding,
} from "@/app/actions";
import { nextRecommendationState, type RecommendationState } from "@/domain/workflow";
import { Button, Badge } from "@/components/ui";

type ActionState = { ok: boolean; error?: string };
const initial: ActionState = { ok: false, error: "" };

function Feedback({ state }: { state: ActionState }) {
  if (state.error) return <p role="alert" className="mt-3 text-sm text-red-700">{state.error}</p>;
  if (state.ok) return <p role="status" className="form-success mt-3 text-sm">Saved.</p>;
  return null;
}

function ReviewButtons({
  workspaceId,
  auditId,
  recordId,
  state,
  kind,
}: {
  workspaceId: string;
  auditId: string;
  recordId: string;
  state: string;
  kind: "energy" | "finding";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const review = (next: "approved" | "rejected") => {
    setError("");
    startTransition(async () => {
      const result = kind === "energy"
        ? await reviewEnergyRecord(workspaceId, auditId, recordId, next)
        : await reviewFinding(workspaceId, auditId, recordId, next);
      if (!result.ok) setError(result.error ?? "Could not complete review.");
      else router.refresh();
    });
  };
  if (state !== "draft") return <Badge tone={state === "approved" ? "good" : "warning"}>{state}</Badge>;
  return <div className="flex flex-wrap items-center gap-2">
    <Button type="button" className="min-h-9 px-3 text-sm" disabled={pending} onClick={() => review("approved")}>Approve</Button>
    <Button type="button" variant="secondary" className="min-h-9 px-3 text-sm" disabled={pending} onClick={() => review("rejected")}>Reject</Button>
    {error && <span role="alert" className="text-xs text-red-700">{error}</span>}
  </div>;
}

export function EnergyReviewButtons(props: Omit<Parameters<typeof ReviewButtons>[0], "kind">) {
  return <ReviewButtons {...props} kind="energy" />;
}

export function FindingReviewButtons(props: Omit<Parameters<typeof ReviewButtons>[0], "kind">) {
  return <ReviewButtons {...props} kind="finding" />;
}

export function FindingForm({ workspaceId, auditId, evidence }: { workspaceId: string; auditId: string; evidence: Array<{ id: string; filename: string }> }) {
  const [state, action, pending] = useActionState(createFinding, initial);
  return <form action={action} className="card p-6">
    <input type="hidden" name="workspaceId" value={workspaceId} />
    <input type="hidden" name="auditId" value={auditId} />
    <h2 className="text-3xl">Record a finding</h2>
    <p className="mt-2 muted">Findings start as drafts and require human review before they support a recommendation.</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-semibold">Title<input required name="title" className="mt-2 w-full rounded-xl border p-3" placeholder="Compressed-air leakage during idle hours" /></label>
      <label className="text-sm font-semibold">Category<input name="category" className="mt-2 w-full rounded-xl border p-3" placeholder="Operations" /></label>
      <label className="text-sm font-semibold">Confidence<select name="confidence" defaultValue="medium" className="mt-2 w-full rounded-xl border p-3"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
      <label className="text-sm font-semibold">Source evidence<select name="evidenceId" defaultValue="" className="mt-2 w-full rounded-xl border p-3"><option value="">No linked document</option>{evidence.map(item => <option value={item.id} key={item.id}>{item.filename}</option>)}</select></label>
    </div>
    <label className="mt-4 block text-sm font-semibold">Observation<textarea required name="observation" minLength={10} className="mt-2 w-full rounded-xl border p-3" placeholder="Describe what was observed, where it occurred, and why it matters." /></label>
    <Button disabled={pending} className="mt-5">{pending ? "Saving…" : "Save draft finding"}</Button>
    <Feedback state={state} />
  </form>;
}

export function RecommendationForm({ workspaceId, auditId, findings }: { workspaceId: string; auditId: string; findings: Array<{ id: string; title: string }> }) {
  const [state, action, pending] = useActionState(createRecommendation, initial);
  return <form action={action} className="card p-6">
    <input type="hidden" name="workspaceId" value={workspaceId} />
    <input type="hidden" name="auditId" value={auditId} />
    <h2 className="text-3xl">Create an accountable action</h2>
    <p className="mt-2 muted">Recommendations begin in Draft and can only move through the defined review sequence.</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-semibold sm:col-span-2">Intervention<input required name="intervention" className="mt-2 w-full rounded-xl border p-3" placeholder="Repair leaks and add an idle-period shutdown check" /></label>
      <label className="text-sm font-semibold">Related finding<select name="findingId" defaultValue="" className="mt-2 w-full rounded-xl border p-3"><option value="">No linked finding</option>{findings.map(item => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label>
      <label className="text-sm font-semibold">Affected system<input name="affectedSystem" className="mt-2 w-full rounded-xl border p-3" placeholder="Compressed air" /></label>
      <label className="text-sm font-semibold">Priority<select name="priority" defaultValue="medium" className="mt-2 w-full rounded-xl border p-3"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
      <label className="text-sm font-semibold">Estimated annual savings (kWh)<input name="estimatedSavingsKwh" type="number" min="0" step="any" className="mt-2 w-full rounded-xl border p-3" /></label>
      <label className="text-sm font-semibold">Implementation cost (INR)<input name="implementationCost" type="number" min="0" step="any" className="mt-2 w-full rounded-xl border p-3" /></label>
    </div>
    <label className="mt-4 block text-sm font-semibold">Assumptions<textarea name="assumptions" className="mt-2 w-full rounded-xl border p-3" placeholder="Savings estimate remains indicative until measured verification." /></label>
    <label className="mt-4 block text-sm font-semibold">Risks or dependencies<textarea name="risks" className="mt-2 w-full rounded-xl border p-3" placeholder="Requires maintenance window and production manager approval." /></label>
    <Button disabled={pending} className="mt-5">{pending ? "Saving…" : "Save draft recommendation"}</Button>
    <Feedback state={state} />
  </form>;
}

export function RecommendationAdvanceButton({ workspaceId, auditId, recommendationId, state, role }: { workspaceId: string; auditId: string; recommendationId: string; state: RecommendationState; role: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const next = nextRecommendationState(state);
  if (!next) return <Badge tone="good">Verified</Badge>;
  const canApprove = next === "approved" || next === "verified";
  const canAct = canApprove ? role === "owner" || role === "reviewer" : role === "owner" || role === "editor";
  if (!canAct) return <span className="text-sm muted">Next: {next.replaceAll("_", " ")} (role required)</span>;
  return <div className="flex flex-wrap items-center gap-2">
    <Button type="button" className="min-h-9 px-3 text-sm" disabled={pending} onClick={() => { setError(""); startTransition(async () => { const result = await advanceRecommendation(workspaceId, auditId, recommendationId, next); if (!result.ok) setError(result.error ?? "Could not advance recommendation."); else router.refresh(); }); }}>Move to {next.replaceAll("_", " ")}</Button>
    {error && <span role="alert" className="text-xs text-red-700">{error}</span>}
  </div>;
}

export function CalculationSnapshotForm({ workspaceId, auditId, boundaryId }: { workspaceId: string; auditId: string; boundaryId: string }) {
  const [state, action, pending] = useActionState(generateCalculationSnapshot, initial);
  return <form action={action} className="mt-6">
    <input type="hidden" name="workspaceId" value={workspaceId} />
    <input type="hidden" name="auditId" value={auditId} />
    <input type="hidden" name="boundaryId" value={boundaryId} />
    <Button disabled={pending}>{pending ? "Generating…" : "Generate calculation snapshot"}</Button>
    <Feedback state={state} />
  </form>;
}
