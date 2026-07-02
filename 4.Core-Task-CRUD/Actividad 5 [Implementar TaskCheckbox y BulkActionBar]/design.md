# Design: Mapeo UI → CMS — TaskCheckbox + BulkActionBar

## 1. Visual Mapping: HTML → Componentes → Payload

| Elemento HTML (2.Stack My Day) | Componente | Payload Field | Operación |
|---|---|---|---|
| `input[type=checkbox].rounded-full.border-2` (pending) | TaskCheckbox unchecked | `task.status = 'pending'` | — |
| `input[checked].rounded-full.border-primary` (checked) | TaskCheckbox checked | `task.status = 'completed'` | PATCH status |
| `div.w-6.h-6.rounded-full.bg-primary + check` (completed task) | TaskCheckbox completed | `task.status = 'completed'`, `task.completedAt` | PATCH + date |
| `header.sticky.bulk-action-bar` | BulkActionBar | — (orquestador) | — |
| `span "3 items selected"` | Contador | `selectedCount` prop | — |
| `button.check_circle "Mark as completed"` | Botón completar | `tasks[].status = 'completed'` | PATCH batch |
| `button.delete "Delete"` | Botón eliminar | `tasks[].id` | DELETE batch |
| `button.event_upcoming` | Placeholder | — | Post-MVP |
| `button.drive_file_move` | Placeholder | — | Post-MVP |

## 2. Diagrama de Árbol de Componentes

```mermaid
graph TD
    subgraph "TaskList"
        TL[TaskList]
        TL --> STATE[selectedIds: Set]
        TL --> TI1[TaskItem 1]
        TL --> TI2[TaskItem ...n]
        TL --> BAB[BulkActionBar]
    end

    subgraph "TaskItem (Act 2)"
        TI[TaskItem]
        TI --> CB[TaskCheckbox]
        TI --> TITLE[título]
        TI --> STAR[estrella]
    end

    subgraph "TaskCheckbox (Act 5)"
        CB[TaskCheckbox<br/>'use client']
        CB -->|onToggle| MUT
    end

    subgraph "BulkActionBar (Act 5)"
        BAB[BulkActionBar<br/>'use client']
        BAB -->|onMarkCompleted| BM[Batch complete]
        BAB -->|onDelete| BD[Batch delete]
        BAB -->|onClearSelection| CS[Deselect all]
    end

    subgraph "Mutations"
        MUT[useToggleTask<br/>optimistic update]
        BM[useBulkComplete<br/>optimistic updates]
        BD[useBulkDelete<br/>optimistic updates]
    end
```

## 3. Optimistic Update Flow (TaskCheckbox)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant TI as TaskItem
    participant CB as TaskCheckbox
    participant RQ as TanStack Query
    participant API as PATCH /api/tasks/{id}
    participant PC as PayloadCMS

    U->>CB: Click checkbox
    CB->>TI: onToggle()
    TI->>RQ: useToggleTask().mutate({ id, status: 'completed' })

    Note over RQ: === onMutate ===
    RQ->>RQ: Cancel ongoing queries
    RQ->>RQ: Snapshot current cache
    RQ->>RQ: Update cache immediately (UI cambia)

    RQ-->>TI: Re-render con optimist update
    TI-->>U: Checkbox se llena, texto se tacha

    Note over RQ: === mutationFn ===
    RQ->>API: PATCH /api/tasks/1 { status: 'completed' }
    API->>PC: payload.update()
    PC->>PC: Hook afterChange → TaskLog
    PC-->>API: { task updated }
    API-->>RQ: 200 OK

    Note over RQ: === onSettled ===
    RQ->>RQ: invalidateQueries(['tasks'])
    
    alt Error
        Note over RQ: === onError ===
        RQ->>RQ: Restore snapshot
        RQ-->>TI: Rollback UI
        TI-->>U: Checkbox vuelve a estado anterior
        U-->>U: (toast opcional: "Error al guardar")
    end
```

## 4. BulkActionBar State Machine

```mermaid
stateDiagram-v2
    [*] --> Hidden
    
    Hidden --> Visible: selectedCount > 0
    Visible --> Hidden: selectedCount = 0 (clearSelection)
    
    state Visible {
        [*] --> Idle
        Idle --> Completing: onMarkCompleted
        Idle --> Deleting: onDelete
        Completing --> Idle: success
        Deleting --> Idle: success
        Completing --> Idle: error
        Deleting --> Idle: error
    }
```

## 5. Tipos TypeScript

```typescript
// TaskCheckbox props
interface TaskCheckboxProps {
  checked: boolean
  onToggle: () => void
  disabled?: boolean
  size?: 'sm' | 'md'       // sm=20px, md=24px
}

// BulkActionBar props
interface BulkActionBarProps {
  selectedCount: number
  onMarkCompleted: () => void
  onDelete: () => void
  onClearSelection: () => void
  onSetDueDate?: () => void
  onMoveToList?: () => void
}

// Mutación Toggle (definida en Act 6)
interface ToggleTaskParams {
  id: number
  status: 'pending' | 'completed'
}

// Task type (payload-types.ts)
export interface Task {
  id: number
  title: string
  status: 'pending' | 'completed'
  important?: boolean | null
  completedAt?: string | null
  // ... otros campos
}
```

## 6. Selección Múltiple: Modelo de Datos en TaskList

```typescript
// En TaskList (Act 3) — estado de selección
const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

const toggleSelection = useCallback((id: number) => {
  setSelectedIds(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })
}, [])

const clearSelection = useCallback(() => {
  setSelectedIds(new Set())
}, [])

// Pasar a TaskItem
<TaskItem
  task={task}
  selected={selectedIds.has(task.id)}
  onSelect={() => toggleSelection(task.id)}  // Modo selección (checkbox adicional o long-press)
  onToggle={handleToggle}                     // Modo normal (checkbox principal)
/>

// Pasar a BulkActionBar
{selectedIds.size > 0 && (
  <BulkActionBar
    selectedCount={selectedIds.size}
    onMarkCompleted={() => bulkComplete(selectedIds)}
    onDelete={() => bulkDelete(selectedIds)}
    onClearSelection={clearSelection}
  />
)}
```

## 7. Responsive: BulkActionBar en Mobile

| Breakpoint | Layout | Comportamiento |
|---|---|---|
| Desktop (≥1024px) | Todos los botones visibles en fila | Igual que HTML |
| Tablet (768-1023px) | Botones colapsados, solo iconos | Tooltips en hover |
| Mobile (<768px) | Drawer desde abajo con acciones | Overlay + bottom sheet |

Para MVP: en mobile, los botones muestran solo el icono sin texto (tooltip opcional).
