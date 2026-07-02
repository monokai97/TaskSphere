# Actividad 1: Implementar TaskDetail — Estrategia de Pruebas

## 1. Pruebas de Integración (`tests/int/`)

### 1.1 `task-detail.int.spec.ts` — API de detalle de tarea

```typescript
// archivo: tests/int/task-detail.int.spec.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { getPayload } from 'payload'
import config from '@payload-config'

describe('TaskDetail API', () => {
  let payload: any
  let guestId: string
  let taskId: number
  let listId: number

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    guestId = crypto.randomUUID()

    // Crear lista default
    const list = await payload.create({
      collection: 'lists',
      data: { name: 'Test List', icon: 'list', guestId },
    })
    listId = list.id

    // Crear tarea de prueba
    const task = await payload.create({
      collection: 'tasks',
      data: {
        title: 'Test task for detail panel',
        status: 'pending',
        guestId,
        list: listId,
        description: 'Initial notes content',
        subtasks: [
          { title: 'Substep 1', completed: false },
          { title: 'Substep 2', completed: true },
        ],
      },
    })
    taskId = task.id
  })

  it('should fetch a single task by id', async () => {
    const task = await payload.findByID({
      collection: 'tasks',
      id: taskId,
    })
    expect(task.id).toBe(taskId)
    expect(task.title).toBe('Test task for detail panel')
    expect(task.description).toBe('Initial notes content')
    expect(task.subtasks).toHaveLength(2)
  })

  it('should update task title via PATCH', async () => {
    const updated = await payload.update({
      collection: 'tasks',
      id: taskId,
      data: { title: 'Updated title' },
    })
    expect(updated.title).toBe('Updated title')
  })

  it('should update task description via PATCH', async () => {
    const updated = await payload.update({
      collection: 'tasks',
      id: taskId,
      data: { description: 'Updated notes with more detail' },
    })
    expect(updated.description).toBe('Updated notes with more detail')
  })

  it('should update dueDate via PATCH', async () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString()
    const updated = await payload.update({
      collection: 'tasks',
      id: taskId,
      data: { dueDate: tomorrow },
    })
    expect(updated.dueDate).toBe(tomorrow)
  })

  it('should clear dueDate via PATCH with null', async () => {
    const updated = await payload.update({
      collection: 'tasks',
      id: taskId,
      data: { dueDate: null },
    })
    expect(updated.dueDate).toBeNull()
  })

  it('should update subtasks array via PATCH', async () => {
    const newSubtasks = [
      { title: 'Step A', completed: true },
      { title: 'Step B', completed: false },
    ]
    const updated = await payload.update({
      collection: 'tasks',
      id: taskId,
      data: { subtasks: newSubtasks },
    })
    expect(updated.subtasks).toHaveLength(2)
    expect(updated.subtasks[0].title).toBe('Step A')
    expect(updated.subtasks[0].completed).toBe(true)
  })

  it('should toggle subtask completion', async () => {
    const task = await payload.findByID({ collection: 'tasks', id: taskId })
    const subtasks = task.subtasks!.map((s: any, i: number) =>
      i === 0 ? { ...s, completed: !s.completed } : s,
    )
    const updated = await payload.update({
      collection: 'tasks',
      id: taskId,
      data: { subtasks },
    })
    expect(updated.subtasks[0].completed).toBe(false) // toggled back
  })

  it('should change task list/relationship', async () => {
    const newList = await payload.create({
      collection: 'lists',
      data: { name: 'New Category', icon: 'work', guestId },
    })
    const updated = await payload.update({
      collection: 'tasks',
      id: taskId,
      data: { list: newList.id },
    })
    expect(updated.list).toBe(newList.id)
  })

  it('should delete task', async () => {
    await payload.delete({ collection: 'tasks', id: taskId })
    const exists = await payload.findByID({ collection: 'tasks', id: taskId }).catch(() => null)
    expect(exists).toBeNull()
  })
})
```

### 1.2 Casos borde adicionales

| Test | Descripción |
|---|---|
| `GET /api/tasks/:id with invalid id returns 404` | API route debe retornar 404 |
| `GET /api/tasks/:id with wrong guestId returns 404` | Access control: no ver tareas de otro guest |
| `PATCH title with empty string returns 400` | Zod validation: min 3 chars |
| `PATCH status with invalid value returns 400` | Zod validation: solo 'pending' \| 'completed' |
| `DELETE non-existent task returns 404` | Manejo de recurso no encontrado |
| `subtasks empty array is valid` | Subtasks puede ser `[]` |
| `subtasks with missing title returns 400` | Array item title es required |
| `dueDate with invalid date format returns 400` | Zod validation: datetime string |

## 2. Pruebas Unitarias (Vitest + jsdom)

### 2.1 TaskDatePicker
```typescript
describe('TaskDatePicker', () => {
  it('renders "Set due date" placeholder when no date')
  it('renders "Due Today" when dueDate is today')
  it('renders "Due Tomorrow" when dueDate is tomorrow')
  it('renders formatted date for future dates')
  it('calls useUpdateTask with dueDate when "Tomorrow" clicked')
  it('calls useUpdateTask with null when × clicked')
  it('calls useUpdateTask with selected date on input change')
})
```

### 2.2 TaskNotes
```typescript
describe('TaskNotes', () => {
  it('renders textarea with initial description value')
  it('shows placeholder when description is null')
  it('debounces save by 800ms after typing')
  it('shows "Saving..." indicator during mutation')
  it('shows "Saved" indicator for 2s after mutation')
  it('does not save if value unchanged from last saved')
  it('textarea has h-48 height class')
})
```

### 2.3 TaskSubsteps
```typescript
describe('TaskSubsteps', () => {
  it('renders list of substeps with checkboxes')
  it('renders "Add step" input at bottom')
  it('adds substep on Enter with non-empty value')
  it('does not add substep on Enter with empty value')
  it('clears input after adding substep')
  it('toggles substep completed on checkbox click')
  it('calls useUpdateTask with updated subtasks array')
  it('applies animate-slide-in to new substep')
})
```

### 2.4 TaskListPicker
```typescript
describe('TaskListPicker', () => {
  it('renders current list name and icon')
  it('opens dropdown on click')
  it('shows all guest lists in dropdown')
  it('marks current list as selected in dropdown')
  it('calls useUpdateTask with new listId on selection')
  it('closes dropdown after selection')
  it('closes dropdown on click outside')
})
```

### 2.5 TaskDetail (orquestador)
```typescript
describe('TaskDetail', () => {
  it('renders EmptyState when taskId is null')
  it('renders skeleton when loading')
  it('renders full detail view when task loaded')
  it('renders error fallback when query fails')
  it('retries fetch on Retry button click')
  it('calls onClose when close button clicked')
  it('calls onDelete when task deleted')
  it('cleans up interval for createdAt formatting')
})
```

## 3. Pruebas E2E (Playwright)

### 3.1 `tests/e2e/task-detail.e2e.spec.ts`

```typescript
// Escenarios clave
test('should open detail panel when clicking a task', async ({ page }) => {
  // 1. Navigate to /my-day
  // 2. Wait for tasks to load
  // 3. Click first task item
  // 4. Assert DetailPanel is visible with task title
})

test('should close detail panel via close button', async ({ page }) => {
  // 1. Open task detail
  // 2. Click close (chevron_right) button
  // 3. Assert panel is hidden/closed
})

test('should toggle task status from detail panel', async ({ page }) => {
  // 1. Open task detail
  // 2. Click checkbox in detail header
  // 3. Assert task status updated (line-through in list)
})

test('should edit title inline and save', async ({ page }) => {
  // 1. Open task detail
  // 2. Click title to enter edit mode
  // 3. Type new title
  // 4. Press Enter
  // 5. Assert title updated in list
})

test('should add substep and toggle it', async ({ page }) => {
  // 1. Open task detail
  // 2. Type in "Add step" input
  // 3. Press Enter
  // 4. Assert new substep appears in list
  // 5. Click substep checkbox
  // 6. Assert substep marked completed
})

test('should select due date via calendar', async ({ page }) => {
  // 1. Open task detail
  // 2. Click date input or "Tomorrow"
  // 3. Assert due date displayed
})

test('should change list/category', async ({ page }) => {
  // 1. Open task detail
  // 2. Click "Pick a category"
  // 3. Select different list
  // 4. Assert task moved to new list (after navigating)
})

test('should save notes with debounce', async ({ page }) => {
  // 1. Open task detail
  // 2. Type in notes textarea
  // 3. Wait 1s (800ms debounce + network)
  // 4. Refresh page
  // 5. Open same task
  // 6. Assert notes persisted
})

test('should delete task with confirmation', async ({ page }) => {
  // 1. Open task detail
  // 2. Click delete button
  // 3. Accept confirmation dialog
  // 4. Assert task removed from list
  // 5. Assert panel returns to idle state
})

test('should show loading skeleton while fetching', async ({ page }) => {
  // 1. Intercept API and add delay
  // 2. Click task
  // 3. Assert skeleton visible during loading
})

test('should show error state and retry on failure', async ({ page }) => {
  // 1. Intercept API to return 500
  // 2. Click task
  // 3. Assert error message visible
  // 4. Click Retry
  // 5. Assert loading shown again
})

test('should handle rapid toggle of important star', async ({ page }) => {
  // 1. Open task detail
  // 2. Click star rapidly 3 times
  // 3. Assert final state is correct
  // 4. Refresh and verify persisted state
})
```

### 3.2 Configuración de Playwright

```typescript
// playwright.config.ts (añadir al proyecto existente)
{
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1440, height: 900 }, // Desktop con panel visible
  },
}
```

## 4. Resumen de Cobertura

| Tipo | Archivo | Tests | Prioridad |
|---|---|---|---|
| Integration | `task-detail.int.spec.ts` | 10 | Alta |
| Unit | `TaskDatePicker` | 7 | Alta |
| Unit | `TaskNotes` | 7 | Alta |
| Unit | `TaskSubsteps` | 7 | Alta |
| Unit | `TaskListPicker` | 6 | Alta |
| Unit | `TaskDetail` | 7 | Alta |
| E2E | `task-detail.e2e.spec.ts` | 11 | Media |
| **Total** | | **≥ 55** | |
