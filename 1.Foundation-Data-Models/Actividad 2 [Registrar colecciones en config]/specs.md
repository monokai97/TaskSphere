# Specs: Registrar colecciones en payload.config.ts

## Funcionales

1. El sistema debe reconocer las 5 nuevas colecciones al iniciar: Tasks, Lists, TaskLogs, GuestSessions, FocusSessions.
2. El admin panel de PayloadCMS debe mostrar las 5 colecciones como secciones navegables.
3. La API REST interna de PayloadCMS debe responder a requests sobre las nuevas colecciones.
4. El generador de tipos debe incluir las interfaces de las 5 colecciones en `payload-types.ts`.

## Técnicos

| # | Requisito | Especificación |
|---|---|---|
| R1 | Importar Tasks | `import { Tasks } from './collections/Tasks'` |
| R2 | Importar Lists | `import { Lists } from './collections/Lists'` |
| R3 | Importar TaskLogs | `import { TaskLogs } from './collections/TaskLogs'` |
| R4 | Importar GuestSessions | `import { GuestSessions } from './collections/GuestSessions'` |
| R5 | Importar FocusSessions | `import { FocusSessions } from './collections/FocusSessions'` |
| R6 | Array collections | `[Users, Media, GuestSessions, Lists, Tasks, TaskLogs, FocusSessions]` |
| R7 | GuestSessions antes que Tasks | El hook afterChange de Tasks crea documentos en task-logs referenciando guestId — PayloadCMS debe conocer GuestSessions primero |
| R8 | Lists antes que Tasks | Tasks tiene `relationship` a Lists — PayloadCMS debe conocer Lists antes de procesar Tasks |
| R9 | TaskLogs después que Tasks | TaskLogs tiene `relationship` a Tasks — debe ir después en el array |
| R10 | Users y Media preservados | Deben mantenerse en sus posiciones originales al inicio del array |
| R11 | Sin side effects | No se modifican: secret, editor, db adapter, sharp, plugins, admin config |

## Contratos

No aplica — esta actividad no expone nuevos endpoints ni cambia contratos de datos existentes. Es puramente configuración del lado servidor.
