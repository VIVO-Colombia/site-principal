-- Tabla independiente del Planner. No altera tablas financieras ni de identidad.
create table if not exists public.transport_pricing_versions (
  id bigint generated always as identity primary key,
  version integer not null,
  effective_from date not null,
  config jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.transport_pricing_versions enable row level security;

revoke all on public.transport_pricing_versions from anon, authenticated;
grant select, insert on public.transport_pricing_versions to service_role;
