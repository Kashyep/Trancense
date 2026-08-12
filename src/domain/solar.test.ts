import { describe, expect, it } from "vitest";
import { solarModel } from "./solar";

describe("solar planning model", () => {
  it("calculates usable capacity and generation", () => {
    const result = solarModel({ roofArea: 1000, exclusions: 100, moduleW: 500, moduleArea: 2.5, yieldKwhPerKw: 1400, losses: 0.1, selfConsumption: 0.8, capex: 1000000, annualOm: 20000, tariff: 8, life: 20, discountRate: 0.1, degradation: 0.005 });
    expect(result.usableArea).toBe(900);
    expect(result.capacityKw).toBe(180);
    expect(result.generation).toBeGreaterThan(0);
    expect(result.payback).not.toBeNull();
  });

  it("does not invent a payback when annual net savings are non-positive", () => {
    const result = solarModel({ roofArea: 100, exclusions: 100, moduleW: 500, moduleArea: 2.5, yieldKwhPerKw: 1400, losses: 0.1, selfConsumption: 0.8, capex: 1000000, annualOm: 20000, tariff: 8, life: 20, discountRate: 0.1, degradation: 0.005 });
    expect(result.payback).toBeNull();
  });
});
