# Checklist de políticas RLS

Ejecutar en un proyecto Supabase con las migraciones aplicadas y dos usuarios independientes.

## Identidad

- [ ] El registro público crea `profiles.role = user`.
- [ ] Un usuario no puede hacer `update profiles set role = 'super_admin'`.
- [ ] `provision_first_super_admin` no está otorgada a `anon` ni `authenticated`.
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
- [ ] Los ciclos superpuestos del mismo usuario fallan por `financial_cycles_no_overlap`.

## Almacenamiento

- [ ] El bucket `receipts` es privado.
- [ ] Un usuario solo sube objetos bajo `/{user_id}/`.
- [ ] El Super Admin puede leer comprobantes; no hay URL pública.
