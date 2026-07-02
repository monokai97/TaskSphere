# Tasks: Registrar colecciones en payload.config.ts

## Dependencias
- Actividad 1 completada (archivos `Tasks.ts`, `Lists.ts`, `TaskLogs.ts`, `GuestSessions.ts`, `FocusSessions.ts` existen en `src/collections/`)

---

## Hito 2.1: Importar colecciones

- [ ] Abrir `src/payload.config.ts`
- [ ] Añadir import: `import { GuestSessions } from './collections/GuestSessions'`
- [ ] Añadir import: `import { Lists } from './collections/Lists'`
- [ ] Añadir import: `import { Tasks } from './collections/Tasks'`
- [ ] Añadir import: `import { TaskLogs } from './collections/TaskLogs'`
- [ ] Añadir import: `import { FocusSessions } from './collections/FocusSessions'`

## Hito 2.2: Registrar en buildConfig

- [ ] Modificar array `collections` de: `[Users, Media]` a: `[Users, Media, GuestSessions, Lists, Tasks, TaskLogs, FocusSessions]`

## Hito 2.3: Verificar orden de registro

- [ ] Verificar que `GuestSessions` está antes que `Tasks`
- [ ] Verificar que `Lists` está antes que `Tasks` (relación `list → lists`)
- [ ] Verificar que `Tasks` está antes que `TaskLogs` (relación `task → tasks`)
- [ ] Verificar que `FocusSessions` está al final (sin dependencias)

## Verificación

- [ ] `npx tsc --noEmit` pasa sin errores
- [ ] `pnpm dev` inicia sin errores
- [ ] Log de PayloadCMS muestra: `Registered collections: users, media, guest-sessions, lists, tasks, task-logs, focus-sessions`
- [ ] Navegar a `/admin` y confirmar que las 7 colecciones aparecen en la barra lateral
- [ ] Hacer clic en cada colección y confirmar que la vista lista se renderiza sin errores
