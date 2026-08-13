"use client";

import { useActionState } from "react";
import { askAuditAssistant, createEquipment, createSolarScenario, importEnergyCsv } from "@/app/actions";
import { Button } from "@/components/ui";

const initial = { ok: false, error: "" };

export function EquipmentForm({ workspaceId, facilityId }: { workspaceId: string; facilityId: string }) {
  const [state, action, pending] = useActionState(createEquipment, initial);
  return <form action={action} className="utility-card p-6">
    <input type="hidden" name="workspaceId" value={workspaceId} /><input type="hidden" name="facilityId" value={facilityId} />
    <p className="kicker">Equipment register</p><h2 className="mt-2 text-3xl">Add a system</h2><p className="mt-2 muted">Start with the major energy-using equipment. Capacity, hours, and condition are optional, so the register can grow with the audit.</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="form-label mt-0 sm:col-span-2">Equipment name<input required name="name" className="form-input" placeholder="e.g. Chiller 01" /></label><label className="form-label mt-0">Category<input name="category" className="form-input" placeholder="HVAC, pump, compressor…" /></label><label className="form-label mt-0">Location<input name="location" className="form-input" placeholder="Plant room" /></label><label className="form-label mt-0">Quantity<input name="quantity" type="number" min="1" defaultValue="1" className="form-input" /></label><label className="form-label mt-0">Capacity <span className="font-normal muted">(optional)</span><input name="capacity" type="number" min="0" step="any" className="form-input" /></label><label className="form-label mt-0">Operating hours / year <span className="font-normal muted">(optional)</span><input name="operatingHours" type="number" min="0" step="any" className="form-input" /></label><label className="form-label mt-0">Condition <span className="font-normal muted">(optional)</span><input name="condition" className="form-input" placeholder="Good, fair, needs review…" /></label></div><label className="form-label">Notes <span className="font-normal muted">(optional)</span><textarea name="notes" className="form-textarea" /></label>
    <Button className="mt-1" disabled={pending}>{pending ? "Saving…" : "Add equipment"}</Button>{state.ok && <p role="status" className="form-success mt-3 text-sm">Equipment saved.</p>}{state.error && <p role="alert" className="field-error mt-3">{state.error}</p>}
  </form>;
}

export function EnergyImportForm({ workspaceId, auditId, boundaryId }: { workspaceId: string; auditId: string; boundaryId: string }) {
  const [state, action, pending] = useActionState(importEnergyCsv, initial);
  return <form action={action} className="utility-card p-6">
    <input type="hidden" name="workspaceId" value={workspaceId} /><input type="hidden" name="auditId" value={auditId} /><input type="hidden" name="boundaryId" value={boundaryId} />
    <p className="kicker">CSV import</p><h2 className="mt-2 text-3xl">Bring in monthly readings</h2><p className="mt-2 max-w-2xl muted">Upload one CSV with a <code>month</code> and <code>quantity</code> (or <code>kwh</code>) column. Optional columns: source, unit, cost, provider, and notes. The original CSV is retained privately as evidence and each row starts as a draft.</p>
    <label className="form-label">CSV file<input required name="file" type="file" accept="text/csv,.csv" className="form-input" /></label>
    <Button className="mt-1" disabled={pending}>{pending ? "Importing…" : "Import monthly data"}</Button>{state.ok && <p role="status" className="form-success mt-3 text-sm">Imported {state.rows ?? 0} draft record(s).</p>}{state.error && <p role="alert" className="field-error mt-3">{state.error}</p>}
  </form>;
}

const solarFields = [
  ["roofArea", "Roof area (m²)", "1000"], ["exclusions", "Excluded area (m²)", "100"], ["moduleW", "Module rating (W)", "550"], ["moduleArea", "Module area (m²)", "2.6"], ["yieldKwhPerKw", "Annual yield (kWh/kW)", "1400"], ["losses", "System losses (0–1)", "0.12"], ["selfConsumption", "Self-consumption (0–1)", "0.8"], ["capex", "CAPEX (INR)", "0"], ["annualOm", "Annual O&M (INR)", "0"], ["tariff", "Grid tariff (INR/kWh)", "8"], ["life", "Project life (years)", "25"], ["discountRate", "Discount rate (0–1)", "0.1"], ["degradation", "Annual degradation (0–1)", "0.005"],
] as const;

export function SolarScenarioForm({ workspaceId, auditId }: { workspaceId: string; auditId: string }) {
  const [state, dispatch, pending] = useActionState(createSolarScenario, initial);
  const action = (formData: FormData) => {
    const inputs = Object.fromEntries(solarFields.map(([name]) => [name, Number(formData.get(name))]));
    const assumptions = String(formData.get("assumptionsText") || "").split("\n").map((value) => value.trim()).filter(Boolean);
    formData.set("inputs", JSON.stringify(inputs)); formData.set("assumptions", JSON.stringify(assumptions)); dispatch(formData);
  };
  return <form action={action} className="utility-card p-6"><input type="hidden" name="workspaceId" value={workspaceId} /><input type="hidden" name="auditId" value={auditId} /><p className="kicker">Scenario planning</p><h2 className="mt-2 text-3xl">Model rooftop solar</h2><p className="mt-2 max-w-2xl muted">This is a planning estimate, not a design or procurement quote. It keeps inputs, assumptions, and calculated outputs together for review.</p><label className="form-label">Scenario name<input required name="name" className="form-input" defaultValue="Rooftop solar option" /></label><div className="grid gap-4 sm:grid-cols-2">{solarFields.map(([name, label, value]) => <label key={name} className="form-label mt-0">{label}<input required name={name} type="number" min="0" step="any" defaultValue={value} className="form-input" /></label>)}</div><label className="form-label">Assumptions <span className="font-normal muted">(one per line, optional)</span><textarea name="assumptionsText" className="form-textarea" placeholder="Roof survey required before design" /></label><Button className="mt-1" disabled={pending}>{pending ? "Saving…" : "Save solar scenario"}</Button>{state.ok && <p role="status" className="form-success mt-3 text-sm">Scenario saved with calculated outputs.</p>}{state.error && <p role="alert" className="field-error mt-3">{state.error}</p>}</form>;
}

export function AuditAssistantForm({ workspaceId, auditId }: { workspaceId: string; auditId: string }) {
  const [state, action, pending] = useActionState(askAuditAssistant, initial);
  return <form action={action} className="utility-card p-6"><input type="hidden" name="workspaceId" value={workspaceId} /><input type="hidden" name="auditId" value={auditId} /><p className="kicker">Workspace guide</p><h2 className="mt-2 text-3xl">Ask about this audit</h2><p className="mt-2 muted">Answers are grounded only in the currently stored workspace records. This guide does not approve data or create findings.</p><label className="form-label">Question<input required name="prompt" className="form-input" placeholder="What should we do next?" /></label><Button className="mt-1" disabled={pending}>{pending ? "Checking…" : "Ask"}</Button>{state.ok && state.text && <p role="status" className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm leading-6">{state.text}</p>}{state.error && <p role="alert" className="field-error mt-3">{state.error}</p>}</form>;
}
