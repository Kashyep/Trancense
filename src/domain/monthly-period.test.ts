import { describe, expect, it } from "vitest";
import { monthlyPeriodBounds } from "./monthly-period";

describe("monthly reporting periods", () => {
  it("expands a selected month to its full calendar period", () => {
    expect(monthlyPeriodBounds("2026-04")).toEqual({ periodStart: "2026-04-01", periodEnd: "2026-04-30" });
  });

  it("accounts for leap years", () => {
    expect(monthlyPeriodBounds("2028-02")).toEqual({ periodStart: "2028-02-01", periodEnd: "2028-02-29" });
  });

  it("rejects an invalid month", () => {
    expect(() => monthlyPeriodBounds("2026-13")).toThrow("Select a valid reporting month.");
  });
});
