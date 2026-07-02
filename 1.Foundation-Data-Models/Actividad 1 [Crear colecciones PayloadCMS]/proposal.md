# Proposal: Crear colecciones PayloadCMS

## Problema

El proyecto Task Sphere necesita persistir datos de tareas, listas, auditoría, sesiones guest y focus sessions. Actualmente `src/collections/` solo contiene `Users.ts` y `Media.ts` (del template PayloadCMS). No existe ningún schema de datos de dominio.

## Solución

Crear 5 colecciones PayloadCMS en `src/collections/` que cubren todo el modelo de datos del MVP:

| Colección | Slug | Propósito |
|---|---|---|
| `Tasks` | `tasks` | Tareas del guest: título, estado, fecha, notas, sub-pasos, orden |
| `Lists` | `lists` | Listas organizadoras: nombre, icono, color, orden |
| `TaskLogs` | `task-logs` | Auditoría write-only: registro de cada CRUD en tasks |
| `GuestSessions` | `guest-sessions` | Preferencias de sesión: tema, locale, notificaciones, integraciones |
| `FocusSessions` | `focus-sessions` | Registro de sesiones Pomodoro: duración, completado, fecha |

## Estrategia

1. **Aislamiento multi-tenant por guestId**: Cada colección incluye un campo `guestId` (text, indexed) y un access control que filtra por `req.headers.get('x-guest-id')`. Esto garantiza que ningún guest vea datos de otro sin necesidad de auth tradicional.

2. **Hooks de auditoría en Tasks**: Los hooks `afterChange` y `afterDelete` en Tasks escriben automáticamente en TaskLogs. Esto es invisible para el frontend pero proporciona trazabilidad completa.

3. **TaskLogs write-only**: Access control configurado para solo permitir creación (por hooks internos), bloqueando lectura/actualización/eliminación desde API pública.

4. **Expiración automática de GuestSessions**: Hook `beforeChange` extiende `expiresAt` a +7 días cada vez que se actualiza `lastActiveAt`.

5. **Relaciones referenciales**: Tasks tiene relationship a Lists; TaskLogs tiene relationship a Tasks. El orden de registro en `payload.config.ts` debe reflejar estas dependencias.

## Impacto

- 5 archivos nuevos en `src/collections/`
- Sin cambios en colecciones existentes (`Users`, `Media`)
- Sin migraciones de base de datos (SQLite crea tablas automáticamente desde los schemas)
- Las colecciones son accesibles inmediatamente desde el admin panel de PayloadCMS en `/admin`
