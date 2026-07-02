# Especificación: API Routes de Tasks (Thin Proxy)

## 1. Descripción General

API REST que expone operaciones CRUD sobre la colección `tasks` de PayloadCMS. Actúa como proxy delgado entre los hooks de TanStack Query (frontend) y la API interna de PayloadCMS. Toda request pasa por: Iron-Session (autenticación) → Zod (validación) → PayloadCMS (persistencia).

## 2. Endpoints

### 2.1 GET /api/tasks

Listar tareas del guest autenticado.

**Headers:**
```
x-guest-id: string (inyectado por middleware, no enviado por el cliente)
```

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `list` | `string` | No | Filtrar por ID de lista |
| `status` | `'pending' \| 'completed'` | No | Filtrar por estado |

**Response 200:**
```json
{
  "docs": [
    {
      "id": "abc123",
      "title": "Comprar leche",
      "description": null,
      "status": "pending",
      "important": false,
      "dueDate": null,
      "list": { "id": "list456", "name": "My Day" },
      "guestId": "uuid-guest",
      "sortOrder": 0,
      "completedAt": null,
      "subtasks": null,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "totalDocs": 1,
  "limit": 10,
  "totalPages": 1,
  "page": 1,
  "pagingCounter": 1,
  "hasPrevPage": false,
  "hasNextPage": false,
  "prevPage": null,
  "nextPage": null
}
```

**Response 401:**
```json
{ "error": "No session" }
```

**Response 503** (tras 3 retries SQLITE_BUSY):
```json
{ "error": "Service unavailable" }
```

### 2.2 POST /api/tasks

Crear una nueva tarea.

**Headers:** Mismo que GET.

**Request Body (validado con Zod):**
```json
{
  "title": "Comprar leche",
  "description": "Leche deslactosada",
  "list": "list456",
  "dueDate": "2025-01-05T00:00:00.000Z",
  "important": false
}
```

**Validation Rules:**
| Campo | Regla |
|---|---|
| `title` | `string`, min 3 chars, max 500, trimmed |
| `description` | `string`, max 5000, opcional |
| `list` | `string`, min 1 (ID de lista existente) |
| `dueDate` | `string` ISO datetime, opcional |
| `important` | `boolean`, default `false`, opcional |

**Response 201:**
```json
{
  "id": "new-task-id",
  "title": "Comprar leche",
  "description": "Leche deslactosada",
  "status": "pending",
  "important": false,
  "dueDate": "2025-01-05T00:00:00.000Z",
  "list": "list456",
  "guestId": "uuid-guest",
  "sortOrder": null,
  "completedAt": null,
  "subtasks": null,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Response 400 (Zod validation error):**
```json
{
  "error": {
    "fieldErrors": {
      "title": ["El título debe tener al menos 3 caracteres"]
    },
    "formErrors": []
  }
}
```

**Response 401:** Mismo que GET.

### 2.3 PATCH /api/tasks/{id}

Actualizar parcialmente una tarea existente.

**Headers:** Mismo que GET.

**Request Body (todos los campos opcionales):**
```json
{
  "title": "Comprar leche deslactosada",
  "status": "completed",
  "important": true,
  "dueDate": null,
  "description": "Actualizado",
  "sortOrder": 1
}
```

**Validation Rules:**
| Campo | Regla |
|---|---|
| `title` | `string`, min 3, max 500, trimmed, opcional |
| `description` | `string`, max 5000, opcional |
| `status` | `'pending' \| 'completed'`, opcional |
| `important` | `boolean`, opcional |
| `dueDate` | `string` ISO datetime *o* `null`, opcional |
| `sortOrder` | `number` int >= 0, opcional |

**Response 200:** Objeto Task actualizado.

**Response 404:**
```json
{ "error": "Task not found" }
```

**Response 403** (tarea de otro guest):
```json
{ "error": "Forbidden" }
```

### 2.4 DELETE /api/tasks/{id}

Eliminar una tarea.

**Headers:** Mismo que GET.

**Response 200:**
```json
{ "success": true }
```

**Response 404 / 403:** Mismo que PATCH.

### 2.5 Reorder (futuro) PATCH /api/tasks/reorder

Actualización batch de sortOrder para drag & drop.

**Request Body:**
```json
{
  "tasks": [
    { "id": "abc", "sortOrder": 0 },
    { "id": "def", "sortOrder": 1 }
  ]
}
```

**Response 200:**
```json
{ "success": true }
```

## 3. Contrato de Datos: Zod Schemas

```typescript
// src/lib/schemas.ts
import { z } from 'zod'

export const CreateTaskInput = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(500).transform(s => s.trim()),
  description: z.string().max(5000).optional(),
  list: z.string().min(1, 'La lista es requerida'),
  dueDate: z.string().datetime().optional(),
  important: z.boolean().default(false),
})

export const UpdateTaskInput = z.object({
  title: z.string().min(3).max(500).transform(s => s.trim()).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(['pending', 'completed']).optional(),
  important: z.boolean().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export type CreateTaskInput = z.infer<typeof CreateTaskInput>
export type UpdateTaskInput = z.infer<typeof UpdateTaskInput>
```

## 4. Dependencias Externas

| Dependencia | Uso | Ya existe |
|---|---|---|
| `payload` | getPayload() para CRUD | ✅ `src/lib/payload-client.ts` |
| `@payload-config` | Config de PayloadCMS | ✅ path alias |
| `zod` | Validación de schemas | ❌ A instalar |
| `next/server` | NextRequest, NextResponse | ✅ |
| `@/lib/payload-client` | ensureGuestInitialized() | ✅ |

## 5. Archivos a Crear

| Archivo | Propósito |
|---|---|
| `src/app/(frontend)/api/tasks/route.ts` | GET + POST |
| `src/app/(frontend)/api/tasks/[id]/route.ts` | PATCH + DELETE |
| `src/lib/schemas.ts` | Zod schemas compartidos |

## 6. No Funcional

- **Tiempo de respuesta:** < 50ms (sin incluir latencia de red)
- **Concurrencia:** Retry pattern 3 intentos con jitter exponencial (100ms, 200ms, 400ms)
- **Seguridad:** guestId nunca viaja en body/URL desde el cliente; se inyecta en header por middleware
- **Logging:** Errores no críticos logueados con `console.warn`, errores críticos con `console.error`
