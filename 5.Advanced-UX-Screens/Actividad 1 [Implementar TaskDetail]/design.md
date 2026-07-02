# Actividad 1: Implementar TaskDetail — Diseño UI-a-CMS

## 1. Visual Mapping: HTML → Payload CMS

| Elemento HTML (3.Task Details.html) | Línea(s) | Componente React | Campo Payload | Tipo | Notas |
|---|---|---|---|---|---|
| Panel derecho `<aside class="w-detail-panel-width">` | 283 | `DetailPanel` (existente) | — | Layout | Container glassmorphism 384px |
| Checkbox circular vacío | 289 | `TaskCheckbox` | `task.status` | `select` | `pending` / `completed` |
| `<h2>Finalize the Quarterly Report deck</h2>` | 291 | `TaskInlineTitle` | `task.title` | `text` | Inline-edit con contentEditable o input |
| `<span>star</span>` con FILL=1 | 292-294 | `ImportantToggle` | `task.important` | `checkbox` | Optimistic update, icono filled/outline |
| "Add step" + icono add | 298-301 | `TaskSubsteps` | `task.subtasks` | `array` | Input inline, Enter crea `{ title, completed: false }` |
| "Remind me" + icono notifications | 303-306 | `PlaceholderRow` | — | — | No implementar, solo UI visual |
| "Due Today ×" con icono calendar_today | 307-313 | `TaskDatePicker` | `task.dueDate` | `date` | Botón "Tomorrow" + date input nativo + botón × para limpiar |
| "Repeat" + icono repeat | 314-317 | `PlaceholderRow` | — | — | No implementar, solo UI visual |
| "Pick a category" + icono sell | 321-326 | `TaskListPicker` | `task.list` | `relationship` | Muestra listas del guest con icono+color, modal/dropdown |
| `<textarea>` Notes | 332-336 | `TaskNotes` | `task.description` | `textarea` | Auto-guardado con debounce 800ms |
| Botón delete + icono delete | 341-343 | `DeleteButton` | DELETE operation | — | `confirm()` antes de eliminar, luego `useDeleteTask` |
| "Created 3 hours ago" | 344 | `CreatedAtBadge` | `task.createdAt` | `date` | Formateado con `formatDistanceToNow` |
| Chevron right (cerrar) | 345-347 | `CloseButton` | — | — | Dispara `onClose` |

### Placeholders sin lógica (post-MVP)
- "Remind me" — requeriría notificaciones push y tabla `reminders`
- "Repeat" — requeriría lógica de recurrencia (cron-based task duplication)

## 2. Diagrama de Componentes

```
StacksLayout (app/(frontend)/(stacks)/layout.tsx)
├── Sidebar
├── <main>
│   └── {children} ← StackPage (my-day, important, planned, tasks)
│       └── StackShell (client component)
│           ├── TopBar
│           ├── TaskList
│           │   ├── TaskItem[]
│           │   │   ├── TaskCheckbox
│           │   │   └── TaskInlineTitle
│           │   └── AddTaskBar
│           └── BulkActionBar (condicional)
└── DetailPanel (open={!!selectedTaskId} onClose={deselect})
    ├── TaskDetail (taskId, onClose, onDelete)
    │   ├── TaskCheckbox (status)
    │   ├── ImportantToggle (important)
    │   ├── TaskInlineTitle (title)
    │   ├── TaskSubsteps (subtasks)
    │   ├── TaskDatePicker (dueDate)
    │   ├── TaskListPicker (list)
    │   ├── TaskNotes (description)
    │   └── Footer
    │       ├── DeleteButton
    │       └── CreatedAtBadge
    └── EmptyState (idle) o Skeleton (loading)
```

## 3. Flujo de Datos

### 3.1 Apertura del panel
```
User clicks TaskItem in TaskList
  → StackShell state: setSelectedTaskId(task.id)
  → DetailPanel open={true}
    → TaskDetail recibe taskId
      → useTask(taskId) fetch GET /api/tasks/{id}
      → Estado: idle → loading → detail
```

### 3.2 Edición de título
```
User clicks title → isEditingTitle = true
User types → local state updates (no fetch)
User presses Enter or blurs → PATCH /api/tasks/{id} { title }
  → onMutate: optimistic update en cache ['tasks', taskId]
  → onError: rollback
  → onSettled: invalidateQueries(['tasks'])
```

### 3.3 Auto-guardado de notas
```
User types in Textarea
  → setDescription local (immediate UX)
  → clearTimeout(existingDebounce)
  → setTimeout 800ms
    → PATCH /api/tasks/{id} { description }
    → show "Saving..." → "Saved" 2s
```

### 3.4 Toggle de sub-paso
```
User clicks checkbox on subtask[i]
  → Map subtasks, toggle subtask[i].completed
  → PATCH /api/tasks/{id} { subtasks: updatedArray }
  → Optimistic update (no rollback en sub-pasos por simplicidad)
```

## 4. Esquema de Base de Datos (PayloadCMS)

No se requieren cambios. La colección `tasks` ya incluye todos los campos necesarios:

```
tasks
├── id: number (PK)
├── title: text (required)
├── description: textarea (notes)
├── status: 'pending' | 'completed'
├── important: boolean
├── dueDate: date
├── list: relationship → lists
├── guestId: text (indexed)
├── sortOrder: number
├── completedAt: date
├── subtasks: array
│   ├── title: text (required)
│   ├── completed: boolean
│   └── id: text (auto)
├── createdAt: date (auto)
└── updatedAt: date (auto)
```

## 5. Tipos TypeScript (payload-types.ts relevantes)

```typescript
// Ya existen — no requieren modificación
interface Task {
  id: number
  title: string
  description?: string | null
  status: 'pending' | 'completed'
  important?: boolean | null
  dueDate?: string | null
  list: number | List
  guestId: string
  subtasks?: Subtask[] | null
  createdAt: string
  updatedAt: string
}

interface Subtask {
  title: string
  completed?: boolean | null
  id?: string | null
}

interface List {
  id: number
  name: string
  icon?: string | null
  color?: string | null
  guestId: string
}
```

## 6. Patrón de Auto-guardado (Debounce)

```typescript
// useDebounce hook pattern
function useDebouncedSave(
  value: string,
  taskId: number,
  field: string,
  delay = 800,
) {
  const updateTask = useUpdateTask()

  useEffect(() => {
    if (!value) return
    const timer = setTimeout(() => {
      updateTask.mutate({ id: taskId, [field]: value })
    }, delay)
    return () => clearTimeout(timer)
  }, [value, taskId, field, delay, updateTask])
}
```

## 7. Diseño de Transiciones y Animaciones

| Elemento | Animación | CSS |
|---|---|---|
| Panel en mobile (abrir) | `translate-x-0` → visible | `transition-transform duration-300` |
| Panel en mobile (cerrar) | `translate-x-full` → oculto | `transition-transform duration-300` |
| Sub-paso nuevo | fade-in + slide-down | `animate-slide-in` (ya definido en tailwind.config) |
| Skeleton loading | pulse opacity | `animate-pulse` |
| Botón hover escala | scale(0.98) | `active:scale-[0.98] transition-transform` |
