# Propuesta: API Routes de Tasks — Thin Proxy a PayloadCMS

## Resumen Ejecutivo

Implementar las API Routes REST para el CRUD de tareas bajo el patrón **Thin API Proxy** definido en `design.md` §1.A. Cada endpoint: (1) extrae `x-guest-id` del header (inyectado por Iron-Session middleware), (2) valida el body con Zod, (3) delega a PayloadCMS REST interno, (4) retorna respuesta tipada. Sin lógica de negocio — solo orquestación y validación en el borde.

## Justificación

### Por qué API Routes custom (no PayloadCMS REST directo)

| Aspecto | PayloadCMS REST directo | API Route custom (elegido) |
|---|---|---|
| **Validación** | No tiene Zod nativo; tocaría hacer hooks complejos | Zod en el borde del servidor, schemas compartidos frontend/backend |
| **guestId injection** | Requiere header manual desde el cliente (inseguro) | `x-guest-id` se inyecta desde middleware Iron-Session; el cliente nunca envía su guestId |
| **Access Control** | Basado en colección (ya implementado como fallback) | Doble capa: session check + Access Control en PayloadCMS |
| **Error handling** | Errores genéricos de PayloadCMS | Error tipado, retry pattern SQLITE_BUSY, respuestas consistentes |

### Mapeo Stitch → API

Los prototipos HTML (`2.Stack My Day`, `3.Task Details`) definen las operaciones de UI que estas API Routes habilitan:

| Elemento HTML/Stitch | Operación UI | API Route |
|---|---|---|
| Lista de tareas en workspace | Ver tareas filtradas por lista | `GET /api/tasks?list={id}&status={status}` |
| Checkbox circular | Toggle completado | `PATCH /api/tasks/{id}` → `{ status }` |
| Input "Add a task" | Crear tarea | `POST /api/tasks` |
| Botón delete (detail footer) | Eliminar tarea | `DELETE /api/tasks/{id}` |
| Estrella (important) | Toggle importante | `PATCH /api/tasks/{id}` → `{ important }` |
| Drag & drop (sortOrder) | Reordenar | `PATCH /api/tasks/reorder` (batch) |

### Contratos de Datos (Zod => PayloadCMS => SQLite)

```
Zod Schema (src/lib/schemas.ts)
  → valida en API Route boundary
  → create/update en PayloadCMS collection 'tasks'
  → Hook afterChange escribe en 'task-logs' (auditoría automática)
  → SQLite persistencia
```

### Mejoras sobre el HTML estático

1. **Validación proactiva:** El HTML permite título vacío; Zod fuerza `min(3)` antes de llegar a PayloadCMS
2. **Aislamiento por guestId:** Múltiples guests conviven en la misma DB sin verse entre sí
3. **Auditoría automática:** Cada mutación queda registrada en TaskLogs por hooks de PayloadCMS
4. **Resiliencia:** Retry pattern con jitter exponencial para SQLITE_BUSY
5. **Type-safety:** Tipos inferidos de Zod (`CreateTaskInput`, `UpdateTaskInput`) compartidos con el frontend

## Colecciones PayloadCMS Involucradas

| Colección | Rol | Operaciones |
|---|---|---|
| `tasks` | CRUD principal | find, create, update, delete |
| `guest-sessions` | Inicialización lazy | find (ensureGuestInitialized) |
| `task-logs` | Auditoría (escritura indirecta vía hooks) | solo hooks afterChange/afterDelete |
| `lists` | Filtro de relación | find (para ensures) |

## Conclusión

Las API Routes de Tasks son la primera implementación concreta del patrón Thin API Proxy. Sin ellas, ningún componente del frontend (TaskList, TaskItem, AddTaskBar) puede operar. Son el habilitador crítico de la Fase 4 y el eslabón que cierra el pipeline: Componente → Hook → API Route → PayloadCMS → SQLite.
