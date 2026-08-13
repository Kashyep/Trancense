"use client";

import { useActionState, useState } from "react";
import { createEnergyRecord, uploadEvidence } from "@/app/actions";
import { Button } from "@/components/ui";

const initial = { ok: false, error: "" };
const defaultUnits: Record<string, string> = {
  electricity: "kWh", diesel: "L", petrol: "L", lpg: "kg", natural_gas: "m³", renewable: "kWh", other: "kWh",
};

export function EnergyForm({ workspaceId, auditId, boundaryId }: { workspaceId: string; auditId: string; boundaryId: string }) {
  const [state, action, pending] = useActionState(createEnergyRecord, initial);
  const [source, setSource] = useState("electricity");
  const [unit, setUnit] = useState(defaultUnits.electricity);

  return <form action={action} className="utility-card p-6">
    <input type="hidden" name="workspaceId" value={workspaceId} />
    <input type="hidden" name="auditId" value={auditId} />
    <input type="hidden" name="boundaryId" value={boundaryId} />
    <p className="kicker">Quick monthly entry</p>
    <h2 className="mt-2 text-3xl">Add one bill or meter reading</h2>
    <p className="mt-2 max-w-2xl muted">Choose the month and enter the reading exactly as it appears on the bill. Attach the bill now if you have it; everything else is optional.</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="form-label mt-0">Billing month<input required name="month" type="month" className="form-input" /></label>
      <label className="form-label mt-0">Energy type<select name="source" value={source} onChange={(event) => { setSource(event.target.value); setUnit(defaultUnits[event.target.value]); }} className="form-select"><option value="electricity">Electricity</option><option value="diesel">Diesel</option><option value="petrol">Petrol</option><option value="lpg">LPG</option><option value="natural_gas">Natural gas</option><option value="renewable">Renewable generation</option><option value="other">Other</option></select></label>
      <label className="form-label mt-0">Reading<input required name="quantity" type="number" min="0" step="any" inputMode="decimal" className="form-input" placeholder="e.g. 12450" /></label>
      <label className="form-label mt-0">Unit<input required name="unit" value={unit} onChange={(event) => setUnit(event.target.value)} className="form-input" /></label>
      <label className="form-label mt-0 sm:col-span-2">Attach the bill or meter photo <span className="font-normal muted">(optional)</span><input name="file" type="file" accept="application/pdf,image/png,image/jpeg,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="form-input" /></label>
    </div>
    <details className="mt-5 rounded-xl border border-[var(--border)] p-4"><summary className="cursor-pointer font-semibold">Add cost, provider, or notes <span className="font-normal muted">(optional)</span></summary><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="form-label mt-0">Total cost (INR)<input name="cost" type="number" min="0" step="any" className="form-input" /></label><label className="form-label mt-0">Provider / source<input name="sourceProvider" className="form-input" placeholder="e.g. Tata Power" /></label></div><label className="form-label">Notes<textarea name="notes" className="form-textarea" /></label></details>
    <Button className="mt-5" disabled={pending}>{pending ? "Saving…" : "Save monthly entry"}</Button>
    {state.ok && <p role="status" className="form-success mt-3 text-sm">Saved as a draft for review.</p>}
    {state.error && <p role="alert" className="field-error mt-3">{state.error}</p>}
  </form>;
}

export function EvidenceForm({ workspaceId, auditId }: { workspaceId: string; auditId: string }) {
  const [state, action, pending] = useActionState(uploadEvidence, initial);
  return <form action={action} className="utility-card p-6"><input type="hidden" name="workspaceId" value={workspaceId} /><input type="hidden" name="auditId" value={auditId} /><p className="kicker">Other source document</p><h2 className="mt-2 text-3xl">Upload a document</h2><p className="mt-2 muted">Use this for documents not tied to one monthly reading. Files stay private and require review before they support approved data.</p><label className="form-label">File<input required name="file" type="file" accept="application/pdf,image/png,image/jpeg,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="form-input" /></label><details className="mt-5 rounded-xl border border-[var(--border)] p-4"><summary className="cursor-pointer font-semibold">Add source details <span className="font-normal muted">(optional)</span></summary><label className="form-label">Source / provider<input name="source" className="form-input" /></label><label className="form-label">Notes<textarea name="notes" className="form-textarea" /></label></details><Button className="mt-5" disabled={pending}>{pending ? "Uploading…" : "Upload document"}</Button>{state.error && <p role="alert" className="field-error mt-3">{state.error}</p>}</form>;
}
