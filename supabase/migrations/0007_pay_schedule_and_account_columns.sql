-- Repair account columns from 0006 and store the pay calendar.
-- Additive. Does not rewrite financial_cycles that already exist.
-- Reloads the PostgREST schema cache so inserts stop failing on color/icon/include_in_total.

alter table public.financial_accounts
  add column if not exists color text;

alter table public.financial_accounts
  add column if not exists icon text;

alter table public.financial_accounts
  add column if not exists include_in_total boolean not null default true;

do $$ begin
  alter type public.account_kind add value if not exists 'savings';
exception when duplicate_object then null;
end $$;

create table if not exists public.income_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  expected_amount numeric(14,2) not null default 0,
  frequency text not null check (frequency in ('monthly', 'semimonthly', 'every_n_days')),
  payment_days integer[] not null default '{}',
  interval_days integer,
  anchor_date date not null,
  account_id uuid references public.financial_accounts (id) on delete set null,
  is_primary boolean not null default false,
  is_variable boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists income_schedules_one_primary
  on public.income_schedules (user_id)
  where is_primary and active;

alter table public.financial_cycles
  add column if not exists source_schedule_id uuid references public.income_schedules (id) on delete set null;

drop trigger if exists income_schedules_set_updated_at on public.income_schedules;
create trigger income_schedules_set_updated_at
  before update on public.income_schedules
  for each row execute function public.set_updated_at();

alter table public.income_schedules enable row level security;

drop policy if exists "income_schedules_select_own" on public.income_schedules;
create policy "income_schedules_select_own"
  on public.income_schedules for select
  using (user_id = auth.uid());

drop policy if exists "income_schedules_insert_own" on public.income_schedules;
create policy "income_schedules_insert_own"
  on public.income_schedules for insert
  with check (user_id = auth.uid() and public.can_write_finance());

drop policy if exists "income_schedules_update_own" on public.income_schedules;
create policy "income_schedules_update_own"
  on public.income_schedules for update
  using (user_id = auth.uid() and public.can_write_finance())
  with check (user_id = auth.uid() and public.can_write_finance());

drop policy if exists "income_schedules_delete_own" on public.income_schedules;
create policy "income_schedules_delete_own"
  on public.income_schedules for delete
  using (user_id = auth.uid() and public.can_write_finance());

grant select, insert, update, delete on public.income_schedules to authenticated;

notify pgrst, 'reload schema';
