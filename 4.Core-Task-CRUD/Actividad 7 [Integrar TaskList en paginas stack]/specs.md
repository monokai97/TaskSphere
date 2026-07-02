# Especificación: Integrar TaskList en Páginas Stack

## 1. Descripción

Integrar los componentes de tareas (TaskList, AddTaskBar) en las 4 páginas stack, reemplazando los EmptyState placeholder. Cada stack descubre su lista correspondiente por nombre y filtra tareas usando `useTasks(listId)`.

## 2. Interfaces

### 2.1 StackShell (nuevo)

```typescript
// Ubicación: src/components/tasks/StackShell.tsx

interface StackShellProps {
  listName: string                    // Nombre exacto de la lista: "My Day" | "Important" | "Planned" | "Tasks"
  emptyState: {
    icon: string
    title: string
    description: string
  }
}
```

### 2.2 Páginas Stack (actualizadas)

Cada página pasa props específicas a `StackShell`. No contienen lógica propia — son wrappers server components.

```typescript
// my-day/page.tsx, important/page.tsx, planned/page.tsx, tasks/page.tsx
// No tienen props — son la ruta. La lógica está en StackShell.
```

## 3. StackShell: Comportamiento

### 3.1 Flujo

```
1. Montar componente
2. useLists() → obtiene todas las listas del guest
3. En data.docs, buscar list.name === props.listName
4. Si encontrada → extraer list.id
5. Si no encontrada → mostrar EmptyState (lista no inicializada)
6. Pasar list.id a TaskList y AddTaskBar
7. TaskList usa useTasks(listId) para obtener tareas
8. AddTaskBar usa listId + listName para crear tareas en esa lista
```

### 3.2 Estados

| Estado | Condición | Render |
|---|---|---|
| **Loading lists** | `useLists()` isLoading | Skeleton de 3 líneas (altura de TopBar + lista) |
| **List not found** | lists cargadas pero list.name no coincide | Mensaje "List '{listName}' not found. Try refreshing." |
| **Ready** | List encontrada | TopBar + TaskList + AddTaskBar |

### 3.3 EmptyState Defaults por Stack

| Stack | icon | title | description |
|---|---|---|---|
| My Day | `sunny` | `"This is your My Day"` | `"Tasks added here appear when you need them most."` |
| Important | `star` | `"No important tasks"` | `"Flag tasks as important to see them here."` |
| Planned | `calendar_month` | `"No planned tasks"` | `"Tasks with a due date will show up here."` |
| Tasks | `task_alt` | `"No tasks yet"` | `"All your tasks live here."` |

## 4. Páginas Stack (actualizadas)

### 4.1 /my-day/page.tsx

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

### 4.2 /important/page.tsx

```typescript
import { TopBar } from '@/components/layout/TopBar'
import { StackShell } from '@/components/tasks/StackShell'

export default function ImportantPage() {
  return (
    <>
      <TopBar title="Important" />
      <StackShell
        listName="Important"
        emptyState={{
          icon: 'star',
          title: 'No important tasks',
          description: 'Flag tasks as important to see them here.',
        }}
      />
    </>
  )
}
```

### 4.3 /planned/page.tsx

```typescript
import { TopBar } from '@/components/layout/TopBar'
import { StackShell } from '@/components/tasks/StackShell'

export default function PlannedPage() {
  return (
    <>
      <TopBar title="Planned" />
      <StackShell
        listName="Planned"
        emptyState={{
          icon: 'calendar_month',
          title: 'No planned tasks',
          description: 'Tasks with a due date will show up here.',
        }}
      />
    </>
  )
}
```

### 4.4 /tasks/page.tsx

```typescript
import { TopBar } from '@/components/layout/TopBar'
import { StackShell } from '@/components/tasks/StackShell'

export default function TasksPage() {
  return (
    <>
      <TopBar title="Tasks" />
      <StackShell
        listName="Tasks"
        emptyState={{
          icon: 'task_alt',
          title: 'No tasks yet',
          description: 'All your tasks live here.',
        }}
      />
    </>
  )
}
```

## 5. Stacks Layout (actualizado)

El layout de stacks (`(stacks)/layout.tsx`) ya renderiza `Sidebar` + `<main>`. Las páginas stack se renderizan dentro de `<main>`. No requiere cambios.

```typescript
// (stacks)/layout.tsx — sin cambios
import { Sidebar } from '@/components/layout/Sidebar'

export default async function StacksLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">{children}</main>
    </>
  )
}
```

## 6. StackShell: Estructura HTML

```html
<div className="flex-1 flex flex-col">
  <!-- TaskList area -->
  <div className="flex-1 overflow-y-auto px-4 md:px-12 py-6">
    <TaskList listId={listId} emptyState={emptyState} />
  </div>
  
  <!-- AddTaskBar al fondo -->
  <AddTaskBar listId={listId} listName={listName} />
</div>
```

## 7. Dependencias

| Dependencia | Uso | Disponible |
|---|---|---|
| `@/hooks/useLists` | Descubrir ID de lista por nombre | ✅ |
| `@/components/tasks/TaskList` | Renderizar tareas | ❌ Act 3 |
| `@/components/tasks/AddTaskBar` | Crear tareas en contexto | ❌ Act 4 |
| `@/components/ui/EmptyState` | Estado vacío | ✅ |
| `@/components/layout/TopBar` | Header del stack | ✅ |

**Plan de contingencia:** Si `StackShell` encuentra que el componente `TaskList` o `AddTaskBar` no existen, puede mostrar un mensaje de fallback. Sin embargo, la actividad 7 debe ejecutarse después de que Act 3 y Act 4 estén completas.
