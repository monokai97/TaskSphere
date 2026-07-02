# Tests: Integrar TaskList en Páginas Stack

## Estrategia

Tres capas: (1) **unitario** para StackShell (descubrimiento de lista, estados), (2) **integración** con TanStack Query para verificar que cada stack obtiene sus tareas correctas, (3) **e2e** con Playwright para navegación y flujo completo.

---

## 1. Tests Unitarios — StackShell

**Archivo:** `tests/int/stack-shell.int.spec.ts`

### 1.1 Setup

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StackShell } from '@/components/tasks/StackShell'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const mockLists = {
  docs: [
    { id: 1, name: 'My Day', icon: 'today', color: '#004ac6', isDefault: true, guestId: 'test', sortOrder: 0, updatedAt: '', createdAt: '' },
    { id: 2, name: 'Important', icon: 'star', color: '#ba1a1a', isDefault: false, guestId: 'test', sortOrder: 1, updatedAt: '', createdAt: '' },
    { id: 3, name: 'Planned', icon: 'calendar_today', color: '#735c00', isDefault: false, guestId: 'test', sortOrder: 2, updatedAt: '', createdAt: '' },
    { id: 4, name: 'Tasks', icon: 'list', color: '#434655', isDefault: false, guestId: 'test', sortOrder: 3, updatedAt: '', createdAt: '' },
  ],
}
```

### 1.2 Test Cases

| # | Test | Mock | Assertion |
|---|---|---|---|
| S1 | Encuentra "My Day" por nombre | useLists retorna mockLists | TaskList recibe `listId={1}` |
| S2 | Encuentra "Important" por nombre | useLists retorna mockLists | TaskList recibe `listId={2}` |
| S3 | Encuentra "Planned" por nombre | useLists retorna mockLists | TaskList recibe `listId={3}` |
| S4 | Encuentra "Tasks" por nombre | useLists retorna mockLists | TaskList recibe `listId={4}` |
| S5 | Lista no encontrada → EmptyState | useLists retorna `{ docs: [] }` | EmptyState con "List not found" |
| S6 | Loading state → skeletons | useLists isLoading=true | 5 skeletons visibles |
| S7 | Error state → mensaje | useLists isError=true | Mensaje de error visible |
| S8 | Case insensitive match | lista se llama "my day" (minúscula) | Match exitoso con "My Day" |

---

## 2. Tests de Integración — Aislamiento entre Stacks

**Archivo:** `tests/int/stack-isolation.int.spec.ts`

| # | Test | Setup | Assertion |
|---|---|---|---|
| I1 | Tarea en My Day no aparece en Important | Crear tarea con list=1, consultar list=2 | docs.length === 0 para Important |
| I2 | Tarea en Tasks aparece en All Tasks | Crear tarea con list=4, consultar list=4 | docs.length === 1 |
| I3 | Cache separado por stack | Consultar My Day, luego Important | Cada stack tiene su propia query en cache |
| I4 | useTasks recibe listId correcto | StackShell con listName="Planned" | useTasks llamado con listId=3 |

---

## 3. Tests E2E (Playwright)

**Archivo:** `tests/e2e/tasks.e2e.spec.ts`

### 3.1 Navegación entre Stacks

| # | Scenario | Steps | Assertions |
|---|---|---|---|
| E1 | Navegar entre todos los stacks | 1. Ir a /my-day<br>2. Click "Important" en sidebar<br>3. Click "Planned"<br>4. Click "Tasks" | Cada stack muestra su TopBar correcto y contenido |
| E2 | Tarea creada aparece solo en su stack | 1. Ir a /my-day<br>2. Crear tarea "Test My Day"<br>3. Ir a /important | "Test My Day" NO visible en Important |
| E3 | Tarea creada en Important | 1. Ir a /important<br>2. Crear tarea "Test Important"<br>3. Ir a /tasks | "Test Important" no visible en Tasks |
| E4 | EmptyState contextual en stack vacío | 1. Ir a /planned (sin tareas) | EmptyState con mensaje "No planned tasks" |

### 3.2 Sidebar Active State

| # | Scenario | Steps | Assertions |
|---|---|---|---|
| E5 | My Day activo en sidebar | 1. Navegar a /my-day | Sidebar "My Day" tiene clase `bg-primary-container/10` |
| E6 | Important activo | 1. Navegar a /important | Sidebar "Important" destacado |
| E7 | Planned activo | 1. Navegar a /planned | Sidebar "Planned" destacado |
| E8 | Tasks activo | 1. Navegar a /tasks | Sidebar "Tasks" destacado |

### 3.3 Flujo Completo

| # | Scenario | Steps | Assertions |
|---|---|---|---|
| E9 | Crear, ver y completar en My Day | 1. Crear tarea en My Day<br>2. Ver en lista<br>3. Completar (checkbox) | Tarea aparece, checkbox toggle funciona |
| E10 | Navegación con datos persistidos | 1. Crear tareas en 2 stacks<br>2. Navegar entre stacks | Cada stack mantiene sus datos |

### 3.4 Playwright Test Example

```typescript
test('E1 - navigate between all stacks', async ({ page }) => {
  await page.goto('/my-day')
  await expect(page.locator('h1')).toContainText('My Day')

  // Click Important in sidebar
  await page.click('text=Important')
  await expect(page).toHaveURL('/important')
  await expect(page.locator('h1')).toContainText('Important')

  // Click Planned in sidebar
  await page.click('text=Planned')
  await expect(page).toHaveURL('/planned')

  // Click Tasks in sidebar
  await page.click('text=Tasks')
  await expect(page).toHaveURL('/tasks')
})

test('E2 - task isolation between stacks', async ({ page }) => {
  await page.goto('/my-day')
  
  // Create task in My Day
  const input = page.locator('input[placeholder*="Add a task"]')
  await input.fill('Tarea solo en My Day')
  await input.press('Enter')
  await expect(page.locator('text=Tarea solo en My Day')).toBeVisible()
  
  // Go to Important — task should NOT be there
  await page.click('text=Important')
  await expect(page.locator('text=Tarea solo en My Day')).not.toBeVisible()
})
```

---

## 4. Matriz de Cobertura

| Funcionalidad | Unitario | Integración | E2E |
|---|---|---|---|
| StackShell descubre My Day | S1 | — | — |
| StackShell descubre Important | S2 | — | — |
| StackShell descubre Planned | S3 | — | — |
| StackShell descubre Tasks | S4 | — | — |
| Lista no encontrada | S5 | — | — |
| Loading state | S6 | — | — |
| Error state | S7 | — | — |
| Case insensitive | S8 | — | — |
| Aislamiento My Day vs Important | — | I1 | E2 |
| Aislamiento Tasks vs otros | — | I2 | E3 |
| Cache separado por stack | — | I3 | — |
| listId correcto | — | I4 | — |
| Navegación entre stacks | — | — | E1 |
| EmptyState contextual | — | — | E4 |
| Sidebar active state | — | — | E5-E8 |
| Flujo completo CRUD | — | — | E9, E10 |

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

**Cobertura mínima:** 90% en StackShell unitarios, 100% de stacks funcionando con datos reales en E2E.
