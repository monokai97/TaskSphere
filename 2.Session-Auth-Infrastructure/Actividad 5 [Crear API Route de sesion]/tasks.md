# Tasks: Crear API Route de sesión

## Dependencias
- Actividad 1 completada (`getSession` en `src/lib/iron-session.ts`)
- Actividad 2 completada (middleware inyecta `x-guest-id`)
- Actividad 3 completada (`ensureGuestInitialized` en `src/lib/payload-client.ts`)
- Fase 1 Actividades 1-2 completadas (colecciones registradas)
- `src/app/(frontend)/api/session/` directory existe

---

## Hito 5.1: GET /api/session

- [ ] Crear directorio `src/app/(frontend)/api/session/`
- [ ] Crear `src/app/(frontend)/api/session/route.ts`
- [ ] Importar `{ getPayload } from 'payload'`, `config from '@payload-config'`, `{ getSession } from '@/lib/iron-session'`, `{ ensureGuestInitialized } from '@/lib/payload-client'`
- [ ] Exportar `async function GET(req: NextRequest)`
- [ ] Leer `guestId` de `req.headers.get('x-guest-id')`
- [ ] Si no hay guestId: retornar 401
- [ ] Ejecutar `await ensureGuestInitialized(guestId)`
- [ ] Obtener instancia PayloadCMS
- [ ] Buscar `guest-sessions` por guestId, limit 1, depth 0
- [ ] Retornar `{ guestId, createdAt, locale, theme, notificationsEnabled }`

## Hito 5.2: DELETE /api/session

- [ ] Exportar `async function DELETE(req: NextRequest)`
- [ ] Leer guestId del header
- [ ] Si no hay guestId: retornar 401
- [ ] Obtener instancia PayloadCMS
- [ ] Eliminar tasks: `payload.delete({ collection: 'tasks', where: { guestId: { equals: guestId } } })`
- [ ] Eliminar task-logs: `payload.delete({ collection: 'task-logs', where: { guestId: { equals: guestId } } })`
- [ ] Eliminar lists: `payload.delete({ collection: 'lists', where: { guestId: { equals: guestId } } })`
- [ ] Eliminar guest-sessions: `payload.delete({ collection: 'guest-sessions', where: { guestId: { equals: guestId } } })`
- [ ] Crear response con `NextResponse.json({ success: true })`
- [ ] Obtener session via `getSession(req, res)`, ejecutar `session.destroy()`, `await session.save()`
- [ ] Retornar response

## Hito 5.3: Error handling

- [ ] Envolver GET en try/catch
- [ ] Envolver DELETE en try/catch
- [ ] En catch: loggear error con `console.error`, retornar 503
- [ ] Verificar que 401 se retorna ANTES de cualquier operación con PayloadCMS

## Hito 5.4: Type-safe response

- [ ] Crear interface `SessionResponse` para tipar la respuesta de GET
- [ ] Tipar la respuesta con `NextResponse.json<SessionResponse>(...)`
- [ ] Verificar que el tipo coincide con el contrato de `GuestSession` en `payload-types.ts`

## Verificación

- [ ] `npx tsc --noEmit` pasa sin errores
- [ ] `pnpm dev` inicia sin errores
- [ ] `curl http://localhost:3000/api/session` retorna 200 con `{ guestId, createdAt, theme, locale }`
- [ ] `curl -X DELETE http://localhost:3000/api/session` retorna `{ success: true }`
- [ ] Después de DELETE, la cookie `task-sphere-session` desaparece (nuevo request genera nueva)
- [ ] Sin cookie, `curl http://localhost:3000/api/session` retorna 401
