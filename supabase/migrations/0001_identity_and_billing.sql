-- Planeador · identity, commercial catalog and manual billing.
-- Safe to re-run on a database that already applied the Phase 1 schema.sql.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

do $$ begin
  create type public.user_role as enum ('user', 'super_admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.account_status as enum ('enabled', 'suspended');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.subscription_status as enum (
    'pending', 'active', 'trialing', 'expired', 'suspended', 'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.subscription_source as enum ('manual', 'trial', 'payment');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.plan_cadence as enum ('monthly', 'quarterly', 'semiannual', 'annual', 'custom');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_request_status as enum (
    'submitted', 'approved', 'rejected', 'cancelled'
  );
exception when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  role public.user_role not null default 'user',
  account_status public.account_status not null default 'enabled',
  timezone text not null default 'America/Bogota',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists account_status public.account_status not null default 'enabled';
alter table public.profiles add column if not exists timezone text not null default 'America/Bogota';

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.user_role not null,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references public.profiles (id),
  reason text
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  cadence public.plan_cadence not null default 'monthly',
  duration_days integer not null check (duration_days > 0),
  price_amount numeric(14,2),
  currency text not null default 'COP',
  is_active boolean not null default true,
  visible_on_landing boolean not null default true,
  sort_order integer not null default 100,
  features jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.plans add column if not exists description text;
alter table public.plans add column if not exists visible_on_landing boolean not null default true;
alter table public.plans add column if not exists sort_order integer not null default 100;
alter table public.plans add column if not exists features jsonb not null default '[]'::jsonb;
alter table public.plans add column if not exists updated_at timestamptz not null default now();
alter table public.plans add column if not exists price_amount numeric(14,2);

create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  instructions text,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid references public.plans (id),
  status public.subscription_status not null default 'pending',
  source public.subscription_source not null default 'manual',
  starts_at timestamptz,
  ends_at timestamptz,
  plan_name_snapshot text,
  duration_days_snapshot integer,
  price_amount_snapshot numeric(14,2),
  currency_snapshot text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions add column if not exists plan_name_snapshot text;
alter table public.subscriptions add column if not exists duration_days_snapshot integer;
alter table public.subscriptions add column if not exists price_amount_snapshot numeric(14,2);
alter table public.subscriptions add column if not exists currency_snapshot text;

create unique index if not exists subscriptions_one_live_access
  on public.subscriptions (user_id)
  where status in ('active', 'trialing');

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid not null references public.plans (id),
  payment_method_id uuid references public.payment_methods (id),
  expected_amount numeric(14,2),
  declared_amount numeric(14,2) not null,
  currency text not null default 'COP',
  paid_on date,
  reference text,
  receipt_path text,
  status public.payment_request_status not null default 'submitted',
  notes text,
  review_notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id)
);

alter table public.payment_requests add column if not exists expected_amount numeric(14,2);
alter table public.payment_requests add column if not exists declared_amount numeric(14,2);
alter table public.payment_requests add column if not exists currency text not null default 'COP';
alter table public.payment_requests add column if not exists paid_on date;
alter table public.payment_requests add column if not exists reference text;
alter table public.payment_requests add column if not exists review_notes text;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  request_id uuid references public.payment_requests (id),
  subscription_id uuid references public.subscriptions (id),
  amount numeric(14,2) not null,
  currency text not null default 'COP',
  paid_at timestamptz,
  recorded_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.payments add column if not exists subscription_id uuid references public.subscriptions (id);
alter table public.payments add column if not exists amount numeric(14,2);

create table if not exists public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  previous_state jsonb,
  new_state jsonb,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs add column if not exists previous_state jsonb;
alter table public.audit_logs add column if not exists new_state jsonb;
alter table public.audit_logs add column if not exists reason text;

create table if not exists public.in_app_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists plans_set_updated_at on public.plans;
create trigger plans_set_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, account_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    'user',
    'enabled'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name);

  insert into public.user_roles (user_id, role, reason)
  values (new.id, 'user', 'registro público');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role
     and current_setting('planeador.allow_role_change', true) is distinct from 'true' then
    raise exception 'El rol no puede modificarse desde el cliente';
  end if;
  if new.account_status is distinct from old.account_status
     and current_setting('planeador.allow_status_change', true) is distinct from 'true'
     and new.id = auth.uid() then
    raise exception 'El estado de la cuenta no puede modificarse desde el perfil';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
  before update on public.profiles
  for each row execute function public.prevent_profile_privilege_escalation();

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists subscriptions_user_status_idx on public.subscriptions (user_id, status);
create index if not exists payment_requests_status_idx on public.payment_requests (status, created_at desc);
create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);
create index if not exists notifications_user_idx on public.in_app_notifications (user_id, created_at desc);

-- Catalog placeholders. Amounts stay null until a Super Admin sets them.
insert into public.plans (code, name, description, cadence, duration_days, price_amount, currency, is_active, visible_on_landing, sort_order)
values
  ('mensual', 'Mensual', 'Acceso completo al planeador durante un mes, renovable de forma manual.', 'monthly', 30, null, 'COP', true, true, 10),
  ('trimestral', 'Trimestral', 'Tres meses de acceso con una sola activación.', 'quarterly', 90, null, 'COP', true, true, 20),
  ('semestral', 'Semestral', 'Seis meses de acceso con una sola activación.', 'semiannual', 180, null, 'COP', true, true, 30),
  ('anual', 'Anual', 'El mismo acceso, con una vigencia más larga y menos renovaciones.', 'annual', 365, null, 'COP', true, true, 40)
on conflict (code) do nothing;
