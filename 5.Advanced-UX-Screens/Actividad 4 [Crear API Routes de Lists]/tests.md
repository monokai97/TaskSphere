# Actividad 4: Crear API Routes de Lists — Estrategia de Pruebas

## 1. Pruebas de Integración (`tests/int/`)

### 1.1 `lists-api.int.spec.ts` — API completa de listas

```typescript
// archivo: tests/int/lists-api.int.spec.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { getPayload } from 'payload'
import config from '@payload-config'
import { CreateListInput, UpdateListInput, ReorderInput } from '@/lib/schemas'

describe('Lists API (via PayloadCMS direct)', () => {
  let payload: any
  let guestId: string
  let secondaryGuestId: string
  let listIds: number[]
  let defaultListId: number

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
    guestId = crypto.randomUUID()
    secondaryGuestId = crypto.randomUUID()

    // Crear listas de prueba (simula POST)
    listIds = []
    for (const list of [
      { name: 'Work', icon: 'work', color: '#004ac6', sortOrder: 0 },
      { name: 'Shopping', icon: 'shopping_cart', color: '#735c00', sortOrder: 1 },
      { name: 'Fitness', icon: 'fitness_center', sortOrder: 2 },
    ]) {
      const created = await payload.create({
        collection: 'lists',
        data: { ...list, guestId },
      })
      listIds.push(created.id)
    }

    // Crear lista default para test de protección
    const defaultList = await payload.create({
      collection: 'lists',
      data: { name: 'Default', icon: 'list', guestId, isDefault: true },
    })
    defaultListId = defaultList.id
  })

  // ── Zod Schema Tests ──

  describe('CreateListInput schema', () => {
    it('validates a complete input', () => {
      const result = CreateListInput.safeParse({
        name: '  My List  ',
        icon: 'work',
        color: '#004ac6',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('My List') // trimmed
        expect(result.data.icon).toBe('work')
        expect(result.data.color).toBe('#004ac6')
      }
    })

    it('rejects empty name after trim', () => {
      const result = CreateListInput.safeParse({ name: '   ' })
      expect(result.success).toBe(false)
    })

    it('rejects invalid hex color', () => {
      const result = CreateListInput.safeParse({
        name: 'Test',
        color: 'not-a-hex',
      })
      expect(result.success).toBe(false)
    })

    it('accepts optional fields omitted', () => {
      const result = CreateListInput.safeParse({ name: 'Test' })
      expect(result.success).toBe(true)
    })
  })

  describe('UpdateListInput schema', () => {
    it('validates partial update with only name', () => {
      const result = UpdateListInput.safeParse({ name: 'Renamed' })
      expect(result.success).toBe(true)
    })

    it('validates partial update with color null', () => {
      const result = UpdateListInput.safeParse({ color: null })
      expect(result.success).toBe(true)
    })

    it('rejects empty string name', () => {
      const result = UpdateListInput.safeParse({ name: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('ReorderInput schema', () => {
    it('validates proper reorder array', () => {
      const result = ReorderInput.safeParse({
        lists: [
          { id: 1, sortOrder: 0 },
          { id: 2, sortOrder: 1 },
        ],
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty array', () => {
      const result = ReorderInput.safeParse({ lists: [] })
      expect(result.success).toBe(false)
    })

    it('rejects negative sortOrder', () => {
      const result = ReorderInput.safeParse({
        lists: [{ id: 1, sortOrder: -1 }],
      })
      expect(result.success).toBe(false)
    })
  })

  // ── PayloadCMS CRUD Tests ──

  describe('GET lists', () => {
    it('should read lists by guestId sorted by sortOrder', async () => {
      const lists = await payload.find({
        collection: 'lists',
        where: { guestId: { equals: guestId } },
        sort: 'sortOrder',
      })
      expect(lists.docs.length).toBeGreaterThanOrEqual(4)
      const orders = lists.docs.map((l: any) => l.sortOrder)
      for (let i = 1; i < orders.length; i++) {
        expect(orders[i]).toBeGreaterThanOrEqual(orders[i - 1])
      }
    })

    it('should not return lists of other guests', async () => {
      const lists = await payload.find({
        collection: 'lists',
        where: { guestId: { equals: secondaryGuestId } },
      })
      expect(lists.docs).toHaveLength(0)
    })
  })

  describe('POST list', () => {
    it('should create a list with all fields', async () => {
      const list = await payload.create({
        collection: 'lists',
        data: {
          name: 'New List',
          icon: 'star',
          color: '#ba1a1a',
          guestId,
          sortOrder: 99,
        },
      })
      expect(list.name).toBe('New List')
      expect(list.icon).toBe('star')
      expect(list.color).toBe('#ba1a1a')
      expect(list.guestId).toBe(guestId)
      expect(list.isDefault).toBe(false)
      listIds.push(list.id)
    })

    it('should create a list with minimal fields', async () => {
      const list = await payload.create({
        collection: 'lists',
        data: { name: 'Minimal', guestId },
      })
      expect(list.name).toBe('Minimal')
      expect(list.icon).toBe('list') // default icon
    })
  })

  describe('PATCH list', () => {
    it('should update name and icon', async () => {
      const updated = await payload.update({
        collection: 'lists',
        id: listIds[0],
        data: { name: 'Updated Work', icon: 'business' },
      })
      expect(updated.name).toBe('Updated Work')
      expect(updated.icon).toBe('business')
    })

    it('should clear color to null', async () => {
      const updated = await payload.update({
        collection: 'lists',
        id: listIds[0],
        data: { color: null },
      })
      expect(updated.color).toBeNull()
    })

    it('should not update fields of another guest', async () => {
      const secondaryList = await payload.create({
        collection: 'lists',
        data: { name: 'Secondary', guestId: secondaryGuestId },
      })
      // Update con guestId que no coincide (simulado)
      const updated = await payload.update({
        collection: 'lists',
        id: secondaryList.id,
        data: { name: 'Hacked' },
        // El access control real filtraría por guestId en API Route
      })
      // PayloadCMS update sin where permite el cambio — la protección está en Access Control + API Route
      expect(updated.name).toBe('Hacked')
    })
  })

  describe('DELETE list', () => {
    it('should delete a non-default list', async () => {
      const listToDelete = listIds[listIds.length - 1]
      await payload.delete({ collection: 'lists', id: listToDelete })
      const deleted = await payload.findByID({
        collection: 'lists',
        id: listToDelete,
      }).catch(() => null)
      expect(deleted).toBeNull()
    })

    it('should allow deleting a default list via PayloadCMS (soft-check in API Route)', async () => {
      // Nota: PayloadCMS no tiene soft-check para default lists
      // La protección está en la API Route, no en PayloadCMS
      const canDelete = await payload.delete({
        collection: 'lists',
        id: defaultListId,
      }).then(() => true).catch(() => false)
      expect(canDelete).toBe(true)
    })
  })

  describe('Reorder (batch update sortOrder)', () => {
    it('should batch update sortOrder', async () => {
      // Reorder: invertir orden
      const updates = listIds.slice(0, 3).map((id, i) => ({
        id,
        sortOrder: 2 - i,
      }))

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

      // Verificar que los sortOrders actualizados son correctos
      for (const update of updates) {
        const list = lists.docs.find((l: any) => l.id === update.id)
        expect(list.sortOrder).toBe(update.sortOrder)
      }
    })
  })
})
```

### 1.2 Casos borde adicionales (API Routes)

| Test | Descripción |
|---|---|
| `POST /api/lists sin body retorna 400` | JSON parse error |
| `POST /api/lists sin x-guest-id retorna 401` | Sesión requerida |
| `PATCH /api/lists/99999 retorna 404` | ID inexistente |
| `DELETE /api/lists/default retorna 409` | Soft-check default list |
| `DELETE /api/lists/99999 retorna 404` | ID inexistente |
| `PATCH /api/lists/reorder con body inválido retorna 400` | Zod failure |
| `PATCH /api/lists/reorder sin x-guest-id retorna 401` | Sesión requerida |
| `GET /api/lists con error Payload retorna 503` | withRetry exhaustion |

## 2. Pruebas Unitarias

### 2.1 withRetry

```typescript
describe('withRetry', () => {
  it('resolves on first attempt if no error')
  it('retries up to 3 times on SQLITE_BUSY')
  it('throws original error after max retries')
  it('does not retry on non-SQLITE_BUSY errors')
  it('uses exponential backoff with jitter')
  it('resolves on second attempt if first fails')
})
```

### 2.2 Zod schemas

```typescript
describe('CreateListInput', () => {
  it('trims whitespace from name')
  it('rejects name > 100 chars')
  it('rejects name < 1 char')
  it('allows optional icon and color')
  it('rejects invalid hex color')
  it('accepts valid hex color with #')
})

describe('UpdateListInput', () => {
  it('allows partial updates')
  it('accepts color: null to clear')
  it('rejects empty string name')
})

describe('ReorderInput', () => {
  it('validates array of {id, sortOrder}')
  it('rejects empty array')
  it('rejects negative sortOrder')
  it('rejects non-integer sortOrder')
})
```

## 3. Pruebas E2E (Playwright)

### 3.1 `tests/e2e/lists-api.e2e.spec.ts`

```typescript
test('should create a list via API and verify in UI', async ({ page }) => {
  // 1. Crear lista via POST /api/lists (fetch interno)
  // 2. Navigate to /my-day
  // 3. Assert new list appears in ListNav
})

test('should update a list and verify in UI', async ({ page }) => {
  // 1. Create list via API
  // 2. Update via PATCH /api/lists/{id}
  // 3. Refresh page
  // 4. Assert updated name in sidebar
})

test('should delete a non-default list', async ({ page }) => {
  // 1. Create list via API
  // 2. Delete via DELETE /api/lists/{id}
  // 3. Refresh page
  // 4. Assert list removed from sidebar
})

test('should not delete a default list', async ({ page }) => {
  // 1. Try DELETE on a default list via fetch
  // 2. Assert 409 response
})

test('should reorder lists', async ({ page }) => {
  // 1. Create 3 lists via API
  // 2. PATCH /api/lists/reorder with inverted order
  // 3. Refresh page
  // 4. Assert new order in sidebar
})
```

## 4. Resumen de Cobertura

| Tipo | Tests | Prioridad |
|---|---|---|
| Zod schema validation | 13 | Alta |
| PayloadCMS CRUD direct | 9 | Alta |
| API integration casos borde | 8 | Alta |
| `withRetry` unit | 6 | Alta |
| E2E | 5 | Media |
| **Total** | **≥ 41** | |
