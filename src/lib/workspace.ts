import { currentUser } from "@/lib/supabase/server";

export async function getWorkspaceContext() {
  let session: Awaited<ReturnType<typeof currentUser>>;
  try {
    session = await currentUser();
  } catch {
    return null;
  }

  const { client, user } = session;
  const { data: membership } = await client.from("workspace_memberships").select("workspace_id,role,workspaces(name)").eq("user_id", user.id).limit(1).maybeSingle();
  if (!membership) return null;

  const workspaceId = membership.workspace_id;
  const { data: audits } = await client.from("audits").select("id,name,facility_id").eq("workspace_id", workspaceId).eq("status", "active").limit(1);
  const audit = audits?.[0] ?? null;
  let boundary = null;
  if (audit) {
    const result = await client.from("reporting_boundaries").select("id,name,area,area_unit,period_start,period_end").eq("audit_id", audit.id).eq("active", true).limit(1).maybeSingle();
    boundary = result.data;
  }
  return { client, user, workspaceId, role: membership.role as string, workspaceName: (membership.workspaces as unknown as { name: string } | null)?.name ?? "Workspace", audit, boundary };
}
