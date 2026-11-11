# VIVO Colombia

Sitio del grupo empresarial VIVO. Reúne las landings corporativas y la aplicación de planeación financiera **VIVO Planner**. El nombre del planeador se centraliza en `src/config/brand.ts` (`NEXT_PUBLIC_PRODUCT_NAME` puede sobreescribirlo).

## Requisitos

- Node.js 22 o superior
- npm
- Proyecto Supabase (Auth + Postgres + Storage) para el portal privado

## Desarrollo local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Sin claves de Supabase las páginas públicas se pueden revisar. `/app` y `/admin` redirigen a `/acceso`.

Aplica las migraciones de `supabase/migrations` en el SQL Editor (ver `supabase/README.md`) antes de probar registro, Super Admin o finanzas.

## Scripts

```bash
npm run dev
npm run lint
npm run test
npm run test:sql
npm run build
npm start
```

`npm run test:sql` crea una base Postgres local aislada, aplica 0001-0005 y recorre dos usuarios, un Super Admin y cuentas vencida/suspendida/sin plan. No usa datos productivos.

## Variables de entorno

Ver `.env.example`. No hay valores reales en el repositorio.

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | URL canónica (local o Vercel) |
| `NEXT_PUBLIC_PRODUCT_NAME` | Nombre de marca (opcional) |
| `NEXT_PUBLIC_SUPABASE_URL` | Proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor / SQL Editor, nunca al navegador |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Widget de Cloudflare Turnstile |
| `TURNSTILE_SECRET_KEY` | Validación del CAPTCHA en el servidor |

## Super Admin

El registro público solo crea el rol `user`. El primer Super Admin se asigna con el UUID de una cuenta existente mediante `provision_first_super_admin`. Procedimiento exacto: `supabase/README.md`.

## Despliegue en Vercel

1. Importa el repositorio.
2. Framework: Next.js.
3. Carga las variables de `.env.example` en Project Settings.
4. Site URL y Redirect URLs de Supabase: `https://TU-DOMINIO/auth/callback`.
5. Aplica las migraciones SQL en el proyecto de producción.
6. Configura Turnstile con el dominio de Vercel.

## Rutas

### Público

- `/` VIVO | Grupo Empresarial
- `/transporte` VIVO Transporte
- `/software` VIVO Software
- `/planner` VIVO Planner
- `/planes`
- `/acceso`
- `/registro`
- `/recuperar-contrasena`
- `/actualizar-contrasena`
- `/activar`
- `/privacidad`
- `/terminos`
- `/contacto`

### Portal financiero

Requiere sesión y suscripción activa, prueba autorizada o vencida (esta última en solo lectura, con exportación CSV).

- `/app`
- `/app/movimientos`
- `/app/planeacion`
- `/app/cuentas`
- `/app/pagos`
- `/app/mi-suscripcion`
- `/app/configuracion`
- `/app/notificaciones`
- Preparadas: ahorros, deudas, calendario, análisis, calculadoras

### Super Admin

Requiere `profiles.role = super_admin`. No consulta finanzas privadas ajenas.

- `/admin`
- `/admin/usuarios`
- `/admin/suscripciones`
- `/admin/solicitudes`
- `/admin/pagos`
- `/admin/planes`
- `/admin/auditoria`
- `/admin/configuracion`

## Fase 2

Implementado: autenticación real, roles, RLS, Super Admin operativo, solicitudes y pagos manuales, núcleo financiero persistido.

Pendiente: Excel original (no está en el repo), pasarela de pagos, PWA completa, recordatorios push/correo, metas de ahorro y deudas avanzadas.

Detalle: `docs/FASE-2.md`.
