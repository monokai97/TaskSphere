# Especificación: Componente TaskItem

## 1. Descripción

Componente React 19 `'use client'` que renderiza una tarea individual. Es puramente de presentación — recibe datos por props y emite eventos por callbacks. No realiza fetching ni mutaciones directamente.

## 2. Interface

```typescript
// Ubicación: src/components/tasks/TaskItem.tsx
// Convención: named export, sin default export

interface TaskItemProps {
  task: Task                              // Desde payload-types.ts
  onToggle: (id: number, status: 'pending' | 'completed') => void
  onToggleImportant: (id: number, important: boolean) => void
  onClick?: (id: number) => void         // Abrir detail panel
  selected?: boolean                      // Modo selección múltiple
}
```

## 3. Props

| Prop | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|
| `task` | `Task` | Sí | — | Objeto de tarea desde PayloadCMS |
| `onToggle` | `(id: number, status: 'pending' \| 'completed') => void` | Sí | — | Callback al cambiar checkbox |
| `onToggleImportant` | `(id: number, important: boolean) => void` | Sí | — | Callback al toggle estrella |
| `onClick` | `(id: number) => void` | No | — | Callback al click en el item (abre detail panel) |
| `selected` | `boolean` | No | `false` | Modo selección múltiple (bulk actions) |

## 4. Estados Visuales

| Estado | Trigger | Cambios Visuales |
|---|---|---|
| **Normal** | Default | `bg-surface-container-lowest`, `border-transparent`, `shadow-sm` |
| **Hover** | mouse enter | `border-outline-variant`, drag handle visible (`opacity-100`) |
| **Selected** | `selected === true` | `border-primary/20`, `bg-primary-fixed/10`, `shadow-sm` |
| **Completed** | `task.status === 'completed'` | `opacity-50`, `grayscale-[0.2]`, título `line-through` |
| **Important** | `task.important === true` | Estrella con fill: `text-secondary`, `font-variation-settings: 'FILL' 1` |

## 5. Estructura HTML Renderizada

```html
<div class="group flex items-center gap-4 p-4 bg-surface-container-lowest rounded-xl
            border border-transparent hover:border-outline-variant hover:shadow-sm
            transition-all cursor-pointer
            [selected] -> border-primary/20 bg-primary-fixed/10
            [completed] -> opacity-50 grayscale-[0.2]"
     role="listitem"
     onClick={() => onClick?.(task.id)}>

  <!-- Checkbox (TaskCheckbox delegado) -->
  <TaskCheckbox checked={task.status === 'completed'} onToggle={handleToggle} />

  <!-- Contenido principal -->
  <div class="flex-1 min-w-0">
    <p class="font-task-item text-body-md text-on-surface truncate
              [completed] -> line-through">
      {task.title}
    </p>

    <!-- Metadata row -->
    <div class="flex items-center gap-3 mt-1">
      <!-- dueDate -->
      {task.dueDate && (
        <span class="font-label-sm text-primary flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">calendar_today</span>
          {formatDueDate(task.dueDate)}
        </span>
      )}
      <!-- List name (si depth > 0) -->
      {typeof task.list === 'object' && task.list?.name && (
        <span class="font-label-sm text-text-secondary-light flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">{task.list.icon || 'list'}</span>
          {task.list.name}
        </span>
      )}
    </div>
  </div>

  <!-- Estrella (Important toggle) -->
  <button onClick={e => handleToggleImportant(e)}
          aria-label={task.important ? 'Quitar importante' : 'Marcar importante'}
          class="transition-colors
                 [important] -> text-secondary
                 [!important] -> text-outline-variant group-hover:text-outline">
    <span class="material-symbols-outlined"
          style={task.important ? { fontVariationSettings: "'FILL' 1" } : undefined}>
      star
    </span>
  </button>

  <!-- Drag handle (visible en hover) -->
  <span class="material-symbols-outlined text-on-surface-variant
               opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
    drag_indicator
  </span>
</div>
```

## 6. Layout y Dimensiones

| Elemento | Clases | Tamaño |
|---|---|---|
| Contenedor | `p-4 rounded-xl` | padding 16px, border-radius 12px |
| Checkbox | `w-6 h-6` | 24px × 24px |
| Título | `font-task-item text-body-md` | 15px/20px Inter Regular |
| Metadata | `font-label-sm` | 12px/16px Geist Medium |
| Estrella | `text-[20px]` | 20px |
| Drag handle | `text-[20px]` | 20px |
| Gap entre elementos | `gap-4` | 16px |

## 7. Formato de Fecha

```typescript
function formatDueDate(date: string): string {
  const due = new Date(date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (due.toDateString() === today.toDateString()) return 'Today'
  if (due.toDateString() === tomorrow.toDateString()) return 'Tomorrow'

  return due.toLocaleDateString('es', { month: 'short', day: 'numeric' })
}
```

## 8. Dependencias

| Dependencia | Uso | Disponible |
|---|---|---|
| `react` | JSX, `useCallback`, `memo` | ✅ |
| `@/payload-types` | `Task` type | ✅ |
| `@/components/tasks/TaskCheckbox` | Checkbox delegado | ❌ Act 5 |

Para el MVP el componente puede incluir el checkbox inline (sin delegar a TaskCheckbox) para desacoplar la dependencia de Act 5.
