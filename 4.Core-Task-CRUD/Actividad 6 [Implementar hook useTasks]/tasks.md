# Tasks: Implementar hook useTasks — Suite TanStack Query

## Dependencias Previas

- [x] Fuerte: TanStack Query Provider en `src/providers/QueryProvider.tsx` con queryClient configurado
- [x] Fuerte: API Routes de tasks funcionando (Act 1): GET, POST, PATCH, DELETE
- [x] Fuerte: `Task` type generado en `src/payload-types.ts`
- [ ] Débil: `useLists` hook en `src/hooks/useLists.ts` — patrón de referencia
- [ ] Débil: `QueryClient` typing — importar `useQueryClient` de `@tanstack/react-query`

## Hitos

### Hito 1: Crear archivo y estructura base

- [ ] 1.1 Crear archivo `src/hooks/useTasks.ts`
- [ ] 1.2 Añadir directiva `'use client'`
- [ ] 1.3 Importar:
  ```typescript
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
  import type { Task } from '@/payload-types'
  ```
- [ ] 1.4 Definir constantes y tipos:
  ```typescript
  const TASKS_KEY = 'tasks'

  interface UseTasksParams {
    listId?: number
    status?: 'pending' | 'completed'
  }

  interface ToggleTaskParams {
    id: number
    status: 'pending' | 'completed'
  }

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

  interface TasksResponse {
    docs: Task[]
    totalDocs: number
  }
  ```

### Hito 2: Implementar useTasks query

- [ ] 2.1 Definir `export function useTasks(params?: UseTasksParams)`:
- [ ] 2.2 Construir queryKey: `['tasks', params?.listId, params?.status]`
- [ ] 2.3 Implementar queryFn:
  ```typescript
  queryFn: async ({ queryKey }) => {
    const [, listId, status] = queryKey
    const searchParams = new URLSearchParams()
    if (listId) searchParams.set('list', String(listId))
    if (status) searchParams.set('status', status as string)
    const url = `/api/tasks?${searchParams.toString()}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch tasks')
    return res.json() as Promise<TasksResponse>
  }
  ```
- [ ] 2.4 Configurar `staleTime: 30_000`, `gcTime: 300_000`
- [ ] 2.5 Seguir el mismo patrón que `useLists()` (named export, sin default)

### Hito 3: Implementar useCreateTask mutation

- [ ] 3.1 Definir `export function useCreateTask()`:
  ```typescript
  export function useCreateTask() {
    const queryClient = useQueryClient()
    
    return useMutation<Task, Error, CreateTaskInput>({
      mutationFn: async (data) => {
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
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [TASKS_KEY] })
      },
    })
  }
  ```
- [ ] 3.2 Sin optimistic update (esperar confirmación del servidor)
- [ ] 3.3 onSuccess: invalidar raíz `['tasks']` para refrescar todas las listas

### Hito 4: Implementar useToggleTask mutation (con optimistic update)

- [ ] 4.1 Definir `export function useToggleTask(listId?: number)`:
  ```typescript
  export function useToggleTask(listId?: number) {
    const queryClient = useQueryClient()
    
    return useMutation<Task, Error, ToggleTaskParams>({
      mutationFn: async ({ id, status }) => {
        const res = await fetch(`/api/tasks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
        if (!res.ok) throw new Error('Failed to toggle task')
        return res.json()
      },
      onMutate: async ({ id, status }) => {
        await queryClient.cancelQueries({ queryKey: [TASKS_KEY, listId] })
        const previousData = queryClient.getQueryData<TasksResponse>([TASKS_KEY, listId])
        
        queryClient.setQueryData<TasksResponse>([TASKS_KEY, listId], (old) => {
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
      },
      onError: (_err, _vars, context) => {
        if (context?.previousData) {
          queryClient.setQueryData([TASKS_KEY, listId], context.previousData)
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: [TASKS_KEY, listId] })
      },
    })
  }
  ```
- [ ] 4.2 Verificar que `onMutate` retorna snapshot para rollback
- [ ] 4.3 Verificar que `onError` restaura el snapshot
- [ ] 4.4 Verificar que `onSettled` invalida (se ejecuta siempre, éxito o error)

### Hito 5: Implementar useDeleteTask mutation (con optimistic update)

- [ ] 5.1 Definir `export function useDeleteTask(listId?: number)`:
  ```typescript
  export function useDeleteTask(listId?: number) {
    const queryClient = useQueryClient()
    
    return useMutation<{ success: boolean }, Error, number>({
      mutationFn: async (id) => {
        const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to delete task')
        return res.json()
      },
      onMutate: async (id) => {
        await queryClient.cancelQueries({ queryKey: [TASKS_KEY, listId] })
        const previousData = queryClient.getQueryData<TasksResponse>([TASKS_KEY, listId])
        
        queryClient.setQueryData<TasksResponse>([TASKS_KEY, listId], (old) => {
          if (!old) return old
          return { ...old, docs: old.docs.filter((task) => task.id !== id) }
        })
        
        return { previousData }
      },
      onError: (_err, _id, context) => {
        if (context?.previousData) {
          queryClient.setQueryData([TASKS_KEY, listId], context.previousData)
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: [TASKS_KEY, listId] })
      },
    })
  }
  ```
- [ ] 5.2 Misma estructura que useToggleTask pero elimina el doc del cache

### Hito 6: Implementar useUpdateTask mutation (sin optimistic update)

- [ ] 6.1 Definir `export function useUpdateTask(listId?: number)`:
  ```typescript
  export function useUpdateTask(listId?: number) {
    const queryClient = useQueryClient()
    
    return useMutation<Task, Error, { id: number } & UpdateTaskInput>({
      mutationFn: async ({ id, ...data }) => {
        const res = await fetch(`/api/tasks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Failed to update task')
        return res.json()
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [TASKS_KEY, listId] })
      },
    })
  }
  ```
- [ ] 6.2 Sin optimistic update (evitar flickering en edición de texto)
- [ ] 6.3 onSuccess: invalidar queries de la lista específica

### Hito 7: Exportar todos los hooks

- [ ] 7.1 Verificar que los 5 exports están al final del archivo:
  ```typescript
  export { useTasks, useCreateTask, useToggleTask, useDeleteTask, useUpdateTask }
  ```
- [ ] 7.2 (O usar exports inline en cada definición)

### Hito 8: Validación final

- [ ] 8.1 Ejecutar `pnpm lint` — sin errores
- [ ] 8.2 Verificar que los tipos `Task`, `TasksResponse` son correctos
- [ ] 8.3 Verificar que `useMutation` está tipado correctamente (genéricos: `TData, TError, TVariables`)
- [ ] 8.4 Verificar que `onMutate` retorna el contexto para `onError`

## Orden de Implementación

```
Hito 1 (estructura) → Hito 2 (useTasks query)
                           ↓
            ┌──────────────┼──────────────┐
            ↓              ↓              ↓
      Hito 3 (create)  Hito 4 (toggle)  Hito 5 (delete) → Hito 6 (update)
            ↓              ↓              ↓                ↓
                           Hito 7 (exports)
                               ↓
                          Hito 8 (lint)
```

## Checklist de Archivos

| Archivo | Estado |
|---|---|
| `src/hooks/useTasks.ts` | ❌ No existe |
