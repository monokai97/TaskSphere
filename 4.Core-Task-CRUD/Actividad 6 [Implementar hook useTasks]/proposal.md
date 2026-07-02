# Propuesta: Hook useTasks — Capa de Datos Fullstack con TanStack Query

## Resumen Ejecutivo

Implementar la suite completa de hooks de TanStack Query para operaciones CRUD de tareas: `useTasks()` (lectura con filtros), `useCreateTask()`, `useToggleTask()` (con optimistic update), `useDeleteTask()` (con optimistic update) y `useUpdateTask()` (sin optimistic update). Es la capa que conecta los componentes de UI (TaskList, TaskItem, AddTaskBar, TaskCheckbox) con las API Routes (Act 1), cerrando el pipeline: **Componente → Hook → API Route → PayloadCMS → SQLite**.

## Justificación

### Por qué TanStack Query como capa de datos

| Aspecto | Fetch directo en cada componente | TanStack Query (elegido) |
|---|---|---|
| **Cache** | Ninguno — cada montaje = fetch | Cache con staleTime 30s, gcTime 5min |
| **Optimistic updates** | Manual, propenso a bugs | `onMutate`/`onError`/`onSettled` nativo |
| **Invalidación** | Manual con useState + useEffect | `invalidateQueries()` automático |
| **Estados** | isLoading/error manuales | Devueltos por useQuery/useMutation |
| **Deduplicación** | Múltiples componentes = múltiples fetches | Un solo fetch por queryKey |

### Estrategia de Optimistic Updates Selectivos (design.md §0 Trade-off #2)

| Mutación | Optimistic Update | Razón |
|---|---|---|
| `useToggleTask` | ✅ Sí | UI refleja cambio inmediato; rollback si falla |
| `useDeleteTask` | ✅ Sí | Item desaparece al instante; rollback si falla |
| `useCreateTask` | ❌ No | Evita flickering si el servidor rechaza el payload |
| `useUpdateTask` | ❌ No | Edición de texto necesita confirmación del servidor |

### Pipeline Completo

```
AddTaskBar (crear)
  → useCreateTask().mutate(data)
  → fetch POST /api/tasks
  → PayloadCMS create + Hook afterChange → TaskLog
  → invalidateQueries(['tasks']) ← todas las listas se refrescan

TaskCheckbox (toggle)
  → useToggleTask().mutate({ id, status })
  → onMutate: snapshot + update cache ← optimista
  → fetch PATCH /api/tasks/{id}
  → onError: rollback ← si falla
  → onSettled: invalidateQueries

TaskItem (delete)
  → useDeleteTask().mutate(id)
  → onMutate: remove from cache ← optimista
  → fetch DELETE /api/tasks/{id}
  → onError: rollback ← si falla

TaskItem (edit title / dueDate / notes)
  → useUpdateTask().mutate({ id, ...data })
  → fetch PATCH /api/tasks/{id}
  → onSuccess: invalidateQueries
```

### Colecciones PayloadCMS Involucradas

| Colección | Vía | Operaciones del Hook |
|---|---|---|
| `tasks` | API Routes | `find`, `create`, `update`, `delete` |
| `task-logs` | Indirecta (hooks) | Automático via afterChange/afterDelete |
| `lists` | No usada directamente en este hook | — |

### Conclusión

useTasks es el eslabón más crítico de la Fase 4. Sin estos hooks, los componentes de UI (Act 2-5) no tienen acceso a datos reales. Con ellos, el pipeline completo se cierra por primera vez: desde el click del usuario hasta la persistencia en SQLite, pasando por validación Zod, PayloadCMS CRUD y auditoría automática.
