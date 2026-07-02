# Especificación: Componente TaskList + Skeleton + EmptyState

## 1. Descripción

Componente React 19 `'use client'` que orquesta la visualización de una lista de tareas. Consume el hook `useTasks()` (o directamente la API si el hook no está disponible), maneja los estados de carga/vacío/error/éxito, y renderiza una colección de `TaskItem`.

## 2. Interfaces

### 2.1 TaskList

```typescript
// Ubicación: src/components/tasks/TaskList.tsx

interface TaskListProps {
  listId?: number          // Filtrar por lista específica
  status?: 'pending' | 'completed' // Filtrar por estado
  emptyState?: {           // Personalizar EmptyState
    icon?: string
    title?: string
    description?: string
  }
}
```

### 2.2 Skeleton

```typescript
// Ubicación: src/components/common/Skeleton.tsx

interface SkeletonProps {
  className?: string
  count?: number           // Número de skeletons a renderizar (default: 5)
}
```

### 2.3 EmptyState (existente, mejora)

```typescript
// Ubicación: src/components/ui/EmptyState.tsx (ya existe)
// Props actuales:
interface EmptyStateProps {
  icon: string
  title: string
  description: string
}
```

## 3. Props de TaskList

| Prop | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|
| `listId` | `number` | No | — | Filtrar tareas por ID de lista |
| `status` | `'pending' \| 'completed'` | No | — | Filtrar por estado |
| `emptyState` | `{ icon?: string; title?: string; description?: string }` | No | Ver defaults | Personalizar mensaje de empty state |

**Default emptyState por stack (definido en cada página stack, Act 7):**

| Stack | Icon | Title | Description |
|---|---|---|---|
| My Day | `sunny` | "This is your My Day" | "Tasks added here appear when you need them most." |
| Important | `star` | "No important tasks" | "Flag tasks as important to see them here." |
| Planned | `calendar_month` | "No planned tasks" | "Tasks with a due date will show up here." |
| Tasks (All) | `task_alt` | "No tasks yet" | "All your tasks live here." |
| Custom list | `list` | "No tasks in this list" | "Add a task to get started." |

## 4. Estados del Componente

| Estado | Condición | Render | Acción |
|---|---|---|---|
| **Loading** | `isLoading === true` | 5 × `<Skeleton />` | — |
| **Error** | `isError === true` | `<div>` con icono `error`, mensaje "Something went wrong", botón "Try again" | Click en "Try again" → `refetch()` |
| **Empty** | `data?.docs?.length === 0` | `<EmptyState>` con props personalizadas o defaults | — |
| **Data** | `data?.docs?.length > 0` | Lista de `<TaskItem>` | Interacciones normales |

## 5. Estructura HTML Renderizada

### 5.1 TaskList — Estado Data

```html
<div class="space-y-3">
  <TaskItem task={task} onToggle={...} onToggleImportant={...} onClick={...} />
  <TaskItem task={task} onToggle={...} onToggleImportant={...} onClick={...} />
  ...
</div>
```

### 5.2 TaskList — Estado Loading

```html
<div class="space-y-3">
  <div class="h-16 bg-surface-container-high animate-pulse rounded-xl" />
  <div class="h-16 bg-surface-container-high animate-pulse rounded-xl" />
  <div class="h-16 bg-surface-container-high animate-pulse rounded-xl" />
  <div class="h-16 bg-surface-container-high animate-pulse rounded-xl" />
  <div class="h-16 bg-surface-container-high animate-pulse rounded-xl" />
</div>
```

### 5.3 TaskList — Estado Error

```html
<div class="flex flex-col items-center justify-center py-12 gap-4 text-center">
  <span class="material-symbols-outlined text-4xl text-error">error</span>
  <p class="font-body-md text-on-surface">Something went wrong</p>
  <p class="font-body-md text-on-surface-variant">{error message}</p>
  <button onClick={refetch}
          class="px-6 py-2 bg-primary text-white rounded-xl font-body-md font-semibold
                 hover:bg-primary/90 transition-colors active:scale-[0.98]">
    Try again
  </button>
</div>
```

### 5.4 Skeleton

```html
<div class="h-16 bg-surface-container-high animate-pulse rounded-xl" />
<!-- Dimensiones: height 64px (4rem), border-radius 12px (rounded-xl) -->
```

## 6. Data Contract (con useTasks hook)

```typescript
// El hook useTasks retorna (definido en Act 6):
interface UseTasksReturn {
  data: { docs: Task[] } | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

// Modo directo (sin hook, fetch manual):
// GET /api/tasks?list={listId}&status={status}
// Response: { docs: Task[], totalDocs: number, ... }
```

## 7. Dependencias

| Dependencia | Uso | Disponible |
|---|---|---|
| `react` | JSX, useState, useCallback | ✅ |
| `@/payload-types` | `Task` type | ✅ |
| `@/hooks/useTasks` | Data fetching + estados | ❌ Act 6 |
| `@/components/tasks/TaskItem` | Renderizar cada tarea | ❌ Act 2 |
| `@/components/ui/EmptyState` | Estado vacío | ✅ Existente |
| `@/components/common/Skeleton` | Loading placeholder | ❌ A crear |

**Plan de contingencia:** Si `useTasks` (Act 6) no está disponible, TaskList implementa fetch directo a `GET /api/tasks` con `useEffect` + `useState`. Al llegar Act 6, se migra a `useTasks()`.
