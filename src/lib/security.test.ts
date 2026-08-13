import { describe, expect, it } from "vitest";
import { isSameOriginRequest } from "./security";

describe("isSameOriginRequest", () => {
  it("accepts an exact browser origin", () => {
    expect(isSameOriginRequest("https://app.trancense.example/auth/signout", "https://app.trancense.example")).toBe(true);
  });

  it("rejects an absent, malformed, or cross-site origin", () => {
    expect(isSameOriginRequest("https://app.trancense.example/auth/signout", null)).toBe(false);
    expect(isSameOriginRequest("https://app.trancense.example/auth/signout", "not a URL")).toBe(false);
    expect(isSameOriginRequest("https://app.trancense.example/auth/signout", "https://attacker.example")).toBe(false);
  });
});
