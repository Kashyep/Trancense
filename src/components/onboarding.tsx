"use client";

import { useActionState } from "react";
import { completeSetup, createWorkspace } from "@/app/actions";
import { Button } from "@/components/ui";

const initial = { ok: false, error: "" };

export function CreateWorkspace() {
  const [state, action, pending] = useActionState(createWorkspace, initial);

  return <form action={action} className="card max-w-lg p-7">
    <h1 className="text-4xl">Set up your workspace</h1>
    <p className="mt-3 muted">Enter your workspace and primary site. A starter audit boundary will be created automatically.</p>
    <label className="mt-6 block text-sm font-semibold">Workspace name<input name="workspaceName" required minLength={2} className="mt-2 w-full rounded-xl border p-3" placeholder="e.g. Meridian Energy Audit" /></label>
    <label className="mt-5 block text-sm font-semibold">Site name<input name="siteName" required minLength={2} className="mt-2 w-full rounded-xl border p-3" placeholder="e.g. Pune Manufacturing Campus" /></label>
    <Button disabled={pending} className="mt-6 w-full">{pending ? "Creating workspace…" : "Enter workspace"}</Button>
    {state.error && <p role="alert" className="mt-4 text-sm text-red-700">{state.error}</p>}
  </form>;
}

export function CompleteSetup({ workspaceId }: { workspaceId: string }) {
  const [state, action, pending] = useActionState(completeSetup, initial);

  return <form action={action} className="card max-w-2xl p-7">
    <input type="hidden" name="workspaceId" value={workspaceId} />
    <h1 className="text-4xl">Set the audit boundary</h1>
    <p className="mt-3 muted">India, INR, Asia/Kolkata, metric units and monthly reporting are set for this pilot. You can revisit supported details in setup.</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">{[["siteName", "Site name", "Greenfield campus"], ["facilityName", "Facility name", "Main manufacturing block"], ["auditName", "Audit name", "FY26 energy audit"], ["area", "Floor area (m²)", "1200"]].map(([name, label, placeholder]) => <label key={name} className="block text-sm font-semibold">{label}<input name={name} required type={name === "area" ? "number" : "text"} min={name === "area" ? "0.01" : undefined} className="mt-2 w-full rounded-xl border p-3" placeholder={placeholder} /></label>)}</div>
    <label className="mt-4 block text-sm font-semibold">Audit objective<textarea name="objective" required minLength={4} className="mt-2 w-full rounded-xl border p-3" placeholder="Establish a defensible energy baseline and identify reviewed opportunities." /></label>
    <label className="mt-4 block text-sm font-semibold">Boundary and exclusions<textarea name="scope" required minLength={4} className="mt-2 w-full rounded-xl border p-3" placeholder="Whole facility; exclude leased retail unit." /></label>
    <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Period starts<input name="periodStart" required type="date" className="mt-2 w-full rounded-xl border p-3" /></label><label className="text-sm font-semibold">Period ends<input name="periodEnd" required type="date" className="mt-2 w-full rounded-xl border p-3" /></label></div>
    <Button disabled={pending} className="mt-6">{pending ? "Saving…" : "Enter audit workspace"}</Button>
    {state.error && <p role="alert" className="mt-4 text-sm text-red-700">{state.error}</p>}
  </form>;
}
