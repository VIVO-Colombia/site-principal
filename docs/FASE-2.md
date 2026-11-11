# Fase 2 — Autenticación, Super Admin y núcleo financiero

## Recorrido de prueba

1. Aplicar las migraciones de `supabase/migrations` en el SQL Editor (en orden).
2. Configurar Auth URLs y Turnstile.
3. Registrar un usuario, confirmar el correo e iniciar sesión.
4. Solicitar un plan en `/activar`.
5. Promover un Super Admin con el procedimiento de `supabase/README.md`.
6. Aprobar la solicitud en `/admin/solicitudes`.
7. Entrar a `/app`, crear ciclo, cuentas, categorías, presupuestos, movimientos y un pago programado.
8. Cerrar sesión, volver a entrar y comprobar que los datos persisten.
9. Repetir con un segundo usuario y verificar que no ve los registros del primero.

## Super Admin

Nunca se asigna desde el registro. Ver `supabase/README.md`.

## Excel original

El archivo `Planeador financiero MENSUAL - GRATU.xlsx` no está en el repositorio. Esta fase construye un núcleo flexible (ciclos no calendarios, cuentas, categorías, presupuestos, movimientos y compromisos) **sin afirmar que replica las fórmulas del Excel**. Hay que incorporar el archivo antes de la migración definitiva de cálculos.

## Variables

Ver `.env.example`. No hay secretos reales en el repositorio.
