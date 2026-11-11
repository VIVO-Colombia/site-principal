-- Row Level Security. Super Admin can read commercial tables, never other users' finances.

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.plans enable row level security;
alter table public.payment_methods enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_requests enable row level security;
alter table public.payments enable row level security;
alter table public.subscription_events enable row level security;
alter table public.audit_logs enable row level security;
alter table public.in_app_notifications enable row level security;
alter table public.financial_cycles enable row level security;
alter table public.financial_accounts enable row level security;
alter table public.financial_categories enable row level security;
alter table public.financial_budgets enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.scheduled_payments enable row level security;
alter table public.scheduled_incomes enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_super_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "user_roles_select" on public.user_roles;
create policy "user_roles_select"
  on public.user_roles for select
  using (user_id = auth.uid() or public.is_super_admin());

drop policy if exists "plans_public_read" on public.plans;
create policy "plans_public_read"
  on public.plans for select
  using (is_active = true or public.is_super_admin());

drop policy if exists "plans_admin_write" on public.plans;
create policy "plans_admin_write"
  on public.plans for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists "payment_methods_read" on public.payment_methods;
create policy "payment_methods_read"
  on public.payment_methods for select
  using (is_active = true or public.is_super_admin());

drop policy if exists "payment_methods_admin_write" on public.payment_methods;
create policy "payment_methods_admin_write"
  on public.payment_methods for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists "subscriptions_select" on public.subscriptions;
create policy "subscriptions_select"
  on public.subscriptions for select
  using (user_id = auth.uid() or public.is_super_admin());

drop policy if exists "payment_requests_select" on public.payment_requests;
create policy "payment_requests_select"
  on public.payment_requests for select
  using (user_id = auth.uid() or public.is_super_admin());

drop policy if exists "payment_requests_insert_own" on public.payment_requests;
create policy "payment_requests_insert_own"
  on public.payment_requests for insert
  with check (user_id = auth.uid());

drop policy if exists "payments_select" on public.payments;
create policy "payments_select"
  on public.payments for select
  using (user_id = auth.uid() or public.is_super_admin());

drop policy if exists "subscription_events_select" on public.subscription_events;
create policy "subscription_events_select"
  on public.subscription_events for select
  using (
    public.is_super_admin()
    or exists (
      select 1 from public.subscriptions s
      where s.id = subscription_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "audit_logs_admin_select" on public.audit_logs;
create policy "audit_logs_admin_select"
  on public.audit_logs for select
  using (public.is_super_admin());

drop policy if exists "notifications_own" on public.in_app_notifications;
create policy "notifications_own"
  on public.in_app_notifications for select
  using (user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.in_app_notifications;
create policy "notifications_update_own"
  on public.in_app_notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Financial tables: owner only. Super Admin is NOT granted cross-user finance access.

drop policy if exists "cycles_own" on public.financial_cycles;
create policy "cycles_own"
  on public.financial_cycles for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "accounts_own" on public.financial_accounts;
create policy "accounts_own"
  on public.financial_accounts for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "categories_own" on public.financial_categories;
create policy "categories_own"
  on public.financial_categories for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "budgets_own" on public.financial_budgets;
create policy "budgets_own"
  on public.financial_budgets for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "transactions_own" on public.financial_transactions;
create policy "transactions_own"
  on public.financial_transactions for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "scheduled_payments_own" on public.scheduled_payments;
create policy "scheduled_payments_own"
  on public.scheduled_payments for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "scheduled_incomes_own" on public.scheduled_incomes;
create policy "scheduled_incomes_own"
  on public.scheduled_incomes for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

do $$
begin
  insert into storage.buckets (id, name, public)
  values ('receipts', 'receipts', false)
  on conflict (id) do nothing;

  execute 'drop policy if exists "receipts_insert_own" on storage.objects';
  execute $p$
    create policy "receipts_insert_own"
      on storage.objects for insert
      with check (
        bucket_id = 'receipts'
        and auth.uid() is not null
        and (storage.foldername(name))[1] = auth.uid()::text
      )
  $p$;

  execute 'drop policy if exists "receipts_select_own_or_admin" on storage.objects';
  execute $p$
    create policy "receipts_select_own_or_admin"
      on storage.objects for select
      using (
        bucket_id = 'receipts'
        and (
          (storage.foldername(name))[1] = auth.uid()::text
          or public.is_super_admin()
        )
      )
  $p$;
exception
  when undefined_table then
    raise notice 'storage schema not available; skip receipts bucket';
  when duplicate_object then
    null;
end $$;
