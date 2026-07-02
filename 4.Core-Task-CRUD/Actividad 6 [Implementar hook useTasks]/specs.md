# Especificación: Hook useTasks — TanStack Query Suite

## 1. Descripción

Suite de hooks TanStack Query para el CRUD de tareas. Cada hook encapsula un patrón específico: queries con filtros, mutations sin optimistic update (creación/edición), mutations con optimistic update (toggle/delete).

## 2. Interfaces

```typescript
// Ubicación: src/hooks/useTasks.ts

// --- Query ---
interface UseTasksParams {
  listId?: number
  status?: 'pending' | 'completed'
}

interface UseTasksReturn {
  data: { docs: Task[]; totalDocs: number } | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => Promise<...>
}

// --- Mutations ---
interface CreateTaskInput {
  title: string
  description?: string
  list: string
  dueDate?: string
  important?: boolean
}

interface UpdateTaskInput {
  title?: string
  description?: string
  status?: 'pending' | 'completed'
  important?: boolean
  dueDate?: string | null
  sortOrder?: number
}

interface ToggleTaskParams {
  id: number
  status: 'pending' | 'completed'
}
```

## 3. Hooks

### 3.1 useTasks (Query)

```typescript
function useTasks(params?: UseTasksParams): UseTasksReturn
```

| Parámetro | Tipo | Requerido | Default |
|---|---|---|---|
| `params` | `UseTasksParams` | No | `{}` |
| `params.listId` | `number` | No | — |
| `params.status` | `'pending' \| 'completed'` | No | — |

**Query Key:** `['tasks', listId, status]`

**Query Function:**
```typescript
const params = new URLSearchParams()
if (listId) params.set('list', String(listId))
if (status) params.set('status', status)
const res = await fetch(`/api/tasks?${params}`)
if (!res.ok) throw new Error('Failed to fetch tasks')
return res.json()
```

**Cache Strategy:**
| Config | Valor | Razón |
|---|---|---|
| `staleTime` | 30_000 (30s) | Balance entre frescura y rendimiento |
| `gcTime` | 300_000 (5min) | Persistencia en caché para navegación entre stacks |
| `retry` | 1 | Un reintento en caso de error |

### 3.2 useCreateTask (Mutation)

```typescript
function useCreateTask(): UseMutationResult<Task, Error, CreateTaskInput>
```

**Mutation Function:**
```typescript
mutationFn: async (data: CreateTaskInput) => {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.title?.[0] || 'Failed to create task')
  }
  return res.json()
}
```

**Invalidation:**
- `onSuccess`: `invalidateQueries({ queryKey: ['tasks'] })`

**Optimistic Update:** ❌ No

### 3.3 useToggleTask (Mutation + Optimistic)

```typescript
function useToggleTask(listId?: number): UseMutationResult<Task, Error, ToggleTaskParams>
```

**Mutation Function:**
```typescript
mutationFn: async ({ id, status }) => {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Failed to toggle task')
  return res.json()
}
```

**Optimistic Update:** ✅

```typescript
onMutate: async ({ id, status }) => {
  await queryClient.cancelQueries({ queryKey: ['tasks', listId] })
  const previousData = queryClient.getQueryData(['tasks', listId])
  
  queryClient.setQueryData(['tasks', listId], (old: { docs: Task[] } | undefined) => {
    if (!old) return old
    return {
      ...old,
      docs: old.docs.map((task) =>
        task.id === id
          ? {
              ...task,
              status,
              completedAt: status === 'completed' ? new Date().toISOString() : null,
            }
          : task
      ),
    }
  })
  
  return { previousData }
}

onError: (_err, _vars, context) => {
  if (context?.previousData) {
    queryClient.setQueryData(['tasks', listId], context.previousData)
  }
}

onSettled: () => {
  queryClient.invalidateQueries({ queryKey: ['tasks', listId] })
}
```

### 3.4 useDeleteTask (Mutation + Optimistic)

```typescript
function useDeleteTask(listId?: number): UseMutationResult<{ success: boolean }, Error, number>
```

**Mutation Function:**
```typescript
mutationFn: async (id: number) => {
  const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete task')
  return res.json()
}
```

**Optimistic Update:** ✅

```typescript
onMutate: async (id) => {
  await queryClient.cancelQueries({ queryKey: ['tasks', listId] })
  const previousData = queryClient.getQueryData(['tasks', listId])
  
  queryClient.setQueryData(['tasks', listId], (old: { docs: Task[] } | undefined) => {
    if (!old) return old
    return { ...old, docs: old.docs.filter((task) => task.id !== id) }
  })
  
  return { previousData }
}

onError: (_err, _id, context) => {
  if (context?.previousData) {
    queryClient.setQueryData(['tasks', listId], context.previousData)
  }
}

onSettled: () => {
  queryClient.invalidateQueries({ queryKey: ['tasks', listId] })
}
```

### 3.5 useUpdateTask (Mutation)

```typescript
function useUpdateTask(listId?: number): UseMutationResult<Task, Error, { id: number } & UpdateTaskInput>
```

**Mutation Function:**
```typescript
mutationFn: async ({ id, ...data }) => {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update task')
  return res.json()
}
```

**Invalidation:**
- `onSuccess`: `invalidateQueries({ queryKey: ['tasks', listId] })`

**Optimistic Update:** ❌ No (para evitar flickering en edición de texto)

## 4. Dependencias

| Dependencia | Uso | Disponible |
|---|---|---|
| `@tanstack/react-query` | `useQuery`, `useMutation`, `useQueryClient` | ✅ |
| `@/payload-types` | `Task` type | ✅ |
| `react` | `useCallback` | ✅ |

## 5. Mapa de Consumidores

| Hook | Consumidor(es) |
|---|---|
| `useTasks(listId, status)` | `TaskList` (Act 3) |
| `useCreateTask()` | `AddTaskBar` (Act 4) |
| `useToggleTask(listId)` | `TaskItem` via `TaskCheckbox` (Act 5) |
| `useDeleteTask(listId)` | `TaskItem` detail footer, `BulkActionBar` (Act 5) |
| `useUpdateTask(listId)` | `TaskItem` inline edit, `TaskNotes`, `TaskDatePicker` |
