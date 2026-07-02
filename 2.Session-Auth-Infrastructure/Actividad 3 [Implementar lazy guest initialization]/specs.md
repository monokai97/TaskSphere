# Specs: Implementar lazy guest initialization

## Funcionales

1. El sistema debe crear un documento `GuestSession` en PayloadCMS para cada nuevo guest en el momento de su primer request de datos.
2. El sistema debe crear 4 listas default para cada nuevo guest: "My Day", "Important", "Planned", "Tasks".
3. La lista "My Day" debe marcarse como `isDefault: true`.
4. Si la función se llama múltiples veces para el mismo guestId, no debe duplicar datos.
5. Si PayloadCMS no responde, la función debe fallar silenciosamente sin crashear el request.

## Técnicos

| # | Requisito | Especificación |
|---|---|---|
| R1 | Import config | `import config from '@payload-config'` |
| R2 | Instancia Payload | `const payloadConfig = await config; const payload = await getPayload({ config: payloadConfig })` |
| R3 | Buscar GuestSession | `payload.find({ collection: 'guest-sessions', where: { guestId: { equals: guestId } }, limit: 1 })` |
| R4 | Early return | Si `results.totalDocs > 0`, retornar inmediatamente |
| R5 | Crear GuestSession | `payload.create({ collection: 'guest-sessions', data: { guestId, createdAt, lastActiveAt: createdAt, expiresAt } })` donde `expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()` |
| R6 | Crear listas default | 4 llamadas a `payload.create({ collection: 'lists', data: { name, icon, color, guestId, isDefault, sortOrder } })` |
| R7 | Datos de listas default | My Day (icon: 'today', isDefault: true), Important (icon: 'star', isDefault: false), Planned (icon: 'calendar_today', isDefault: false), Tasks (icon: 'list', isDefault: false) |
| R8 | Try/catch silencioso | Envolver todo el bloque en try/catch — si falla, solo loggear warning, no relanzar |
| R9 | Exportar función | `export async function ensureGuestInitialized(guestId: string): Promise<void>` |

## Contratos

```typescript
// src/lib/payload-client.ts
export async function ensureGuestInitialized(guestId: string): Promise<void>

// Uso en API Route de sesión
import { ensureGuestInitialized } from '@/lib/payload-client'

export async function GET(req: NextRequest) {
  const guestId = req.headers.get('x-guest-id')
  await ensureGuestInitialized(guestId)  // lazy init
  // continuar con la lógica del endpoint
}
```

```typescript
// Listas default creadas
const DEFAULT_LISTS = [
  { name: 'My Day', icon: 'today', color: '#004ac6', isDefault: true, sortOrder: 0 },
  { name: 'Important', icon: 'star', color: '#ba1a1a', isDefault: false, sortOrder: 1 },
  { name: 'Planned', icon: 'calendar_today', color: '#735c00', isDefault: false, sortOrder: 2 },
  { name: 'Tasks', icon: 'list', color: '#434655', isDefault: false, sortOrder: 3 },
]
```
