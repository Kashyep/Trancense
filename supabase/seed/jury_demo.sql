-- Jury-demo seed for a confirmed user with email kashyap.arnav2005@gmail.com.
-- Run after both migrations and after creating the demo Auth user.
-- This creates fictional audit data only. Upload the matching fixture through /app/evidence.
do $$
declare
  v_demo_user uuid;
  v_workspace_id uuid;
  v_site_id uuid;
  v_facility_id uuid;
  v_audit_id uuid;
  v_boundary_id uuid;
  v_finding_id uuid;
begin
  select u.id into v_demo_user from auth.users u where u.email = 'kashyap.arnav2005@gmail.com' limit 1;
  if v_demo_user is null then
    raise exception 'Create and confirm kashyap.arnav2005@gmail.com in Supabase Auth first.';
  end if;

  select w.id into v_workspace_id from public.workspaces w where w.created_by = v_demo_user and w.name = 'Meridian Components - Jury Demo' limit 1;
  if v_workspace_id is null then
    insert into public.workspaces(name, country_code, currency, timezone, created_by)
    values ('Meridian Components - Jury Demo', 'IN', 'INR', 'Asia/Kolkata', v_demo_user)
    returning id into v_workspace_id;
  end if;
  insert into public.workspace_memberships(workspace_id, user_id, role)
  values (v_workspace_id, v_demo_user, 'owner')
  on conflict (workspace_id, user_id) do update set role = 'owner';

  select s.id into v_site_id from public.sites s where s.workspace_id = v_workspace_id limit 1;
  if v_site_id is null then
    insert into public.sites(workspace_id, name, city, state, country_code, created_by)
    values (v_workspace_id, 'Meridian Components Campus', 'Pune', 'Maharashtra', 'IN', v_demo_user)
    returning id into v_site_id;
  end if;

  select f.id into v_facility_id from public.facilities f where f.workspace_id = v_workspace_id limit 1;
  if v_facility_id is null then
    insert into public.facilities(workspace_id, site_id, name, facility_type, floor_area, area_unit, created_by)
    values (v_workspace_id, v_site_id, 'Main Manufacturing Block', 'Manufacturing', 1200, 'm²', v_demo_user)
    returning id into v_facility_id;
  end if;

  select a.id into v_audit_id from public.audits a where a.workspace_id = v_workspace_id and a.status = 'active' limit 1;
  if v_audit_id is null then
    insert into public.audits(workspace_id, facility_id, name, objective, period_start, period_end, status, created_by)
    values (v_workspace_id, v_facility_id, 'FY26 Energy Audit', 'Establish a defensible energy baseline and identify reviewed opportunities.', '2026-01-01', '2026-03-31', 'active', v_demo_user)
    returning id into v_audit_id;
  end if;

  select b.id into v_boundary_id from public.reporting_boundaries b where b.audit_id = v_audit_id and b.active limit 1;
  if v_boundary_id is null then
    insert into public.reporting_boundaries(workspace_id, audit_id, name, scope_description, frequency, period_start, period_end, area, area_unit, active, created_by)
    values (v_workspace_id, v_audit_id, 'Whole facility', 'Main manufacturing block; exclude leased retail unit.', 'monthly', '2026-01-01', '2026-03-31', 1200, 'm²', true, v_demo_user)
    returning id into v_boundary_id;
  end if;

  insert into public.energy_records(workspace_id, audit_id, boundary_id, period_start, period_end, source_category, raw_quantity, raw_unit, normalized_kwh, conversion_status, cost_method, direct_cost, currency, quality_state, review_state, created_by, reviewed_by, reviewed_at, notes)
  select v_workspace_id, v_audit_id, v_boundary_id, '2026-01-01', '2026-01-31', 'electricity', 120000, 'kWh', 120000, 'native', 'direct_total', 840000, 'INR', 'source_documented', 'approved', v_demo_user, v_demo_user, now(), 'Fictional jury-demo record.'
  where not exists (select 1 from public.energy_records er where er.audit_id = v_audit_id and er.period_start = '2026-01-01' and er.source_category = 'electricity');

  insert into public.energy_records(workspace_id, audit_id, boundary_id, period_start, period_end, source_category, raw_quantity, raw_unit, normalized_kwh, conversion_status, cost_method, direct_cost, currency, quality_state, review_state, created_by, reviewed_by, reviewed_at, notes)
  select v_workspace_id, v_audit_id, v_boundary_id, '2026-02-01', '2026-02-28', 'electricity', 118000, 'kWh', 118000, 'native', 'direct_total', 826000, 'INR', 'source_documented', 'approved', v_demo_user, v_demo_user, now(), 'Fictional jury-demo record.'
  where not exists (select 1 from public.energy_records er where er.audit_id = v_audit_id and er.period_start = '2026-02-01' and er.source_category = 'electricity');

  insert into public.energy_records(workspace_id, audit_id, boundary_id, period_start, period_end, source_category, raw_quantity, raw_unit, normalized_kwh, conversion_status, cost_method, direct_cost, currency, quality_state, review_state, created_by, reviewed_by, reviewed_at, notes)
  select v_workspace_id, v_audit_id, v_boundary_id, '2026-03-01', '2026-03-31', 'electricity', 125000, 'kWh', 125000, 'native', 'direct_total', 875000, 'INR', 'source_documented', 'approved', v_demo_user, v_demo_user, now(), 'Fictional jury-demo record.'
  where not exists (select 1 from public.energy_records er where er.audit_id = v_audit_id and er.period_start = '2026-03-01' and er.source_category = 'electricity');

  insert into public.energy_records(workspace_id, audit_id, boundary_id, period_start, period_end, source_category, raw_quantity, raw_unit, normalized_kwh, conversion_status, cost_method, direct_cost, currency, quality_state, review_state, created_by, notes)
  select v_workspace_id, v_audit_id, v_boundary_id, '2026-03-15', '2026-03-31', 'diesel', 4200, 'L', null, 'missing_factor', 'direct_total', null, 'INR', 'needs_review', 'draft', v_demo_user, 'Fictional excluded record: no approved conversion factor.'
  where not exists (select 1 from public.energy_records er where er.audit_id = v_audit_id and er.source_category = 'diesel');

  select f.id into v_finding_id from public.findings f where f.audit_id = v_audit_id and f.title = 'Compressed-air leakage during idle hours' limit 1;
  if v_finding_id is null then
    insert into public.findings(workspace_id, audit_id, title, category, observation, confidence, review_state, ai_assisted, created_by, reviewed_by, reviewed_at)
    values (v_workspace_id, v_audit_id, 'Compressed-air leakage during idle hours', 'Operations', 'The fictional source register indicates compressed-air demand continues during the recorded idle window. Confirm the observation on site before estimating savings.', 'medium', 'approved', false, v_demo_user, v_demo_user, now())
    returning id into v_finding_id;
  end if;

  insert into public.recommendations(workspace_id, audit_id, finding_id, intervention, affected_system, assumptions, risks, confidence, estimated_savings_kwh, implementation_cost, priority, state, created_by)
  select v_workspace_id, v_audit_id, v_finding_id, 'Repair leaks and add an idle-period shutdown check', 'Compressed air', 'Savings remain indicative until measured verification.', 'Requires a maintenance window and production-owner review.', 'medium', 7200, 180000, 'high', 'review', v_demo_user
  where not exists (select 1 from public.recommendations r where r.audit_id = v_audit_id and r.intervention = 'Repair leaks and add an idle-period shutdown check');
end $$;
