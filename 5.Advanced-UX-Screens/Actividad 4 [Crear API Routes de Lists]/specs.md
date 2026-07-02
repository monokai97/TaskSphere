# Actividad 4: Crear API Routes de Lists — Especificación Técnica

## 1. Requisitos Funcionales

### 1.1 POST /api/lists — Crear lista
| ID | Requisito | Prioridad |
|---|---|---|
| F1 | Validar body con Zod `CreateListInput`: `name` (string min 1 max 100, trim), `icon` (string max 50, opcional), `color` (hex regex `/^#[0-9a-fA-F]{6}$/`, opcional) | Alta |
| F2 | Si validación falla, responder 400 con `{ error: { fieldErrors, formErrors } }` | Alta |
| F3 | Si no hay `x-guest-id` header, responder 401 | Alta |
| F4 | Crear lista en PayloadCMS con `guestId` del header + `sortOrder` auto (última posición) | Alta |
| F5 | Retornar 201 con el objeto `List` completo | Alta |
| F6 | Aplicar `withRetry` para SQLITE_BUSY | Alta |

### 1.2 PATCH /api/lists/[id] — Actualizar lista
| ID | Requisito | Prioridad |
|---|---|---|
| F7 | Validar body con Zod `UpdateListInput`: `name` (opcional, min 1 max 100, trim), `icon` (opcional, max 50), `color` (opcional, hex nullable) | Alta |
| F8 | Verificar que la lista existe y pertenece al guest (`guestId` del header coincide) | Alta |
| F9 | Si no existe o no pertenece, responder 404 | Alta |
| F10 | Actualizar solo los campos enviados (PATCH parcial) | Alta |
| F11 | Retornar 200 con el objeto `List` actualizado | Alta |
| F12 | Aplicar `withRetry` para SQLITE_BUSY | Alta |

### 1.3 DELETE /api/lists/[id] — Eliminar lista
| ID | Requisito | Prioridad |
|---|---|---|
| F13 | Verificar que la lista existe y pertenece al guest | Alta |
| F14 | **Soft-check**: si `list.isDefault === true`, responder 409 Conflict con mensaje "Cannot delete a default list" | Alta |
| F15 | Si existe y no es default, eliminar la lista de PayloadCMS | Alta |
| F16 | Retornar 200 con `{ success: true }` | Alta |
| F17 | Aplicar `withRetry` para SQLITE_BUSY | Alta |

### 1.4 PATCH /api/lists/reorder — Reordenar listas (batch)
| ID | Requisito | Prioridad |
|---|---|---|
| F18 | Validar body con Zod `ReorderInput`: `{ lists: { id: number, sortOrder: number }[] }` (array min 1 item) | Alta |
| F19 | Cada `id` en el array debe corresponder a una lista del guest | Alta |
| F20 | Actualizar `sortOrder` de todas las listas en el array | Alta |
| F21 | Retornar 200 con `{ success: true }` | Alta |
| F22 | Aplicar `withRetry` para SQLITE_BUSY | Alta |

### 1.5 GET /api/lists (mejora)
| ID | Requisito | Prioridad |
|---|---|---|
| F23 | Mantener funcionalidad existente (lectura de listas por guestId, sort por sortOrder) | Alta |
| F24 | Envolver en `try/catch` para 503 en caso de error de Payload | Media |

## 2. Contratos de Datos

### 2.1 Zod Schemas (nuevo archivo `src/lib/schemas.ts`)
```typescript
import { z } from 'zod'

export const CreateListInput = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .transform(s => s.trim()),
  icon: z.string().max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Formato hex inválido')
    .optional(),
})

export const UpdateListInput = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .transform(s => s.trim())
    .optional(),
  icon: z.string().max(50).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .nullable()
    .optional(),
})

export const ReorderInput = z.object({
  lists: z
    .array(
      z.object({
        id: z.number(),
        sortOrder: z.number().int().min(0),
      }),
    )
    .min(1, 'Se requiere al menos una lista'),
})

export type CreateListInput = z.infer<typeof CreateListInput>
export type UpdateListInput = z.infer<typeof UpdateListInput>
export type ReorderInput = z.infer<typeof ReorderInput>
```

### 2.2 API Contracts

```
GET /api/lists
  → 200: { docs: List[], totalDocs: number, ... }
  → 401: { error: 'No session' }

POST /api/lists
  Body: { name: string, icon?: string, color?: string }
  → 201: List
  → 400: { error: { fieldErrors: Record<string, string[]>, formErrors: string[] } }
  → 401: { error: 'No session' }

PATCH /api/lists/{id}
  Body: { name?: string, icon?: string, color?: string | null }
  → 200: List
  → 400: { error: { fieldErrors, formErrors } }
  → 401: { error: 'No session' }
  → 404: { error: 'List not found' }

DELETE /api/lists/{id}
  → 200: { success: true }
  → 401: { error: 'No session' }
  → 404: { error: 'List not found' }
  → 409: { error: 'Cannot delete a default list' }

PATCH /api/lists/reorder
  Body: { lists: { id: number, sortOrder: number }[] }
  → 200: { success: true }
  → 400: { error: 'Invalid payload' }
  → 401: { error: 'No session' }
```

### 2.3 Response Types
```typescript
interface ApiError {
  error:
    | string
    | { fieldErrors: Record<string, string[]>; formErrors: string[] }
}

interface ListResponse {
  id: number
  name: string
  icon?: string | null
  color?: string | null
  guestId: string
  isDefault?: boolean | null
  sortOrder?: number | null
  createdAt: string
  updatedAt: string
}
```

## 3. withRetry Pattern

```typescript
// src/lib/with-retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      if (error?.code === 'SQLITE_BUSY' && attempt < maxRetries - 1) {
        const delay = Math.min(100 * Math.pow(2, attempt) + Math.random() * 50, 1000)
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }
      throw error
    }
  }
  throw new Error('Max retries exceeded')
}
```

## 4. Mapa de Endpoints a Métodos PayloadCMS

| Endpoint | Método HTTP | Operación Payload | Payload Method |
|---|---|---|---|
| `/api/lists` | GET | Find lists by guestId | `payload.find({ collection: 'lists', where: { guestId } })` |
| `/api/lists` | POST | Create list | `payload.create({ collection: 'lists', data })` |
| `/api/lists/[id]` | PATCH | Update list by id | `payload.update({ collection: 'lists', id, data })` |
| `/api/lists/[id]` | DELETE | Delete list by id | `payload.delete({ collection: 'lists', id })` |
| `/api/lists/reorder` | PATCH | Batch update sortOrder | `Promise.all(updates.map(u => payload.update(...)))` |
