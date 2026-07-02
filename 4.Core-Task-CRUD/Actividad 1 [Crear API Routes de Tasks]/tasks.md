# Tasks: Crear API Routes de Tasks

## Dependencias Previas

- [x] Medio: Iron-Session middleware funciona e inyecta `x-guest-id` (Fase 2)
- [x] Fuerte: Colección `Tasks` registrada en PayloadCMS con hooks afterChange/afterDelete (Fase 1)
- [x] Fuerte: `ensureGuestInitialized()` en `src/lib/payload-client.ts` (Fase 2)
- [x] Débil: `src/app/(frontend)/api/` directory existe (verificado en session/list routes existentes)

## Hitos

### Hito 1: Zod Schemas Compartidos

**Archivo:** `src/lib/schemas.ts`

- [ ] 1.1 Crear `CreateTaskInput` schema con:
  - `title`: `z.string().min(3).max(500).transform(s => s.trim())`
  - `description`: `z.string().max(5000).optional()`
  - `list`: `z.string().min(1)`
  - `dueDate`: `z.string().datetime().optional()`
  - `important`: `z.boolean().default(false)`
- [ ] 1.2 Crear `UpdateTaskInput` schema con:
  - `title`: opcional, mismas reglas
  - `description`: opcional
  - `status`: `z.enum(['pending', 'completed']).optional()`
  - `important`: `z.boolean().optional()`
  - `dueDate`: `z.string().datetime().nullable().optional()`
  - `sortOrder`: `z.number().int().min(0).optional()`
- [ ] 1.3 Exportar tipos inferidos: `export type CreateTaskInput = z.infer<typeof CreateTaskInput>`
- [ ] 1.4 Verificar con `pnpm lint` que no hay errores de tipo

### Hito 2: GET /api/tasks

**Archivo:** `src/app/(frontend)/api/tasks/route.ts`

- [ ] 2.1 Definir handler `GET(req: NextRequest)`
- [ ] 2.2 Extraer `guestId` de `req.headers.get('x-guest-id')`; si no existe → 401
- [ ] 2.3 Llamar `ensureGuestInitialized(guestId)` para garantizar sesión en DB
- [ ] 2.4 Leer query params `list` y `status` de `req.nextUrl.searchParams`
- [ ] 2.5 Construir objeto `where` con `guestId: { equals: guestId }`
- [ ] 2.6 Si `list` presente: añadir `list: { equals: listId }`
- [ ] 2.7 Si `status` presente: añadir `status: { equals: status }`
- [ ] 2.8 Ejecutar `payload.find({ collection: 'tasks', where, sort: 'sortOrder', depth: 1 })`
- [ ] 2.9 Envolver payload call en `withRetry()` para SQLITE_BUSY
- [ ] 2.10 Retornar `NextResponse.json(tasks)` con los docs

### Hito 3: POST /api/tasks

**Archivo:** `src/app/(frontend)/api/tasks/route.ts`

- [ ] 3.1 Definir handler `POST(req: NextRequest)`
- [ ] 3.2 Extraer `guestId`; si no existe → 401
- [ ] 3.3 Llamar `ensureGuestInitialized(guestId)`
- [ ] 3.4 Parsear body: `const body = await req.json()`
- [ ] 3.5 Validar con `CreateTaskInput.safeParse(body)`
- [ ] 3.6 Si `!parsed.success`: retornar 400 con `parsed.error.flatten()`
- [ ] 3.7 Ejecutar `payload.create({ collection: 'tasks', data: { ...parsed.data, guestId } })`
- [ ] 3.8 Envolver en `withRetry()`
- [ ] 3.9 Retornar 201 con la tarea creada

### Hito 4: PATCH /api/tasks/[id]

**Archivo:** `src/app/(frontend)/api/tasks/[id]/route.ts`

- [ ] 4.1 Definir handler `PATCH(req: NextRequest, { params }: { params: { id: string } })`
- [ ] 4.2 Extraer `guestId`; si no existe → 401
- [ ] 4.3 Parsear body y validar con `UpdateTaskInput.safeParse(body)`
- [ ] 4.4 Si `!parsed.success`: retornar 400 con errores
- [ ] 4.5 Ejecutar `payload.update({ collection: 'tasks', id: params.id, data: parsed.data })`
- [ ] 4.6 Si PayloadCMS retorna `null` (not found): retornar 404
- [ ] 4.7 Envolver en `withRetry()`
- [ ] 4.8 Retornar 200 con la tarea actualizada

### Hito 5: DELETE /api/tasks/[id]

**Archivo:** `src/app/(frontend)/api/tasks/[id]/route.ts`

- [ ] 5.1 Definir handler `DELETE(req: NextRequest, { params }: { params: { id: string } })`
- [ ] 5.2 Extraer `guestId`; si no existe → 401
- [ ] 5.3 Ejecutar `payload.delete({ collection: 'tasks', id: params.id })`
- [ ] 5.4 Envolver en `withRetry()`
- [ ] 5.5 Retornar `NextResponse.json({ success: true })`

### Hito 6: Retry Pattern SQLITE_BUSY

**Archivo reusable** (definir inline en cada route o en `src/lib/payload-client.ts`):

- [ ] 6.1 Implementar `async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T>`
- [ ] 6.2 Capturar error con `error?.code === 'SQLITE_BUSY'`
- [ ] 6.3 Calcular delay: `Math.min(100 * Math.pow(2, attempt) + Math.random() * 50, 1000)`
- [ ] 6.4 Después de 3 intentos fallidos: retornar 503
- [ ] 6.5 Aplicar `withRetry()` a cada operación CRUD (find, create, update, delete)

### Hito 7: Validación Final

- [ ] 7.1 Ejecutar `pnpm lint` — sin errores
- [ ] 7.2 Ejecutar `pnpm build` — build exitoso
- [ ] 7.3 Verificar que `src/lib/schemas.ts` no tiene errores de tipo
- [ ] 7.4 Verificar que los imports relativos usan extensión `.js` (convención del proyecto)

## Orden de Implementación

```
Hito 1 (schemas)
  ↓
Hito 2 (GET) ──┐
Hito 3 (POST) ──┤── Hito 6 (retry pattern) ── Hito 7 (validación)
Hito 4 (PATCH) ─┤
Hito 5 (DELETE) ┘
```

## Checklist de Archivos

| Archivo | Estado |
|---|---|
| `src/lib/schemas.ts` | ❌ No existe |
| `src/app/(frontend)/api/tasks/route.ts` | ❌ No existe |
| `src/app/(frontend)/api/tasks/[id]/route.ts` | ❌ No existe |
