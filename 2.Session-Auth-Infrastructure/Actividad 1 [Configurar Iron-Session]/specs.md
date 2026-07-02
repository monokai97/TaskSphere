# Specs: Configurar Iron-Session

## Funcionales

1. El sistema debe identificar unívocamente a cada visitante sin requerir registro o login.
2. La identidad del guest debe persistir entre requests mediante una cookie cifrada.
3. La cookie debe expirar después de 7 días de inactividad.
4. La cookie debe ser inaccesible desde JavaScript del lado cliente (httpOnly).
5. El sistema debe funcionar sin DB: la cookie es la única fuente de verdad de la identidad.

## Técnicos

| # | Requisito | Especificación |
|---|---|---|
| R1 | SessionData.guestId | `string`, opcional. UUID v4 generado con `crypto.randomUUID()` |
| R2 | SessionData.createdAt | `string`, opcional. ISO 8601 timestamp |
| R3 | password | `process.env.IRON_SESSION_PASSWORD` — mínimo 32 caracteres. Fallback para dev: `'complex_password_at_least_32_chars_long_here'` |
| R4 | cookieName | `'task-sphere-session'` |
| R5 | cookieOptions.secure | `true` en producción, `false` en desarrollo (para HTTP local) |
| R6 | cookieOptions.httpOnly | `true` — prevenir XSS access |
| R7 | cookieOptions.sameSite | `'lax'` — permite envío en navegación entre top-level sites |
| R8 | cookieOptions.maxAge | `604800` segundos (7 días) |
| R9 | getSession helper | Función async que acepta `NextRequest` y `NextResponse`, retorna `IronSession<SessionData>` |
| R10 | Exportaciones mínimas | El módulo debe exportar: `SessionData` (type), `sessionOptions` (const), `getSession` (function) |

## Contratos

```typescript
// src/lib/iron-session.ts — exports esperados

export interface SessionData {
  guestId?: string
  createdAt?: string
}

export const sessionOptions: SessionOptions = { ... }

export async function getSession(
  request: NextRequest,
  response: NextResponse
): Promise<IronSession<SessionData>>
```

```typescript
// Uso en middleware y API Routes
const session = await getSession(req, res)
// session.guestId → 'uuid-string' o undefined
if (!session.guestId) {
  session.guestId = crypto.randomUUID()
  session.createdAt = new Date().toISOString()
  await session.save()
}
```
