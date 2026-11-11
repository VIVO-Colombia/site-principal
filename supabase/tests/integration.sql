-- Integration tests: two independent users, a Super Admin, and several billing states.
-- Run against an isolated database only. Does not target production.

create or replace function public.test_fail(message text)
returns void
language plpgsql
as $$
begin
  raise exception 'FAIL: %', message;
end;
$$;

create or replace function public.test_pass(message text)
returns void
language plpgsql
as $$
begin
  raise notice 'PASS: %', message;
end;
$$;

create or replace function public.test_as_user(p_user uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claim.sub', p_user::text, false);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', p_user, 'role', 'authenticated')::text,
    false
  );
end;
$$;

do $$
declare
  user_a uuid := '11111111-1111-1111-1111-111111111111';
  user_b uuid := '22222222-2222-2222-2222-222222222222';
  user_expired uuid := '33333333-3333-3333-3333-333333333333';
  user_lapsed uuid := '44444444-4444-4444-4444-444444444444';
  user_suspended uuid := '55555555-5555-5555-5555-555555555555';
  user_none uuid := '66666666-6666-6666-6666-666666666666';
  user_admin uuid := '77777777-7777-7777-7777-777777777777';
  plan_id uuid;
  cycle_a uuid;
  cycle_b uuid;
  cycle_expired uuid;
  account_a uuid;
  account_b uuid;
  account_expired uuid;
  category_a uuid;
  category_b uuid;
  fn record;
  allowed text[];
  can_exec boolean;
  visible integer;
  wrote boolean;
begin
  insert into auth.users (id, email, raw_user_meta_data, email_confirmed_at)
  values
    (user_a, 'a@test.local', '{"full_name":"Ana"}', now()),
    (user_b, 'b@test.local', '{"full_name":"Bruno"}', now()),
    (user_expired, 'expired@test.local', '{"full_name":"Eva"}', now()),
    (user_lapsed, 'lapsed@test.local', '{"full_name":"Luis"}', now()),
    (user_suspended, 'suspended@test.local', '{"full_name":"Sara"}', now()),
    (user_none, 'none@test.local', '{"full_name":"Nico"}', now()),
    (user_admin, 'admin@test.local', '{"full_name":"Ada"}', now())
  on conflict (id) do nothing;

  if (select role from public.profiles where id = user_a) is distinct from 'user' then
    perform public.test_fail('el registro público debe crear role=user');
  end if;
  perform public.test_pass('registro público crea role=user');

  perform set_config('planeador.allow_role_change', 'true', true);
  perform set_config('planeador.allow_status_change', 'true', true);
  update public.profiles set role = 'super_admin', account_status = 'enabled' where id = user_admin;
  update public.profiles set account_status = 'suspended' where id = user_suspended;

  select id into plan_id from public.plans where code = 'mensual';
  if plan_id is null then
    perform public.test_fail('el catálogo de planes no se sembró');
  end if;

  insert into public.subscriptions (user_id, plan_id, status, source, starts_at, ends_at, plan_name_snapshot, duration_days_snapshot)
  values
    (user_a, plan_id, 'active', 'manual', now() - interval '2 days', now() + interval '28 days', 'Mensual', 30),
    (user_b, plan_id, 'active', 'manual', now() - interval '2 days', now() + interval '28 days', 'Mensual', 30),
    (user_expired, plan_id, 'expired', 'manual', now() - interval '60 days', now() - interval '30 days', 'Mensual', 30),
    (user_lapsed, plan_id, 'active', 'manual', now() - interval '40 days', now() - interval '10 days', 'Mensual', 30),
    (user_suspended, plan_id, 'active', 'manual', now() - interval '2 days', now() + interval '28 days', 'Mensual', 30);

  insert into public.financial_cycles (user_id, name, starts_on, ends_on)
  values
    (user_a, 'Ciclo A', current_date, current_date + 30),
    (user_b, 'Ciclo B', current_date, current_date + 30),
    (user_expired, 'Ciclo vencido', current_date - 40, current_date - 10);

  select id into cycle_a from public.financial_cycles where user_id = user_a;
  select id into cycle_b from public.financial_cycles where user_id = user_b;
  select id into cycle_expired from public.financial_cycles where user_id = user_expired;

  insert into public.financial_accounts (user_id, name, kind, opening_balance)
  values
    (user_a, 'Banco A', 'bank', 1000),
    (user_b, 'Banco B', 'bank', 2000),
    (user_expired, 'Banco Eva', 'bank', 50);

  select id into account_a from public.financial_accounts where user_id = user_a;
  select id into account_b from public.financial_accounts where user_id = user_b;
  select id into account_expired from public.financial_accounts where user_id = user_expired;

  insert into public.financial_categories (user_id, name, group_code)
  values
    (user_a, 'Arriendo A', 'scheduled_payment'),
    (user_b, 'Arriendo B', 'scheduled_payment');

  select id into category_a from public.financial_categories where user_id = user_a;
  select id into category_b from public.financial_categories where user_id = user_b;

  allowed := array[
    'is_super_admin',
    'can_write_finance',
    'seed_default_categories',
    'admin_set_account_status',
    'admin_approve_payment_request',
    'admin_reject_payment_request',
    'admin_grant_trial',
    'admin_set_subscription_status',
    'admin_extend_subscription'
  ];

  for fn in
    select p.proname, p.oid
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and p.proname not like 'test_%'
  loop
    can_exec := has_function_privilege('authenticated', fn.oid, 'execute');
    if fn.proname = any(allowed) then
      if not can_exec then
        perform public.test_fail(format('%s debe tener EXECUTE para authenticated', fn.proname));
      end if;
    else
      if can_exec then
        perform public.test_fail(format('%s no debe tener EXECUTE para authenticated', fn.proname));
      end if;
    end if;
  end loop;
  perform public.test_pass('EXECUTE restringido al RPC permitido');

  perform public.test_pass('funciones internas sin EXECUTE para authenticated');

  perform public.test_as_user(user_a);
  set role authenticated;
  select count(*) into visible from public.financial_cycles;
  if visible <> 1 then
    reset role;
    perform public.test_fail('el usuario A no debe ver ciclos ajenos');
  end if;
  select count(*) into visible from public.financial_accounts where user_id = user_b;
  reset role;
  if visible <> 0 then
    perform public.test_fail('el usuario A no debe ver cuentas de B');
  end if;
  perform public.test_pass('RLS aísla finanzas de dos usuarios');

  perform public.test_as_user(user_admin);
  set role authenticated;
  select count(*) into visible from public.financial_cycles where user_id = user_a;
  if visible <> 0 then
    reset role;
    perform public.test_fail('el Super Admin no debe leer finanzas ajenas');
  end if;
  select count(*) into visible from public.profiles;
  reset role;
  if visible < 7 then
    perform public.test_fail('el Super Admin debe leer perfiles');
  end if;
  perform public.test_pass('Super Admin no cruza finanzas privadas');

  perform public.test_as_user(user_a);
  wrote := false;
  begin
    set role authenticated;
    insert into public.financial_transactions (
      user_id, cycle_id, account_id, kind, amount, occurred_on
    ) values (
      user_a, cycle_a, account_b, 'expense', 10, current_date
    );
    reset role;
    wrote := true;
  exception
    when others then
      reset role;
      wrote := false;
  end;
  if wrote then
    perform public.test_fail('un movimiento con cuenta ajena debió fallar');
  end if;
  perform public.test_pass('propiedad de cuenta validada');

  perform public.test_as_user(user_a);
  wrote := false;
  begin
    set role authenticated;
    insert into public.scheduled_payments (
      user_id, cycle_id, category_id, name, expected_amount, due_on
    ) values (
      user_a, cycle_a, category_b, 'Cuenta ajena', 10, current_date
    );
    reset role;
    wrote := true;
  exception
    when others then
      reset role;
      wrote := false;
  end;
  if wrote then
    perform public.test_fail('un compromiso con categoría ajena debió fallar');
  end if;
  perform public.test_pass('propiedad de categoría en compromisos validada');

  perform public.test_as_user(user_expired);
  set role authenticated;
  select count(*) into visible from public.financial_cycles;
  reset role;
  if visible <> 1 then
    perform public.test_fail('la suscripción vencida debe poder consultar sus ciclos');
  end if;
  wrote := false;
  begin
    set role authenticated;
    insert into public.financial_cycles (user_id, name, starts_on, ends_on)
    values (user_expired, 'Nuevo', current_date, current_date + 10);
    reset role;
    wrote := true;
  exception
    when others then
      reset role;
      wrote := false;
  end;
  if wrote then
    perform public.test_fail('una suscripción vencida no debe escribir');
  end if;
  perform public.test_pass('vencida: SELECT sí, escritura no');

  perform public.test_as_user(user_lapsed);
  wrote := false;
  begin
    set role authenticated;
    insert into public.financial_cycles (user_id, name, starts_on, ends_on)
    values (user_lapsed, 'Lapsed', current_date, current_date + 10);
    reset role;
    wrote := true;
  exception
    when others then
      reset role;
      wrote := false;
  end;
  if wrote then
    perform public.test_fail('una suscripción active con ends_at pasado no debe escribir');
  end if;
  perform public.test_pass('active lapsed se trata como vencida para escritura');

  perform public.test_as_user(user_suspended);
  wrote := false;
  begin
    set role authenticated;
    insert into public.financial_cycles (user_id, name, starts_on, ends_on)
    values (user_suspended, 'Suspendida', current_date, current_date + 10);
    reset role;
    wrote := true;
  exception
    when others then
      reset role;
      wrote := false;
  end;
  if wrote then
    perform public.test_fail('una cuenta suspendida no debe escribir finanzas');
  end if;
  perform public.test_pass('cuenta suspendida no escribe');

  perform public.test_as_user(user_none);
  wrote := false;
  begin
    set role authenticated;
    insert into public.financial_cycles (user_id, name, starts_on, ends_on)
    values (user_none, 'Sin plan', current_date, current_date + 10);
    reset role;
    wrote := true;
  exception
    when others then
      reset role;
      wrote := false;
  end;
  if wrote then
    perform public.test_fail('sin suscripción vigente no debe escribir');
  end if;
  perform public.test_pass('sin suscripción no escribe');

  perform public.test_as_user(user_a);
  begin
    set role authenticated;
    insert into public.financial_cycles (user_id, name, starts_on, ends_on)
    values (user_a, 'Segundo ciclo', current_date + 40, current_date + 70);
    reset role;
  exception
    when others then
      reset role;
      perform public.test_fail('un usuario vigente debe poder crear un ciclo: ' || sqlerrm);
  end;
  perform public.test_pass('usuario vigente escribe sus finanzas');

  perform public.test_as_user(user_a);
  begin
    set role authenticated;
    perform public.admin_approve_payment_request('00000000-0000-0000-0000-000000000000');
    reset role;
    perform public.test_fail('un usuario no admin no debe aprobar pagos');
  exception
    when others then
      reset role;
      if sqlerrm ilike '%un usuario no admin%' then
        raise;
      end if;
      if sqlerrm not ilike '%autorizado%' and sqlerrm not ilike '%encontrada%' then
        raise;
      end if;
  end;
  perform public.test_pass('admin RPC rechaza a un usuario ordinario');

  raise notice 'ALL INTEGRATION CHECKS PASSED';
end $$;
