import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const callbackRoute = readFileSync("src/app/auth/callback/route.ts", "utf8");

describe("email confirmation callback", () => {
  it("takes a confirmed account to the dedicated confirmation page, not an authenticated workspace", () => {
    expect(callbackRoute).toContain('new URL("/account-verified", url.origin)');
    expect(callbackRoute).toContain("await supabase.auth.signOut()");
  });
});
