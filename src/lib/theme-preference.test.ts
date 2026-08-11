import { describe, expect, it } from "vitest";
import { normalizeManualTheme } from "@/lib/theme-preference";

describe("manual theme selection", () => {
  it("accepts only explicit light and dark preferences", () => {
    expect(normalizeManualTheme("dark")).toBe("dark");
    expect(normalizeManualTheme("light")).toBe("light");
    expect(normalizeManualTheme("unexpected")).toBe("light");
    expect(normalizeManualTheme(undefined)).toBe("light");
  });
});
