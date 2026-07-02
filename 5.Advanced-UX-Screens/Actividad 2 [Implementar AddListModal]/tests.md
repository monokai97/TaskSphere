# Actividad 2: Implementar AddListModal — Estrategia de Pruebas

## 1. Pruebas de Integración (`tests/int/`)

### 1.1 `lists-api.int.spec.ts` — API de listas

```typescript
// archivo: tests/int/lists-api.int.spec.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { getPayload } from 'payload'
import config from '@payload-config'

describe('Lists CRUD API', () => {
  let payload: any
  let guestId: string
  let listId: number

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
    guestId = crypto.randomUUID()
  })

  it('should create a list with name and icon', async () => {
    const list = await payload.create({
      collection: 'lists',
      data: { name: 'Work Projects', icon: 'work', guestId },
    })
    expect(list.name).toBe('Work Projects')
    expect(list.icon).toBe('work')
    expect(list.guestId).toBe(guestId)
    expect(list.isDefault).toBe(false)
    listId = list.id
  })

  it('should create a list with color', async () => {
    const list = await payload.create({
      collection: 'lists',
      data: { name: 'Shopping', icon: 'shopping_cart', color: '#735c00', guestId },
    })
    expect(list.color).toBe('#735c00')
  })

  it('should reject list without name', async () => {
    await expect(
      payload.create({
        collection: 'lists',
        data: { guestId },
      }),
    ).rejects.toThrow()
  })

  it('should read lists by guestId', async () => {
    const lists = await payload.find({
      collection: 'lists',
      where: { guestId: { equals: guestId } },
    })
    expect(lists.docs.length).toBeGreaterThan(0)
    expect(lists.docs.every((l: any) => l.guestId === guestId)).toBe(true)
  })

  it('should update list name and icon', async () => {
    const updated = await payload.update({
      collection: 'lists',
      id: listId,
      data: { name: 'Work 2024', icon: 'business' },
    })
    expect(updated.name).toBe('Work 2024')
    expect(updated.icon).toBe('business')
  })

  it('should update list color', async () => {
    const updated = await payload.update({
      collection: 'lists',
      id: listId,
      data: { color: '#004ac6' },
    })
    expect(updated.color).toBe('#004ac6')
  })

  it('should not expose lists of other guests', async () => {
    const otherGuestId = crypto.randomUUID()
    const otherLists = await payload.find({
      collection: 'lists',
      where: { guestId: { equals: otherGuestId } },
    })
    expect(otherLists.docs).toHaveLength(0)
  })

  it('should delete a list', async () => {
    await payload.delete({ collection: 'lists', id: listId })
    const deleted = await payload.findByID({ collection: 'lists', id: listId }).catch(() => null)
    expect(deleted).toBeNull()
  })
})
```

### 1.2 Casos borde adicionales

| Test | Descripción |
|---|---|
| `POST /api/lists with empty name returns 400` | Zod validation: min 1 char |
| `POST /api/lists with name > 100 chars returns 400` | Zod validation: max 100 |
| `POST /api/lists with invalid hex color returns 400` | Zod regex validation |
| `POST /api/lists without x-guest-id returns 401` | No session |
| `PATCH /api/lists/:id with invalid id returns 404` | Not found |
| `PATCH /api/lists/:id from another guest returns 404` | Access control |
| `DELETE default list should be blocked` | Soft check (isDefault=true) |
| `List is created with default sortOrder` | Default sortOrder auto-asignado |

## 2. Pruebas Unitarias (Vitest + jsdom)

### 2.1 AddListModal

```typescript
// tests/int/add-list-modal.int.spec.tsx
describe('AddListModal', () => {
  it('renders nothing when isOpen is false')
  it('renders overlay and card when isOpen is true')
  it('renders "Nueva lista" title in create mode')
  it('renders "Editar lista" title when editList is provided')
  it('renders input with placeholder "Sin título"')
  it('auto-focuses the name input on open')
  it('shows 12 icon options in the grid')
  it('marks first icon as selected by default')
  it('allows selecting a different icon')
  it('shows 5 color circles')
  it('marks first color as selected by default')
  it('allows selecting a different color')
  it('disables submit button when name is empty')
  it('enables submit button when name has content')
  it('closes modal on overlay click')
  it('closes modal on Escape key')
  it('closes modal on close button click')
  it('calls onClose when Cancel button clicked')
  it('pre-fills name from editList in edit mode')
  it('pre-fills icon from editList in edit mode')
  it('pre-fills color from editList in edit mode')
  it('shows submitError when mutation fails')
  it('shows "Creando..." while mutating')
  it('does not submit when name is only whitespace')
  it('resets form when opening for create after edit')
})
```

### 2.2 useCreateList / useUpdateList mutations

```typescript
describe('useCreateList', () => {
  it('sends POST /api/lists with name, icon, color')
  it('invalidates ["lists"] query on success')
  it('throws parsed error message on 400')
  it('throws generic error on network failure')
})

describe('useUpdateList', () => {
  it('sends PATCH /api/lists/:id with partial data')
  it('invalidates ["lists"] query on success')
  it('throws error on 404')
})
```

## 3. Pruebas E2E (Playwright)

### 3.1 `tests/e2e/add-list.e2e.spec.ts`

```typescript
test('should open add list modal from sidebar', async ({ page }) => {
  // 1. Navigate to /my-day
  // 2. Click "New List" button in sidebar
  // 3. Assert modal is visible with title "Nueva lista"
  // 4. Assert input is focused
})

test('should create a new list successfully', async ({ page }) => {
  // 1. Open modal
  // 2. Type "Shopping" in name input
  // 3. Select "shopping_cart" icon (click 2nd icon)
  // 4. Select secondary color (click 2nd color)
  // 5. Click "Crear lista"
  // 6. Assert modal closes
  // 7. Assert new list appears in sidebar ListNav
  // 8. Refresh page
  // 9. Assert list persists in sidebar
})

test('should not submit with empty name', async ({ page }) => {
  // 1. Open modal
  // 2. Leave input empty
  // 3. Assert "Crear lista" button is disabled
  // 4. Try clicking it (should not close modal)
})

test('should close modal via overlay click', async ({ page }) => {
  // 1. Open modal
  // 2. Click overlay outside card
  // 3. Assert modal closes
})

test('should close modal via Escape key', async ({ page }) => {
  // 1. Open modal
  // 2. Press Escape
  // 3. Assert modal closes
})

test('should close modal via X button', async ({ page }) => {
  // 1. Open modal
  // 2. Click close button (X)
  // 3. Assert modal closes
})

test('should close modal via Cancel button', async ({ page }) => {
  // 1. Open modal
  // 2. Click "Cancelar"
  // 3. Assert modal closes
})

test('should edit an existing list', async ({ page }) => {
  // (requiere un trigger de edición desde ListNav — puede ser click derecho o botón editar)
  // 1. Create list via API
  // 2. Trigger edit (via context menu or edit button in ListNav)
  // 3. Assert modal title is "Editar lista"
  // 4. Assert input has existing name
  // 5. Change name to "Shopping List"
  // 6. Click "Guardar cambios"
  // 7. Assert list renamed in sidebar
})

test('should animate entrance and exit', async ({ page }) => {
  // 1. Open modal
  // 2. Assert scale-100 and opacity-100 classes on card
  // 3. Close modal
  // 4. Assert modal is removed from DOM
})

test('should show error on server failure', async ({ page }) => {
  // 1. Intercept POST /api/lists to return 500
  // 2. Open modal, fill name
  // 3. Click "Crear lista"
  // 4. Assert error message visible
  // 5. Assert modal stays open
})

test('should handle rapid create attempts', async ({ page }) => {
  // 1. Open modal, fill name
  // 2. Click "Crear lista" rapidly 3 times
  // 3. Assert only 1 POST request was sent (button disabled while pending)
})
```

## 4. Resumen de Cobertura

| Tipo | Archivo | Tests | Prioridad |
|---|---|---|---|
| Integration | `lists-api.int.spec.ts` | 9 | Alta |
| Unit | `AddListModal` | 26 | Alta |
| Unit | `useCreateList` | 4 | Alta |
| Unit | `useUpdateList` | 3 | Alta |
| E2E | `add-list.e2e.spec.ts` | 10 | Media |
| **Total** | | **≥ 52** | |
