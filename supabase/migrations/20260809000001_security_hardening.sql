-- Deployment-blocking security hardening. Apply after the pilot migration.
-- Prevent direct client approval, audit-history forgery, and cross-workspace child references.
alter table public.sites add constraint one_site_per_pilot_workspace unique (workspace_id);
alter table public.facilities add constraint one_facility_per_pilot_workspace unique (workspace_id);
create unique index one_active_audit_per_pilot_workspace on public.audits(workspace_id) where status = 'active';
create unique index one_active_boundary_per_audit on public.reporting_boundaries(audit_id) where active;

create or replace function public.assert_same_workspace() returns trigger language plpgsql security invoker set search_path = public as $$
declare expected uuid;
begin
  if TG_TABLE_NAME = 'facilities' then select workspace_id into expected from public.sites where id = new.site_id;
  elsif TG_TABLE_NAME = 'audits' then select workspace_id into expected from public.facilities where id = new.facility_id;
  elsif TG_TABLE_NAME = 'reporting_boundaries' then select workspace_id into expected from public.audits where id = new.audit_id;
  elsif TG_TABLE_NAME = 'evidence_documents' then select workspace_id into expected from public.audits where id = new.audit_id;
  elsif TG_TABLE_NAME = 'energy_records' then select workspace_id into expected from public.audits where id = new.audit_id;
  elsif TG_TABLE_NAME = 'equipment' then select workspace_id into expected from public.facilities where id = new.facility_id;
  elsif TG_TABLE_NAME in ('findings','recommendations','calculations','report_exports') then select workspace_id into expected from public.audits where id = new.audit_id;
  end if;
  if expected is null or expected <> new.workspace_id then raise exception 'Cross-workspace child reference rejected'; end if;
  if TG_TABLE_NAME = 'energy_records' and not exists (select 1 from public.reporting_boundaries where id = new.boundary_id and workspace_id = new.workspace_id and audit_id = new.audit_id) then raise exception 'Boundary does not belong to audit'; end if;
  if TG_TABLE_NAME = 'recommendations' and new.finding_id is not null and not exists (select 1 from public.findings where id = new.finding_id and workspace_id = new.workspace_id and audit_id = new.audit_id) then raise exception 'Finding does not belong to audit'; end if;
  return new;
end $$;
revoke all on function public.assert_same_workspace() from public;
create trigger facilities_same_workspace before insert or update on public.facilities for each row execute procedure public.assert_same_workspace();
create trigger audits_same_workspace before insert or update on public.audits for each row execute procedure public.assert_same_workspace();
create trigger boundaries_same_workspace before insert or update on public.reporting_boundaries for each row execute procedure public.assert_same_workspace();
create trigger evidence_same_workspace before insert or update on public.evidence_documents for each row execute procedure public.assert_same_workspace();
create trigger energy_same_workspace before insert or update on public.energy_records for each row execute procedure public.assert_same_workspace();
create trigger equipment_same_workspace before insert or update on public.equipment for each row execute procedure public.assert_same_workspace();
create trigger findings_same_workspace before insert or update on public.findings for each row execute procedure public.assert_same_workspace();
create trigger recommendations_same_workspace before insert or update on public.recommendations for each row execute procedure public.assert_same_workspace();
create trigger calculations_same_workspace before insert or update on public.calculations for each row execute procedure public.assert_same_workspace();
create trigger exports_same_workspace before insert or update on public.report_exports for each row execute procedure public.assert_same_workspace();

-- Editors may create and amend only their own draft records; only reviewers/owners may approve or reject.
drop policy "write editor energy_records" on public.energy_records;
drop policy "update editor energy_records" on public.energy_records;
create policy "editor creates own draft energy" on public.energy_records for insert to authenticated with check (public.is_workspace_member(workspace_id,'editor') and created_by=(select auth.uid()) and review_state='draft' and reviewed_by is null and reviewed_at is null);
create policy "editor updates own draft energy" on public.energy_records for update to authenticated using (public.is_workspace_member(workspace_id,'editor') and created_by=(select auth.uid()) and review_state='draft') with check (public.is_workspace_member(workspace_id,'editor') and created_by=(select auth.uid()) and review_state='draft' and reviewed_by is null and reviewed_at is null);
create policy "reviewer reviews energy" on public.energy_records for update to authenticated using (public.is_workspace_member(workspace_id,'reviewer') and review_state='draft') with check (public.is_workspace_member(workspace_id,'reviewer') and review_state in ('approved','rejected') and reviewed_by=(select auth.uid()) and reviewed_at is not null);

-- Findings follow the same review boundary: an Editor cannot self-approve through the Data API.
drop policy "write editor findings" on public.findings;
drop policy "update editor findings" on public.findings;
create policy "editor creates own draft findings" on public.findings for insert to authenticated with check (public.is_workspace_member(workspace_id,'editor') and created_by=(select auth.uid()) and review_state='draft' and reviewed_by is null and reviewed_at is null);
create policy "editor updates own draft findings" on public.findings for update to authenticated using (public.is_workspace_member(workspace_id,'editor') and created_by=(select auth.uid()) and review_state='draft') with check (public.is_workspace_member(workspace_id,'editor') and created_by=(select auth.uid()) and review_state='draft' and reviewed_by is null and reviewed_at is null);
create policy "reviewer reviews findings" on public.findings for update to authenticated using (public.is_workspace_member(workspace_id,'reviewer') and review_state='draft') with check (public.is_workspace_member(workspace_id,'reviewer') and review_state in ('approved','rejected') and reviewed_by=(select auth.uid()) and reviewed_at is not null);

-- State transitions are enforced independently of UI/server actions.
create or replace function public.assert_recommendation_transition() returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if new.state = old.state then return new; end if;
  if old.state = 'draft' and new.state = 'review' and public.is_workspace_member(new.workspace_id,'editor') then return new; end if;
  if old.state = 'review' and new.state = 'approved' and public.is_workspace_member(new.workspace_id,'reviewer') then return new; end if;
  if old.state = 'approved' and new.state = 'planned' and public.is_workspace_member(new.workspace_id,'editor') then return new; end if;
  if old.state = 'planned' and new.state = 'in_progress' and public.is_workspace_member(new.workspace_id,'editor') then return new; end if;
  if old.state = 'in_progress' and new.state = 'completed' and public.is_workspace_member(new.workspace_id,'editor') then return new; end if;
  if old.state = 'completed' and new.state = 'verified' and public.is_workspace_member(new.workspace_id,'reviewer') then return new; end if;
  raise exception 'Invalid recommendation state transition';
end $$;
revoke all on function public.assert_recommendation_transition() from public;
create trigger recommendation_transition before update of state on public.recommendations for each row execute procedure public.assert_recommendation_transition();
drop policy "write editor recommendations" on public.recommendations;
drop policy "update editor recommendations" on public.recommendations;
create policy "editor creates draft recommendations" on public.recommendations for insert to authenticated with check (public.is_workspace_member(workspace_id,'editor') and created_by=(select auth.uid()) and state='draft');
create policy "editor changes recommendations" on public.recommendations for update to authenticated using (public.is_workspace_member(workspace_id,'editor')) with check (public.is_workspace_member(workspace_id,'editor'));
create policy "reviewer changes recommendations" on public.recommendations for update to authenticated using (public.is_workspace_member(workspace_id,'reviewer')) with check (public.is_workspace_member(workspace_id,'reviewer'));

-- Audit rows are append-only and are created through the constrained RPC below.
drop policy "write editor audit_events" on public.audit_events;
drop policy "update editor audit_events" on public.audit_events;
drop policy "delete owner audit_events" on public.audit_events;
create or replace function public.record_audit_event(target_workspace uuid, target_audit uuid, target_entity_type text, target_entity_id uuid, target_action text, target_details jsonb default '{}'::jsonb) returns uuid language plpgsql security definer set search_path = public as $$
declare event_id uuid;
begin
  if not public.is_workspace_member(target_workspace,'editor') then raise exception 'Forbidden'; end if;
  if target_audit is not null and not exists(select 1 from public.audits where id=target_audit and workspace_id=target_workspace) then raise exception 'Audit is outside workspace'; end if;
  insert into public.audit_events(workspace_id,audit_id,entity_type,entity_id,action,details,actor_id) values(target_workspace,target_audit,left(target_entity_type,80),target_entity_id,left(target_action,120),target_details,(select auth.uid())) returning id into event_id;
  return event_id;
end $$;
revoke all on function public.record_audit_event(uuid,uuid,text,uuid,text,jsonb) from public;
grant execute on function public.record_audit_event(uuid,uuid,text,uuid,text,jsonb) to authenticated;
