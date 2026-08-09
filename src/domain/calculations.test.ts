import { describe, expect, it } from "vitest";
import { calculateEnergy, calculateBaseline, calculateEmissions, calculatePayback } from "./calculations";

describe("trusted calculations", () => {
  it("includes only approved normalized matching records", () => {
    expect(calculateEnergy([{ kwh: 120, status: "approved" }, { kwh: 50, status: "draft" }, { kwh: null, status: "approved" }])).toEqual({ value: 120, included: 1, excluded: 2 });
  });
  it("requires three compatible approved periods for a historical baseline", () => {
    expect(calculateBaseline([100, 110])).toMatchObject({ available: false, required: 3, count: 2 });
    expect(calculateBaseline([100, 110, 120])).toMatchObject({ available: true, value: 110 });
  });
  it("does not turn a missing emission factor into zero", () => {
    expect(calculateEmissions(100, null)).toMatchObject({ available: false, value: null });
  });
  it("requires positive annual savings for payback", () => {
    expect(calculatePayback(1000, 0)).toMatchObject({ available: false, value: null });
    expect(calculatePayback(1000, 250)).toMatchObject({ available: true, value: 4 });
  });
});
