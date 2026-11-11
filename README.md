# Planeador

Plataforma web de finanzas personales. Esta primera entrega concentra la **landing comercial**, el **acceso/registro** y la **estructura de rutas** del portal financiero y Super Admin.

El nombre del producto se centraliza en `src/config/brand.ts` (`NEXT_PUBLIC_PRODUCT_NAME` puede sobreescribirlo).

## Requisitos

- Node.js 22 o superior
- npm

## Desarrollo local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Sin claves de Supabase la landing, los planes y los formularios de acceso se pueden revisar con normalidad. `/app` y `/admin` redirigen a `/acceso` porque están protegidos en el servidor.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm start
```

## Variables de entorno

Ver `.env.example`.

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | URL canónica del sitio |
| `NEXT_PUBLIC_PRODUCT_NAME` | Nombre de marca (opcional) |
| `NEXT_PUBLIC_SUPABASE_URL` | Proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor, nunca al navegador |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Widget de Cloudflare Turnstile |
| `TURNSTILE_SECRET_KEY` | Validación del CAPTCHA en el servidor |

## Despliegue en Vercel

1. Importa el repositorio.
2. Framework: Next.js.
3. Carga las mismas variables en Project Settings > Environment Variables.
4. Configura las URLs de redirección de Supabase con el dominio de Vercel.

## Rutas

### Público

- `/` landing
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

`/app` y subrutas. Requieren sesión y una suscripción activa, en prueba o vencida (esta última en solo lectura cuando el módulo exista).

### Super Admin

`/admin` y subrutas. Requieren `profiles.role = super_admin`.

## Fase actual

Implementado:

- Identidad visual y landing comercial
- Página de planes sin importes inventados
- Formularios de acceso, registro y recuperación
- Protección de rutas privadas
- Layouts independientes para marketing, app y admin
- Preparación de Supabase, Turnstile, PWA (manifiesto) y esquema comercial

Pendiente:

- Credenciales reales de Supabase y Turnstile
- Flujo completo de solicitudes, comprobantes y auditoría
- Núcleo financiero a partir del Excel original
- Service worker / instalación PWA completa y recordatorios automáticos
