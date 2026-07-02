# Tasks: Implementar lazy guest initialization

## Dependencias
- Actividad 1 completada (`src/lib/iron-session.ts`)
- Actividad 2 completada (`src/middleware.ts`)
- Fase 1 Actividades 1-2 completadas (colecciones registradas en payload.config.ts)
- `src/lib/` directory existe

---

## Hito 3.1: Crear payload-client.ts

- [ ] Crear directorio `src/lib/` si no existe
- [ ] Crear `src/lib/payload-client.ts`
- [ ] Importar `{ getPayload } from 'payload'`
- [ ] Importar `config from '@payload-config'`

## Hito 3.2: Implementar ensureGuestInitialized

- [ ] Definir array `DEFAULT_LISTS` con 4 objetos: name, icon, color, isDefault, sortOrder
- [ ] Exportar función `async function ensureGuestInitialized(guestId: string): Promise<void>`
- [ ] Obtener instancia Payload: `const payloadConfig = await config; const payload = await getPayload({ config: payloadConfig })`
- [ ] Buscar GuestSession existente: `payload.find({ collection: 'guest-sessions', where: { guestId: { equals: guestId } }, limit: 1 })`
- [ ] Si `totalDocs > 0`, hacer return early

## Hito 3.3: Idempotencia

- [ ] Verificar que el early return (hito 3.2) funciona correctamente
- [ ] Si se llama 2 veces seguidas con el mismo guestId, la segunda llamada retorna inmediatamente sin crear duplicados

## Hito 3.4: Manejo de errores

- [ ] Envolver TODO el bloque en `try/catch`
- [ ] En el catch: `console.warn('[ensureGuestInitialized]', guestId, error)` — NO relanzar el error
- [ ] Si falla la creación de la sesión, no intentar crear las listas
- [ ] La función siempre retorna `void` (nunca lanza)

## Verificación

- [ ] `npx tsc --noEmit` pasa sin errores
- [ ] El import `@payload-config` resuelve correctamente (definido en tsconfig paths)
- [ ] `ensureGuestInitialized` es una función async que retorna `Promise<void>`
- [ ] `DEFAULT_LISTS` contiene exactamente 4 listas
- [ ] My Day tiene `isDefault: true`, las otras `false`
- [ ] Cada lista tiene `name`, `icon`, `color`, `isDefault`, `sortOrder`
- [ ] El try/catch no silencia errores de sintaxis (solo errores de PayloadCMS/DB)
