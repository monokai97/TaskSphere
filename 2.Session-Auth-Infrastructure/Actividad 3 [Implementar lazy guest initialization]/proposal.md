# Proposal: Implementar lazy guest initialization

## Problema

Cuando un guest visita por primera vez, la cookie Iron-Session se crea en el middleware, pero PayloadCMS no tiene ningún registro de él. No existe `GuestSession` ni las 4 listas default (My Day, Important, Planned, Tasks). Inicializar en el middleware bloquearía el request con una escritura en DB — violando el principio de "middleware no bloqueante" (trade-off #3 en design.md §0).

## Solución

`ensureGuestInitialized()`: función lazy que se ejecuta en el primer request de datos (no en el middleware). Verifica si el `guestId` ya existe en `guest-sessions`; si no, crea la sesión y las 4 listas default en una sola operación.

## Estrategia

1. **Helper `getPayloadClient()`** en `src/lib/payload-client.ts`: centraliza la inicialización de PayloadCMS, importando config async y retornando la instancia de Payload. Todas las API Routes lo reutilizan.
2. **`ensureGuestInitialized(guestId)`**: primero busca `guest-sessions` por `guestId`. Si existe, retorna early (idempotente). Si no: crea `GuestSession` con `expiresAt = createdAt + 7 días`, luego crea 4 listas default en batch.
3. **Graceful degradation**: si PayloadCMS lanza error (DB bloqueada), la función falla silenciosamente. El frontend muestra estado vacío. El próximo request reintentará.

## Impacto

- 1 archivo nuevo: `src/lib/payload-client.ts`
- Crea datos en 2 colecciones: `guest-sessions` (1 documento) y `lists` (4 documentos)
- Sin cambios en middleware o API Routes existentes
- Las 4 listas default tienen nombres, iconos y `isDefault: true` en "My Day"
