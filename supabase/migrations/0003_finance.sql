-- Financial core. Ownership is always explicit via user_id.

do $$ begin
  create type public.cycle_status as enum ('open', 'closed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.account_kind as enum (
    'cash', 'bank', 'digital_wallet', 'pocket', 'other'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.category_group as enum (
    'income', 'scheduled_payment', 'expense', 'savings', 'debt'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.transaction_kind as enum (
    'income', 'expense', 'transfer', 'savings_contribution', 'debt_payment'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.transaction_status as enum ('posted', 'voided');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.commitment_status as enum (
    'pending', 'partial', 'paid', 'overdue', 'cancelled'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.financial_cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  starts_on date not null,
  ends_on date not null,
  status public.cycle_status not null default 'open',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint financial_cycles_range check (ends_on >= starts_on)
);

alter table public.financial_cycles
  drop constraint if exists financial_cycles_no_overlap;
alter table public.financial_cycles
  add constraint financial_cycles_no_overlap
  exclude using gist (
    user_id with =,
    daterange(starts_on, ends_on, '[]') with &&
  );

create table if not exists public.financial_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  kind public.account_kind not null default 'cash',
  currency text not null default 'COP',
  opening_balance numeric(14,2) not null default 0,
  allow_negative boolean not null default true,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  group_code public.category_group not null,
  color text,
  icon text,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  cycle_id uuid not null references public.financial_cycles (id) on delete cascade,
  category_id uuid not null references public.financial_categories (id),
  planned_amount numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cycle_id, category_id)
);

create table if not exists public.scheduled_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  cycle_id uuid not null references public.financial_cycles (id) on delete cascade,
  category_id uuid references public.financial_categories (id),
  preferred_account_id uuid references public.financial_accounts (id),
  name text not null,
  expected_amount numeric(14,2) not null,
  due_on date not null,
  paid_amount numeric(14,2) not null default 0,
  status public.commitment_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scheduled_incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  cycle_id uuid not null references public.financial_cycles (id) on delete cascade,
  category_id uuid references public.financial_categories (id),
  preferred_account_id uuid references public.financial_accounts (id),
  name text not null,
  expected_amount numeric(14,2) not null,
  due_on date not null,
  received_amount numeric(14,2) not null default 0,
  status public.commitment_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  cycle_id uuid not null references public.financial_cycles (id),
  account_id uuid not null references public.financial_accounts (id),
  counterparty_account_id uuid references public.financial_accounts (id),
  category_id uuid references public.financial_categories (id),
  scheduled_payment_id uuid references public.scheduled_payments (id),
  scheduled_income_id uuid references public.scheduled_incomes (id),
  kind public.transaction_kind not null,
  status public.transaction_status not null default 'posted',
  amount numeric(14,2) not null check (amount > 0),
  occurred_on date not null,
  description text,
  notes text,
  voided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transfer_needs_counterparty check (
    (kind <> 'transfer') or (counterparty_account_id is not null and counterparty_account_id <> account_id)
  )
);

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

drop trigger if exists budgets_same_owner on public.financial_budgets;
create trigger budgets_same_owner
  before insert or update on public.financial_budgets
  for each row execute function public.assert_same_owner();

drop trigger if exists transactions_same_owner on public.financial_transactions;
create trigger transactions_same_owner
  before insert or update on public.financial_transactions
  for each row execute function public.assert_same_owner();

drop trigger if exists scheduled_payments_same_owner on public.scheduled_payments;
create trigger scheduled_payments_same_owner
  before insert or update on public.scheduled_payments
  for each row execute function public.assert_same_owner();

drop trigger if exists scheduled_incomes_same_owner on public.scheduled_incomes;
create trigger scheduled_incomes_same_owner
  before insert or update on public.scheduled_incomes
  for each row execute function public.assert_same_owner();

drop trigger if exists cycles_set_updated_at on public.financial_cycles;
create trigger cycles_set_updated_at
  before update on public.financial_cycles
  for each row execute function public.set_updated_at();

drop trigger if exists accounts_set_updated_at on public.financial_accounts;
create trigger accounts_set_updated_at
  before update on public.financial_accounts
  for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.financial_categories;
create trigger categories_set_updated_at
  before update on public.financial_categories
  for each row execute function public.set_updated_at();

drop trigger if exists budgets_set_updated_at on public.financial_budgets;
create trigger budgets_set_updated_at
  before update on public.financial_budgets
  for each row execute function public.set_updated_at();

drop trigger if exists tx_set_updated_at on public.financial_transactions;
create trigger tx_set_updated_at
  before update on public.financial_transactions
  for each row execute function public.set_updated_at();

drop trigger if exists sp_set_updated_at on public.scheduled_payments;
create trigger sp_set_updated_at
  before update on public.scheduled_payments
  for each row execute function public.set_updated_at();

drop trigger if exists si_set_updated_at on public.scheduled_incomes;
create trigger si_set_updated_at
  before update on public.scheduled_incomes
  for each row execute function public.set_updated_at();

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
      if old.scheduled_payment_id is distinct from new.scheduled_payment_id then
        payment_id := new.scheduled_payment_id;
        -- Recompute the previous commitment before the new one.
        if old.scheduled_payment_id is not null then
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

create index if not exists financial_cycles_user_idx on public.financial_cycles (user_id, starts_on desc);
create index if not exists financial_accounts_user_idx on public.financial_accounts (user_id);
create index if not exists financial_categories_user_idx on public.financial_categories (user_id, group_code);
create index if not exists financial_tx_user_date_idx on public.financial_transactions (user_id, occurred_on desc);
create index if not exists financial_tx_cycle_idx on public.financial_transactions (cycle_id, status);
create index if not exists scheduled_payments_due_idx on public.scheduled_payments (user_id, due_on);

grant execute on function public.seed_default_categories(uuid) to authenticated;
revoke all on function public.assert_same_owner() from public, anon, authenticated;
revoke all on function public.refresh_commitment_status() from public, anon, authenticated;
