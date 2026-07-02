# Tests: Hook useTasks — Suite TanStack Query

## Estrategia

Tres capas: (1) **unitario** para lógica de mutation callbacks (snapshot, rollback), (2) **integración** con QueryClientProvider y fetch mock para verificar cache, (3) **e2e** para flujo completo.

---

## 1. Tests Unitarios (Vitest + jsdom)

**Archivo:** `tests/int/use-tasks.int.spec.ts`

### 1.1 Setup

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTasks, useCreateTask, useToggleTask, useDeleteTask, useUpdateTask } from '@/hooks/useTasks'
import type { Task } from '@/payload-types'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const mockTask: Task = {
  id: 1, title: 'Test task', status: 'pending', important: false,
  dueDate: null, list: 1, guestId: 'test', sortOrder: 0,
  completedAt: null, subtasks: null, description: null,
  updatedAt: '', createdAt: '',
}

const mockResponse = { docs: [mockTask], totalDocs: 1 }
```

### 1.2 useTasks Query Tests

| # | Test | Mock | Assertion |
|---|---|---|---|
| Q1 | Fetch con listId | fetch retorna mockResponse | `data?.docs[0].title === 'Test task'` |
| Q2 | Fetch con status filter | fetch llamado con `?status=pending` | URL contiene `status=pending` |
| Q3 | Fetch sin parámetros | fetch llamado sin query params | URL es `/api/tasks?` |
| Q4 | Error state | fetch retorna 500 | `isError === true`, `error` definido |
| Q5 | Loading state | fetch lento (nunca resuelve) | `isLoading === true` |
| Q6 | Cache key con listId | fetch llamado 1 vez, re-montar | fetch no se llama segunda vez (cache hit) |

### 1.3 useCreateTask Tests

| # | Test | Mock | Assertion |
|---|---|---|---|
| C1 | POST con datos válidos | fetch retorna 201 + task | `mutateAsync` resuelve con task |
| C2 | POST con error | fetch retorna 400 | `mutateAsync` rechaza con error |
| C3 | Invalidación tras éxito | fetch retorna 201 | Queries con key ['tasks'] se refrescan |
| C4 | Sin optimistic update | fetch retorna 201 | Cache no cambia antes de la respuesta |

### 1.4 useToggleTask Tests (Optimistic)

| # | Test | Mock | Steps | Assertion |
|---|---|---|---|---|
| T1 | Optimistic: cache se actualiza inmediatamente | fetch lento | `mutate({ id:1, status:'completed' })` | Cache cambia antes de que fetch resuelva |
| T2 | Optimistic: status cambia a completed | fetch lento | mutate | `task.status === 'completed'` inmediatamente |
| T3 | Optimistic: completedAt se setea | fetch lento | mutate | `task.completedAt` no es null inmediatamente |
| T4 | Optimistic: rollback en error | fetch retorna 500 | mutate → error | Cache vuelve al estado original |
| T5 | Optimistic: rollback restaura completedAt | fetch retorna 500 | mutate → error | `task.completedAt` vuelve a null |
| T6 | Cancel queries antes de mutate | fetch en curso | mutate | Queries en curso se cancelan |
| T7 | Invalidación tras settled | fetch retorna 200 | mutate → success | Queries invalidated |

### 1.5 useDeleteTask Tests (Optimistic)

| # | Test | Mock | Steps | Assertion |
|---|---|---|---|---|
| D1 | Optimistic: item desaparece inmediatamente | fetch lento | mutate(1) | `docs.length === 0` inmediatamente |
| D2 | Optimistic: rollback restaura item | fetch retorna 500 | mutate → error | `docs.length === 1`, item restaurado |
| D3 | Fetch DELETE llamado con ID correcto | fetch retorna 200 | mutate(1) | fetch llamado con `DELETE /api/tasks/1` |
| D4 | Invalidación tras settled | fetch retorna 200 | mutate → success | Queries invalidated |

### 1.6 useUpdateTask Tests

| # | Test | Mock | Assertion |
|---|---|---|---|
| U1 | PATCH con datos válidos | fetch retorna 200 + task updated | `mutateAsync` resuelve |
| U2 | PATCH con título nuevo | fetch retorna 200 | URL es `/api/tasks/1`, método PATCH |
| U3 | Invalidación tras éxito | fetch retorna 200 | Queries invalidated |
| U4 | Sin optimistic update | fetch lento | Cache NO cambia antes de respuesta |

---

## 2. Tests de Integración (Fetch Mock)

**Archivo:** `tests/int/use-tasks-integration.int.spec.ts`

| # | Test | Setup | Assertion |
|---|---|---|---|
| I1 | Múltiples hooks comparten cache | 2 componentes montan `useTasks(1)` | Solo 1 fetch ejecutado |
| I2 | ToggleTask invalida todas las variantes | Mutate after having Q1 + Q2 | Q1 y Q2 se marcan como stale |
| I3 | CreateTask sin listId en params | Mutate create sin listId | Todas las queries ['tasks'] se invalidan |
| I4 | Retry en error de red | fetch falla 1 vez, luego éxito | Query eventualmente resuelve |

---

## 3. Tests E2E (Playwright)

**Archivo:** `tests/e2e/tasks.e2e.spec.ts`

| # | Scenario | Steps | Assertions |
|---|---|---|---|
| E1 | Crear tarea y ver en lista | 1. Escribir en AddTaskBar<br>2. Enter | Tarea aparece en TaskList |
| E2 | Toggle completado | 1. Click checkbox | Checkbox cambia, texto se tacha |
| E3 | Toggle desmarcar | 1. Click en tarea completada | Checkbox se vacía |
| E4 | Eliminar tarea | 1. Click delete | Tarea desaparece |
| E5 | Cache entre stacks | 1. Crear tarea en My Day<br>2. Ir a Tasks (All)<br>3. Volver a My Day | Tarea persiste, sin doble fetch |

---

## 4. Matriz de Cobertura

| Funcionalidad | Unitario | Integración | E2E |
|---|---|---|---|
| useTasks query base | Q1, Q3 | I1 | — |
| useTasks filtros | Q2 | — | — |
| useTasks error | Q4 | — | — |
| useTasks loading | Q5 | — | — |
| useTasks cache | Q6 | I1 | E5 |
| useCreateTask success | C1 | — | E1 |
| useCreateTask error | C2 | — | — |
| useCreateTask invalidation | C3 | I3 | — |
| useCreateTask no optimistic | C4 | — | — |
| useToggleTask optimistic | T1, T2, T3 | — | E2, E3 |
| useToggleTask rollback | T4, T5 | — | — |
| useToggleTask cancel | T6 | — | — |
| useToggleTask invalidate | T7 | I2 | — |
| useDeleteTask optimistic | D1 | — | E4 |
| useDeleteTask rollback | D2 | — | — |
| useDeleteTask fetch | D3 | — | — |
| useDeleteTask invalidate | D4 | — | — |
| useUpdateTask success | U1, U2 | — | — |
| useUpdateTask invalidate | U3 | — | — |
| useUpdateTask no optimistic | U4 | — | — |

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

**Cobertura mínima:** 90% en unitarios (especialmente optimistic update callbacks), 100% de flujos de mutación probados.
