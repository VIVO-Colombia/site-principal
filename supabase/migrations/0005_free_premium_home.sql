-- Fase 3: Free lifetime, Premium capabilities, account visuals, receipts prep.
-- Additive and idempotent. Does not drop finance data or relax owner isolation.

do $$ begin
  create type public.plan_tier as enum ('free', 'premium');
exception when duplicate_object then null;
end $$;

alter table public.plans
  add column if not exists tier public.plan_tier not null default 'premium';

alter table public.plans
  add column if not exists capabilities jsonb not null default '[]'::jsonb;

insert into public.plans (
  code, name, description, cadence, duration_days, price_amount, currency,
  is_active, visible_on_landing, sort_order, tier, capabilities
) values (
  'gratis',
  'Free',
  'Acceso al planeador sin vencimiento. Movimientos, cuentas, presupuesto y pagos.',
  'custom',
  36500,
  0,
  'COP',
  true,
  true,
  0,
  'free',
  '["manual_transactions","accounts","budgets","scheduled_payments","basic_analytics","basic_export"]'::jsonb
)
on conflict (code) do update
  set tier = excluded.tier,
      capabilities = excluded.capabilities,
      description = excluded.description,
      visible_on_landing = true,
      is_active = true;

update public.plans
set tier = 'premium',
    capabilities = coalesce(nullif(capabilities, '[]'::jsonb),
      '["manual_transactions","accounts","budgets","scheduled_payments","basic_analytics","basic_export","receipt_upload","receipt_ocr","advanced_analytics","advanced_export"]'::jsonb)
where code is distinct from 'gratis';

alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;

do $$ begin
  alter type public.account_kind add value if not exists 'savings';
exception when duplicate_object then null;
end $$;

alter table public.financial_accounts
  add column if not exists color text;

alter table public.financial_accounts
  add column if not exists icon text;

alter table public.financial_accounts
  add column if not exists include_in_total boolean not null default true;

create table if not exists public.transaction_receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  transaction_id uuid references public.financial_transactions (id) on delete set null,
  storage_path text not null,
  original_filename text,
  content_type text,
  byte_size integer,
  ocr_status text not null default 'stored' check (ocr_status in ('stored', 'pending', 'ready', 'failed', 'unavailable')),
  ocr_payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists transaction_receipts_user_idx
  on public.transaction_receipts (user_id, created_at desc);

alter table public.transaction_receipts enable row level security;

-- Internal RPCs must not be callable by clients even if a previous environment granted them.
do $$ begin
  revoke all on function public.write_audit(text, text, uuid, jsonb, jsonb, text, jsonb) from public, anon, authenticated;
exception when undefined_function then null;
end $$;

do $$ begin
  revoke all on function public.provision_first_super_admin(uuid, text) from public, anon, authenticated;
exception when undefined_function then null;
end $$;

create or replace function public.can_write_finance()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.account_status = 'enabled'
      and not exists (
        select 1
        from public.subscriptions s
        where s.user_id = p.id
          and s.status = 'suspended'
      )
  );
$$;

create or replace function public.has_live_premium()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    left join public.subscriptions s on s.user_id = p.id
    where p.id = auth.uid()
      and p.account_status = 'enabled'
      and (
        p.role = 'super_admin'
        or (
          s.status in ('active', 'trialing')
          and (s.ends_at is null or s.ends_at >= now())
        )
      )
  );
$$;

create or replace function public.can_use_premium_capability(p_capability text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    case
      when p_capability in (
        'manual_transactions', 'accounts', 'budgets', 'scheduled_payments',
        'basic_analytics', 'basic_export'
      ) then public.can_write_finance()
      else public.has_live_premium()
    end;
$$;

grant execute on function public.can_write_finance() to authenticated;
grant execute on function public.has_live_premium() to authenticated;
grant execute on function public.can_use_premium_capability(text) to authenticated;

drop policy if exists "receipts_meta_own" on public.transaction_receipts;
create policy "receipts_meta_own"
  on public.transaction_receipts for select
  using (user_id = auth.uid());

drop policy if exists "receipts_meta_insert_own" on public.transaction_receipts;
create policy "receipts_meta_insert_own"
  on public.transaction_receipts for insert
  with check (user_id = auth.uid() and public.can_use_premium_capability('receipt_upload'));

drop policy if exists "receipts_meta_update_own" on public.transaction_receipts;
create policy "receipts_meta_update_own"
  on public.transaction_receipts for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Split finance policies: owners always read; writes require an enabled, non-suspended account.
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'financial_cycles',
    'financial_accounts',
    'financial_categories',
    'financial_budgets',
    'financial_transactions',
    'scheduled_payments',
    'scheduled_incomes'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', replace(tbl, 'financial_', '') || '_own', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_select_own', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_write_own', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_insert_own', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_update_own', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_delete_own', tbl);

    execute format(
      'create policy %I on public.%I for select using (user_id = auth.uid())',
      tbl || '_select_own',
      tbl
    );
    execute format(
      'create policy %I on public.%I for insert with check (user_id = auth.uid() and public.can_write_finance())',
      tbl || '_insert_own',
      tbl
    );
    execute format(
      'create policy %I on public.%I for update using (user_id = auth.uid() and public.can_write_finance()) with check (user_id = auth.uid() and public.can_write_finance())',
      tbl || '_update_own',
      tbl
    );
    execute format(
      'create policy %I on public.%I for delete using (user_id = auth.uid() and public.can_write_finance())',
      tbl || '_delete_own',
      tbl
    );
  end loop;
end $$;
