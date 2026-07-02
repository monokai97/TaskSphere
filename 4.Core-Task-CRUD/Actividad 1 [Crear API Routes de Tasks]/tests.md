# Tests: API Routes de Tasks

## Estrategia

Tres capas de validación: (1) **integración** con PayloadCMS real (SQLite), (2) **e2e** con Playwright verificando el flujo completo, (3) **unitario** para Zod schemas.

---

## 1. Tests de Integración (Vitest)

**Archivo:** `tests/int/tasks.int.spec.ts`

### 1.1 Setup

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getPayload } from 'payload'
import config from '@payload-config'

let payload: ReturnType<typeof getPayload>
const TEST_GUEST_ID = '00000000-0000-0000-0000-000000000001'

beforeAll(async () => {
  const payloadConfig = await config
  payload = await getPayload({ config: payloadConfig })
})

afterAll(async () => {
  // Cleanup test data
  await payload.delete({ collection: 'tasks', where: { guestId: { equals: TEST_GUEST_ID } } })
})
```

### 1.2 Test Cases

#### Zod Validation

| # | Test | Input | Expected |
|---|---|---|---|
| T1 | CreateTaskInput rechaza título vacío | `{ title: '', list: 'abc' }` | `success: false`, error en `title` |
| T2 | CreateTaskInput rechaza título < 3 chars | `{ title: 'ab', list: 'abc' }` | `success: false`, error en `title` |
| T3 | CreateTaskInput acepta título válido | `{ title: 'Comprar leche', list: 'abc' }` | `success: true`, `data.title === 'Comprar leche'` |
| T4 | CreateTaskInput trimea título | `{ title: '  test  ', list: 'abc' }` | `success: true`, `data.title === 'test'` |
| T5 | CreateTaskInput asigna important default | `{ title: 'test', list: 'abc' }` | `data.important === false` |
| T6 | UpdateTaskInput acepta body vacío | `{}` | `success: true` |
| T7 | UpdateTaskInput rechaza status inválido | `{ status: 'invalid' }` | `success: false` |
| T8 | UpdateTaskInput acepta dueDate null | `{ dueDate: null }` | `success: true`, `data.dueDate === null` |

#### PayloadCMS CRUD

| # | Test | Steps | Expected |
|---|---|---|---|
| T9 | Crear tarea en PayloadCMS | `payload.create({ collection: 'tasks', data: { title: 'Test', guestId: TEST_GUEST_ID, list: listId, status: 'pending' } })` | Tarea creada con id, title, status='pending' |
| T10 | Leer tareas por guestId | `payload.find({ collection: 'tasks', where: { guestId: { equals: TEST_GUEST_ID } } })` | `totalDocs > 0`, todos los docs tienen el guestId correcto |
| T11 | Filtrar por status | `payload.find({ where: { guestId, status: { equals: 'completed' } } })` | Todos los docs con status='completed' |
| T12 | Actualizar título | `payload.update({ id, data: { title: 'Updated' } })` | `doc.title === 'Updated'` |
| T13 | Toggle status | `payload.update({ id, data: { status: 'completed' } })` | `doc.status === 'completed'`, `doc.completedAt` no es null |
| T14 | Eliminar tarea | `payload.delete({ id })` | `payload.find({ where: { id } }).totalDocs === 0` |
| T15 | Aislamiento por guestId | Crear tarea con guestId A, buscar con guestId B | `totalDocs === 0` para B |

### 1.3 API Route Integration (via Next.js)

| # | Test | Method/Path | Expected |
|---|---|---|---|
| T16 | GET sin guestId → 401 | `GET /api/tasks` sin header | `status === 401` |
| T17 | GET con guestId → 200 + docs | `GET /api/tasks` con `x-guest-id` | `status === 200`, body tiene `docs` array |
| T18 | GET filtra por list | `GET /api/tasks?list=abc` | Solo tareas de esa lista |
| T19 | POST sin guestId → 401 | `POST /api/tasks` sin header | `status === 401` |
| T20 | POST título inválido → 400 | `POST /api/tasks` con `{ title: '' }` | `status === 400`, error field |
| T21 | POST título válido → 201 | `POST /api/tasks` con título válido | `status === 201`, body tiene `id` |
| T22 | PATCH sin guestId → 401 | `PATCH /api/tasks/id` sin header | `status === 401` |
| T23 | PATCH actualiza status → 200 | `PATCH /api/tasks/id` con `{ status: 'completed' }` | `status === 200`, `body.status === 'completed'` |
| T24 | DELETE sin guestId → 401 | `DELETE /api/tasks/id` sin header | `status === 401` |
| T25 | DELETE tarea existente → 200 | `DELETE /api/tasks/id` con guestId correcto | `status === 200`, `body.success === true` |

---

## 2. Tests E2E (Playwright)

**Archivo:** `tests/e2e/tasks.e2e.spec.ts`

### 2.1 Scenarios

| # | Scenario | Steps | Assertions |
|---|---|---|---|
| E1 | Guest crea tarea desde UI | 1. Navegar a `/my-day`<br>2. Escribir en AddTaskBar<br>3. Presionar Enter | Tarea aparece en la lista inmediatamente |
| E2 | Guest completa tarea | 1. Tarea visible<br>2. Click en checkbox | Checkbox se llena, texto tachado, opacidad reducida |
| E3 | Guest elimina tarea | 1. Tarea visible<br>2. Click en delete (detail panel) | Tarea desaparece de la lista |
| E4 | Guest marca importante | 1. Tarea visible<br>2. Click en estrella | Estrella se llena (FILL 1) |
| E5 | Stack filtra correctamente | 1. Crear tarea en lista "Important"<br>2. Navegar a `/important` | Tarea visible en Important, no en My Day |
| E6 | Guest sin tareas ve EmptyState | 1. Navegar a lista vacía | Mensaje "No tasks" visible, sin tareas en DOM |

### 2.2 Playwright Config

```typescript
// tests/e2e/tasks.e2e.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Tasks CRUD E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/my-day')
  })

  test('E1 - create task', async ({ page }) => {
    const input = page.locator('input[placeholder*="Add a task"]')
    await input.fill('Nueva tarea E2E')
    await input.press('Enter')
    await expect(page.locator('text=Nueva tarea E2E')).toBeVisible()
  })
})
```

---

## 3. Tests de Retry Pattern (Unitario)

| # | Test | Mock | Expected |
|---|---|---|---|
| R1 | withRetry éxito en primer intento | fn() resuelve inmediato | Retorna resultado, 1 llamada |
| R2 | withRetry éxito tras SQLITE_BUSY | fn() falla 2 veces, resuelve 3ra | Retorna resultado, 3 llamadas |
| R3 | withRetry falla tras 3 intentos | fn() siempre SQLITE_BUSY | Lanza error, delay progresivo (100ms, 200ms, 400ms) |
| R4 | withRetry no retry en errores no-BUSY | fn() lanza Error('other') | Error inmediato, 1 llamada |

---

## 4. Ejecución

```bash
# Unit/Integration (Zod + PayloadCMS)
pnpm test:int       # Corre tests/int/**/*.int.spec.ts

# E2E (Playwright)
pnpm test:e2e        # Corre tests/e2e/**/*.e2e.spec.ts

# Ambos
pnpm test
```

## 5. Cobertura Esperada

| Capa | Cobertura Mínima |
|---|---|
| Zod schemas | 100% de reglas de validación |
| API Routes (GET/POST/PATCH/DELETE) | 100% de códigos HTTP |
| Retry pattern | 100% de escenarios (éxito, error BUSY, error otro) |
| Aislamiento guestId | 100% (ninguna operación cruza guestIds) |
