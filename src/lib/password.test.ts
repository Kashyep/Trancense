import { describe, expect, it } from "vitest";
import { assessPassword } from "@/lib/password";

describe("assessPassword", () => {
  it("requires the server-compatible minimum length", () => {
    expect(assessPassword("short").meetsMinimum).toBe(false);
    expect(assessPassword("eight888").meetsMinimum).toBe(true);
  });

  it("returns clear, non-sensitive strength guidance", () => {
    expect(assessPassword("eight888").label).toBe("Basic");
    expect(assessPassword("Safer-passphrase_2026").label).toBe("Strong");
  });
});
