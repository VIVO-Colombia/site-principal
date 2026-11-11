-- Planeador · schema of phase 1, kept as historical reference.
-- Apply the versioned files in supabase/migrations instead of this script.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.user_role as enum ('user', 'super_admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.subscription_status as enum (
    'pending',
    'active',
    'trialing',
    'expired',
    'suspended',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  cadence text not null,
  duration_days integer not null check (duration_days > 0),
  price_cents integer,
  currency text not null default 'COP',
  is_active boolean not null default true,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid references public.plans (id),
  status public.subscription_status not null default 'pending',
  source text not null default 'manual',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  instructions text,
  is_active boolean not null default true
);

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid references public.plans (id),
  payment_method_id uuid references public.payment_methods (id),
  status text not null default 'submitted',
  receipt_path text,
  notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  request_id uuid references public.payment_requests (id),
  amount_cents integer,
  currency text not null default 'COP',
  paid_at timestamptz,
  recorded_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

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
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'user'
  );
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
  if new.role is distinct from old.role then
    if auth.uid() is not null and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    ) then
      return new;
    end if;
    raise exception 'El rol no puede modificarse desde el cliente';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
  before update on public.profiles
  for each row execute function public.prevent_profile_privilege_escalation();

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_methods enable row level security;
alter table public.payment_requests enable row level security;
alter table public.payments enable row level security;
alter table public.subscription_events enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_self_read" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_self_update" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

create policy "plans_public_read" on public.plans
  for select using (is_active = true);

create policy "subscriptions_self_read" on public.subscriptions
  for select using (user_id = auth.uid());

create policy "payment_methods_read" on public.payment_methods
  for select using (is_active = true);

create policy "payment_requests_self" on public.payment_requests
  for select using (user_id = auth.uid());

create policy "payment_requests_self_insert" on public.payment_requests
  for insert with check (user_id = auth.uid());

create policy "payments_self_read" on public.payments
  for select using (user_id = auth.uid());

-- Super Admin policies are applied with the service role from server actions,
-- not by granting ordinary read access to other users' financial data.
