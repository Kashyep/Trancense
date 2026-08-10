import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const migration=readFileSync("supabase/migrations/20260809000001_security_hardening.sql","utf8");
const workflowMigration=readFileSync("supabase/migrations/20260810000000_jury_demo_workflow.sql","utf8");
const triggerFixMigration=readFileSync("supabase/migrations/20260810000001_fix_assert_same_workspace_trigger.sql","utf8");
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
  it("keeps editor access separate from reviewer approval access",()=>{
    expect(workflowMigration).toContain("when 'reviewer' then m.role in ('owner','reviewer')");
    expect(workflowMigration).toContain('create policy "write reviewer calculations"');
  });
  it("does not resolve table-specific NEW fields on unrelated trigger tables",()=>{
    expect(triggerFixMigration).toContain('row_data := to_jsonb(new)');
    expect(triggerFixMigration).not.toContain('new.boundary_id');
    expect(triggerFixMigration).not.toContain('new.finding_id');
  });
});
