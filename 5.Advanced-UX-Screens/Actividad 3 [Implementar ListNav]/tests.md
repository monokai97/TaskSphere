# Actividad 3: Implementar ListNav — Estrategia de Pruebas

## 1. Pruebas de Integración (`tests/int/`)

### 1.1 `lists-reorder.int.spec.ts` — Reorder API

```typescript
// archivo: tests/int/lists-reorder.int.spec.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { getPayload } from 'payload'
import config from '@payload-config'

describe('Lists Reorder API', () => {
  let payload: any
  let guestId: string
  let listIds: number[]

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
    guestId = crypto.randomUUID()

    // Crear 3 listas de prueba con sortOrder 0, 1, 2
    listIds = []
    for (const name of ['Alpha', 'Bravo', 'Charlie']) {
      const list = await payload.create({
        collection: 'lists',
        data: { name, icon: 'list', guestId, sortOrder: listIds.length },
      })
      listIds.push(list.id)
    }
  })

  it('should have initial sortOrder 0, 1, 2', async () => {
    const lists = await payload.find({
      collection: 'lists',
      where: { guestId: { equals: guestId } },
      sort: 'sortOrder',
    })
    expect(lists.docs.map((l: any) => l.sortOrder)).toEqual([0, 1, 2])
    expect(lists.docs.map((l: any) => l.name)).toEqual(['Alpha', 'Bravo', 'Charlie'])
  })

  it('should reorder lists via batch update', async () => {
    // Reorder: Charlie → 0, Alpha → 1, Bravo → 2
    const updates = [
      { id: listIds[2], sortOrder: 0 },
      { id: listIds[0], sortOrder: 1 },
      { id: listIds[1], sortOrder: 2 },
    ]

    await Promise.all(
      updates.map(({ id, sortOrder }) =>
        payload.update({ collection: 'lists', id, data: { sortOrder } }),
      ),
    )

    const lists = await payload.find({
      collection: 'lists',
      where: { guestId: { equals: guestId } },
      sort: 'sortOrder',
    })
    expect(lists.docs.map((l: any) => l.name)).toEqual(['Charlie', 'Alpha', 'Bravo'])
  })

  it('should handle reorder of a single list (no-op)', async () => {
    const list = await payload.findByID({ collection: 'lists', id: listIds[0] })
    const updated = await payload.update({
      collection: 'lists',
      id: listIds[0],
      data: { sortOrder: list.sortOrder },
    })
    expect(updated.sortOrder).toBe(list.sortOrder)
  })

  it('should list lists sorted by sortOrder', async () => {
    const lists = await payload.find({
      collection: 'lists',
      where: { guestId: { equals: guestId } },
      sort: 'sortOrder',
    })
    const orders = lists.docs.map((l: any) => l.sortOrder)
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i]).toBeGreaterThanOrEqual(orders[i - 1])
    }
  })
})
```

### 1.2 Casos borde adicionales

| Test | Descripción |
|---|---|
| `PATCH /api/lists/reorder with empty array returns 400` | Zod validation |
| `PATCH /api/lists/reorder with missing id returns 400` | Zod validation |
| `PATCH /api/lists/reorder with negative sortOrder returns 400` | Zod validation |
| `PATCH /api/lists/reorder without x-guest-id returns 401` | No session |
| `GET /api/lists returns sorted by sortOrder` | Default sort |
| `PATCH /api/lists/reorder with non-existent id fails silently` | Graceful handling |

## 2. Pruebas Unitarias (Vitest + jsdom)

### 2.1 ListNav

```typescript
describe('ListNav', () => {
  // Estados base
  it('renders "LISTS" section header')
  it('renders loading skeleton when isLoading is true')
  it('renders "No lists yet" when data is empty')
  it('returns null when error is truthy')

  // Renderizado de items
  it('renders a link for each list')
  it('shows list icon from Material Symbols')
  it('shows list name truncated')
  it('shows color dot with list.color as backgroundColor')
  it('uses primary color #004ac6 when list.color is null')

  // Drag handle
  it('renders drag_indicator icon in each list item')
  it('drag handle is hidden by default (opacity-0)')
  it('drag handle is visible on group hover (opacity-100)')
  it('drag handle has cursor-grab class')
  it('drag handle is hidden on mobile (hidden md:block)')

  // Active state
  it('marks the current path as active with bg-primary-container/10')
  it('does not mark different paths as active')
  it('uses border-l-4 border-primary for active item')

  // Navegación
  it('each list links to /lists/{id}')
  it('uses Next.js Link for client-side navigation')
})
```

### 2.2 Drag & Drop

```typescript
describe('ListNav Drag & Drop', () => {
  it('sets draggedId on dragStart')
  it('sets dropIndex on dragOver with preventDefault')
  it('applies opacity-50 to dragged item')
  it('shows drop indicator on target position')
  it('reorders lists optimistically on drop')
  it('calls useReorderLists.mutate with new sortOrder array')
  it('cleans up drag state after drop')
  it('cleans up drag state on dragEnd')
  it('does nothing if dropped on same position')
  it('does not trigger drag on mobile viewport')
  it('returns to original order on mutation error (rollback)')
})
```

### 2.3 useReorderLists

```typescript
describe('useReorderLists', () => {
  it('sends PATCH /api/lists/reorder with { lists: [{id, sortOrder}] }')
  it('cancels in-flight queries on mutate')
  it('snapshots previous list order for rollback')
  it('optimistically updates sortOrder in cache')
  it('invalidates ["lists"] query on success')
  it('rolls back to snapshot on error')
})
```

## 3. Pruebas E2E (Playwright)

### 3.1 `tests/e2e/list-nav.e2e.spec.ts`

```typescript
test('should render lists in sidebar', async ({ page }) => {
  // 1. Navigate to /my-day
  // 2. Assert "LISTS" section header is visible
  // 3. Assert default lists (My Day, Important, Planned, Tasks) appear
})

test('should navigate to list on click', async ({ page }) => {
  // 1. Create a list via API
  // 2. Navigate to /my-day
  // 3. Click on the list in sidebar
  // 4. Assert URL changes to /lists/{id}
  // 5. Assert list item shows active state
})

test('should show active state for current list', async ({ page }) => {
  // 1. Create a list via API
  // 2. Navigate directly to /lists/{id}
  // 3. Assert list item has active classes
  // 4. Navigate to another list
  // 5. Assert first list loses active state, second gains it
})

test('should reorder lists with drag & drop', async ({ page }) => {
  // 1. Create 3 lists via API
  // 2. Navigate to /my-day
  // 3. Drag list "Charlie" to the top position
  // 4. Assert lists are visually reordered
  // 5. Refresh page
  // 6. Assert order is persisted
})

test('should show loading skeleton while fetching lists', async ({ page }) => {
  // 1. Intercept API and add delay
  // 2. Navigate to /my-day
  // 3. Assert skeleton is visible during loading
})

test('should show drag handle on hover', async ({ page }) => {
  // 1. Navigate to /my-day
  // 2. Hover over a list item
  // 3. Assert drag_indicator icon becomes visible
})

test('should revert order on reorder API failure', async ({ page }) => {
  // 1. Create 3 lists
  // 2. Intercept PATCH /api/lists/reorder to return 500
  // 3. Drag and drop a list
  // 4. Assert lists return to original order
})

test('should show empty state when no lists exist', async ({ page }) => {
  // (Requiere guest sin listas — difícil en test normal)
  // 1. Mock API to return empty docs
  // 2. Assert "No lists yet" visible
})

test('should have lists sorted by sortOrder initially', async ({ page }) => {
  // 1. Create lists with specific sortOrder values
  // 2. Navigate to /my-day
  // 3. Assert lists appear in sortOrder order
})
```

## 4. Resumen de Cobertura

| Tipo | Archivo | Tests | Prioridad |
|---|---|---|---|
| Integration | `lists-reorder.int.spec.ts` | 4 | Alta |
| Integration | Casos borde API | 6 | Alta |
| Unit | `ListNav` (base) | 15 | Alta |
| Unit | `ListNav` (drag & drop) | 12 | Alta |
| Unit | `useReorderLists` | 6 | Alta |
| E2E | `list-nav.e2e.spec.ts` | 9 | Media |
| **Total** | | **≥ 52** | |
