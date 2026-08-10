import { describe, expect, it } from "vitest";
import { canAdvanceRecommendation, nextRecommendationState } from "./workflow";

describe("recommendation workflow", () => {
  it("moves through exactly one next state", () => {
    expect(nextRecommendationState("draft")).toBe("review");
    expect(nextRecommendationState("completed")).toBe("verified");
    expect(nextRecommendationState("verified")).toBeNull();
  });

  it("requires reviewer authority for approval and verification", () => {
    expect(canAdvanceRecommendation("review", "approved", "editor")).toBe(false);
    expect(canAdvanceRecommendation("review", "approved", "reviewer")).toBe(true);
    expect(canAdvanceRecommendation("completed", "verified", "owner")).toBe(true);
    expect(canAdvanceRecommendation("draft", "approved", "owner")).toBe(false);
  });
});
