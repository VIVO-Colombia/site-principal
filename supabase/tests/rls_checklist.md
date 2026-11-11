# Checklist de políticas RLS

Ejecutar en un proyecto Supabase con las migraciones aplicadas (incluye `0005_stabilization.sql`) y dos usuarios independientes. El script `supabase/tests/run-integration.sh` cubre el mismo recorrido contra Postgres local.

## Identidad

- [ ] El registro público crea `profiles.role = user`.
- [ ] Un usuario no puede hacer `update profiles set role = 'super_admin'`.
- [ ] `provision_first_super_admin` no está otorgada a `anon` ni `authenticated`.
- [ ] `write_audit` y `activate_or_renew_subscription` no están otorgadas a `anon` ni `authenticated`.
- [ ] Un Super Admin puede leer perfiles ajenos; un usuario solo el propio.

## Comercial

- [ ] Un usuario ve solo sus `subscriptions`, `payment_requests` y `payments`.
- [ ] El Super Admin ve el catálogo comercial completo.
- [ ] `audit_logs` es de solo lectura para Super Admin y no tiene política de update/delete.
- [ ] Aprobar una solicitud dos veces falla (`La solicitud ya fue revisada`).

## Finanzas

- [ ] Un usuario no puede `select` ciclos, cuentas, categorías, presupuestos, movimientos ni pagos de otro.
- [ ] El Super Admin tampoco lee `financial_*` ajenos por las políticas ordinarias.
- [ ] Insertar un movimiento con `account_id` de otro usuario falla por trigger y por RLS.
- [ ] Insertar un compromiso con `category_id` o `preferred_account_id` de otro usuario falla.
- [ ] Los ciclos superpuestos del mismo usuario fallan por `financial_cycles_no_overlap`.
- [ ] Una cuenta suspendida no puede insertar ni actualizar registros financieros.
- [ ] Una cuenta sin suscripción vigente no puede insertar ni actualizar registros financieros.
- [ ] Una suscripción vencida puede `select` e exportar, pero no escribir.
- [ ] Una suscripción `active` con `ends_at` en el pasado se trata como vencida para escritura.

## Almacenamiento

- [ ] El bucket `receipts` es privado.
- [ ] Un usuario solo sube objetos bajo `/{user_id}/`.
- [ ] El Super Admin puede leer comprobantes; no hay URL pública.
