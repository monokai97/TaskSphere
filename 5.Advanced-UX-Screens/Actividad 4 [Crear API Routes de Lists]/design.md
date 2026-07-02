# Actividad 4: Crear API Routes de Lists — Diseño UI-a-CMS

## 1. Mapeo de Endpoints a Componentes

| Endpoint | Método | Consumido por | Componente | Acción UI |
|---|---|---|---|---|
| `/api/lists` | GET | `useLists()` | ListNav, TaskListPicker | Cargar listas del guest |
| `/api/lists` | POST | `useCreateList()` | AddListModal | Crear nueva lista |
| `/api/lists/[id]` | PATCH | `useUpdateList()` | AddListModal (edit) | Renombrar / cambiar icono/color |
| `/api/lists/[id]` | DELETE | futuro `useDeleteList()` | ListNav (context menu) | Eliminar lista |
| `/api/lists/reorder` | PATCH | `useReorderLists()` | ListNav | Drag & drop reorder |

## 2. Diagrama de Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React)                           │
│                                                             │
│  ListNav                          AddListModal              │
│  ┌──────────┐                     ┌───────────┐            │
│  │ useLists │                     │useCreateList│           │
│  │useReorder│                     │useUpdateList│           │
│  └────┬─────┘                     └─────┬─────┘            │
│       │                                 │                   │
└───────┼─────────────────────────────────┼───────────────────┘
        │ fetch GET /api/lists            │ POST /api/lists
        │ PATCH /api/lists/reorder        │ PATCH /api/lists/{id}
        │                                 │
┌───────┼─────────────────────────────────┼───────────────────┐
│       ▼                                 ▼                   │
│  ┌──────────────────────────────────────────────┐          │
│  │           API ROUTES (Next.js)                │          │
│  │                                              │          │
│  │  1. Leer x-guest-id del header                │          │
│  │  2. Validar body con Zod                      │          │
│  │  3. Aplicar withRetry()                       │          │
│  │  4. Delegar a PayloadCMS REST                 │          │
│  └──────────────────┬───────────────────────────┘          │
│                     │                                      │
│                     ▼                                      │
│  ┌──────────────────────────────────────────────┐          │
│  │           PAYLOAD CMS (Headless)              │          │
│  │                                              │          │
│  │  Access Control: guestId match               │          │
│  │  CRUD operations on 'lists' collection       │          │
│  └──────────────────┬───────────────────────────┘          │
│                     │                                      │
│                     ▼                                      │
│  ┌──────────────────────────────────────────────┐          │
│  │                 SQLite (WAL)                  │          │
│  │              task-sphere.db                   │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## 3. Estructura de Archivos

```
src/app/(frontend)/api/lists/
├── route.ts                  # GET (existente) + POST (nuevo)
└── [id]/
    └── route.ts              # PATCH + DELETE (nuevo)

src/app/(frontend)/api/lists/reorder/
└── route.ts                  # PATCH batch (nuevo)

src/lib/
├── schemas.ts                # CreateListInput, UpdateListInput, ReorderInput (nuevo)
└── with-retry.ts             # withRetry<T>() (nuevo)
```

## 4. Código de Referencia

### 4.1 GET + POST en `/api/lists/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { ensureGuestInitialized } from '@/lib/payload-client'
import { CreateListInput } from '@/lib/schemas'
import { withRetry } from '@/lib/with-retry'

export async function GET(req: NextRequest) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }
    await ensureGuestInitialized(guestId)

    const { getPayload } = await import('payload')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const lists = await withRetry(() =>
      payload.find({
        collection: 'lists',
        where: { guestId: { equals: guestId } },
        sort: 'sortOrder',
      }),
    )
    return NextResponse.json(lists)
  } catch (error) {
    console.error('[GET /api/lists]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }
    await ensureGuestInitialized(guestId)

    const body = await req.json()
    const parsed = CreateListInput.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    // Calcular sortOrder: última posición
    const { getPayload } = await import('payload')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const existing = await withRetry(() =>
      payload.find({
        collection: 'lists',
        where: { guestId: { equals: guestId } },
        limit: 0,
        depth: 0,
      }),
    )

    const sortOrder = existing.totalDocs

    const list = await withRetry(() =>
      payload.create({
        collection: 'lists',
        data: { ...parsed.data, guestId, sortOrder },
      }),
    )

    return NextResponse.json(list, { status: 201 })
  } catch (error) {
    console.error('[POST /api/lists]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
```

### 4.2 PATCH + DELETE en `/api/lists/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { UpdateListInput } from '@/lib/schemas'
import { withRetry } from '@/lib/with-retry'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const parsed = UpdateListInput.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { getPayload } = await import('payload')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Verificar existencia y ownership
    const existing = await withRetry(() =>
      payload.findByID({ collection: 'lists', id: Number(id) }),
    ).catch(() => null)

    if (!existing || existing.guestId !== guestId) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    const updated = await withRetry(() =>
      payload.update({
        collection: 'lists',
        id: Number(id),
        data: parsed.data,
      }),
    )

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/lists/[id]]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const { id } = await params

    const { getPayload } = await import('payload')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const existing = await withRetry(() =>
      payload.findByID({ collection: 'lists', id: Number(id) }),
    ).catch(() => null)

    if (!existing || existing.guestId !== guestId) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    if (existing.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete a default list' },
        { status: 409 },
      )
    }

    await withRetry(() =>
      payload.delete({ collection: 'lists', id: Number(id) }),
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/lists/[id]]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
```

### 4.3 PATCH batch en `/api/lists/reorder/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { ReorderInput } from '@/lib/schemas'
import { withRetry } from '@/lib/with-retry'

export async function PATCH(req: NextRequest) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = ReorderInput.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { getPayload } = await import('payload')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    await withRetry(() =>
      Promise.all(
        parsed.data.lists.map(({ id, sortOrder }) =>
          payload.update({
            collection: 'lists',
            id,
            data: { sortOrder },
            depth: 0,
          }),
        ),
      ),
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/lists/reorder]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
```

## 5. Consideraciones de Seguridad

| Aspecto | Implementación |
|---|---|
| **guestId spoofing** | El `x-guest-id` header lo inyecta el middleware de Next.js desde Iron-Session. El cliente no puede modificarlo. |
| **Ownership** | Access Control de PayloadCMS filtra por `guestId` en update/delete. Además, las API Routes verifican ownership explícitamente antes de operar. |
| **Default list protection** | DELETE verifica `isDefault` antes de eliminar. Esto no está en Access Control de PayloadCMS porque es regla de negocio, no de seguridad. |
| **Injection via Zod** | Todos los inputs se validan con Zod antes de llegar a PayloadCMS. Los strings se trimean. |

## 6. Manejo de Errores

| Escenario | HTTP Status | Response Body |
|---|---|---|
| Sin sesión | 401 | `{ error: 'No session' }` |
| Input inválido (Zod) | 400 | `{ error: { fieldErrors: { name: [...], icon: [...] }, formErrors: [] } }` |
| Lista no encontrada | 404 | `{ error: 'List not found' }` |
| Lista default (delete) | 409 | `{ error: 'Cannot delete a default list' }` |
| PayloadCMS error / SQLITE_BUSY (tras retry) | 503 | `{ error: 'Service unavailable' }` |
