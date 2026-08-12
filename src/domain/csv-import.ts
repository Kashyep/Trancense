export type EnergyImportRow = {
  month: string;
  source: string;
  quantity: number;
  unit: string;
  cost: number | null;
  sourceProvider: string | null;
  notes: string | null;
};

const MONTH_COLUMNS = ["month", "billing_month", "period"];
const QUANTITY_COLUMNS = ["quantity", "energy", "kwh", "electricity_kwh", "consumption"];
const SOURCE_COLUMNS = ["source", "energy_type", "type"];
const UNIT_COLUMNS = ["unit", "energy_unit"];
const COST_COLUMNS = ["cost", "inr", "cost_inr", "amount"];
const PROVIDER_COLUMNS = ["provider", "source_provider", "utility"];
const NOTES_COLUMNS = ["notes", "note", "remarks"];

function normaliseHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function findColumn(headers: string[], options: string[]) {
  return headers.findIndex((header) => options.includes(header));
}

function parseCsvRows(source: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < source.length; i += 1) {
    const character = source[i];
    if (character === '"') {
      if (quoted && source[i + 1] === '"') { cell += '"'; i += 1; } else quoted = !quoted;
    } else if (character === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && source[i + 1] === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = []; cell = "";
    } else cell += character;
  }
  if (quoted) throw new Error("The CSV contains an unclosed quoted value.");
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function optionalNumber(value: string | undefined) {
  const clean = value?.trim().replace(/,/g, "") ?? "";
  if (!clean) return null;
  const number = Number(clean);
  if (!Number.isFinite(number) || number < 0) throw new Error("Cost values must be non-negative numbers.");
  return number;
}

function safeText(value: string | undefined) {
  const clean = value?.trim() ?? "";
  if (clean.startsWith("=") || clean.startsWith("+") || clean.startsWith("-") || clean.startsWith("@")) throw new Error("Formula-like cells are not supported in imports.");
  return clean || null;
}

export function parseEnergyCsv(source: string): EnergyImportRow[] {
  const rows = parseCsvRows(source);
  if (rows.length < 2) throw new Error("Include a header and at least one data row.");
  if (rows.length > 501) throw new Error("Imports are limited to 500 data rows at a time.");
  const headers = rows[0].map(normaliseHeader);
  const monthIndex = findColumn(headers, MONTH_COLUMNS);
  const quantityIndex = findColumn(headers, QUANTITY_COLUMNS);
  if (monthIndex < 0 || quantityIndex < 0) throw new Error("The CSV needs month and quantity (or kwh) columns.");
  const sourceIndex = findColumn(headers, SOURCE_COLUMNS);
  const unitIndex = findColumn(headers, UNIT_COLUMNS);
  const costIndex = findColumn(headers, COST_COLUMNS);
  const providerIndex = findColumn(headers, PROVIDER_COLUMNS);
  const notesIndex = findColumn(headers, NOTES_COLUMNS);

  return rows.slice(1).map((row, index) => {
    const month = safeText(row[monthIndex]);
    if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error(`Row ${index + 2} needs a month in YYYY-MM format.`);
    const quantityText = safeText(row[quantityIndex]);
    const quantity = Number(quantityText?.replace(/,/g, ""));
    if (!Number.isFinite(quantity) || quantity < 0) throw new Error(`Row ${index + 2} needs a non-negative quantity.`);
    const source = safeText(sourceIndex < 0 ? undefined : row[sourceIndex])?.toLowerCase().replace(/[\s-]+/g, "_") ?? "electricity";
    const unit = safeText(unitIndex < 0 ? undefined : row[unitIndex]) ?? "kWh";
    return { month, quantity, source, unit, cost: optionalNumber(costIndex < 0 ? undefined : row[costIndex]), sourceProvider: safeText(providerIndex < 0 ? undefined : row[providerIndex]), notes: safeText(notesIndex < 0 ? undefined : row[notesIndex]) };
  });
}
