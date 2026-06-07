create extension if not exists pgcrypto;

create table if not exists bad_data_cases (
  id uuid primary key default gen_random_uuid(),
  case_id text unique not null,
  created_date date not null,
  rm_name text not null,
  product text not null,
  cif text,
  customer_name text,
  phone_number text,
  issue_category text not null,
  source_system text not null,
  process_stage text not null,
  issue_description text,
  business_impact text,
  priority text not null,
  status text not null,
  assigned_pic text,
  target_resolution_date date,
  closed_date date,
  action_taken text,
  escalation_required boolean default false,
  escalation_date date,
  escalation_target text,
  evidence_note text,
  created_by text,
  updated_at timestamptz default now()
);

create table if not exists checklist_runs (
  id uuid primary key default gen_random_uuid(),
  run_date date not null,
  product text not null,
  rm_name text not null,
  cif text,
  phone_number text,
  normalized_phone text,
  cif_checked boolean,
  cif_matches_latest boolean,
  phone_exists boolean,
  phone_format_valid boolean,
  email_checked boolean,
  job_business_checked boolean,
  payroll_checked boolean,
  supporting_docs_checked boolean,
  slik_checked boolean,
  brispot_matches_latest boolean,
  no_data_mismatch boolean,
  notes text,
  result_status text,
  created_case_id text,
  created_at timestamptz default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz default now(),
  action text not null,
  entity_type text not null,
  entity_id text,
  performed_by text,
  old_value jsonb,
  new_value jsonb
);

create or replace function set_bad_data_cases_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_bad_data_cases_updated_at on bad_data_cases;
create trigger trg_bad_data_cases_updated_at
before update on bad_data_cases
for each row
execute function set_bad_data_cases_updated_at();

alter table bad_data_cases enable row level security;
alter table checklist_runs enable row level security;
alter table audit_logs enable row level security;

drop policy if exists "MVP dummy read bad data cases" on bad_data_cases;
create policy "MVP dummy read bad data cases"
on bad_data_cases for select
using (true);

drop policy if exists "MVP dummy write bad data cases" on bad_data_cases;
create policy "MVP dummy write bad data cases"
on bad_data_cases for all
using (true)
with check (true);

drop policy if exists "MVP dummy read checklist runs" on checklist_runs;
create policy "MVP dummy read checklist runs"
on checklist_runs for select
using (true);

drop policy if exists "MVP dummy write checklist runs" on checklist_runs;
create policy "MVP dummy write checklist runs"
on checklist_runs for all
using (true)
with check (true);

drop policy if exists "MVP dummy read audit logs" on audit_logs;
create policy "MVP dummy read audit logs"
on audit_logs for select
using (true);

drop policy if exists "MVP dummy write audit logs" on audit_logs;
create policy "MVP dummy write audit logs"
on audit_logs for all
using (true)
with check (true);

create index if not exists idx_bad_data_cases_status on bad_data_cases(status);
create index if not exists idx_bad_data_cases_product on bad_data_cases(product);
create index if not exists idx_bad_data_cases_created_date on bad_data_cases(created_date);
create index if not exists idx_checklist_runs_run_date on checklist_runs(run_date);
