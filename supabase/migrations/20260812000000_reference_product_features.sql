-- Durable scenario storage for the post-onboarding planning workflow.
create table if not exists public.solar_scenarios (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  audit_id uuid references public.audits on delete set null,
  name text not null check (char_length(name) between 2 and 160),
  inputs jsonb not null default '{}'::jsonb,
  outputs jsonb not null default '{}'::jsonb,
  assumptions jsonb not null default '[]'::jsonb,
  created_by uuid not null references auth.users,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.solar_scenarios enable row level security;
create policy "read member solar scenarios" on public.solar_scenarios for select to authenticated using (public.is_workspace_member(workspace_id,'viewer'));
create policy "write editor solar scenarios" on public.solar_scenarios for insert to authenticated with check (public.is_workspace_member(workspace_id,'editor') and created_by=(select auth.uid()));
create policy "update editor solar scenarios" on public.solar_scenarios for update to authenticated using (public.is_workspace_member(workspace_id,'editor')) with check (public.is_workspace_member(workspace_id,'editor'));
create policy "delete owner solar scenarios" on public.solar_scenarios for delete to authenticated using (public.is_workspace_member(workspace_id,'owner'));
create index if not exists solar_scenarios_workspace_created_idx on public.solar_scenarios(workspace_id, created_at desc);

create or replace function public.assert_solar_scenario_workspace() returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if new.audit_id is not null and not exists (
    select 1 from public.audits where id = new.audit_id and workspace_id = new.workspace_id
  ) then raise exception 'Audit is outside workspace'; end if;
  return new;
end $$;
revoke all on function public.assert_solar_scenario_workspace() from public;
create trigger solar_scenario_same_workspace before insert or update on public.solar_scenarios for each row execute procedure public.assert_solar_scenario_workspace();
