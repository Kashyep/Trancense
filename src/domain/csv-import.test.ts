import { describe, expect, it } from "vitest";
import { parseEnergyCsv } from "./csv-import";

describe("parseEnergyCsv", () => {
  it("parses supported aliases and quoted text", () => {
    expect(parseEnergyCsv('billing month,electricity_kwh,provider,notes\n2026-01,1200,"City Power","Main, meter"')).toEqual([{ month: "2026-01", source: "electricity", quantity: 1200, unit: "kWh", cost: null, sourceProvider: "City Power", notes: "Main, meter" }]);
  });

  it("rejects unsafe formula-like values", () => {
    expect(() => parseEnergyCsv("month,kwh\n2026-01,=1000")).toThrow("Formula-like");
  });
});
