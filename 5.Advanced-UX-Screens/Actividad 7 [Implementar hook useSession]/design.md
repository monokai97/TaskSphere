# Act 7: Hook useSession — Design

## Data Flow

```
┌─────────────┐     GET /api/session     ┌──────────────┐
│ ThemeToggle  │◄──── useSession() ──────►│ guest-sessions│
│ LanguageSelect│     staleTime: 5min     │   (Payload)  │
│ Notification  │                         └──────────────┘
│  Toggles      │                              ▲
└──────┬───────┘                              │
       │ useUpdateSession()                    │ PATCH /api/session
       │ mutation                             │
       └───────────────────────────────────────┘
           │
           ▼
   ThemeProvider.setTheme()
   (when theme field changes)
```

## Hook State Machine

### useSession()

```
IDLE (no cache)
  │
  ├─ fetch succeeds → DATA (guestId, theme, locale, notificationsEnabled)
  │     │
  │     ├─ cache valid (5min) → return cached data
  │     └─ cache stale → re-fetch
  │
  └─ fetch fails → ERROR
        │
        └─ retry (2x) → if still fail → ERROR state
```

### useUpdateSession()

```
IDLE
  │
  ├─ mutate({ theme: 'dark' })
  │     │
  │     ├─ optimistic update → queryClient.setQueryData(['session'], { ...old, theme: 'dark' })
  │     │     │
  │     │     ├─ PATCH succeeds → invalidateQueries(['session']) → confirm data from server
  │     │     └─ PATCH fails → rollback query cache + show error toast
  │     │
  │     └─ ThemeProvider.setTheme('dark') called immediately
  │
  └─ isPending → button shows loading state or disabled
```

## Integration Architecture

### Option A: SessionProvider (recommended)

```tsx
// src/providers/SessionProvider.tsx
'use client'

import { useSession, useUpdateSession } from '@/hooks/useSession'
import { useTheme } from './ThemeProvider'
import { useEffect } from 'react'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isLoading } = useSession()
  const { setTheme } = useTheme()

  useEffect(() => {
    if (!isLoading && session?.theme) {
      setTheme(session.theme)
    }
  }, [session?.theme, isLoading, setTheme])

  return <>{children}</>
}
```

### Option B: Inline in ThemeProvider (simpler)

Add the sync logic directly inside `ThemeProvider` by calling `useSession()` there. However, this creates a circular dependency (ThemeProvider imports from hooks, hooks may reference ThemeProvider). Option A is cleaner.

## Component Integration

```tsx
// ThemeToggle.tsx (Act 6)
function ThemeToggle() {
  const { data: session } = useSession()
  const { mutate: updateSession, isPending } = useUpdateSession()
  const { setTheme } = useTheme()

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)                           // immediate DOM update
    updateSession({ theme: newTheme })           // server persistence
  }

  return (
    <div>
      <Button active={session?.theme === 'light'} onClick={() => handleThemeChange('light')}>
        Claro
      </Button>
      <Button active={session?.theme === 'dark'} onClick={() => handleThemeChange('dark')}>
        Oscuro
      </Button>
      <Button active={session?.theme === 'system'} onClick={() => handleThemeChange('system')}>
        Auto
      </Button>
    </div>
  )
}
```

## PATCH Route Flow

```
Request: PATCH /api/session { "theme": "dark" }
  │
  ├─ 1. Extract x-guest-id header
  │     └─ Missing → 401
  │
  ├─ 2. Zod parse body
  │     └─ Invalid → 400 + details
  │
  ├─ 3. Find GuestSession by guestId
  │     └─ Not found → 404
  │
  ├─ 4. payload.update({ collection: 'guest-sessions', id, data: { theme: 'dark' } })
  │     └─ Error → 503
  │
  └─ 5. Return 200 { guestId, createdAt, theme: 'dark', locale, notificationsEnabled }
```

## Cache Strategy

| Query | Key | staleTime | gcTime | Reason |
|-------|-----|-----------|--------|--------|
| `useSession` | `['session']` | 5 min | 10 min | Preferences rarely change |
| `useUpdateSession` | mutation | — | — | Invalidates `['session']` on success |

## Error Handling

| Scenario | User Experience |
|----------|----------------|
| Fetch fails (network down) | Retry 2x, then show stale data if available, else error state |
| Mutate fails (network down) | Rollback optimistic update, show toast "No se pudo guardar" |
| Server returns 503 | Same as fetch fail |
| Validation error (400) | Toast "Datos inválidos" (should not happen with client-side validation) |
