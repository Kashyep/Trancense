create extension if not exists pgcrypto;

create type public.workspace_role as enum ('owner', 'editor', 'reviewer', 'viewer');
create type public.review_state as enum ('draft', 'approved', 'rejected');

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_memberships
    where workspace_id = target_workspace and user_id = auth.uid()
  );
$$;

create or replace function public.workspace_role(target_workspace uuid)
returns public.workspace_role language sql stable security definer set search_path = public as $$
  select role from public.workspace_memberships
  where workspace_id = target_workspace and user_id = auth.uid()
  limit 1;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  country_code text not null default 'IN',
  currency text not null default 'INR',
  timezone text not null default 'Asia/Kolkata',
  is_demo boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_memberships (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create or replace function public.seed_workspace_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.workspace_memberships (workspace_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

create trigger workspace_owner_membership
after insert on public.workspaces
for each row execute function public.seed_workspace_owner();

create table public.sites (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null, address text, city text, state text, postal_code text, country text not null default 'India', notes text,
  created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.facilities (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade, name text not null, facility_type text,
  floor_area numeric, floor_area_unit text default 'm2', occupancy integer, operating_hours numeric,
  driver_name text, driver_unit text, notes text, created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.audits (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade, facility_id uuid not null references public.facilities(id) on delete cascade,
  name text not null, objective text, status text not null default 'active', period_start date, period_end date, scope_description text, boundary_description text,
  included_energy_sources text[] not null default '{}', review_state public.review_state not null default 'draft', created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.reporting_boundaries (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  audit_id uuid not null references public.audits(id) on delete cascade, name text not null, description text, created_by uuid not null references auth.users(id), created_at timestamptz not null default now()
);

create table public.evidence_documents (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  audit_id uuid not null references public.audits(id) on delete cascade, original_filename text not null, storage_path text not null,
  mime_type text not null, file_size integer not null, document_type text, source_provider text, period date, review_state public.review_state not null default 'draft', notes text, checksum text, is_demo boolean not null default false,
  uploaded_by uuid not null references auth.users(id), uploaded_at timestamptz not null default now()
);

create table public.energy_records (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  facility_id uuid not null references public.facilities(id) on delete cascade, audit_id uuid not null references public.audits(id) on delete cascade,
  evidence_document_id uuid references public.evidence_documents(id) on delete set null, period_start date not null, period_end date not null,
  energy_source text not null, raw_quantity numeric not null check (raw_quantity >= 0), raw_unit text not null, normalized_quantity numeric, normalized_unit text not null default 'kWh', normalization_status text not null default 'not-required',
  total_cost numeric check (total_cost is null or total_cost >= 0), currency text default 'INR', unit_rate numeric, fixed_charge numeric, cost_method text, source_type text, data_quality text not null default 'user-entered', review_state public.review_state not null default 'draft', notes text, created_by uuid not null references auth.users(id), superseded_by uuid references public.energy_records(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.conversion_factors (
  id uuid primary key default gen_random_uuid(), workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null, factor_type text not null, energy_source text not null, source_name text not null, source_url text, vintage text not null,
  unit_from text not null, unit_to text not null, factor_value numeric not null, status text not null default 'demo', notes text, created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table public.tariff_assumptions (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text, tariff_category text, effective_date date, unit_rate numeric, fixed_charge numeric, demand_charge numeric, tod_charge numeric, source_document_id uuid references public.evidence_documents(id) on delete set null,
  entry_method text not null default 'manual', created_by uuid not null references auth.users(id), created_at timestamptz not null default now()
);

create table public.equipment (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  facility_id uuid not null references public.facilities(id) on delete cascade, name text not null, category text, location text, quantity numeric default 1, rated_capacity numeric, capacity_unit text, operating_hours numeric, installation_year integer, efficiency_information text, condition text, data_quality text not null default 'user-entered', evidence_document_id uuid references public.evidence_documents(id) on delete set null, notes text, created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.calculations (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  audit_id uuid not null references public.audits(id) on delete cascade, metric text not null, value numeric, unit text not null, formula_name text not null, formula_version text not null,
  input_record_ids uuid[] not null default '{}', period text, boundary text, factors jsonb not null default '[]', warnings jsonb not null default '[]', available boolean not null default false, calculated_at timestamptz not null default now(), calculated_by uuid references auth.users(id)
);

create table public.findings (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, audit_id uuid not null references public.audits(id) on delete cascade,
  title text not null, category text, problem_statement text, observation text, evidence_document_ids uuid[] not null default '{}', confidence text, status public.review_state not null default 'draft', reviewer_notes text, created_by uuid not null references auth.users(id), approved_by uuid references auth.users(id), approved_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.recommendations (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, audit_id uuid not null references public.audits(id) on delete cascade, finding_id uuid references public.findings(id) on delete set null,
  title text not null, proposed_intervention text, affected_system text, annual_energy_savings numeric, annual_cost_savings numeric, implementation_cost numeric, simple_payback numeric, currency text default 'INR', confidence text, assumptions text, dependencies text, risks text, owner text, due_date date, priority text, status text not null default 'draft', created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, actor_id uuid references auth.users(id), event_type text not null, entity_type text, entity_id uuid, metadata jsonb not null default '{}', created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table public.report_exports (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, audit_id uuid not null references public.audits(id) on delete cascade, requested_by uuid not null references auth.users(id), created_by uuid references auth.users(id), report_version text not null default 'v1', status text not null default 'generated', storage_path text, generated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_memberships enable row level security;

do $$ declare t text; begin
  foreach t in array array['sites','facilities','audits','reporting_boundaries','evidence_documents','energy_records','conversion_factors','tariff_assumptions','equipment','calculations','findings','recommendations','audit_events','report_exports'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I_select on public.%I for select using (public.is_workspace_member(workspace_id))', t || '_member', t);
    execute format('create policy %I_insert on public.%I for insert with check (public.workspace_role(workspace_id) in (''owner'', ''editor''))', t || '_member', t);
    execute format('create policy %I_update on public.%I for update using (public.workspace_role(workspace_id) in (''owner'', ''editor'', ''reviewer'')) with check (public.workspace_role(workspace_id) in (''owner'', ''editor'', ''reviewer''))', t || '_member', t);
  end loop;
end $$;

create policy profiles_self on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy workspaces_member on public.workspaces for select using (public.is_workspace_member(id));
create policy workspaces_create on public.workspaces for insert with check (auth.uid() = created_by);
create policy workspaces_owner_update on public.workspaces for update using (public.workspace_role(id) = 'owner') with check (public.workspace_role(id) = 'owner');
create policy memberships_self_or_owner on public.workspace_memberships for select using (user_id = auth.uid() or public.workspace_role(workspace_id) = 'owner');
create policy memberships_owner_insert on public.workspace_memberships for insert with check (public.workspace_role(workspace_id) = 'owner');
create policy memberships_owner_update on public.workspace_memberships for update using (public.workspace_role(workspace_id) = 'owner');

insert into storage.buckets (id, name, public) values ('evidence', 'evidence', false) on conflict (id) do nothing;
create policy evidence_read on storage.objects for select using (bucket_id = 'evidence' and public.is_workspace_member((storage.foldername(name))[1]::uuid));
create policy evidence_insert on storage.objects for insert with check (bucket_id = 'evidence' and public.is_workspace_member((storage.foldername(name))[1]::uuid));
create policy evidence_delete on storage.objects for delete using (bucket_id = 'evidence' and public.workspace_role((storage.foldername(name))[1]::uuid) = 'owner');
