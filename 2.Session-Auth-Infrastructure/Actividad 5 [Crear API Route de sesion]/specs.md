# Specs: Crear API Route de sesión

## Funcionales

1. GET /api/session debe retornar los datos de la sesión del guest actual: guestId, createdAt, locale, theme.
2. GET /api/session debe disparar la inicialización lazy del guest si es su primer request.
3. DELETE /api/session debe eliminar todos los datos del guest (tasks, lists, task-logs, guest-session).
4. DELETE /api/session debe destruir la cookie Iron-Session para que el guest sea tratado como nuevo visitante.
5. Si no hay guestId en el header, ambos endpoints deben retornar 401.

## Técnicos

| # | Requisito | Especificación |
|---|---|---|
| R1 | GET handler | `export async function GET(req: NextRequest)` |
| R2 | Validación guestId | `const guestId = req.headers.get('x-guest-id'); if (!guestId) return 401` |
| R3 | Lazy init | `await ensureGuestInitialized(guestId)` antes de consultar PayloadCMS |
| R4 | Consulta GuestSession | `payload.find({ collection: 'guest-sessions', where: { guestId: { equals: guestId } }, limit: 1, depth: 0 })` |
| R5 | Response GET | `{ guestId, createdAt, locale, theme, notificationsEnabled }` — solo campos relevantes para frontend |
| R6 | DELETE handler | `export async function DELETE(req: NextRequest)` |
| R7 | Eliminar tasks | `payload.delete({ collection: 'tasks', where: { guestId: { equals: guestId } } })` |
| R8 | Eliminar task-logs | `payload.delete({ collection: 'task-logs', where: { guestId: { equals: guestId } } })` |
| R9 | Eliminar lists | `payload.delete({ collection: 'lists', where: { guestId: { equals: guestId } } })` |
| R10 | Eliminar guest-session | `payload.delete({ collection: 'guest-sessions', where: { guestId: { equals: guestId } } })` |
| R11 | Destruir cookie | Obtener session via `getSession(req, res)`, asignar `session.destroy()`, `await session.save()` |
| R12 | Response DELETE | `{ success: true }` |
| R13 | Error 401 | Si no hay guestId: `NextResponse.json({ error: 'No session' }, { status: 401 })` |
| R14 | Error 503 | Si PayloadCMS falla: `NextResponse.json({ error: 'Service unavailable' }, { status: 503 })` |

## Contratos

```typescript
// GET /api/session → 200
{
  guestId: string,
  createdAt: string,
  locale: 'es' | 'en' | null,
  theme: 'light' | 'dark' | 'system' | null,
  notificationsEnabled: boolean | null
}

// DELETE /api/session → 200
{ success: true }

// Error → 401
{ error: 'No session' }

// Error → 503
{ error: 'Service unavailable' }
```
