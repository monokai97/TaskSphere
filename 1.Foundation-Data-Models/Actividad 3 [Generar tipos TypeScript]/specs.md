# Specs: Generar tipos TypeScript

## Funcionales

1. El sistema de tipos debe exportar las interfaces `Task`, `List`, `TaskLog`, `GuestSession`, `FocusSession`.
2. Cada interfaz debe incluir todos los campos definidos en su schema de colección respectivo.
3. Los tipos deben reflejar correctamente campos opcionales, required, nullables, y relaciones.
4. El archivo `payload-types.ts` debe ser regenerable en cualquier momento vía `pnpm generate:types`.

## Técnicos

| # | Requisito | Especificación |
|---|---|---|
| R1 | Interfaz Task | title (string, required), description (string \| null), status ('pending' \| 'completed'), important (boolean \| null), dueDate (string \| null), list (string \| List), guestId (string), sortOrder (number \| null), completedAt (string \| null), subtasks (array \| null), createdAt (string), updatedAt (string) |
| R2 | Interfaz List | name (string), icon (string \| null), color (string \| null), guestId (string), isDefault (boolean \| null), sortOrder (number \| null), createdAt (string), updatedAt (string) |
| R3 | Interfaz TaskLog | task (string \| Task), guestId (string), operation ('CREATE' \| 'UPDATE' \| 'DELETE'), previousState (Record<string, unknown> \| null), newState (Record<string, unknown> \| null), timestamp (string) |
| R4 | Interfaz GuestSession | guestId (string), createdAt (string), lastActiveAt (string), expiresAt (string), locale ('es' \| 'en' \| null), theme ('light' \| 'dark' \| 'system' \| null), notificationsEnabled (boolean \| null), integrations (Record<string, unknown> \| null), focusSettings (Record<string, unknown> \| null) |
| R5 | Interfaz FocusSession | guestId (string), duration (number), completed (boolean \| null), completedAt (string \| null), date (string) |
| R6 | Tipo Config | Debe exportar un tipo `Config` que liste todas las colecciones en `collections` con sus slugs |
| R7 | Comando generador | `pnpm generate:types` debe ejecutarse sin errores |

## Contratos

El archivo generado es la fuente de verdad de tipos. Ejemplo de importación esperada:

```typescript
import type { Task, List, TaskLog, GuestSession, FocusSession } from '@/payload-types'
```
