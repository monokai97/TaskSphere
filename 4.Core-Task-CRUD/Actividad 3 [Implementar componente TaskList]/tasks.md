# Tasks: Implementar componente TaskList + Skeleton

## Dependencias Previas

- [ ] Débil: `useTasks` hook (Act 6) — se implementa fallback con fetch directo
- [ ] Débil: `TaskItem` component (Act 2) — se implementa placeholder interno si no existe
- [x] Fuerte: `EmptyState` component en `src/components/ui/EmptyState.tsx`
- [x] Fuerte: Directorio `src/components/tasks/` debe crearse
- [x] Fuerte: TanStack Query Provider en `src/providers/QueryProvider.tsx`

## Hitos

### Hito 1: Crear componente Skeleton

**Archivo:** `src/components/common/Skeleton.tsx`

- [ ] 1.1 Crear archivo con directiva `'use client'`
- [ ] 1.2 Definir interfaz:
  ```typescript
  interface SkeletonProps {
    className?: string
    count?: number
  }
  ```
- [ ] 1.3 Valor por defecto: `count = 1`
- [ ] 1.4 Renderizar `count` divs con clases:
  - `h-16 bg-surface-container-high animate-pulse rounded-xl` (default TaskItem skeleton)
  - Aplicar `className` extra si se provee
- [ ] 1.5 Usar `Array.from({ length: count })` para generar los elementos
- [ ] 1.6 Añadir key a cada skeleton item para evitar warning de React

### Hito 2: Crear directorio y estructura de TaskList

- [ ] 2.1 Crear directorio `src/components/tasks/` (si no existe)
- [ ] 2.2 Crear archivo `src/components/tasks/TaskList.tsx`
- [ ] 2.3 Añadir directiva `'use client'`

### Hito 3: Definir props e imports

- [ ] 3.1 Importar:
  ```typescript
  import { useTasks } from '@/hooks/useTasks'        // Act 6 — o fallback directo
  import { TaskItem } from '@/components/tasks/TaskItem' // Act 2
  import { EmptyState } from '@/components/ui/EmptyState'
  import { Skeleton } from '@/components/common/Skeleton'
  ```
- [ ] 3.2 Definir interfaz `TaskListProps`:
  ```typescript
  interface TaskListProps {
    listId?: number
    status?: 'pending' | 'completed'
    emptyState?: {
      icon?: string
      title?: string
      description?: string
    }
  }
  ```
- [ ] 3.3 Definir `export function TaskList(props: TaskListProps)`
- [ ] 3.4 Definir emptyState defaults:
  ```typescript
  const DEFAULT_EMPTY = {
    icon: 'task_alt',
    title: 'No tasks yet',
    description: 'Add a task to get started.',
  }
  ```

### Hito 4: Implementar data fetching (fallback directo si useTasks no existe)

- [ ] 4.1 Definir fetch directo como plan de contingencia:
  ```typescript
  const [data, setData] = useState<{ docs: Task[] } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  ```
- [ ] 4.2 Implementar `fetchTasks` con `useCallback`:
  ```typescript
  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      const params = new URLSearchParams()
      if (listId) params.set('list', String(listId))
      if (status) params.set('status', status)
      const res = await fetch(`/api/tasks?${params}`)
      if (!res.ok) throw new Error('Failed to fetch tasks')
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [listId, status])
  ```
- [ ] 4.3 Llamar `fetchTasks` en `useEffect` con dependencias `[listId, status, fetchTasks]`
- [ ] 4.4 Exponer `refetch` como `() => fetchTasks()`

### Hito 5: Implementar renderizado condicional

- [ ] 5.1 Estado **loading** (`isLoading && !data`):
  ```html
  <div className="space-y-3">
    <Skeleton count={5} />
  </div>
  ```
- [ ] 5.2 Estado **error** (`isError`):
  ```html
  <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
    <span className="material-symbols-outlined text-4xl text-error">error</span>
    <p className="font-body-md text-on-surface font-semibold">Something went wrong</p>
    <p className="font-body-md text-on-surface-variant">{error?.message}</p>
    <button onClick={refetch}
            className="px-6 py-2 bg-primary text-white rounded-xl
                       font-body-md font-semibold hover:bg-primary/90
                       transition-colors active:scale-[0.98]">
      Try again
    </button>
  </div>
  ```
- [ ] 5.3 Estado **empty** (`data?.docs?.length === 0`):
  ```html
  <EmptyState
    icon={emptyState?.icon || DEFAULT_EMPTY.icon}
    title={emptyState?.title || DEFAULT_EMPTY.title}
    description={emptyState?.description || DEFAULT_EMPTY.description}
  />
  ```
- [ ] 5.4 Estado **data** (`data?.docs?.length > 0`):
  ```html
  <div className="space-y-3">
    {data.docs.map((task) => (
      <TaskItem
        key={task.id}
        task={task}
        onToggle={handleToggle}
        onToggleImportant={handleToggleImportant}
        onClick={handleClick}
      />
    ))}
  </div>
  ```
- [ ] 5.5 Importante: no mostrar loading si ya hay datos (evitar flickering en refetch)

### Hito 6: Implementar callbacks (placeholder hasta Act 6)

- [ ] 6.1 Callbacks temporales que serán reemplazados por las mutations de useTasks:
  ```typescript
  const handleToggle = useCallback((id: number, status: 'pending' | 'completed') => {
    // Placeholder — será reemplazado por useToggleTask() en Act 6
    console.log('Toggle task', id, status)
  }, [])

  const handleToggleImportant = useCallback((id: number, important: boolean) => {
    console.log('Toggle important', id, important)
  }, [])

  const handleClick = useCallback((id: number) => {
    console.log('Open detail', id)
  }, [])
  ```
- [ ] 6.2 Estos callbacks deben reemplazarse cuando Act 6 esté implementada

### Hito 7: Integrar con EmptyState existente

- [ ] 7.1 Verificar que `EmptyState` en `src/components/ui/EmptyState.tsx` acepta los mismos props
- [ ] 7.2 Si es necesario, actualizar EmptyState para soportar `children` o props adicionales
- [ ] 7.3 Verificar que el EmptyState actual usa `material-symbols-outlined` (coincide con el diseño)

### Hito 8: Validación final

- [ ] 8.1 Ejecutar `pnpm lint` — sin errores
- [ ] 8.2 Verificar que los imports usan `@/` alias
- [ ] 8.3 Verificar que no hay dependencias circulares
- [ ] 8.4 Verificar que Skeleton no produce layout shift (misma altura que TaskItem: `h-16`)

## Orden de Implementación

```
Hito 1 (Skeleton) ──┐
                     ├──→ Hito 2 (TaskList dir) → Hito 3 (props)
                     │                                    ↓
                     └──→ Hito 4 (fetch fallback) ← Hito 5 (render condicional)
                                                              ↓
                                                          Hito 6 (callbacks)
                                                              ↓
                                                          Hito 7 (EmptyState check)
                                                              ↓
                                                          Hito 8 (lint)
```

## Checklist de Archivos

| Archivo | Estado |
|---|---|
| `src/components/common/Skeleton.tsx` | ❌ No existe |
| `src/components/tasks/TaskList.tsx` | ❌ No existe |
| `src/components/tasks/` directory | ❌ No existe |
