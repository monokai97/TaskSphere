# Tasks: Integrar TaskList en Páginas Stack

## Dependencias Previas

- [x] Fuerte: `useLists()` hook en `src/hooks/useLists.ts` — descubre listas del guest
- [x] Fuerte: 4 páginas stack existen en `src/app/(frontend)/(stacks)/`
- [ ] Fuerte: `TaskList` component (Act 3) — acepta `listId` prop
- [ ] Fuerte: `AddTaskBar` component (Act 4) — acepta `listId` + `listName` props
- [ ] Débil: `useTasks` hook (Act 6) — consumido por TaskList internamente

## Hitos

### Hito 1: Crear componente StackShell

**Archivo:** `src/components/tasks/StackShell.tsx`

- [ ] 1.1 Crear archivo con directiva `'use client'`
- [ ] 1.2 Importar dependencias:
  ```typescript
  import { useLists } from '@/hooks/useLists'
  import { TaskList } from '@/components/tasks/TaskList'
  import { AddTaskBar } from '@/components/tasks/AddTaskBar'
  import { EmptyState } from '@/components/ui/EmptyState'
  ```
- [ ] 1.3 Definir interfaz `StackShellProps` con `listName` y `emptyState`
- [ ] 1.4 Definir componente `export function StackShell(props: StackShellProps)`
- [ ] 1.5 Implementar lógica de descubrimiento:
  ```typescript
  const { data: listsData, isLoading, isError } = useLists()
  
  // Buscar lista por nombre exacto
  const list = listsData?.docs?.find(
    (l) => l.name.toLowerCase() === props.listName.toLowerCase()
  )
  const listId = list?.id
  
  // Estados
  if (isLoading) {
    return <LoadingSkeleton />
  }
  
  if (isError || !list) {
    return <EmptyState icon="error" title="List not found" description="Try refreshing the page." />
  }
  ```

### Hito 2: StackShell — renderizado principal

- [ ] 2.1 Renderizar layout con TaskList + AddTaskBar:
  ```typescript
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 md:px-12 py-6">
        <TaskList
          listId={listId}
          emptyState={props.emptyState}
        />
      </div>
      <AddTaskBar
        listId={listId}
        listName={props.listName}
      />
    </div>
  )
  ```
- [ ] 2.2 Verificar que `listId` es del tipo correcto (`number`)
- [ ] 2.3 Verificar que `emptyState` se pasa correctamente a TaskList

### Hito 3: StackShell — loading state

- [ ] 3.1 Crear componente inline `LoadingSkeleton` o usar `Skeleton` de common:
  ```typescript
  function LoadingSkeleton() {
    return (
      <div className="flex-1 px-4 md:px-12 py-6 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-surface-container-high animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }
  ```
- [ ] 3.2 Mostrar 5 skeletons mientras `useLists()` carga

### Hito 4: Actualizar /my-day/page.tsx

- [ ] 4.1 Reemplazar contenido:
  ```typescript
  import { TopBar } from '@/components/layout/TopBar'
  import { StackShell } from '@/components/tasks/StackShell'
  
  export default function MyDayPage() {
    return (
      <>
        <TopBar title="My Day" />
        <StackShell
          listName="My Day"
          emptyState={{
            icon: 'sunny',
            title: 'This is your My Day',
            description: 'Tasks added here appear when you need them most.',
          }}
        />
      </>
    )
  }
  ```
- [ ] 4.2 Eliminar import de `EmptyState` (ya no se usa directamente)
- [ ] 4.3 Verificar que TopBar se mantiene como Server Component

### Hito 5: Actualizar /important/page.tsx

- [ ] 5.1 Mismo patrón que My Day con:
  - `listName="Important"`
  - emptyState: icon `star`, title "No important tasks", description "Flag tasks as important to see them here."
- [ ] 5.2 Eliminar import de `EmptyState`

### Hito 6: Actualizar /planned/page.tsx

- [ ] 6.1 Mismo patrón con:
  - `listName="Planned"`
  - emptyState: icon `calendar_month`, title "No planned tasks", description "Tasks with a due date will show up here."
- [ ] 6.2 Eliminar import de `EmptyState`

### Hito 7: Actualizar /tasks/page.tsx

- [ ] 7.1 Mismo patrón con:
  - `listName="Tasks"`
  - emptyState: icon `task_alt`, title "No tasks yet", description "All your tasks live here."
- [ ] 7.2 Eliminar import de `EmptyState`

### Hito 8: Verificar Sidebar activo

- [ ] 8.1 Confirmar que Sidebar ya usa `usePathname()` para destacar el stack activo (verificado en `Sidebar.tsx` — ya implementado)
- [ ] 8.2 Verificar que las rutas en `NAV_ITEMS` coinciden con las rutas reales:
  - `/my-day` → sidebar "My Day"
  - `/important` → sidebar "Important"
  - `/planned` → sidebar "Planned"
  - `/tasks` → sidebar "Tasks"
- [ ] 8.3 No se requieren cambios en Sidebar

### Hito 9: Verificar MobileNav

- [ ] 9.1 Verificar que `MobileNav.tsx` también resalta la navegación activa
- [ ] 9.2 Si MobileNav no existe o no tiene active state, opcional: añadir resaltado con `usePathname()`

### Hito 10: Validación final

- [ ] 10.1 Ejecutar `pnpm lint` — sin errores
- [ ] 10.2 Verificar que las 4 páginas stack importan `StackShell` correctamente
- [ ] 10.3 Verificar que `StackShell` no tiene dependencias circulares
- [ ] 10.4 Probar navegación entre stacks: /my-day → /important → /planned → /tasks
- [ ] 10.5 Probar que crear tarea en My Day no la muestra en Important (y viceversa)
- [ ] 10.6 Probar empty state: ir a un stack sin tareas → ver EmptyState contextual

## Orden de Implementación

```
Hito 1 (StackShell) → Hito 2 (render) → Hito 3 (loading)
                                                ↓
              ┌──────────────────────────────────┼──────────────────────────────────┐
              ↓                                  ↓                                  ↓
    Hito 4 (my-day)                    Hito 5 (important)                 Hito 6 (planned) + Hito 7 (tasks)
              ↓                                  ↓                                  ↓
              └──────────────────────────────────┼──────────────────────────────────┘
                                                 ↓
                              Hito 8 (sidebar) + Hito 9 (mobile nav)
                                                 ↓
                                          Hito 10 (lint + tests)
```

## Checklist de Archivos

| Archivo | Acción | Estado |
|---|---|---|
| `src/components/tasks/StackShell.tsx` | Crear | ❌ |
| `src/app/(frontend)/(stacks)/my-day/page.tsx` | Modificar | ❌ (placeholder) |
| `src/app/(frontend)/(stacks)/important/page.tsx` | Modificar | ❌ (placeholder) |
| `src/app/(frontend)/(stacks)/planned/page.tsx` | Modificar | ❌ (placeholder) |
| `src/app/(frontend)/(stacks)/tasks/page.tsx` | Modificar | ❌ (placeholder) |
| `src/components/layout/Sidebar.tsx` | Verificar (sin cambios esperados) | ✅ |
