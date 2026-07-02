# Actividad 1: Implementar TaskDetail — Especificación Técnica

## 1. Requisitos Funcionales

### 1.1 Panel de Detalle (TaskDetail)
| ID | Requisito | Prioridad |
|---|---|---|
| F1 | El panel se renderiza dentro de `DetailPanel` (384px) al seleccionar una tarea desde TaskList | Alta |
| F2 | Muestra 4 estados: `idle` (panel vacío con mensaje), `loading` (skeleton), `detail` (contenido completo), `error` (fallback con retry) | Alta |
| F3 | Estado idle: muestra "Select a task" con icono de flecha izquierda | Alta |
| F4 | Estado loading: 3 skeleton lines animadas (pulse) para header + 2 líneas para secciones | Alta |
| F5 | Estado error: mensaje "Could not load task details" + botón "Retry" | Media |
| F6 | Botón de cerrar panel (visible solo en mobile) que dispara `onClose` | Alta |
| F7 | Título de la tarea editable inline; al hacer blur o Enter, dispara `useUpdateTask` | Alta |

### 1.2 Header (Checkbox + Título + Estrella)
| ID | Requisito | Prioridad |
|---|---|---|
| F8 | Checkbox circular `TaskCheckbox` sincronizado con `task.status` | Alta |
| F9 | Al click checkbox: optimistic update vía `useToggleTask` | Alta |
| F10 | Estrella (importante) toggleable; optimistic update vía `useToggleImportant` | Alta |
| F11 | Título editable inline: al focus se convierte en input, al blur/Enter envía PATCH | Alta |

### 1.3 Secciones de Acción
| ID | Requisito | Prioridad |
|---|---|---|
| F12 | Sección "Add step": input inline para agregar sub-paso a `task.subtasks` | Alta |
| F13 | "Remind me": placeholder visual sin lógica (post-MVP) | Baja |
| F14 | Due Date: componente `TaskDatePicker` con input date nativo + botón "Tomorrow" | Alta |
| F15 | "Repeat": placeholder visual sin lógica (post-MVP) | Baja |
| F16 | "Pick a category": `TaskListPicker` que muestra listas del guest con icono + color | Alta |
| F17 | Al seleccionar lista, PATCH `task.list` con el nuevo ID | Alta |

### 1.4 Notas
| ID | Requisito | Prioridad |
|---|---|---|
| F18 | Textarea expandible de altura fija (192px) | Alta |
| F19 | Auto-guardado con debounce de 800ms: al dejar de escribir, envía PATCH `task.description` | Alta |
| F20 | Indicador visual de guardado: "Saving..." → "Saved" por 2 segundos | Media |

### 1.5 Sub-pasos
| ID | Requisito | Prioridad |
|---|---|---|
| F21 | Lista de sub-pasos con checkbox individual + título | Alta |
| F22 | Input inline "Add step" al final de la lista | Alta |
| F23 | Checkbox de sub-paso hace PATCH `task.subtasks` con el array actualizado | Alta |
| F24 | Animación fade-in al agregar nuevo sub-paso | Baja |
| F25 | Enter en input vacío no agrega sub-paso | Media |

### 1.6 Footer
| ID | Requisito | Prioridad |
|---|---|---|
| F26 | Botón de eliminar con icono `delete` (rojo en hover) | Alta |
| F27 | Confirmación antes de eliminar: alert nativo `confirm()` o toast con "Undo" | Media |
| F28 | Texto "Created X ago" con `createdAt` formateado (ej. "Created 3 hours ago") | Alta |
| F29 | Botón chevron_right para cerrar panel (alias de onClose) | Media |

## 2. Contratos de Datos

### 2.1 Payload Types (de `src/payload-types.ts`)
```typescript
interface Task {
  id: number
  title: string
  description?: string | null      // Notes section
  status: 'pending' | 'completed'
  important?: boolean | null
  dueDate?: string | null          // ISO 8601
  list: number | List              // relationship
  guestId: string
  subtasks?: {
    title: string
    completed?: boolean | null
    id?: string | null
  }[] | null
  createdAt: string
  updatedAt: string
}
```

### 2.2 TaskDetail Props
```typescript
interface TaskDetailProps {
  taskId: number | null        // null = idle state
  onClose: () => void
  onDelete?: (taskId: number) => void  // callback post-delete
}

type TaskDetailState = 'idle' | 'loading' | 'detail' | 'error'
```

### 2.3 Subcomponent Props

**TaskDatePicker**
```typescript
interface TaskDatePickerProps {
  dueDate?: string | null
  taskId: number
  onUpdate?: () => void
}
```

**TaskNotes**
```typescript
interface TaskNotesProps {
  description?: string | null
  taskId: number
}
```

**TaskSubsteps**
```typescript
interface TaskSubstepsProps {
  subtasks?: Task['subtasks']
  taskId: number
}
```

**TaskListPicker**
```typescript
interface TaskListPickerProps {
  currentListId: number | string
  taskId: number
}
```

### 2.4 Estado interno de TaskDetail
```typescript
interface TaskDetailLocalState {
  selectedTask: Task | null
  state: TaskDetailState
  title: string
  isEditingTitle: boolean
}
```

## 3. Hooks Requeridos (de Phase 4)

| Hook | Método | Endpoint | Uso |
|---|---|---|---|
| `useTask(id)` | `useQuery` | `GET /api/tasks/[id]` | Fetch individual task para el panel |
| `useUpdateTask()` | `useMutation` | `PATCH /api/tasks/[id]` | Actualizar title, description, dueDate, list, subtasks |
| `useToggleTask()` | `useMutation` | `PATCH /api/tasks/[id]` | Optimistic toggle de status |
| `useToggleImportant()` | `useMutation` | `PATCH /api/tasks/[id]` | Optimistic toggle de important |
| `useDeleteTask()` | `useMutation` | `DELETE /api/tasks/[id]` | Optimistic delete con invalidación |

## 4. Estados de la UI

```
idle:   ┌─────────────────────┐
        │  ← Select a task    │
        └─────────────────────┘

loading: ┌─────────────────────┐
         │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  skeleton pulse
         │  ▓▓▓▓▓▓            │
         │  ▓▓▓▓▓▓▓▓▓▓        │
         │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
         └─────────────────────┘

detail:  ┌─────────────────────┐
         │ ◯ Title ★           │
         │ + Add step          │
         │ 🔔 Remind me        │
         │ 📅 Due: Tomorrow ×  │
         │ 🔄 Repeat           │
         │ 🏷️ Pick a category │
         │ 📝 Notes            │  textarea
         │                     │
         ├─────────────────────┤
         │ 🗑️  Created 3h ago  │
         └─────────────────────┘

error:   ┌─────────────────────┐
         │ ⚠️ Could not load  │
         │ [Retry]            │
         └─────────────────────┘
```
