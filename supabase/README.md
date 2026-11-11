# Supabase

## 1. Crear el proyecto

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Copia `Project URL` y `anon public` a `.env.local`.
3. Copia `service_role` solo al servidor. Nunca la expongas al navegador.

## 2. Aplicar el esquema

Ejecuta `schema.sql` en el SQL Editor. Eso crea:

- `profiles` (rol por defecto `user`)
- `plans`, `subscriptions`, `payment_requests`, `payments`
- `payment_methods`, `subscription_events`, `audit_logs`
- RLS y un trigger que impide autoasignarse `super_admin`

## 3. Autenticación

En Authentication > Providers, deja habilitado el correo.

En URL configuration:

- Site URL: el dominio de Vercel o `http://localhost:3000`
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://TU-DOMINIO/auth/callback`

Activa la confirmación de correo.

## 4. Asignar Super Admin

El registro público siempre crea `role = user`. Para promover una cuenta ya existente:

```sql
update public.profiles
set role = 'super_admin'
where id = (
  select id from auth.users where email = 'correo-del-admin@dominio'
);
```

Hazlo solo desde el SQL Editor o un procedimiento interno. No existe un control en la interfaz de registro para elegir este rol.

## 5. Storage de comprobantes

Crea un bucket privado `receipts` cuando se implemente la carga de comprobantes. No lo dejes público.
