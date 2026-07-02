# Tasks: Implementar middleware de Next.js

## Dependencias
- Actividad 1 completada (`src/lib/iron-session.ts` existe con `sessionOptions` y `SessionData`)
- `iron-session` instalado

---

## Hito 2.1: Estructura base del middleware

- [ ] Crear `src/middleware.ts`
- [ ] Importar `{ getIronSession } from 'iron-session'`
- [ ] Importar `{ NextResponse } from 'next/server'`
- [ ] Importar `type { NextRequest } from 'next/server'`
- [ ] Importar `{ sessionOptions }` y `type { SessionData }` desde `@/lib/iron-session`
- [ ] Exportar función `async function middleware(request: NextRequest)`
- [ ] Internamente: `const response = NextResponse.next()`
- [ ] Retornar `NextResponse.next()` al final

## Hito 2.2: Leer sesión existente

- [ ] Usar `getIronSession<SessionData>(request, response, sessionOptions)` para obtener `session`
- [ ] El objeto `session` contendrá `guestId` y `createdAt` si la cookie existe y es válida

## Hito 2.3: Crear sesión nueva

- [ ] Verificar `if (!session.guestId)`
- [ ] Asignar `session.guestId = crypto.randomUUID()`
- [ ] Asignar `session.createdAt = new Date().toISOString()`
- [ ] Ejecutar `await session.save()` para persistir la cookie

## Hito 2.4: Inyectar x-guest-id header

- [ ] Crear `const requestHeaders = new Headers(request.headers)`
- [ ] `requestHeaders.set('x-guest-id', session.guestId)`
- [ ] Modificar return: `return NextResponse.next({ request: { headers: requestHeaders } })`

## Hito 2.5: Configurar matcher

- [ ] Añadir `export const config = { matcher: '/((?!_next|api/auth|admin|static|favicon.ico).*)' }`
- [ ] Verificar que excluye: `/_next/`, `/api/auth/*`, `/admin/*`, `/static/*`, `/favicon.ico`
- [ ] Verificar que incluye: todas las rutas de la app (`/my-day`, `/api/tasks`, `/settings`, etc.)

## Verificación

- [ ] `npx tsc --noEmit` pasa sin errores
- [ ] `pnpm dev` inicia sin errores
- [ ] En DevTools > Network, el primer request a `/` retorna `Set-Cookie: task-sphere-session={...}`
- [ ] En DevTools > Application > Cookies, aparece `task-sphere-session` con valor cifrado
- [ ] Refrescar la página: la cookie se envía en el request header `Cookie`
- [ ] Requests a `/admin` no tienen `x-guest-id` header (excluido por matcher)
