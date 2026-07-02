# Actividad 4: Crear API Routes de Lists — Micro-tareas

## Hito 4.1: Utilidades compartidas (schemas + withRetry)

### Tarea 4.1.1 — Crear `src/lib/schemas.ts`
- Exportar `CreateListInput` Zod schema: `z.object({ name: z.string().min(1).max(100).transform(s => s.trim()), icon: z.string().max(50).optional(), color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional() })`
- Exportar `UpdateListInput` Zod schema: similar a CreateListInput pero todos los campos opcionales, `color` nullable
- Exportar `ReorderInput` Zod schema: `z.object({ lists: z.array(z.object({ id: z.number(), sortOrder: z.number().int().min(0) })).min(1) })`
- Exportar tipos inferidos: `type CreateListInput`, `type UpdateListInput`, `type ReorderInput`

### Tarea 4.1.2 — Crear `src/lib/with-retry.ts`
- Exportar función genérica `async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T>`
- Implementar loop con 3 intentos, jitter exponencial (100ms, 200ms, 400ms + random 0-50ms), captura `error?.code === 'SQLITE_BUSY'`
- Si todos los retries fallan, lanzar error original

## Hito 4.2: Actualizar GET y añadir POST en `/api/lists/route.ts`

### Tarea 4.2.1 — Envolver GET existente en try/catch + withRetry
- Añadir `try/catch` alrededor de la lógica actual de GET
- Envolver `payload.find()` con `withRetry()`
- En catch, loggear error y responder 503 `{ error: 'Service unavailable' }`

### Tarea 4.2.2 — Añadir POST handler
- `export async function POST(req: NextRequest)`
- Extraer `guestId` de header, retornar 401 si no existe
- `await ensureGuestInitialized(guestId)`
- Parsear body JSON y validar con `CreateListInput.safeParse()`. Si inválido, 400 con `parsed.error.flatten()`
- Contar listas existentes del guest para asignar `sortOrder = totalDocs`
- Crear lista con `withRetry(() => payload.create({ collection: 'lists', data: { ...parsed.data, guestId, sortOrder } }))`
- Responder 201 con objeto `List`
- Catch general: 503

## Hito 4.3: Crear PATCH + DELETE en `/api/lists/[id]/route.ts`

### Tarea 4.3.1 — Crear directorio y archivo
- Crear `src/app/(frontend)/api/lists/[id]/route.ts`

### Tarea 4.3.2 — PATCH handler
- `export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> })`
- Extraer `guestId` (401 si no), `id` de params
- Validar body con `UpdateListInput.safeParse()` (400 si inválido)
- Verificar existencia: `payload.findByID({ collection: 'lists', id: Number(id) })`. Si no existe o `guestId` no coincide, 404
- Actualizar con `withRetry(() => payload.update({ collection: 'lists', id: Number(id), data: parsed.data }))`
- Responder 200 con objeto actualizado

### Tarea 4.3.3 — DELETE handler
- `export async function DELETE(req, { params })`
- Extraer `guestId` (401 si no), `id` de params
- Verificar existencia + ownership. Si no, 404
- **Soft-check**: si `existing.isDefault === true`, responder 409 con mensaje
- Eliminar con `withRetry(() => payload.delete({ collection: 'lists', id: Number(id) }))`
- Responder 200 `{ success: true }`

## Hito 4.4: Crear PATCH batch en `/api/lists/reorder/route.ts`

### Tarea 4.4.1 — Crear directorio y archivo
- Crear `src/app/(frontend)/api/lists/reorder/route.ts`

### Tarea 4.4.2 — PATCH handler
- `export async function PATCH(req: NextRequest)`
- Extraer `guestId` (401 si no)
- Validar body con `ReorderInput.safeParse()` (400 si inválido)
- Ejecutar batch update: `withRetry(() => Promise.all(parsed.data.lists.map(({ id, sortOrder }) => payload.update({ collection: 'lists', id, data: { sortOrder }, depth: 0 }))))`
- Responder 200 `{ success: true }`

## Hito 4.5: Verificación y lint

### Tarea 4.5.1 — Verificar integración con hooks
- `useCreateList()` en `src/hooks/useLists.ts` debe hacer `POST /api/lists` (existente de Act 2)
- `useUpdateList()` debe hacer `PATCH /api/lists/[id]`
- `useReorderLists()` debe hacer `PATCH /api/lists/reorder`
- Confirmar que los paths coinciden con las rutas creadas

### Tarea 4.5.2 — ESLint y type-check
- Ejecutar `pnpm lint` para verificar reglas del proyecto
- Verificar tipos: imports de Zod schemas, tipos de respuesta, parámetros de NextRequest/NextResponse
- Asegurar que `params` usa `Promise<{ id: string }>` (Next.js 16 App Router pattern)
- No warnings de `no-unused-vars`, `no-explicit-any`
