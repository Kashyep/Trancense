import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const migration=readFileSync("supabase/migrations/20260809000001_security_hardening.sql","utf8");
describe("security migration regression guards",()=>{
  it("removes generic approval and audit-event mutation policies",()=>{
    expect(migration).toContain('drop policy "update editor energy_records"');
    expect(migration).toContain('drop policy "write editor audit_events"');
    expect(migration).toContain('create policy "reviewer reviews energy"');
  });
  it("enforces cross-workspace checks and the verified recommendation transition",()=>{
    expect(migration).toContain('Cross-workspace child reference rejected');
    expect(migration).toContain("old.state = 'completed' and new.state = 'verified'");
    expect(migration).toContain('Invalid recommendation state transition');
  });
});
