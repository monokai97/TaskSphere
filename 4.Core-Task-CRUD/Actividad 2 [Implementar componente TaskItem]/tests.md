# Tests: Componente TaskItem

## Estrategia

Tres capas: (1) **unitario** con Vitest + jsdom para renderizado y estados, (2) **visual/regression** para verificar fidelidad con prototipos HTML, (3) **e2e** con Playwright para interacción real.

---

## 1. Tests Unitarios (Vitest + jsdom)

**Archivo:** `tests/int/task-item.int.spec.ts`

### 1.1 Setup

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskItem } from '@/components/tasks/TaskItem'

const mockTask = {
  id: 1,
  title: 'Comprar leche',
  description: null,
  status: 'pending' as const,
  important: false,
  dueDate: '2025-01-05T00:00:00.000Z',
  list: { id: 1, name: 'My Day', icon: 'today', color: '#004ac6', guestId: 'abc', isDefault: true, sortOrder: 0, updatedAt: '', createdAt: '' },
  guestId: 'test-guest',
  sortOrder: 0,
  completedAt: null,
  subtasks: null,
  updatedAt: '',
  createdAt: '',
}
```

### 1.2 Test Cases

#### Renderizado Básico

| # | Test | Assertion |
|---|---|---|
| T1 | Renderiza título de la tarea | `screen.getByText('Comprar leche')` existe |
| T2 | Renderiza metadata de fecha | `screen.getByText('Today')` existe (dueDate es hoy) |
| T3 | Renderiza nombre de lista | `screen.getByText('My Day')` existe |
| T4 | Renderiza estrella no importante | Estrella presente, `getByLabelText('Marcar importante')` |
| T5 | Renderiza drag handle | `screen.getByText('drag_indicator')` existe |

#### Estados Visuales

| # | Test | Setup | Assertion |
|---|---|---|---|
| T6 | Estado completed | `mockTask.status = 'completed'` | Contenedor tiene `opacity-50`, título tiene `line-through` |
| T7 | Estado important | `mockTask.important = true` | Botón con `aria-label="Quitar importante"`, texto secondary |
| T8 | Estado selected | `selected={true}` prop | Contenedor tiene clase `border-primary/20` |
| T9 | No dueDate | `mockTask.dueDate = null` | Metadata de fecha no renderizada |
| T10 | list como number (depth=0) | `mockTask.list = 1` | Nombre de lista no renderizado (fallback silencioso) |

#### Interacciones

| # | Test | Acción | Assertion |
|---|---|---|---|
| T11 | Click en checkbox llama onToggle | Click en checkbox | `onToggle` llamado con `(1, 'completed')` |
| T12 | Click en estrella llama onToggleImportant | Click en estrella | `onToggleImportant` llamado con `(1, true)` |
| T13 | Click en contenedor llama onClick | Click en div | `onClick` llamado con `(1)` |
| T14 | Click en estrella no propaga al contenedor | Click en estrella | `onClick` **no** es llamado |
| T15 | Toggle desde completed a pending | `mockTask.status = 'completed'`, click checkbox | `onToggle` llamado con `(1, 'pending')` |

#### React.memo

| # | Test | Assertion |
|---|---|---|
| T16 | No re-renderiza con mismas props | Renderizar, actualizar props iguales con rerender → no hay llamada extra al render |
| T17 | Re-renderiza cuando cambia status | `mockTask.status` cambia → componente se actualiza |

---

## 2. Tests de Integración Visual (Storybook-style)

Sin Storybook, se pueden verificar clases CSS directamente:

| # | Test | Clase Esperada |
|---|---|---|
| V1 | Item normal tiene bg correcto | `bg-surface-container-lowest` |
| V2 | Item hover tiene border hover | `hover:border-outline-variant` |
| V3 | Checkbox pending tiene border-outline | `border-2 border-outline` |
| V4 | Checkbox completed tiene bg-primary | `bg-primary` |
| V5 | Drag handle oculto por defecto | `opacity-0` |
| V6 | Drag handle visible en hover | `group-hover:opacity-100` |
| V7 | Gap entre elementos | `gap-4` |
| V8 | Padding interno | `p-4` |
| V9 | Border radius | `rounded-xl` |

---

## 3. Tests E2E (Playwright)

**Archivo:** `tests/e2e/tasks.e2e.spec.ts`

### 3.1 Escenarios

| # | Scenario | Steps | Assertions |
|---|---|---|---|
| E1 | Tarea pendiente se ve correcta | 1. Navegar a stack con tareas<br>2. Observar TaskItem | Título visible, checkbox vacío, metadata visible |
| E2 | Click checkbox completa tarea | 1. Click en checkbox<br>2. Observar cambio | Checkbox se llena, texto se tacha, opacidad se reduce |
| E3 | Click estrella marca importante | 1. Click en estrella | Estrella cambia de color (fill se activa) |
| E4 | Drag handle aparece en hover | 1. Hacer hover sobre TaskItem | Icono `drag_indicator` se vuelve visible |
| E5 | Tarea completada se ve distinta | 1. Tarea con status completed | Opacidad reducida, título tachado, checkbox primary |

### 3.2 Playwright selectors

```typescript
// Selectores útiles
const taskItem = page.locator('[role="listitem"]').first()
const checkbox = taskItem.locator('[role="checkbox"]')
const starButton = taskItem.locator('button[aria-label*="importante"]')
const title = taskItem.locator('p.font-task-item')
```

---

## 4. Matriz de Cobertura

| Funcionalidad | Unitario | Visual | E2E |
|---|---|---|---|
| Render título | T1 | — | E1 |
| Render metadata fecha | T2 | — | E1 |
| Render nombre lista | T3 | — | — |
| Estado pending | T1-T5 | V1, V3 | E1 |
| Estado completed | T6 | V4 | E5 |
| Estado important | T7 | — | E3 |
| Estado selected | T8 | — | — |
| Toggle status | T11, T15 | — | E2 |
| Toggle important | T12 | — | E3 |
| Click detail | T13 | — | — |
| Stop propagation | T14 | — | — |
| Drag handle | T5 | V5, V6 | E4 |
| React.memo | T16, T17 | — | — |
| Sin fecha | T9 | — | — |
| Relationship sin depth | T10 | — | — |

---

## 5. Ejecución

```bash
# Unitarios
pnpm test:int       # Vitest + jsdom

# E2E
pnpm test:e2e        # Playwright

# Coverage
pnpm test:int -- --coverage
```

**Cobertura mínima:** 90% en unitarios, 100% de estados visuales cubiertos.
