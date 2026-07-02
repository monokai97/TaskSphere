# Tests: TaskCheckbox + BulkActionBar

## Estrategia

Tres capas: (1) **unitario** para estados visuales e interacciones, (2) **integración** para optimistic update, (3) **e2e** para flujo completo de toggle y bulk actions.

---

## 1. Tests Unitarios — TaskCheckbox

**Archivo:** `tests/int/task-checkbox.int.spec.ts`

### 1.1 Setup

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskCheckbox } from '@/components/tasks/TaskCheckbox'
```

### 1.2 Test Cases

| # | Test | Assertion |
|---|---|---|
| C1 | Renderiza unchecked | `aria-checked="false"`, clase `border-outline` |
| C2 | Renderiza checked | `aria-checked="true"`, clase `bg-primary`, icono `check` visible |
| C3 | Click llama onToggle | Click → `onToggle` llamado 1 vez |
| C4 | Disabled no llama onToggle | Click con `disabled={true}` → `onToggle` no llamado |
| C5 | Stop propagation | Click → evento no propaga al padre |
| C6 | Size sm | `size="sm"` → `w-5 h-5` |
| C7 | Size md (default) | `size="md"` → `w-6 h-6` |
| C8 | aria-label dinámico | `checked={false}` → `"Mark as completed"` |
| C9 | aria-label dinámico | `checked={true}` → `"Mark as pending"` |
| C10 | Checked → checkmark presente | `checked={true}` → texto "check" en el DOM |
| C11 | No checkmark cuando unchecked | `checked={false}` → texto "check" ausente |
| C12 | Disabled → cursor not-allowed | `disabled={true}` → clase `cursor-not-allowed` |

---

## 2. Tests Unitarios — BulkActionBar

**Archivo:** `tests/int/bulk-action-bar.int.spec.ts`

### 2.1 Setup

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BulkActionBar } from '@/components/tasks/BulkActionBar'

const defaultProps = {
  selectedCount: 3,
  onMarkCompleted: vi.fn(),
  onDelete: vi.fn(),
  onClearSelection: vi.fn(),
  onSetDueDate: vi.fn(),
  onMoveToList: vi.fn(),
}
```

### 2.2 Test Cases

| # | Test | Assertion |
|---|---|---|
| B1 | No renderiza cuando count = 0 | `selectedCount={0}` → `container.innerHTML === ''` |
| B2 | Muestra contador singular | `selectedCount={1}` → "1 item selected" |
| B3 | Muestra contador plural | `selectedCount={3}` → "3 items selected" |
| B4 | Botón close llama onClearSelection | Click close → `onClearSelection` llamado |
| B5 | Botón "Mark as completed" funciona | Click → `onMarkCompleted` llamado |
| B6 | Botón "Delete" funciona | Click → `onDelete` llamado |
| B7 | Botón "Set due date" funciona | Click → `onSetDueDate` llamado |
| B8 | Botón "Move to..." funciona | Click → `onMoveToList` llamado |
| B9 | Tiene clase sticky | `sticky top-0 z-40` presente |
| B10 | Tiene animación slide-in | Clase `animate-slide-in` presente |
| B11 | Texto oculto en mobile | Botones tienen `hidden md:inline` en spans de texto |
| B12 | Botón delete tiene color error | Clase `text-error` presente |

---

## 3. Tests de Integración — Optimistic Update

**Archivo:** `tests/int/task-toggle-optimistic.int.spec.ts`

### 3.1 Setup

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { TaskList } from '@/components/tasks/TaskList'
```

### 3.2 Test Cases

| # | Test | Steps | Assertion |
|---|---|---|---|
| I1 | Optimistic: UI cambia antes de respuesta | Click checkbox en tarea pendiente | UI cambia inmediatamente a completed |
| I2 | Optimistic: rollback en error | Mock PATCH retorna 500 | UI vuelve a pending tras error |
| I3 | Bulk complete: todas las seleccionadas | Seleccionar 2 tasks, click "Mark as completed" | Ambas tasks cambian a completed |
| I4 | Bulk delete: seleccionadas desaparecen | Seleccionar 2 tasks, click "Delete" | Tasks desaparecen de la lista |
| I5 | BulkActionBar desaparece tras clear | Click close en BulkActionBar | Barra desaparece, selectedCount = 0 |

---

## 4. Tests E2E (Playwright)

**Archivo:** `tests/e2e/tasks.e2e.spec.ts`

| # | Scenario | Steps | Assertions |
|---|---|---|---|
| E1 | Toggle individual completar tarea | 1. Navegar a stack con tareas<br>2. Click en checkbox de primera tarea | Checkbox se llena, texto se tacha, opacidad se reduce |
| E2 | Toggle individual desmarcar tarea | 1. Click en checkbox de tarea completada | Checkbox se vacía, texto normal, opacidad normal |
| E3 | Bulk selection y completar | 1. Seleccionar 2 tareas (modo selección)<br>2. BulkActionBar aparece<br>3. Click "Mark as completed" | Ambas tareas completadas |
| E4 | Bulk selection y eliminar | 1. Seleccionar 2 tareas<br>2. Click "Delete" | Tareas desaparecen, BulkActionBar desaparece |
| E5 | BulkActionBar desaparece al deseleccionar | 1. Seleccionar tarea<br>2. Click close | Barra desaparece, tareas deseleccionadas |
| E6 | Contador plural/singular | 1. Seleccionar 1 tarea → "1 item"<br>2. Seleccionar 3 → "3 items" | Texto del contador correcto |

### 4.1 Playwright test example

```typescript
test('E1 - toggle task completion', async ({ page }) => {
  await page.goto('/my-day')

  // Esperar que las tareas carguen
  await page.waitForSelector('[role="listitem"]')

  const firstCheckbox = page.locator('[role="checkbox"]').first()
  
  // Verificar estado inicial
  await expect(firstCheckbox).toHaveAttribute('aria-checked', 'false')

  // Click para completar
  await firstCheckbox.click()
  await expect(firstCheckbox).toHaveAttribute('aria-checked', 'true')

  // Click para desmarcar
  await firstCheckbox.click()
  await expect(firstCheckbox).toHaveAttribute('aria-checked', 'false')
})
```

---

## 5. Matriz de Cobertura

| Funcionalidad | Unitario | Integración | E2E |
|---|---|---|---|
| TaskCheckbox estados | C1-C11 | — | E1, E2 |
| TaskCheckbox disabled | C4, C12 | — | — |
| TaskCheckbox size | C6, C7 | — | — |
| TaskCheckbox ARIA | C1, C8, C9 | — | — |
| BulkActionBar hidden | B1 | — | — |
| BulkActionBar contador | B2, B3 | — | E6 |
| BulkActionBar botones | B4-B8 | — | E3, E4 |
| BulkActionBar sticky | B9, B10 | — | — |
| BulkActionBar mobile | B11 | — | — |
| BulkActionBar delete color | B12 | — | — |
| Optimistic toggle | — | I1, I2 | E1, E2 |
| Bulk complete | — | I3 | E3 |
| Bulk delete | — | I4 | E4 |
| Clear selection | — | I5 | E5 |

---

## 6. Ejecución

```bash
# Unitarios + Integración
pnpm test:int

# E2E
pnpm test:e2e

# Coverage
pnpm test:int -- --coverage
```

**Cobertura mínima:** 85% en unitarios, optimistic update con rollback probado, E2E de toggle individual y bulk actions validados.
