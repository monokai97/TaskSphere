# Tests: Componente TaskList + Skeleton

## Estrategia

Tres capas: (1) **unitario** con Vitest + jsdom para renderizado, estados y mocking de fetch, (2) **integración** con TanStack Query Provider, (3) **e2e** con Playwright para flujo completo.

---

## 1. Tests Unitarios (Vitest + jsdom)

**Archivo:** `tests/int/task-list.int.spec.ts`

### 1.1 Setup

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskList } from '@/components/tasks/TaskList'

const mockTasks = {
  docs: [
    {
      id: 1, title: 'Task 1', status: 'pending', important: false,
      dueDate: null, list: { id: 1, name: 'My Day', icon: 'today' },
      guestId: 'test', sortOrder: 0, completedAt: null, subtasks: null,
      description: null, updatedAt: '', createdAt: '',
    },
    {
      id: 2, title: 'Task 2', status: 'completed', important: true,
      dueDate: '2025-01-05T00:00:00.000Z',
      list: { id: 1, name: 'My Day', icon: 'today' },
      guestId: 'test', sortOrder: 1, completedAt: '2025-01-01T00:00:00.000Z',
      subtasks: null, description: null, updatedAt: '', createdAt: '',
    },
  ],
  totalDocs: 2,
}
```

### 1.2 Skeleton Tests

| # | Test | Assertion |
|---|---|---|
| S1 | Renderiza 5 skeletons por defecto | `screen.getAllByRole('presentation')` length === 5 |
| S2 | Skeleton tiene animate-pulse | Cada skeleton tiene clase `animate-pulse` |
| S3 | Skeleton respeta count prop | `count={3}` → 3 skeletons |
| S4 | Skeleton acepta className extra | `className="w-24"` se aplica al div |
| S5 | Skeleton tiene border-radius correcto | Clase `rounded-xl` presente |

### 1.3 TaskList Tests

#### Estado Loading

| # | Test | Setup | Assertion |
|---|---|---|---|
| T1 | Muestra skeletons durante carga | fetch nunca resuelve | 5 skeletons visibles en el DOM |
| T2 | No muestra EmptyState durante carga | fetch nunca resuelve | EmptyState no está en el DOM |

#### Estado Empty

| # | Test | Setup | Assertion |
|---|---|---|---|
| T3 | Muestra EmptyState cuando docs vacío | fetch retorna `{ docs: [] }` | EmptyState visible |
| T4 | Muestra título default | fetch retorna vacío | "No tasks yet" visible |
| T5 | Acepta emptyState props custom | `emptyState={{ title: 'Custom' }}` | "Custom" visible en lugar del default |
| T6 | Muestra icono default | fetch retorna vacío | Icono `task_alt` presente |

#### Estado Data

| # | Test | Setup | Assertion |
|---|---|---|---|
| T7 | Renderiza TaskItem por cada tarea | fetch retorna 2 tasks | 2 TaskItems en el DOM |
| T8 | Pasa correct props a TaskItem | fetch retorna 2 tasks | Título "Task 1" y "Task 2" visibles |
| T9 | Tarea completada se ve distinta | task con status='completed' | Título con clase `line-through` |
| T10 | Tarea importante se ve distinta | task con important=true | Estrella con fill activo |

#### Estado Error

| # | Test | Setup | Assertion |
|---|---|---|---|
| T11 | Muestra mensaje de error | fetch lanza 500 | "Something went wrong" visible |
| T12 | Muestra botón "Try again" | fetch lanza error | Botón presente |
| T13 | Click "Try again" reintenta fetch | fetch falla, luego éxito | Datos se renderizan tras reintento |

#### Transiciones

| # | Test | Steps | Assertion |
|---|---|---|---|
| T14 | Loading→Data sin flash | fetch resuelve rápido | No hay parpadeo del empty state |
| T15 | Loading→Error→Data | fetch falla, click try again, fetch éxito | Error se reemplaza por datos |

---

## 2. Tests de Integración (con TanStack Query)

**Archivo:** `tests/int/task-list-query.int.spec.ts`

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TaskList } from '@/components/tasks/TaskList'

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}
```

| # | Test | Assertion |
|---|---|---|
| Q1 | Hook useTasks se integra con TaskList | Datos se renderizan correctamente via hook |
| Q2 | Cache de useTasks evita re-fetch | Segunda renderización del mismo listId no dispara fetch |

---

## 3. Tests E2E (Playwright)

**Archivo:** `tests/e2e/tasks.e2e.spec.ts`

| # | Scenario | Steps | Assertions |
|---|---|---|---|
| E1 | Stack con tareas muestra lista | 1. Navegar a stack con datos | TaskItems visibles, scroll vertical funciona |
| E2 | Stack vacío muestra EmptyState | 1. Navegar a lista sin tareas | EmptyState con icono y mensaje visible |
| E3 | Loading state se ve durante carga | 1. Navegar a stack (red lenta) | Skeletons visibles, luego reemplazados por datos |
| E4 | Error state con recovery | 1. Bloquear API (route interception) | Error visible, click "Try again" restaura |
| E5 | Múltiples stacks con diferentes datos | 1. Crear tarea en My Day<br>2. Ir a Important | My Day muestra la tarea, Important no |

### 3.1 Playwright Route Interception (para E4)

```typescript
await page.route('**/api/tasks**', (route) => {
  if (shouldFail) {
    route.fulfill({ status: 500, body: 'Server error' })
  } else {
    route.continue()
  }
})
```

---

## 4. Matriz de Cobertura

| Funcionalidad | Unitario | Integración | E2E |
|---|---|---|---|
| Skeleton count default | S1 | — | — |
| Skeleton animación | S2 | — | E3 |
| Skeleton props | S3, S4, S5 | — | — |
| Loading state | T1, T2 | — | E3 |
| Empty state default | T3, T4 | — | E2 |
| Empty state custom | T5, T6 | — | — |
| Data state | T7-T10 | Q1, Q2 | E1, E5 |
| Error state | T11-T13 | — | E4 |
| Transiciones | T14, T15 | — | E3, E4 |
| Cache | — | Q2 | — |

---

## 5. Ejecución

```bash
# Unitarios + Integración
pnpm test:int

# E2E
pnpm test:e2e

# Coverage
pnpm test:int -- --coverage
```

**Cobertura mínima:** 85% en unitarios, 100% de estados (loading/empty/data/error) cubiertos.
