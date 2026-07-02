# Tests: Configurar Iron-Session

## Estrategia

Actividad de configuración — tests de compilación y verificación de tipos.

## Test Suite

### 1. Type Check

```bash
npx tsc --noEmit
```
- **Criterio:** 0 errores
- **Verifica:** Los tipos de iron-session son compatibles con Next.js Request/Response

### 2. Export test

```bash
node -e "
const mod = require('./src/lib/iron-session.ts') // via tsx
"
```
O alternativamente verificar imports con TypeScript:

```typescript
// test-imports.ts (temporal)
import { SessionData, sessionOptions, getSession } from './src/lib/iron-session'

// Verificar tipo
const data: SessionData = { guestId: 'test', createdAt: new Date().toISOString() }
console.log('SessionData OK:', data)

// Verificar options
console.log('cookieName:', sessionOptions.cookieName)
console.log('maxAge:', sessionOptions.cookieOptions?.maxAge)
console.log('httpOnly:', sessionOptions.cookieOptions?.httpOnly)
```

### 3. Verificación de seguridad

| Propiedad | Valor esperado | Riesgo si incorrecto |
|---|---|---|
| httpOnly | `true` | XSS puede leer cookie |
| sameSite | `'lax'` | CSRF en requests POST |
| secure (prod) | `true` | Cookie enviada por HTTP plano |
| password length | >= 32 chars | AES-256-GCM rechaza passwords cortos |

### 4. Compatibilidad con Next.js (prueba manual)

- [ ] El archivo usa solo API de Next.js compatibles con App Router (`NextRequest`, `NextResponse`)
- [ ] No usa `NextApiRequest`/`NextApiResponse` (Pages Router)
- [ ] `getSession` es una función async que puede usarse tanto en middleware como en Route Handlers
