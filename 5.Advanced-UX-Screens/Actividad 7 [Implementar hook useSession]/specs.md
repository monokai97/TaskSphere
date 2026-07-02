# Act 7: Hook useSession — Functional Specifications

## 7.1 Hook API

### `useSession()`

```ts
function useSession(): {
  data: SessionResponse | undefined
  isLoading: boolean
  error: Error | null
}
```

**Where `SessionResponse` is:**
```ts
interface SessionResponse {
  guestId: string
  createdAt: string
  locale: string | null
  theme: string | null
  notificationsEnabled: boolean | null
}
```

### `useUpdateSession()`

```ts
function useUpdateSession(): {
  mutate: (data: UpdateSessionInput) => void
  mutateAsync: (data: UpdateSessionInput) => Promise<SessionResponse>
  isPending: boolean
}
```

**Where `UpdateSessionInput` is:**
```ts
interface UpdateSessionInput {
  theme?: 'light' | 'dark' | 'system'
  locale?: 'es' | 'en'
  notificationsEnabled?: boolean
}
```

### Behavior
- `useSession` fetches `GET /api/session` via `useQuery`
  - `queryKey: ['session']`
  - `staleTime: 5 * 60 * 1000` (5 minutes — preferences change rarely)
  - `gcTime: 10 * 60 * 1000`
  - `retry: 2` (handle transient failures)
- `useUpdateSession` PATCHes `PATCH /api/session` via `useMutation`
  - On success: invalidates `['session']` query
  - Optimistic update: updates query cache immediately, rollback on error
- When theme changes via mutation, hook synchronizes with `ThemeProvider.setTheme()`

## 7.2 PATCH /api/session Endpoint

**File:** `src/app/(frontend)/api/session/route.ts` (add PATCH method)

### Request
```
PATCH /api/session
Content-Type: application/json

{
  "theme": "dark",
  "locale": "es",
  "notificationsEnabled": true
}
```

### Validation (Zod)
```ts
const UpdateSessionSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  locale: z.enum(['es', 'en']).optional(),
  notificationsEnabled: z.boolean().optional(),
})
```

### Response
- 200: `{ guestId, createdAt, locale, theme, notificationsEnabled }` (updated session)
- 400: `{ error: 'Validation error', details: [...] }` (Zod validation errors)
- 401: `{ error: 'No session' }` (missing x-guest-id)
- 503: `{ error: 'Service unavailable' }` (PayloadCMS error)

### Implementation
1. Extract `x-guest-id` from request headers
2. Validate body with `UpdateSessionSchema`
3. Find the GuestSession doc by `guestId`
4. Build update payload with only provided fields
5. Call `payload.update({ collection: 'guest-sessions', id: sessionId, data: updateData })`
6. Return updated session

## 7.3 ThemeProvider Integration

### Behavior
- The `useSession` hook must be called from a component that has access to both `QueryClient` (for TanStack Query) and `ThemeContext` (for `useTheme()`)
- A new `SessionProvider` wrapper component is created that:
  1. Calls `useSession()` inside the component
  2. Uses `useEffect` to sync `session.theme` with `ThemeProvider.setTheme()`
  3. Priority: localStorage theme > session theme > 'system'
- `SessionProvider` wraps `<ThemeProvider>` inside root layout, or a client component between them
- On page load:
  1. `ThemeProvider` reads localStorage (instant, no async)
  2. `useSession` fetches from API (async)
  3. When session data arrives, if `session.theme` differs from current, call `setTheme(session.theme)`
- On settings change:
  1. User clicks "Oscuro" in ThemeToggle
  2. ThemeToggle calls `useUpdateSession({ theme: 'dark' })`
  3. Mutation onSuccess: `setTheme('dark')` + localStorage updated
  4. Or: hook internally calls `setTheme()` before mutation resolves (optimistic)

## 7.4 File Structure

```
src/hooks/useSession.ts          — useSession() + useUpdateSession()
src/app/(frontend)/api/session/route.ts  — adds PATCH handler
src/app/(frontend)/layout.tsx    — wraps <SessionProvider> if created
```
