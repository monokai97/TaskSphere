# Act 7: Hook useSession — Test Plan

## Test Strategy

- **Integration (Vitest)**: Primary testing — test the hook's interaction with the query client and mock fetch
- **E2E (Playwright)**: Secondary — test the full round-trip (PATCH → re-fetch → UI update)
- **Unit**: Minimal — the hook itself is simple; the logic is in TanStack Query internals

---

## Integration Tests (`tests/int/session-hook.int.spec.ts`)

### Setup

```ts
// Test helpers needed:
// - Mock fetch for useSession
// - QueryClient + QueryClientProvider wrapper
// - useSession + useUpdateSession rendered via renderHook
```

### 7.1 useSession query

| # | Scenario | Setup | Assertion |
|---|----------|-------|-----------|
| 7.1 | Fetches session data on mount | Mock GET /api/session returns 200 `{ guestId: 'g1', theme: 'dark', locale: 'es' }` | `data` matches mock response |
| 7.2 | Returns loading state initially | Mock fetch with delay | `isLoading` is true, then false |
| 7.3 | Returns error on fetch fail | Mock GET returns 500 | `error` is not null |
| 7.4 | Uses staleTime correctly | Fetch once, then re-render after 1ms (before staleTime) | Second fetch not called (verify with fetch mock counter) |
| 7.5 | Retries on failure | Mock GET fails 2x, succeeds on 3rd | Data returned after retries |

### 7.2 useUpdateSession mutation

| # | Scenario | Setup | Assertion |
|---|----------|-------|-----------|
| 7.6 | Sends PATCH with correct body | Mock PATCH returns 200, call `mutate({ theme: 'light' })` | Fetch called with method PATCH, body `{"theme":"light"}` |
| 7.7 | Optimistic update updates cache | Call `mutate({ theme: 'light' })`, check query cache | `queryClient.getQueryData(['session']).theme === 'light'` |
| 7.8 | Optimistic rollback on error | Mock PATCH returns 500, previous theme was 'dark' | Cache rolls back to `theme: 'dark'` |
| 7.9 | Invalidates session query on success | Call `mutate({ locale: 'es' })` | `['session']` query is stale after mutation settles |
| 7.10 | Returns isPending during mutation | Call `mutate()` | `isPending` is true, then false |
| 7.11 | Sends only provided fields | Call `mutate({ theme: 'dark' })` | Body does NOT include locale or notificationsEnabled |

### 7.3 PATCH /api/session endpoint (server-side)

| # | Scenario | Setup | Assertion |
|---|----------|-------|-----------|
| 7.12 | Updates single field | PATCH `{ "theme": "dark" }` | Response `theme === 'dark'`, other fields unchanged |
| 7.13 | Updates multiple fields | PATCH `{ "theme": "dark", "locale": "es" }` | Both fields updated in response |
| 7.14 | Ignores extra fields | PATCH `{ "theme": "dark", "extra": true }` | Extra field ignored (not in schema), theme updated |
| 7.15 | Returns 400 for invalid value | PATCH `{ "theme": "neon" }` | 400 with Zod validation details |
| 7.16 | Returns 401 without x-guest-id | PATCH without header | 401 "No session" |
| 7.17 | Returns 503 on Payload error | Database unavailable | 503 "Service unavailable" |
| 7.18 | Empty body = no-op | PATCH `{}` | 200 with current session data unchanged |

### 7.4 SessionProvider (Theme sync)

| # | Scenario | Setup | Assertion |
|---|----------|-------|-----------|
| 7.19 | Syncs theme from session to ThemeProvider | Session loads with `{ theme: 'dark' }` | ThemeProvider's `theme` becomes `'dark'` |
| 7.20 | Does not sync during loading | Session loading | ThemeProvider is not called |
| 7.21 | Does not sync if session has no theme | Session returns `{ theme: null }` | ThemeProvider theme unchanged |
| 7.22 | Syncs when session theme changes | Session refetch returns new theme | ThemeProvider updated |

---

## E2E Tests (`tests/e2e/settings.e2e.spec.ts`)

These overlap with Act 5 E2E but verify server round-trip:

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| E1 | Theme change persists across reload | Go to Appearance, click "Oscuro", reload page | Page renders in dark mode |
| E2 | Language change persists | Select "Español", reload | Dropdown shows "Español" |
| E3 | Notification toggle persists | Disable "Alertas de escritorio", reload | Toggle is off |
| E4 | Multiple settings saved atomically | Change theme + language + notifications, reload | All three persist |

---

## Edge Cases

| # | Scenario | Expected |
|---|----------|----------|
| EC1 | Race condition: rapid theme toggles | Last call wins, UI always consistent |
| EC2 | Session not created yet (fresh guest) | GET returns existing session (created by middleware), hook works |
| EC3 | Network offline during PATCH | Optimistic update rolled back, error surface shown |
| EC4 | Server returns stale data after PATCH | `invalidateQueries` ensures fresh data on next read |
| EC5 | Multiple tabs open | Each tab has independent cache; PATCH in one tab doesn't update another until staleTime expires + refetch |
| EC6 | localStorage theme vs session theme conflict | localStorage wins on first load (intentional — user's explicit choice has priority) |

---

## Test Setup

- **Integration tests**:
  - Use `renderHook` from `@testing-library/react`
  - Wrap with `QueryClientProvider` (create fresh `QueryClient` per test)
  - Mock `global.fetch` for each test scenario
  - Clean up after each test with `queryClient.clear()`
- **E2E tests**:
  - Standard Playwright setup with `test.env`
  - Re-seed guest-sessions collection between tests if needed
- Run: `pnpm test:int -- -g "useSession"` for integration tests
- Run: `pnpm test:e2e -- -g "Settings persistence"` for E2E persistence tests

### Integration test skeleton

```ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSession, useUpdateSession } from '@/hooks/useSession'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}
```
