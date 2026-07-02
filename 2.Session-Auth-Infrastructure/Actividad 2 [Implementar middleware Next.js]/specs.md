# Specs: Implementar middleware de Next.js

## Funcionales

1. Cada request HTTP debe tener un `guestId` único asociado, visible en el header `x-guest-id`.
2. Si el visitante no tiene cookie, el middleware debe crear una nueva sesión y asignar un nuevo UUID.
3. Si el visitante tiene cookie válida, el middleware debe leer el `guestId` existente.
4. El admin panel de PayloadCMS y assets estáticos deben funcionar sin intervención del middleware.
5. El middleware no debe escribir en la base de datos ni bloquear el request para operaciones I/O pesadas.

## Técnicos

| # | Requisito | Especificación |
|---|---|---|
| R1 | Importar sessionOptions | `import { sessionOptions, SessionData } from '@/lib/iron-session'` |
| R2 | Obtener sesión | `const session = await getIronSession<SessionData>(request, response, sessionOptions)` |
| R3 | Crear sesión nueva | Si `!session.guestId`: `session.guestId = crypto.randomUUID()`, `session.createdAt = new Date().toISOString()`, `await session.save()` |
| R4 | Header injection | `requestHeaders.set('x-guest-id', session.guestId)` |
| R5 | Response headers | `NextResponse.next({ request: { headers: requestHeaders } })` |
| R6 | Matcher | `export const config = { matcher: '/((?!_next|api/auth|admin|static|favicon.ico).*)' }` |
| R7 | Tipado | Usar genérico `<SessionData>` en `getIronSession` |
| R8 | No capturar errores | Si Iron-Session lanza (cookie inválida), dejar que falle para no silenciar errores de config |

## Contratos

```typescript
// src/middleware.ts — estructura esperada
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(request, response, sessionOptions)

  if (!session.guestId) {
    session.guestId = crypto.randomUUID()
    session.createdAt = new Date().toISOString()
    await session.save()
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-guest-id', session.guestId)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: '/((?!_next|api/auth|admin|static|favicon.ico).*)',
}
```

```typescript
// Uso en API Route (consumidor del header)
export async function GET(req: NextRequest) {
  const guestId = req.headers.get('x-guest-id')  // <- inyectado por middleware
  // guestId siempre existe si el matcher incluye esta ruta
}
```
