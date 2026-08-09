export type TrustedRecord = { kwh: number | null; status: string };
export type CalculationResult = { available: boolean; value: number | null; warning?: string };

export function calculateEnergy(records: TrustedRecord[]) {
  let value = 0; let included = 0;
  for (const record of records) {
    if (record.status === "approved" && typeof record.kwh === "number") { value += record.kwh; included++; }
  }
  return { value, included, excluded: records.length - included };
}
export function calculateBaseline(periods: number[]) {
  const required = 3;
  if (periods.length < required) return { available: false, value: null, count: periods.length, required, warning: "Three approved compatible monthly periods are required." };
  return { available: true, value: periods.reduce((sum, period) => sum + period, 0) / periods.length, count: periods.length, required };
}
export function calculateEmissions(kwh: number, factor: number | null): CalculationResult {
  if (factor === null) return { available: false, value: null, warning: "No approved emissions factor applies to this source and period." };
  return { available: true, value: kwh * factor };
}
export function calculatePayback(implementationCost: number, annualSavings: number): CalculationResult {
  if (annualSavings <= 0) return { available: false, value: null, warning: "Positive annual cost savings are required." };
  return { available: true, value: implementationCost / annualSavings };
}
export function normalizeToKwh(quantity: number, unit: string, factor?: number | null) {
  if (unit === "kWh") return { value: quantity, status: "native" as const };
  if (!factor) return { value: null, status: "missing_factor" as const };
  return { value: quantity * factor, status: "converted" as const };
}
