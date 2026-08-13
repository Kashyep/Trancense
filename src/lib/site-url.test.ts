import { describe, expect, it } from "vitest";
import { canonicalOrigin } from "./site-url";

describe("canonicalOrigin", () => {
  it("uses a configured HTTPS production origin and removes path/query fragments", () => {
    expect(canonicalOrigin("https://app.trancense.example/path?preview=1#section").toString())
      .toBe("https://app.trancense.example/");
  });

  it("allows only the local HTTP development origin", () => {
    expect(canonicalOrigin("http://localhost:3000").toString()).toBe("http://localhost:3000/");
    expect(canonicalOrigin("http://example.com").toString()).toBe("http://localhost:3000/");
  });

  it("fails closed to local development for missing or malformed values", () => {
    expect(canonicalOrigin(undefined).toString()).toBe("http://localhost:3000/");
    expect(canonicalOrigin("not a url").toString()).toBe("http://localhost:3000/");
  });
});
