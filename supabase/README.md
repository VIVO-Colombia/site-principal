# Supabase

## 1. Crear el proyecto

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Copia `Project URL` y `anon public` a `.env.local`.
3. Copia `service_role` solo al servidor o al SQL Editor. Nunca la expongas al navegador.

## 2. Aplicar migraciones

Ejecuta en el SQL Editor, **en este orden**:

1. `migrations/0001_identity_and_billing.sql`
2. `migrations/0002_admin_functions.sql`
3. `migrations/0003_finance.sql`
4. `migrations/0004_rls.sql`
5. `migrations/0005_stabilization.sql`
6. `migrations/0006_free_premium_home.sql`
7. `migrations/0007_pay_schedule_and_account_columns.sql`

`0005`, `0006` y `0007` son aditivas: no borran tablas ni reescriben ciclos ya creados. En una base que ya está en producción, ejecuta las que falten y deja que `0007` termine: recarga la caché de la API. Sin esa caché, crear una cuenta falla con `Could not find the 'color' column of 'financial_accounts'`.

`schema.sql` queda como referencia de la fase 1. No lo ejecutes encima de las migraciones versionadas.

Funciones internas (`write_audit`, `activate_or_renew_subscription`, triggers) no tienen `EXECUTE` para `anon` ni `authenticated`. El RPC público se limita a `is_super_admin`, `can_write_finance`, `seed_default_categories` y las funciones `admin_*` que ya comprueban Super Admin.

Desde `0006`, una cuenta habilitada y sin suscripción suspendida puede escribir sus finanzas. El plan Free no exige suscripción de pago.

## 3. Autenticación

En Authentication > Providers, deja habilitado el correo.

En URL configuration:

- Site URL: el dominio de Vercel o `http://localhost:3000`
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://TU-DOMINIO/auth/callback`

Activa la confirmación de correo. Plantillas: confirmación y recuperación.

## 4. Primer Super Admin

El registro público **siempre** crea `role = user`. No existe un endpoint ni un formulario que eleve privilegios.

1. Crea la cuenta con el flujo normal de `/registro`.
2. Confirma el correo.
3. Copia el UUID de `auth.users.id` (Authentication > Users).
4. En el SQL Editor, como dueño de la base (no como usuario autenticado de la app), ejecuta:

```sql
select public.provision_first_super_admin('00000000-0000-0000-0000-000000000000'::uuid, 'aprovisionamiento inicial');
```

Sustituye el UUID. La función:

- no acepta correos ni contraseñas
- no está otorgada a `anon` ni `authenticated`
- escribe auditoría y el historial en `user_roles`

Si ya existe un Super Admin, solo otro Super Admin (sesión) o el dueño de la base pueden usarla.

## 5. Storage de comprobantes

La migración 0004 crea el bucket privado `receipts` cuando el esquema `storage` está disponible. Comprueba en Storage que **no** es público.

## 6. Turnstile

Configura las claves en `.env.local`. En desarrollo, si faltan, la verificación se omite. En producción es obligatoria.
