-- Administrative RPCs. Role elevation is NOT granted to anon/authenticated
-- except for operations that already require is_super_admin().

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'super_admin'
      and account_status = 'enabled'
  );
$$;

create or replace function public.write_audit(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_previous jsonb default null,
  p_new jsonb default null,
  p_reason text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (
    actor_id, action, entity_type, entity_id, previous_state, new_state, reason, metadata
  ) values (
    auth.uid(), p_action, p_entity_type, p_entity_id, p_previous, p_new, p_reason, p_metadata
  );
end;
$$;

-- Manual bootstrap. Run in the SQL editor as the database owner.
-- Not granted to anon or authenticated.
create or replace function public.provision_first_super_admin(p_user_id uuid, p_reason text default 'aprovisionamiento inicial')
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  existing integer;
begin
  if p_user_id is null then
    raise exception 'Debes indicar el UUID de una cuenta existente';
  end if;

  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'No existe un perfil con ese UUID. Crea la cuenta primero.';
  end if;

  select count(*) into existing from public.profiles where role = 'super_admin';

  if existing > 0 and not public.is_super_admin() then
    raise exception 'Ya existe un Super Admin. Este procedimiento solo puede ejecutarlo un Super Admin o el dueño de la base de datos cuando aún no hay ninguno.';
  end if;

  perform set_config('planeador.allow_role_change', 'true', true);

  update public.profiles
  set role = 'super_admin', account_status = 'enabled'
  where id = p_user_id;

  insert into public.user_roles (user_id, role, assigned_by, reason)
  values (p_user_id, 'super_admin', auth.uid(), p_reason);

  perform public.write_audit(
    'provision_super_admin',
    'profile',
    p_user_id,
    jsonb_build_object('role', 'user'),
    jsonb_build_object('role', 'super_admin'),
    p_reason
  );
end;
$$;

revoke all on function public.provision_first_super_admin(uuid, text) from public, anon, authenticated;

create or replace function public.admin_set_account_status(
  p_user_id uuid,
  p_status public.account_status,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  previous public.account_status;
begin
  if not public.is_super_admin() then
    raise exception 'No autorizado';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'No puedes suspender tu propia cuenta de Super Admin';
  end if;

  select account_status into previous from public.profiles where id = p_user_id for update;
  if previous is null then
    raise exception 'Usuario no encontrado';
  end if;

  perform set_config('planeador.allow_status_change', 'true', true);
  update public.profiles set account_status = p_status where id = p_user_id;

  perform public.write_audit(
    'set_account_status',
    'profile',
    p_user_id,
    jsonb_build_object('account_status', previous),
    jsonb_build_object('account_status', p_status),
    p_reason
  );
end;
$$;

create or replace function public.snapshot_plan(p_plan public.plans)
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'plan_id', p_plan.id,
    'name', p_plan.name,
    'duration_days', p_plan.duration_days,
    'price_amount', p_plan.price_amount,
    'currency', p_plan.currency
  );
$$;

create or replace function public.activate_or_renew_subscription(
  p_user_id uuid,
  p_plan public.plans,
  p_source public.subscription_source,
  p_starts_at timestamptz,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  live public.subscriptions;
  new_start timestamptz;
  new_end timestamptz;
  new_id uuid;
begin
  select * into live
  from public.subscriptions
  where user_id = p_user_id
    and status in ('active', 'trialing')
  for update;

  if p_source = 'trial' and live.status = 'active' then
    raise exception 'No se puede conceder una prueba sobre una suscripción pagada vigente';
  end if;

  if live.id is not null and live.status in ('active', 'trialing') and live.ends_at is not null and live.ends_at > now() then
    -- SUS-04: extend from current end when still valid.
    new_start := live.starts_at;
    new_end := live.ends_at + make_interval(days => p_plan.duration_days);
    update public.subscriptions
    set
      plan_id = p_plan.id,
      status = case when p_source = 'trial' then 'trialing' else 'active' end,
      source = p_source,
      ends_at = new_end,
      plan_name_snapshot = p_plan.name,
      duration_days_snapshot = p_plan.duration_days,
      price_amount_snapshot = p_plan.price_amount,
      currency_snapshot = p_plan.currency
    where id = live.id;

    insert into public.subscription_events (subscription_id, event_type, payload, created_by)
    values (
      live.id,
      'renewed',
      jsonb_build_object('ends_at', new_end, 'source', p_source, 'reason', p_reason),
      auth.uid()
    );

    perform public.write_audit('renew_subscription', 'subscription', live.id, to_jsonb(live), jsonb_build_object('ends_at', new_end), p_reason);
    return live.id;
  end if;

  if live.id is not null then
    update public.subscriptions
    set status = 'expired'
    where id = live.id and status in ('active', 'trialing');
  end if;

  -- SUS-05: start from the provided activation date when not currently valid.
  new_start := coalesce(p_starts_at, now());
  new_end := new_start + make_interval(days => p_plan.duration_days);

  insert into public.subscriptions (
    user_id, plan_id, status, source, starts_at, ends_at,
    plan_name_snapshot, duration_days_snapshot, price_amount_snapshot, currency_snapshot
  ) values (
    p_user_id,
    p_plan.id,
    case when p_source = 'trial' then 'trialing' else 'active' end,
    p_source,
    new_start,
    new_end,
    p_plan.name,
    p_plan.duration_days,
    p_plan.price_amount,
    p_plan.currency
  )
  returning id into new_id;

  insert into public.subscription_events (subscription_id, event_type, payload, created_by)
  values (
    new_id,
    'activated',
    jsonb_build_object('starts_at', new_start, 'ends_at', new_end, 'source', p_source),
    auth.uid()
  );

  perform public.write_audit('activate_subscription', 'subscription', new_id, null, jsonb_build_object('ends_at', new_end, 'source', p_source), p_reason);
  return new_id;
end;
$$;

create or replace function public.admin_approve_payment_request(
  p_request_id uuid,
  p_review_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.payment_requests;
  plan_row public.plans;
  sub_id uuid;
  pay_id uuid;
begin
  if not public.is_super_admin() then
    raise exception 'No autorizado';
  end if;

  select * into req from public.payment_requests where id = p_request_id for update;
  if req.id is null then
    raise exception 'Solicitud no encontrada';
  end if;
  if req.status <> 'submitted' then
    raise exception 'La solicitud ya fue revisada';
  end if;

  select * into plan_row from public.plans where id = req.plan_id;
  if plan_row.id is null then
    raise exception 'El plan ya no existe';
  end if;

  sub_id := public.activate_or_renew_subscription(
    req.user_id,
    plan_row,
    'payment',
    now(),
    coalesce(p_review_notes, 'aprobación de pago manual')
  );

  insert into public.payments (
    user_id, request_id, subscription_id, amount, currency, paid_at, recorded_by
  ) values (
    req.user_id,
    req.id,
    sub_id,
    req.declared_amount,
    req.currency,
    coalesce(req.paid_on::timestamptz, now()),
    auth.uid()
  )
  returning id into pay_id;

  update public.payment_requests
  set
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    review_notes = p_review_notes
  where id = req.id;

  insert into public.in_app_notifications (user_id, kind, title, body, payload)
  values (
    req.user_id,
    'subscription_activated',
    'Tu acceso fue activado',
    'Un administrador confirmó tu pago y habilitó tu plan.',
    jsonb_build_object('request_id', req.id, 'subscription_id', sub_id)
  );

  perform public.write_audit(
    'approve_payment_request',
    'payment_request',
    req.id,
    jsonb_build_object('status', 'submitted'),
    jsonb_build_object('status', 'approved', 'payment_id', pay_id, 'subscription_id', sub_id),
    p_review_notes
  );

  return sub_id;
end;
$$;

create or replace function public.admin_reject_payment_request(
  p_request_id uuid,
  p_review_notes text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.payment_requests;
begin
  if not public.is_super_admin() then
    raise exception 'No autorizado';
  end if;

  select * into req from public.payment_requests where id = p_request_id for update;
  if req.id is null then
    raise exception 'Solicitud no encontrada';
  end if;
  if req.status <> 'submitted' then
    raise exception 'La solicitud ya fue revisada';
  end if;

  update public.payment_requests
  set status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid(), review_notes = p_review_notes
  where id = req.id;

  insert into public.in_app_notifications (user_id, kind, title, body, payload)
  values (
    req.user_id,
    'request_rejected',
    'Tu solicitud de acceso fue rechazada',
    coalesce(p_review_notes, 'Un administrador rechazó la solicitud. Puedes enviar una nueva.'),
    jsonb_build_object('request_id', req.id)
  );

  perform public.write_audit(
    'reject_payment_request',
    'payment_request',
    req.id,
    jsonb_build_object('status', 'submitted'),
    jsonb_build_object('status', 'rejected'),
    p_review_notes
  );
end;
$$;

create or replace function public.admin_grant_trial(
  p_user_id uuid,
  p_plan_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  plan_row public.plans;
  live public.subscriptions;
  new_id uuid;
  duration integer;
begin
  if not public.is_super_admin() then
    raise exception 'No autorizado';
  end if;
  if p_ends_at <= p_starts_at then
    raise exception 'La prueba debe tener un plazo definido';
  end if;

  select * into plan_row from public.plans where id = p_plan_id;
  if plan_row.id is null then
    raise exception 'Plan no encontrado';
  end if;

  select * into live
  from public.subscriptions
  where user_id = p_user_id and status in ('active', 'trialing')
  for update;

  if live.status = 'active' and live.ends_at is not null and live.ends_at > now() then
    raise exception 'No se puede conceder una prueba sobre una suscripción pagada vigente';
  end if;

  duration := greatest(1, ceil(extract(epoch from (p_ends_at - p_starts_at)) / 86400.0)::int);

  if live.id is not null then
    update public.subscriptions set status = 'expired' where id = live.id;
  end if;

  insert into public.subscriptions (
    user_id, plan_id, status, source, starts_at, ends_at,
    plan_name_snapshot, duration_days_snapshot, price_amount_snapshot, currency_snapshot
  ) values (
    p_user_id, plan_row.id, 'trialing', 'trial', p_starts_at, p_ends_at,
    plan_row.name, duration, 0, plan_row.currency
  )
  returning id into new_id;

  insert into public.subscription_events (subscription_id, event_type, payload, created_by)
  values (new_id, 'trial_granted', jsonb_build_object('starts_at', p_starts_at, 'ends_at', p_ends_at, 'reason', p_reason), auth.uid());

  insert into public.in_app_notifications (user_id, kind, title, body)
  values (p_user_id, 'trial_granted', 'Prueba autorizada', 'Un administrador habilitó una prueba de acceso con fecha de finalización definida.');

  perform public.write_audit('grant_trial', 'subscription', new_id, null, jsonb_build_object('ends_at', p_ends_at), p_reason);
  return new_id;
end;
$$;

create or replace function public.admin_set_subscription_status(
  p_subscription_id uuid,
  p_status public.subscription_status,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  sub public.subscriptions;
begin
  if not public.is_super_admin() then
    raise exception 'No autorizado';
  end if;

  select * into sub from public.subscriptions where id = p_subscription_id for update;
  if sub.id is null then
    raise exception 'Suscripción no encontrada';
  end if;

  update public.subscriptions set status = p_status where id = p_subscription_id;
  insert into public.subscription_events (subscription_id, event_type, payload, created_by)
  values (p_subscription_id, 'status_changed', jsonb_build_object('from', sub.status, 'to', p_status, 'reason', p_reason), auth.uid());
  perform public.write_audit('set_subscription_status', 'subscription', p_subscription_id, jsonb_build_object('status', sub.status), jsonb_build_object('status', p_status), p_reason);
end;
$$;

create or replace function public.admin_extend_subscription(
  p_subscription_id uuid,
  p_days integer,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  sub public.subscriptions;
  new_end timestamptz;
begin
  if not public.is_super_admin() then
    raise exception 'No autorizado';
  end if;
  if p_days <= 0 then
    raise exception 'Los días de extensión deben ser positivos';
  end if;

  select * into sub from public.subscriptions where id = p_subscription_id for update;
  if sub.id is null then
    raise exception 'Suscripción no encontrada';
  end if;

  new_end := coalesce(sub.ends_at, now()) + make_interval(days => p_days);
  update public.subscriptions
  set ends_at = new_end, status = case when status in ('expired', 'cancelled') then 'active' else status end
  where id = p_subscription_id;

  insert into public.subscription_events (subscription_id, event_type, payload, created_by)
  values (p_subscription_id, 'extended', jsonb_build_object('days', p_days, 'ends_at', new_end), auth.uid());
  perform public.write_audit('extend_subscription', 'subscription', p_subscription_id, jsonb_build_object('ends_at', sub.ends_at), jsonb_build_object('ends_at', new_end), p_reason);
end;
$$;

grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.admin_set_account_status(uuid, public.account_status, text) to authenticated;
grant execute on function public.admin_approve_payment_request(uuid, text) to authenticated;
grant execute on function public.admin_reject_payment_request(uuid, text) to authenticated;
grant execute on function public.admin_grant_trial(uuid, uuid, timestamptz, timestamptz, text) to authenticated;
grant execute on function public.admin_set_subscription_status(uuid, public.subscription_status, text) to authenticated;
grant execute on function public.admin_extend_subscription(uuid, integer, text) to authenticated;
