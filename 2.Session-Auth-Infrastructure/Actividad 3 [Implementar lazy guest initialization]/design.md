# Design: Implementar lazy guest initialization

## Visual Mapping

| Elemento Stitch | Impacto | Colección Payload |
|---|---|---|
| "1.Stack Vacio" — estado sin tareas | Aparece si guest es nuevo (aún sin lists ni tasks) | `guest-sessions` + `lists` |
| Sidebar — 4 listas default | Primer render muestra My Day, Important, Planned, Tasks | `lists` (creadas por init) |
| Config Main — preferencias | Tema/locale default aplicados | `guest-sessions.theme = 'system'`, `locale = 'es'` |

## Diagrama de Flujo

```mermaid
sequenceDiagram
    participant Client as Frontend
    participant API as GET /api/session
    participant Init as ensureGuestInitialized
    participant PC as PayloadCMS
    participant DB as SQLite

    Client->>API: GET /api/session (con cookie)
    API->>Init: ensureGuestInitialized('abc-123')
    Init->>PC: find guest-sessions where guestId='abc-123'
    PC->>DB: SELECT * FROM guest_sessions WHERE guestId = 'abc-123'
    DB-->>PC: 0 results
    PC-->>Init: totalDocs: 0

    Note over Init,DB: Primera vez — crear todo

    Init->>PC: create guest-session { guestId, createdAt, expiresAt }
    PC->>DB: INSERT INTO guest_sessions
    Init->>PC: create list "My Day"
    Init->>PC: create list "Important"
    Init->>PC: create list "Planned"
    Init->>PC: create list "Tasks"
    PC->>DB: INSERT INTO lists × 4

    Init-->>API: void (success)
    API->>PC: find guest-session by guestId
    PC-->>API: { guestId, theme: 'system', locale: 'es' }
    API-->>Client: { guestId, theme, locale }

    Note over Client,DB: Request siguiente — ya inicializado

    Client->>API: GET /api/session
    API->>Init: ensureGuestInitialized('abc-123')
    Init->>PC: find guest-sessions where guestId='abc-123'
    PC-->>Init: totalDocs: 1
    Init-->>API: void (early return — ya existe)
```

## Código Esperado

```typescript
// src/lib/payload-client.ts
import { getPayload } from 'payload'
import config from '@payload-config'

const DEFAULT_LISTS = [
  { name: 'My Day', icon: 'today', color: '#004ac6', isDefault: true, sortOrder: 0 },
  { name: 'Important', icon: 'star', color: '#ba1a1a', isDefault: false, sortOrder: 1 },
  { name: 'Planned', icon: 'calendar_today', color: '#735c00', isDefault: false, sortOrder: 2 },
  { name: 'Tasks', icon: 'list', color: '#434655', isDefault: false, sortOrder: 3 },
]

export async function ensureGuestInitialized(guestId: string): Promise<void> {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const existing = await payload.find({
      collection: 'guest-sessions',
      where: { guestId: { equals: guestId } },
      limit: 1,
    })

    if (existing.totalDocs > 0) return // ya inicializado

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    await payload.create({
      collection: 'guest-sessions',
      data: {
        guestId,
        createdAt: now.toISOString(),
        lastActiveAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
    })

    for (const list of DEFAULT_LISTS) {
      await payload.create({
        collection: 'lists',
        data: { ...list, guestId },
      })
    }
  } catch (error) {
    console.warn('[ensureGuestInitialized] Failed to initialize guest:', guestId, error)
    // Fallo silencioso — el guest opera sin datos persistidos
  }
}
```
