# Tasks: Crear colecciones PayloadCMS

## Dependencias
- `src/collections/` debe existir (ya existe con `Users.ts` y `Media.ts`)

---

## Hito 1.1: Schema Tasks

- [ ] Crear `src/collections/Tasks.ts`
- [ ] Definir slug: `'tasks'`
- [ ] Configurar `admin.useAsTitle: 'title'`, `admin.defaultColumns: ['title', 'status', 'list', 'dueDate']`
- [ ] Agregar campo `title`: `{ type: 'text', required: true, maxLength: 500 }`
- [ ] Agregar campo `description`: `{ type: 'textarea', maxLength: 5000 }`
- [ ] Agregar campo `status`: `{ type: 'select', options: [{ label: 'Pending', value: 'pending' }, { label: 'Completed', value: 'completed' }], defaultValue: 'pending', required: true }`
- [ ] Agregar campo `important`: `{ type: 'checkbox', defaultValue: false }`
- [ ] Agregar campo `dueDate`: `{ type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } }`
- [ ] Agregar campo `list`: `{ type: 'relationship', relationTo: 'lists', required: true }`
- [ ] Agregar campo `guestId`: `{ type: 'text', required: true, index: true }`
- [ ] Agregar campo `sortOrder`: `{ type: 'number' }`
- [ ] Agregar campo `completedAt`: `{ type: 'date' }`
- [ ] Agregar campo `subtasks`: `{ type: 'array', fields: [{ name: 'title', type: 'text', required: true }, { name: 'completed', type: 'checkbox', defaultValue: false }] }`

## Hito 1.2: Access Control Tasks

- [ ] Implementar `access.read`: retorna `{ guestId: { equals: req.headers.get('x-guest-id') } }`
- [ ] Implementar `access.create`: retorna `!!req.headers.get('x-guest-id')`
- [ ] Implementar `access.update`: mismo patrón que read (filter por guestId)
- [ ] Implementar `access.delete`: mismo patrón que read (filter por guestId)

## Hito 1.3: Hooks Tasks

- [ ] Implementar `hooks.afterChange`: async function que crea TaskLog con `operation: operation.toUpperCase()`, `previousState: JSON.stringify(previousDoc)`, `newState: JSON.stringify(doc)`
- [ ] Implementar `hooks.afterDelete`: async function que crea TaskLog con `operation: 'DELETE'`, `previousState: JSON.stringify(doc)`, `newState: null`

## Hito 1.4: Schema Lists

- [ ] Crear `src/collections/Lists.ts`
- [ ] Definir slug: `'lists'`
- [ ] Configurar `admin.useAsTitle: 'name'`, `admin.defaultColumns: ['name', 'guestId', 'isDefault']`
- [ ] Agregar campo `name`: `{ type: 'text', required: true, maxLength: 100 }`
- [ ] Agregar campo `icon`: `{ type: 'text', defaultValue: 'list' }`
- [ ] Agregar campo `color`: `{ type: 'text' }`
- [ ] Agregar campo `guestId`: `{ type: 'text', required: true, index: true }`
- [ ] Agregar campo `isDefault`: `{ type: 'checkbox', defaultValue: false }`
- [ ] Agregar campo `sortOrder`: `{ type: 'number' }`

## Hito 1.5: Access Control Lists

- [ ] Implementar `access.read`: filter por `guestId === x-guest-id header`
- [ ] Implementar `access.create`: verificar header presente
- [ ] Implementar `access.update`: filter por guestId
- [ ] Implementar `access.delete`: filter por guestId

## Hito 1.6: Schema TaskLogs

- [ ] Crear `src/collections/TaskLogs.ts`
- [ ] Definir slug: `'task-logs'`
- [ ] Agregar campo `task`: `{ type: 'relationship', relationTo: 'tasks', required: true }`
- [ ] Agregar campo `guestId`: `{ type: 'text', required: true }`
- [ ] Agregar campo `operation`: `{ type: 'select', options: [{ label: 'Create', value: 'CREATE' }, { label: 'Update', value: 'UPDATE' }, { label: 'Delete', value: 'DELETE' }], required: true }`
- [ ] Agregar campo `previousState`: `{ type: 'json' }`
- [ ] Agregar campo `newState`: `{ type: 'json' }`
- [ ] Agregar campo `timestamp`: `{ type: 'date', required: true, defaultValue: () => new Date().toISOString() }`

## Hito 1.7: Access Control TaskLogs

- [ ] `access.read: () => false`
- [ ] `access.create: () => true`
- [ ] `access.update: () => false`
- [ ] `access.delete: () => false`

## Hito 1.8: Schema GuestSessions

- [ ] Crear `src/collections/GuestSessions.ts`
- [ ] Definir slug: `'guest-sessions'`
- [ ] Agregar campo `guestId`: `{ type: 'text', required: true, unique: true, index: true }`
- [ ] Agregar campo `createdAt`: `{ type: 'date', required: true }`
- [ ] Agregar campo `lastActiveAt`: `{ type: 'date', required: true }`
- [ ] Agregar campo `expiresAt`: `{ type: 'date', required: true }`
- [ ] Agregar campo `locale`: `{ type: 'select', options: [{ label: 'Español', value: 'es' }, { label: 'English', value: 'en' }] }`
- [ ] Agregar campo `theme`: `{ type: 'select', options: [{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }, { label: 'System', value: 'system' }], defaultValue: 'system' }`
- [ ] Agregar campo `notificationsEnabled`: `{ type: 'checkbox', defaultValue: true }`
- [ ] Agregar campo `integrations`: `{ type: 'json' }`
- [ ] Agregar campo `focusSettings`: `{ type: 'json' }`

## Hito 1.9: Access Control + Hook GuestSessions

- [ ] Implementar `access.read`: filter por guestId
- [ ] Implementar `access.create`: `() => true`
- [ ] Implementar `access.update`: filter por guestId
- [ ] Implementar `access.delete`: `() => false`
- [ ] Implementar `hooks.beforeChange`: si `data.lastActiveAt` cambia, extender `data.expiresAt = new Date(lastActive.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()`

## Hito 1.10: Schema FocusSessions

- [ ] Crear `src/collections/FocusSessions.ts`
- [ ] Definir slug: `'focus-sessions'`
- [ ] Agregar campo `guestId`: `{ type: 'text', required: true, index: true }`
- [ ] Agregar campo `duration`: `{ type: 'number', required: true, min: 1, max: 120 }`
- [ ] Agregar campo `completed`: `{ type: 'checkbox', defaultValue: false }`
- [ ] Agregar campo `completedAt`: `{ type: 'date' }`
- [ ] Agregar campo `date`: `{ type: 'date', required: true, defaultValue: () => new Date().toISOString().split('T')[0] }`

## Hito 1.11: Access Control FocusSessions

- [ ] Implementar `access.read`: filter por guestId
- [ ] Implementar `access.create`: verificar header presente
- [ ] Implementar `access.update`: `() => false`
- [ ] Implementar `access.delete`: `() => false`

## Verificación

- [ ] `npx tsc --noEmit` pasa sin errores
- [ ] Los 5 archivos importan `CollectionConfig` desde `'payload'` con `import type { CollectionConfig } from 'payload'`
- [ ] Todos los slugs son únicos: `tasks`, `lists`, `task-logs`, `guest-sessions`, `focus-sessions`
- [ ] Ningún campo `guestId` usa `unique: true` excepto GuestSessions
