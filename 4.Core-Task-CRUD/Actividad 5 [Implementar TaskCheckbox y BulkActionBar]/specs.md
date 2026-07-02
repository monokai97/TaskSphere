# Especificación: TaskCheckbox + BulkActionBar

## 1. TaskCheckbox

### 1.1 Descripción

Checkbox circular animado de 24px que alterna el estado de una tarea entre `pending` y `completed`. Implementa optimistic update con TanStack Query: la UI cambia inmediatamente y se revierte si el servidor falla.

### 1.2 Interface

```typescript
// Ubicación: src/components/tasks/TaskCheckbox.tsx

interface TaskCheckboxProps {
  checked: boolean                     // task.status === 'completed'
  onToggle: () => void                 // Callback sin args (el padre maneja la lógica)
  disabled?: boolean                   // Durante submitting
  size?: 'sm' | 'md'                  // sm: 20px, md: 24px (default)
}
```

### 1.3 Props

| Prop | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|
| `checked` | `boolean` | Sí | — | Estado actual del checkbox |
| `onToggle` | `() => void` | Sí | — | Callback al clickear |
| `disabled` | `boolean` | No | `false` | Deshabilitado durante mutación |
| `size` | `'sm' \| 'md'` | No | `'md'` | Tamaño del checkbox |

### 1.4 Estados Visuales

| Estado | Condición | Clases |
|---|---|---|
| **Unchecked** | `checked === false` | `w-6 h-6 rounded-full border-2 border-outline` |
| **Unchecked + Hover** | mouse enter | `border-primary bg-primary/5` |
| **Checked** | `checked === true` | `w-6 h-6 rounded-full bg-primary flex items-center justify-center` + icono `check` blanco |
| **Disabled** | `disabled === true` | `opacity-50 cursor-not-allowed` |

### 1.5 Animación

```css
/* Transición suave entre estados */
.task-checkbox-ring {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.task-checkbox-ring:hover {
  border-color: #004ac6;
  background-color: rgba(0, 74, 198, 0.05);
}
```

### 1.6 Estructura HTML

```html
<button
  onClick={onToggle}
  disabled={disabled}
  className={`flex items-center justify-center transition-all duration-200
              ${size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${checked
                ? 'bg-primary rounded-full'
                : 'rounded-full border-2 border-outline hover:border-primary hover:bg-primary/5'
              }`}
  role="checkbox"
  aria-checked={checked}
  aria-label={checked ? 'Mark as pending' : 'Mark as completed'}
>
  {checked && (
    <span className="material-symbols-outlined text-white text-[18px]">check</span>
  )}
</button>
```

## 2. BulkActionBar

### 2.1 Descripción

Barra sticky que aparece en la parte superior del workspace cuando hay tareas seleccionadas. Muestra el contador de selección y botones de acción masiva. Animación slide-in desde arriba.

### 2.2 Interface

```typescript
// Ubicación: src/components/tasks/BulkActionBar.tsx

interface BulkActionBarProps {
  selectedCount: number                // Número de tareas seleccionadas
  onMarkCompleted: () => void          // Completar todas las seleccionadas
  onDelete: () => void                 // Eliminar seleccionadas
  onClearSelection: () => void         // Deseleccionar todo
  onSetDueDate?: () => void            // Placeholder Post-MVP
  onMoveToList?: () => void            // Placeholder Post-MVP
}
```

### 2.3 Props

| Prop | Tipo | Requerido | Descripción |
|---|---|---|---|
| `selectedCount` | `number` | Sí | Cantidad de tareas seleccionadas |
| `onMarkCompleted` | `() => void` | Sí | Completar todas |
| `onDelete` | `() => void` | Sí | Eliminar seleccionadas |
| `onClearSelection` | `() => void` | Sí | Limpiar selección |
| `onSetDueDate` | `() => void` | No | Placeholder |
| `onMoveToList` | `() => void` | No | Placeholder |

### 2.4 Estados

| Estado | Condición | UI |
|---|---|---|
| **Hidden** | `selectedCount === 0` | `display: none` / no renderizado |
| **Visible** | `selectedCount > 0` | Barra sticky con slide-in animation |

### 2.5 Estructura HTML

```html
<header className="sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-md
                   px-12 py-4 border-b border-primary/10 shadow-sm animate-slide-in">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-6">
      <button onClick={onClearSelection}
              className="flex items-center justify-center w-8 h-8 rounded-full
                         hover:bg-surface-variant transition-colors"
              aria-label="Clear selection">
        <span className="material-symbols-outlined text-primary">close</span>
      </button>
      <span className="font-headline-md text-primary font-bold">
        {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
      </span>
    </div>
    <div className="flex items-center gap-2">
      <button onClick={onMarkCompleted}
              className="flex items-center gap-2 px-4 py-2 text-on-surface-variant
                         hover:bg-surface-variant transition-all rounded-lg font-label-sm">
        <span className="material-symbols-outlined text-primary">check_circle</span>
        Mark as completed
      </button>
      <button onClick={onSetDueDate}
              className="flex items-center gap-2 px-4 py-2 text-on-surface-variant
                         hover:bg-surface-variant transition-all rounded-lg font-label-sm">
        <span className="material-symbols-outlined text-primary">event_upcoming</span>
        Set due date
      </button>
      <button onClick={onMoveToList}
              className="flex items-center gap-2 px-4 py-2 text-on-surface-variant
                         hover:bg-surface-variant transition-all rounded-lg font-label-sm">
        <span className="material-symbols-outlined text-primary">drive_file_move</span>
        Move to...
      </button>
      <div className="w-[1px] h-6 bg-outline-variant mx-2"></div>
      <button onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 text-error
                         hover:bg-error-container/20 transition-all rounded-lg font-label-sm">
        <span className="material-symbols-outlined">delete</span>
        Delete
      </button>
    </div>
  </div>
</header>
```

### 2.6 Animación

```css
/* Definida en tailwind.config.ts */
@keyframes slide-in {
  0% { transform: translateY(-20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.animate-slide-in {
  animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

## 3. Integración con TaskItem y TaskList

```
TaskList
  ├── state: selectedIds: Set<number>        ← IDs seleccionados
  ├── state: showBulkBar: boolean            ← selectedIds.size > 0
  │
  ├── render: TaskItem[]                     ← cada item recibe:
  │   ├── task: Task
  │   ├── selected: selectedIds.has(task.id)
  │   └── onToggle → useToggleTask mutation
  │
  ├── render: BulkActionBar (condicional)    ← cuando selectedIds.size > 0
  │   ├── selectedCount: selectedIds.size
  │   ├── onMarkCompleted → toggle all selected
  │   └── onDelete → delete all selected
  │
  └── render: TaskCheckbox (dentro de TaskItem)
      ├── checked: task.status === 'completed'
      └── onToggle: toggle individual
```

## 4. Dependencias

| Dependencia | Uso | Disponible |
|---|---|---|
| `react` | `useState`, `useCallback` | ✅ |
| `@tanstack/react-query` | `useMutation`, `useQueryClient` | ✅ |
| `@/payload-types` | `Task` type | ✅ |
| `@/hooks/useTasks` | `useToggleTask` mutation | ❌ Act 6 |

**Plan de contingencia:** Si `useToggleTask` (Act 6) no existe, implementar fetch directo a `PATCH /api/tasks/{id}` con rollback manual.
