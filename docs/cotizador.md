# Cotizador de transporte

El valor no sale de una tabla por ciudad. `calculateQuote` en `src/lib/transport/engine.ts` usa la configuración vigente.

## Fórmula

Costo de desplazamiento = distancia vial × (1 + retorno vacío) × COP/km del vehículo.

Si el vehículo tiene `includesFuel: false`, se suma `fuel.copPerKm` × la misma distancia. Si ya incluye combustible, esa línea queda en cero.

Costo de tiempo = minutos de ruta × COP/minuto + (minutos de cargue + minutos de descargue) × factor de la carga × COP/minuto.

Peajes = valor que entregue Google Routes, o `tollFallbackPerKmCop` × km si ese parámetro es mayor que cero. Si `requireRealTolls` está activo y no hay peaje, el total no se cierra.

Costo operativo = máximo entre la suma anterior, el mínimo de la operación y el mínimo del vehículo.

Margen `on_cost`: costo × tasa. Margen `on_sale`: costo / (1 − tasa) − costo.

Transporte estimado = costo operativo + margen.

Ayudantes = tarifa de la regla que cubre el piso más alto entre origen y destino (un ascensor cuenta como piso 1 en ese extremo) × cantidad. No se suma dos veces. Sin regla, el personal queda pendiente y no hay total definitivo.

## Parámetros

Fuente, en este orden: `TRANSPORT_PRICING_JSON`, la última fila de `transport_pricing_versions` (migración `0008`, solo servicio), `data/transport-pricing.json`.

Actualización sin desplegar código: `POST /api/transporte/parametros` con la cabecera `x-transport-admin-key` igual a `TRANSPORT_PRICING_ADMIN_KEY`. En un hosting de solo lectura hace falta la tabla o la variable JSON.

## Rutas

Google Routes API y Places Autocomplete, con `GOOGLE_MAPS_API_KEY`. Hay caché en memoria. Si el proveedor falla, no se inventa la distancia.

Origen aceptado solo si la dirección resuelta es Popayán o Cali.

## Correo

`WEB3FORMS_ACCESS_KEY` en el servidor. El éxito del formulario depende de `success: true` de Web3Forms.
