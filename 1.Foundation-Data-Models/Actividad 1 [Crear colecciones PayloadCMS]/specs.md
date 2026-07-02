# Specs: Crear colecciones PayloadCMS

## Funcionales

1. **Tasks**: El sistema debe persistir tareas con título (3-500 chars), descripción opcional (hasta 5000), estado pending/completed, flag important, fecha de vencimiento, lista padre, guestId, orden, fecha de completado, y array de sub-pasos.

2. **Lists**: El sistema debe persistir listas con nombre (1-100 chars), icono, color hex, guestId, flag isDefault, y orden.

3. **TaskLogs**: El sistema debe registrar automáticamente cada operación CRUD sobre Tasks (CREATE, UPDATE, DELETE) con el estado anterior y nuevo, timestamp, y referencia a la tarea.

4. **GuestSessions**: El sistema debe persistir sesiones guest con guestId único, fechas de creación/actividad/expiración, preferencias de locale (es/en), theme (light/dark/system), y settings de notificaciones e integraciones.

5. **FocusSessions**: El sistema debe persistir sesiones de enfoque con duración (1-120 min), estado completed, fecha de completado, y fecha del día.

## Técnicos

| # | Requisito | Especificación |
|---|---|---|
| R1 | Index en guestId | Todas las colecciones con campo guestId deben tener `index: true` |
| R2 | guestId único en GuestSessions | El campo guestId en GuestSessions debe tener `unique: true` además de index |
| R3 | Access Control Tasks/Lists | read/update/delete filtran por `guestId === x-guest-id header`; create verifica header presente |
| R4 | Access Control TaskLogs | read/update/delete: false; create: true (solo hooks internos) |
| R5 | Access Control GuestSessions | read/update filtran por guestId; create: true; delete: false |
| R6 | Access Control FocusSessions | read/create filtran por guestId; update/delete: false |
| R7 | Hook afterChange Tasks | Crea TaskLog con operation=CREATE/UPDATE, previousState y newState como JSON stringify |
| R8 | Hook afterDelete Tasks | Crea TaskLog con operation=DELETE, previousState como JSON stringify |
| R9 | Hook beforeChange GuestSessions | Si lastActiveAt cambia, recalcula expiresAt = lastActiveAt + 7 días |
| R10 | Relationship Tasks→Lists | Campo `list` de tipo `relationship` con `relationTo: 'lists'`, `required: true` |
| R11 | Relationship TaskLogs→Tasks | Campo `task` de tipo `relationship` con `relationTo: 'tasks'`, `required: true` |
| R12 | Timestamp default | Campos timestamp/createdAt con `defaultValue: () => new Date().toISOString()` |

## Contratos de Datos (JSON esperado por API Routes)

```typescript
// Task (desde API GET /api/tasks)
{
  id: string,
  title: string,
  description?: string,
  status: 'pending' | 'completed',
  important: boolean,
  dueDate?: string,
  list: string,          // list ID
  guestId: string,
  sortOrder?: number,
  completedAt?: string,
  subtasks?: { id: string, title: string, completed: boolean }[],
  createdAt: string,
  updatedAt: string
}

// List
{
  id: string,
  name: string,
  icon?: string,
  color?: string,
  guestId: string,
  isDefault?: boolean,
  sortOrder?: number,
  createdAt: string,
  updatedAt: string
}

// GuestSession (desde API GET /api/session)
{
  id: string,
  guestId: string,
  createdAt: string,
  lastActiveAt: string,
  expiresAt: string,
  locale?: 'es' | 'en',
  theme?: 'light' | 'dark' | 'system',
  notificationsEnabled?: boolean,
  integrations?: Record<string, unknown>,
  focusSettings?: Record<string, unknown>
}

// FocusSession (desde API POST /api/focus)
{
  id: string,
  guestId: string,
  duration: number,
  completed?: boolean,
  completedAt?: string,
  date: string
}
```
