# Tests: Componente AddTaskBar

## Estrategia

Tres capas: (1) **unitario** con Vitest + jsdom para estados e interacciones, (2) **integración** con fetch mock para creación, (3) **e2e** con Playwright para flujo real.

---

## 1. Tests Unitarios (Vitest + jsdom)

**Archivo:** `tests/int/add-task-bar.int.spec.ts`

### 1.1 Setup

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddTaskBar } from '@/components/tasks/AddTaskBar'

const defaultProps = {
  listId: 1,
  listName: 'My Day',
  onTaskCreated: vi.fn(),
}
```

### 1.2 Test Cases

#### Estado Collapsed

| # | Test | Assertion |
|---|---|---|
| T1 | Renderiza contenedor fixed | Contenedor tiene clase `fixed bottom-8` |
| T2 | Muestra placeholder con nombre de lista | Placeholder contiene "My Day" |
| T3 | Muestra icono add | Icono `add` presente |
| T4 | No muestra toolbar en collapsed | Botones calendar/notifications/repeat ausentes |
| T5 | Input está vacío por defecto | `input.value === ''` |

#### Expansión (Focus)

| # | Test | Acción | Assertion |
|---|---|---|---|
| T6 | Focus muestra toolbar | Focus input | Botones toolbar visibles |
| T7 | Focus cambia borde | Focus input | Borde cambia a `border-primary/20` |
| T8 | Blur sin contenido vuelve a collapsed | Escribir, borrar, blur | Toolbar desaparece |
| T9 | Blur con contenido mantiene focused | Escribir texto, blur | Toolbar sigue visible |
| T10 | Escape vuelve a collapsed y limpia | Escribir texto, Escape | Input vacío, toolbar oculto |

#### Validación y Envío

| # | Test | Acción | Assertion |
|---|---|---|---|
| T11 | Enter con título corto muestra error | Escribir "ab", Enter | Mensaje error visible, estado `error` |
| T12 | Error desaparece al editar | Error visible, escribir tecla | Error desaparece, estado `focused` |
| T13 | Enter con título válido envía POST | Escribir "Comprar leche", Enter | Fetch llamado con método POST |
| T14 | POST body contiene title y list | Escribir "Test", Enter | Body tiene `{ title: "Test", list: "1" }` |
| T15 | Éxito limpia input y colapsa | POST exitoso | Input vacío, collapsed, toolbar oculto |
| T16 | onTaskCreated se llama tras éxito | POST exitoso | Callback ejecutado |

#### Estado Submitting

| # | Test | Acción | Assertion |
|---|---|---|---|
| T17 | Input se deshabilita durante submit | Enter en input válido | Input `disabled` |
| T18 | Muestra spinner durante submit | Enter en input válido | Icono `progress_activity` con `animate-spin` |
| T19 | Toolbar oculto durante submit | Enter en input válido | Botones toolbar ausentes |
| T20 | Input se re-habilita tras éxito | POST resuelve | Input `disabled` ya no está |

#### Estado Error

| # | Test | Acción | Assertion |
|---|---|---|---|
| T21 | Error del servidor se muestra | POST retorna 400 | Mensaje error visible con `role="alert"` |
| T22 | Error de red se muestra | fetch lanza excepción | Mensaje "Something went wrong" visible |
| T23 | Error tiene estilo error | POST retorna error | Input/container tiene clase `border-error/50` |

#### Teclado

| # | Test | Acción | Assertion |
|---|---|---|---|
| T24 | Shift+Enter no envía | Shift+Enter | No se llama fetch |
| T25 | Enter sin Shift envía | Enter solo | Fetch es llamado |
| T26 | Escape limpia sin enviar | Escribir, Escape | Fetch no es llamado |

---

## 2. Tests de Integración (con fetch mock)

| # | Test | Mock | Assertion |
|---|---|---|---|
| I1 | POST exitoso invalida cache | fetch retorna 201 | Si se usa TanStack Query, `invalidateQueries` llamado |
| I2 | Múltiples creates rápidos | fetch lento, 2 enters | Solo 1 fetch activo (debounce o disabled) |
| I3 | Placeholder cambia con listName prop | `listName="Work"` | Placeholder "Add a task to 'Work'..." |

---

## 3. Tests E2E (Playwright)

**Archivo:** `tests/e2e/tasks.e2e.spec.ts`

| # | Scenario | Steps | Assertions |
|---|---|---|---|
| E1 | Crear tarea desde el input | 1. Navegar a /my-day<br>2. Focus input<br>3. Escribir "Nueva tarea E2E"<br>4. Enter | Tarea aparece en la lista |
| E2 | Toolbar visible en focus | 1. Focus input | Botones calendar, notifications, repeat visibles |
| E3 | Error por título corto | 1. Escribir "ab"<br>2. Enter | Mensaje error visible |
| E4 | Escape limpia input | 1. Escribir texto<br>2. Escape | Input vacío, toolbar oculto |
| E5 | Crear tarea en lista específica | 1. Navegar a /important<br>2. Crear tarea | Tarea aparece solo en Important |
| E6 | Placeholder contextual | 1. Navegar a /my-day | Placeholder "Add a task to 'My Day'..." |

### 3.1 Playwright Test Example

```typescript
test('E1 - create task from input bar', async ({ page }) => {
  await page.goto('/my-day')
  
  const input = page.locator('input[placeholder*="Add a task"]')
  await expect(input).toBeVisible()
  
  await input.focus()
  await expect(page.locator('button[title="Set due date"]')).toBeVisible()
  
  await input.fill('Comprar leche')
  await input.press('Enter')
  
  // Esperar que la tarea aparezca en la lista
  await expect(page.locator('text=Comprar leche')).toBeVisible({ timeout: 5000 })
  
  // Input debe limpiarse
  await expect(input).toHaveValue('')
})
```

---

## 4. Matriz de Cobertura

| Funcionalidad | Unitario | Integración | E2E |
|---|---|---|---|
| Estado collapsed | T1-T5 | — | — |
| Focus → expansión | T6-T10 | — | E2 |
| Blur behavior | T8, T9 | — | — |
| Escape key | T10, T26 | — | E4 |
| Validación corta | T11, T12 | — | E3 |
| Enter submit | T13-T15 | I1 | E1 |
| Submit loading | T17-T20 | I2 | — |
| Submit error | T21-T23 | — | — |
| Shift+Enter | T24 | — | — |
| Placeholder | T2 | I3 | E6 |
| onTaskCreated | T16 | — | — |
| Crear en lista | — | — | E5 |

---

## 5. Ejecución

```bash
# Unitarios
pnpm test:int

# E2E
pnpm test:e2e

# Coverage
pnpm test:int -- --coverage
```

**Cobertura mínima:** 85% en unitarios, 100% de estados (collapsed/focused/submitting/error) cubiertos, E2E crítico (crear tarea) validado.
