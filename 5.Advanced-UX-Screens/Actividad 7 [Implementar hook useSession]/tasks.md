# Act 7: Hook useSession — Implementation Tasks

## Task 7.0: PATCH /api/session endpoint

**File:** `src/app/(frontend)/api/session/route.ts` (add PATCH export)

- [ ] Define `UpdateSessionSchema` Zod schema:
  ```ts
  const UpdateSessionSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    locale: z.enum(['es', 'en']).optional(),
    notificationsEnabled: z.boolean().optional(),
  })
  ```
- [ ] Add `export async function PATCH(req: NextRequest)` handler
- [ ] Extract `x-guest-id` header → 401 if missing
- [ ] Parse body with `UpdateSessionSchema` → 400 if invalid
- [ ] Find GuestSession by guestId with `payload.find({ collection: 'guest-sessions', where: { guestId: { equals } }, limit: 1 })`
- [ ] If not found, create new GuestSession (defensive — should already exist)
- [ ] Build update payload: only include fields present in request body
- [ ] `payload.update({ collection: 'guest-sessions', id: session.id, data: filteredUpdate })`
- [ ] Return 200 with updated session response
- [ ] Wrap in try/catch → 503 on error
- [ ] Test with curl/httpie

## Task 7.1: useSession query hook

**File:** `src/hooks/useSession.ts`

- [ ] Add `'use client'` directive
- [ ] Import from `@tanstack/react-query`:
  ```ts
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
  ```
- [ ] Define `SessionResponse` interface matching GET /api/session response
- [ ] Define `UpdateSessionInput` type
- [ ] Implement `useSession()`:
  ```ts
  export function useSession() {
    return useQuery<SessionResponse>({
      queryKey: ['session'],
      queryFn: async () => {
        const res = await fetch('/api/session')
        if (!res.ok) throw new Error('Failed to fetch session')
        return res.json()
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
    })
  }
  ```
- [ ] Export `useSession`

## Task 7.2: useUpdateSession mutation hook

**File:** `src/hooks/useSession.ts` (same file)

- [ ] Implement `useUpdateSession()`:
  ```ts
  export function useUpdateSession() {
    const queryClient = useQueryClient()

    return useMutation<SessionResponse, Error, UpdateSessionInput>({
      mutationFn: async (data) => {
        const res = await fetch('/api/session', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error ?? 'Failed to update session')
        }
        return res.json()
      },
      onMutate: async (newData) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['session'] })
        // Snapshot previous value
        const previous = queryClient.getQueryData<SessionResponse>(['session'])
        // Optimistically update cache
        if (previous) {
          queryClient.setQueryData<SessionResponse>(['session'], {
            ...previous,
            ...newData,
          })
        }
        return { previous }
      },
      onError: (_err, _newData, context) => {
        // Rollback on error
        if (context?.previous) {
          queryClient.setQueryData(['session'], context.previous)
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['session'] })
      },
    })
  }
  ```
- [ ] Export `useUpdateSession`

## Task 7.3: SessionProvider (Theme sync)

**File:** `src/providers/SessionProvider.tsx`

- [ ] Create component:
  ```tsx
  'use client'

  import { useSession } from '@/hooks/useSession'
  import { useTheme } from './ThemeProvider'
  import { useEffect } from 'react'

  export function SessionProvider({ children }: { children: React.ReactNode }) {
    const { data: session, isLoading } = useSession()
    const { setTheme } = useTheme()

    useEffect(() => {
      if (!isLoading && session?.theme) {
        setTheme(session.theme as 'light' | 'dark' | 'system')
      }
    }, [session?.theme, isLoading, setTheme])

    return <>{children}</>
  }
  ```

## Task 7.4: Integrate SessionProvider in root layout

**File:** `src/app/(frontend)/layout.tsx`

- [ ] Import `SessionProvider` from `@/providers/SessionProvider`
- [ ] Wrap `<SessionProvider>` inside `<ThemeProvider>`:
  ```tsx
  <ThemeProvider>
    <SessionProvider>
      ...
    </SessionProvider>
  </ThemeProvider>
  ```
- [ ] This ensures `useSession` has access to both `QueryClient` (from outer `<QueryProvider>`) and `ThemeContext` (from `<ThemeProvider>`)

## Task 7.5: Handle initial theme priority

**File:** `src/providers/ThemeProvider.tsx` (minor update)

- [ ] Add logic so that when `SessionProvider` calls `setTheme('system')`, it doesn't override a user's localStorage preference
- [ ] Implementation: `SessionProvider` only calls `setTheme(session.theme)` if:
  1. The session theme is explicitly set (not null)
  2. No prior localStorage theme exists, OR sync is intentional
- [ ] Alternative: let ThemeProvider's localStorage value take precedence on first load, then session sync can override on subsequent visits
- [ ] Decision: localStorage always wins on first load; session sync runs on every mount but only if localStorage is absent → store `syncSource` flag

## Task 7.6: Barrel export & cleanup

**File:** `src/hooks/index.ts` (create or update)

- [ ] Export `useSession`, `useUpdateSession` from hooks barrel

## Task 7.7: Lint & Build

- [ ] Run `pnpm lint` — 0 errors
- [ ] Run `pnpm build` — 0 errors
- [ ] Verify GET /api/session still works (PATCH shouldn't break it)
- [ ] Verify PATCH /api/session works via curl: `curl -X PATCH http://localhost:3000/api/session -H "x-guest-id: test" -d '{"theme":"dark"}'`

## Estimated Effort

| Task | Files | Est. Time |
|------|-------|-----------|
| 7.0 PATCH endpoint | 1 modified | 30 min |
| 7.1 useSession query | 1 new | 15 min |
| 7.2 useUpdateSession mutation | same file | 20 min |
| 7.3 SessionProvider | 1 new | 15 min |
| 7.4 Root layout integration | 1 modified | 5 min |
| 7.5 Theme priority | 1 modified | 15 min |
| 7.6 Barrel export | 1 new/modified | 5 min |
| 7.7 Lint & Build | — | 10 min |
| **Total** | **~5 files** | **~2 hours** |
