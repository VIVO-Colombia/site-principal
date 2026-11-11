-- Planeador · technical stabilization.
-- Additive and idempotent. Does not drop tables, truncate data, or rewrite history.
-- Safe to run on a database that already applied 0001-0004 and contains user information.

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
      and (
        p.role = 'super_admin'
        or exists (
          select 1
          from public.subscriptions s
          where s.user_id = p.id
            and s.status in ('active', 'trialing')
            and (s.ends_at is null or s.ends_at > now())
        )
      )
  );
$$;

create or replace function public.seed_default_categories(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'No autorizado';
  end if;
  if not public.can_write_finance() then
    raise exception 'No autorizado';
  end if;

  if exists (select 1 from public.financial_categories where user_id = p_user_id) then
    return;
  end if;

  insert into public.financial_categories (user_id, name, group_code, sort_order) values
    (p_user_id, 'Salario', 'income', 10),
    (p_user_id, 'Otros ingresos', 'income', 20),
    (p_user_id, 'Arriendo', 'scheduled_payment', 10),
    (p_user_id, 'Servicios', 'scheduled_payment', 20),
    (p_user_id, 'Alimentación', 'expense', 10),
    (p_user_id, 'Transporte', 'expense', 20),
    (p_user_id, 'Hogar', 'expense', 30),
    (p_user_id, 'Salud', 'expense', 40),
    (p_user_id, 'Ahorro', 'savings', 10),
    (p_user_id, 'Deuda', 'debt', 10);
end;
$$;

create or replace function public.assert_same_owner()
returns trigger
language plpgsql
as $$
declare
  owner uuid;
begin
  if tg_table_name = 'financial_budgets' then
    select user_id into owner from public.financial_cycles where id = new.cycle_id;
    if owner is distinct from new.user_id then
      raise exception 'El presupuesto debe pertenecer al dueño del ciclo';
    end if;
    select user_id into owner from public.financial_categories where id = new.category_id;
    if owner is distinct from new.user_id then
      raise exception 'La categoría del presupuesto no pertenece al usuario';
    end if;
  elsif tg_table_name = 'financial_transactions' then
    select user_id into owner from public.financial_cycles where id = new.cycle_id;
    if owner is distinct from new.user_id then
      raise exception 'El movimiento debe pertenecer al dueño del ciclo';
    end if;
    select user_id into owner from public.financial_accounts where id = new.account_id;
    if owner is distinct from new.user_id then
      raise exception 'La cuenta no pertenece al usuario';
    end if;
    if new.counterparty_account_id is not null then
      select user_id into owner from public.financial_accounts where id = new.counterparty_account_id;
      if owner is distinct from new.user_id then
        raise exception 'La cuenta destino no pertenece al usuario';
      end if;
    end if;
    if new.category_id is not null then
      select user_id into owner from public.financial_categories where id = new.category_id;
      if owner is distinct from new.user_id then
        raise exception 'La categoría no pertenece al usuario';
      end if;
    end if;
    if new.scheduled_payment_id is not null then
      select user_id into owner from public.scheduled_payments where id = new.scheduled_payment_id;
      if owner is distinct from new.user_id then
        raise exception 'El compromiso no pertenece al usuario';
      end if;
    end if;
    if new.scheduled_income_id is not null then
      select user_id into owner from public.scheduled_incomes where id = new.scheduled_income_id;
      if owner is distinct from new.user_id then
        raise exception 'El ingreso programado no pertenece al usuario';
      end if;
    end if;
  elsif tg_table_name in ('scheduled_payments', 'scheduled_incomes') then
    select user_id into owner from public.financial_cycles where id = new.cycle_id;
    if owner is distinct from new.user_id then
      raise exception 'El compromiso debe pertenecer al dueño del ciclo';
    end if;
    if new.category_id is not null then
      select user_id into owner from public.financial_categories where id = new.category_id;
      if owner is distinct from new.user_id then
        raise exception 'La categoría no pertenece al usuario';
      end if;
    end if;
    if new.preferred_account_id is not null then
      select user_id into owner from public.financial_accounts where id = new.preferred_account_id;
      if owner is distinct from new.user_id then
        raise exception 'La cuenta preferida no pertenece al usuario';
      end if;
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.refresh_commitment_status()
returns trigger
language plpgsql
as $$
declare
  payment_id uuid;
  income_id uuid;
  paid numeric(14,2);
  expected numeric(14,2);
  due date;
  current_status public.commitment_status;
begin
  if tg_op = 'DELETE' then
    payment_id := old.scheduled_payment_id;
    income_id := old.scheduled_income_id;
  else
    payment_id := new.scheduled_payment_id;
    income_id := new.scheduled_income_id;
    if tg_op = 'UPDATE' then
      if old.scheduled_payment_id is distinct from new.scheduled_payment_id and old.scheduled_payment_id is not null then
        select coalesce(sum(amount), 0) into paid
        from public.financial_transactions
        where scheduled_payment_id = old.scheduled_payment_id
          and status = 'posted'
          and kind in ('expense', 'debt_payment', 'savings_contribution');
        select expected_amount, due_on, status into expected, due, current_status
        from public.scheduled_payments
        where id = old.scheduled_payment_id;
        if expected is not null and current_status is distinct from 'cancelled' then
          update public.scheduled_payments
          set
            paid_amount = paid,
            status = case
              when paid >= expected then 'paid'::public.commitment_status
              when paid > 0 then 'partial'::public.commitment_status
              when due < current_date then 'overdue'::public.commitment_status
              else 'pending'::public.commitment_status
            end
          where id = old.scheduled_payment_id;
        end if;
      end if;
      if old.scheduled_income_id is distinct from new.scheduled_income_id and old.scheduled_income_id is not null then
        select coalesce(sum(amount), 0) into paid
        from public.financial_transactions
        where scheduled_income_id = old.scheduled_income_id
          and status = 'posted'
          and kind = 'income';
        select expected_amount, due_on, status into expected, due, current_status
        from public.scheduled_incomes
        where id = old.scheduled_income_id;
        if expected is not null and current_status is distinct from 'cancelled' then
          update public.scheduled_incomes
          set
            received_amount = paid,
            status = case
              when paid >= expected then 'paid'::public.commitment_status
              when paid > 0 then 'partial'::public.commitment_status
              when due < current_date then 'overdue'::public.commitment_status
              else 'pending'::public.commitment_status
            end
          where id = old.scheduled_income_id;
        end if;
      end if;
    end if;
  end if;

  if payment_id is not null then
    select coalesce(sum(amount), 0) into paid
    from public.financial_transactions
    where scheduled_payment_id = payment_id
      and status = 'posted'
      and kind in ('expense', 'debt_payment', 'savings_contribution');
    select expected_amount, due_on, status into expected, due, current_status
    from public.scheduled_payments
    where id = payment_id;
    if expected is not null and current_status is distinct from 'cancelled' then
      update public.scheduled_payments
      set
        paid_amount = paid,
        status = case
          when paid >= expected then 'paid'::public.commitment_status
          when paid > 0 then 'partial'::public.commitment_status
          when due < current_date then 'overdue'::public.commitment_status
          else 'pending'::public.commitment_status
        end
      where id = payment_id;
    end if;
  end if;

  if income_id is not null then
    select coalesce(sum(amount), 0) into paid
    from public.financial_transactions
    where scheduled_income_id = income_id
      and status = 'posted'
      and kind = 'income';
    select expected_amount, due_on, status into expected, due, current_status
    from public.scheduled_incomes
    where id = income_id;
    if expected is not null and current_status is distinct from 'cancelled' then
      update public.scheduled_incomes
      set
        received_amount = paid,
        status = case
          when paid >= expected then 'paid'::public.commitment_status
          when paid > 0 then 'partial'::public.commitment_status
          when due < current_date then 'overdue'::public.commitment_status
          else 'pending'::public.commitment_status
        end
      where id = income_id;
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists tx_refresh_commitment on public.financial_transactions;
create trigger tx_refresh_commitment
  after insert or update or delete on public.financial_transactions
  for each row execute function public.refresh_commitment_status();

-- Split financial RLS: expired accounts keep SELECT (and CSV export). Writes require live access.
drop policy if exists "cycles_own" on public.financial_cycles;
drop policy if exists "cycles_select_own" on public.financial_cycles;
drop policy if exists "cycles_insert_own" on public.financial_cycles;
drop policy if exists "cycles_update_own" on public.financial_cycles;
drop policy if exists "cycles_delete_own" on public.financial_cycles;
create policy "cycles_select_own"
  on public.financial_cycles for select
  using (user_id = auth.uid());
create policy "cycles_insert_own"
  on public.financial_cycles for insert
  with check (user_id = auth.uid() and public.can_write_finance());
create policy "cycles_update_own"
  on public.financial_cycles for update
  using (user_id = auth.uid() and public.can_write_finance())
  with check (user_id = auth.uid() and public.can_write_finance());
create policy "cycles_delete_own"
  on public.financial_cycles for delete
  using (user_id = auth.uid() and public.can_write_finance());

drop policy if exists "accounts_own" on public.financial_accounts;
drop policy if exists "accounts_select_own" on public.financial_accounts;
drop policy if exists "accounts_insert_own" on public.financial_accounts;
drop policy if exists "accounts_update_own" on public.financial_accounts;
drop policy if exists "accounts_delete_own" on public.financial_accounts;
create policy "accounts_select_own"
  on public.financial_accounts for select
  using (user_id = auth.uid());
create policy "accounts_insert_own"
  on public.financial_accounts for insert
  with check (user_id = auth.uid() and public.can_write_finance());
create policy "accounts_update_own"
  on public.financial_accounts for update
  using (user_id = auth.uid() and public.can_write_finance())
  with check (user_id = auth.uid() and public.can_write_finance());
create policy "accounts_delete_own"
  on public.financial_accounts for delete
  using (user_id = auth.uid() and public.can_write_finance());

drop policy if exists "categories_own" on public.financial_categories;
drop policy if exists "categories_select_own" on public.financial_categories;
drop policy if exists "categories_insert_own" on public.financial_categories;
drop policy if exists "categories_update_own" on public.financial_categories;
drop policy if exists "categories_delete_own" on public.financial_categories;
create policy "categories_select_own"
  on public.financial_categories for select
  using (user_id = auth.uid());
create policy "categories_insert_own"
  on public.financial_categories for insert
  with check (user_id = auth.uid() and public.can_write_finance());
create policy "categories_update_own"
  on public.financial_categories for update
  using (user_id = auth.uid() and public.can_write_finance())
  with check (user_id = auth.uid() and public.can_write_finance());
create policy "categories_delete_own"
  on public.financial_categories for delete
  using (user_id = auth.uid() and public.can_write_finance());

drop policy if exists "budgets_own" on public.financial_budgets;
drop policy if exists "budgets_select_own" on public.financial_budgets;
drop policy if exists "budgets_insert_own" on public.financial_budgets;
drop policy if exists "budgets_update_own" on public.financial_budgets;
drop policy if exists "budgets_delete_own" on public.financial_budgets;
create policy "budgets_select_own"
  on public.financial_budgets for select
  using (user_id = auth.uid());
create policy "budgets_insert_own"
  on public.financial_budgets for insert
  with check (user_id = auth.uid() and public.can_write_finance());
create policy "budgets_update_own"
  on public.financial_budgets for update
  using (user_id = auth.uid() and public.can_write_finance())
  with check (user_id = auth.uid() and public.can_write_finance());
create policy "budgets_delete_own"
  on public.financial_budgets for delete
  using (user_id = auth.uid() and public.can_write_finance());

drop policy if exists "transactions_own" on public.financial_transactions;
drop policy if exists "transactions_select_own" on public.financial_transactions;
drop policy if exists "transactions_insert_own" on public.financial_transactions;
drop policy if exists "transactions_update_own" on public.financial_transactions;
drop policy if exists "transactions_delete_own" on public.financial_transactions;
create policy "transactions_select_own"
  on public.financial_transactions for select
  using (user_id = auth.uid());
create policy "transactions_insert_own"
  on public.financial_transactions for insert
  with check (user_id = auth.uid() and public.can_write_finance());
create policy "transactions_update_own"
  on public.financial_transactions for update
  using (user_id = auth.uid() and public.can_write_finance())
  with check (user_id = auth.uid() and public.can_write_finance());
create policy "transactions_delete_own"
  on public.financial_transactions for delete
  using (user_id = auth.uid() and public.can_write_finance());

drop policy if exists "scheduled_payments_own" on public.scheduled_payments;
drop policy if exists "scheduled_payments_select_own" on public.scheduled_payments;
drop policy if exists "scheduled_payments_insert_own" on public.scheduled_payments;
drop policy if exists "scheduled_payments_update_own" on public.scheduled_payments;
drop policy if exists "scheduled_payments_delete_own" on public.scheduled_payments;
create policy "scheduled_payments_select_own"
  on public.scheduled_payments for select
  using (user_id = auth.uid());
create policy "scheduled_payments_insert_own"
  on public.scheduled_payments for insert
  with check (user_id = auth.uid() and public.can_write_finance());
create policy "scheduled_payments_update_own"
  on public.scheduled_payments for update
  using (user_id = auth.uid() and public.can_write_finance())
  with check (user_id = auth.uid() and public.can_write_finance());
create policy "scheduled_payments_delete_own"
  on public.scheduled_payments for delete
  using (user_id = auth.uid() and public.can_write_finance());

drop policy if exists "scheduled_incomes_own" on public.scheduled_incomes;
drop policy if exists "scheduled_incomes_select_own" on public.scheduled_incomes;
drop policy if exists "scheduled_incomes_insert_own" on public.scheduled_incomes;
drop policy if exists "scheduled_incomes_update_own" on public.scheduled_incomes;
drop policy if exists "scheduled_incomes_delete_own" on public.scheduled_incomes;
create policy "scheduled_incomes_select_own"
  on public.scheduled_incomes for select
  using (user_id = auth.uid());
create policy "scheduled_incomes_insert_own"
  on public.scheduled_incomes for insert
  with check (user_id = auth.uid() and public.can_write_finance());
create policy "scheduled_incomes_update_own"
  on public.scheduled_incomes for update
  using (user_id = auth.uid() and public.can_write_finance())
  with check (user_id = auth.uid() and public.can_write_finance());
create policy "scheduled_incomes_delete_own"
  on public.scheduled_incomes for delete
  using (user_id = auth.uid() and public.can_write_finance());

-- Revoke EXECUTE on every public function, then allow only the RPC surface.
do $$
declare
  r record;
  role_name text;
begin
  for r in
    select p.proname, pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
  loop
    execute format('revoke all on function public.%I(%s) from public', r.proname, r.args);
    foreach role_name in array array['anon', 'authenticated'] loop
      begin
        execute format('revoke all on function public.%I(%s) from %I', r.proname, r.args, role_name);
      exception
        when undefined_object then
          null;
      end;
    end loop;
  end loop;
end $$;

do $$
begin
  grant execute on function public.is_super_admin() to authenticated;
  grant execute on function public.can_write_finance() to authenticated;
  grant execute on function public.seed_default_categories(uuid) to authenticated;
  grant execute on function public.admin_set_account_status(uuid, public.account_status, text) to authenticated;
  grant execute on function public.admin_approve_payment_request(uuid, text) to authenticated;
  grant execute on function public.admin_reject_payment_request(uuid, text) to authenticated;
  grant execute on function public.admin_grant_trial(uuid, uuid, timestamptz, timestamptz, text) to authenticated;
  grant execute on function public.admin_set_subscription_status(uuid, public.subscription_status, text) to authenticated;
  grant execute on function public.admin_extend_subscription(uuid, integer, text) to authenticated;
exception
  when undefined_object then
    raise notice 'authenticated role not present; skip RPC grants';
end $$;
