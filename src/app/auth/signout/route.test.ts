import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const signoutRoute = readFileSync("src/app/auth/signout/route.ts", "utf8");

describe("sign-out route", () => {
  it("checks the POST origin before clearing a session", () => {
    expect(signoutRoute).toContain("assertRequestOrigin(request)");
  });
});
