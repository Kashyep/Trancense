-- The shared trigger is attached to tables with different foreign-key columns.
-- Read NEW through JSON so PostgreSQL does not resolve boundary_id/finding_id/etc.
-- on tables that do not contain those fields.
create or replace function public.assert_same_workspace() returns trigger language plpgsql security invoker set search_path = public as $$
declare
  expected uuid;
  row_data jsonb;
  row_workspace_id uuid;
  related_id uuid;
begin
  row_data := to_jsonb(new);
  row_workspace_id := nullif(row_data ->> 'workspace_id', '')::uuid;

  if TG_TABLE_NAME = 'facilities' then
    related_id := nullif(row_data ->> 'site_id', '')::uuid;
    select workspace_id into expected from public.sites where id = related_id;
  elsif TG_TABLE_NAME = 'audits' then
    related_id := nullif(row_data ->> 'facility_id', '')::uuid;
    select workspace_id into expected from public.facilities where id = related_id;
  elsif TG_TABLE_NAME = 'reporting_boundaries' then
    related_id := nullif(row_data ->> 'audit_id', '')::uuid;
    select workspace_id into expected from public.audits where id = related_id;
  elsif TG_TABLE_NAME = 'evidence_documents' then
    related_id := nullif(row_data ->> 'audit_id', '')::uuid;
    select workspace_id into expected from public.audits where id = related_id;
  elsif TG_TABLE_NAME = 'energy_records' then
    related_id := nullif(row_data ->> 'audit_id', '')::uuid;
    select workspace_id into expected from public.audits where id = related_id;
  elsif TG_TABLE_NAME = 'equipment' then
    related_id := nullif(row_data ->> 'facility_id', '')::uuid;
    select workspace_id into expected from public.facilities where id = related_id;
  elsif TG_TABLE_NAME in ('findings','recommendations','calculations','report_exports') then
    related_id := nullif(row_data ->> 'audit_id', '')::uuid;
    select workspace_id into expected from public.audits where id = related_id;
  end if;

  if expected is null or expected <> row_workspace_id then
    raise exception 'Cross-workspace child reference rejected';
  end if;

  if TG_TABLE_NAME = 'energy_records' and not exists (
    select 1
    from public.reporting_boundaries
    where id = nullif(row_data ->> 'boundary_id', '')::uuid
      and workspace_id = row_workspace_id
      and audit_id = nullif(row_data ->> 'audit_id', '')::uuid
  ) then
    raise exception 'Boundary does not belong to audit';
  end if;

  if TG_TABLE_NAME = 'recommendations' then
    related_id := nullif(row_data ->> 'finding_id', '')::uuid;
    if related_id is not null and not exists (
      select 1
      from public.findings
      where id = related_id
        and workspace_id = row_workspace_id
        and audit_id = nullif(row_data ->> 'audit_id', '')::uuid
    ) then
      raise exception 'Finding does not belong to audit';
    end if;
  end if;

  return new;
end $$;

revoke all on function public.assert_same_workspace() from public;
