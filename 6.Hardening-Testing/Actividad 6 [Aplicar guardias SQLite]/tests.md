# Act 6: Guardias SQLite — Test Plan

## Test Strategy

- **Unit (Vitest)**: Test `withRetry` logic in isolation with mock functions
- **Manual**: Verify WAL mode and busy_timeout PRAGMAs
- **Integration**: Existing API route tests verify retry behavior indirectly

---

## Unit Tests (`tests/int/with-retry.int.spec.ts`)

### Setup
```ts
import { withRetry } from '@/lib/with-retry'
```

### 6.1 Success Path

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| 6.1 | Resolves immediately on success | `withRetry(() => Promise.resolve('ok'))` | Resolves to `'ok'` |
| 6.2 | Resolves with complex return value | `withRetry(() => Promise.resolve({ a: 1, b: 2 }))` | Resolves to `{ a: 1, b: 2 }` |

### 6.2 Retry Logic

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| 6.3 | Retries on SQLITE_BUSY then succeeds | Mock fn: fails twice with SQLITE_BUSY, succeeds on 3rd call | Resolves to value, fn called 3 times |
| 6.4 | Retries up to maxRetries then throws | Mock fn: always throws SQLITE_BUSY, maxRetries=2 | Rejects with error, fn called 3 times |
| 6.5 | Non-BUSY errors throw immediately | Mock fn: throws `new Error('OTHER_ERR')` | Rejects immediately, fn called 1 time |
| 6.6 | maxRetries=0 disables retry | Mock fn: throws SQLITE_BUSY, maxRetries=0 | Rejects immediately, fn called 1 time |
| 6.7 | Exponential delay increases | Mock clock: fn fails with SQLITE_BUSY, check delays | Delay ~100ms (attempt 2), ~200ms (attempt 3), ~400ms (attempt 4) |

### 6.3 Retry with Options

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| 6.8 | Custom baseDelayMs | `withRetry(fn, { baseDelayMs: 500 })` | Delay starts at ~500ms |
| 6.9 | Custom maxRetries = 5 | `withRetry(fn, { maxRetries: 5 })` | Retries up to 6 total attempts |
| 6.10 | onRetry callback called | Mock onRetry, fn fails twice | onRetry called twice with (attempt, error) |

### 6.4 PRAGMA Verification (Manual)

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| 6.11 | WAL mode active | Start dev server, run `PRAGMA journal_mode` via sqlite3 CLI | Returns `wal` |
| 6.12 | busy_timeout = 5000 | Run `PRAGMA busy_timeout` via sqlite3 CLI | Returns `5000` |

### 6.5 Integration: Existing Routes

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| 6.13 | Lists GET with valid session | Call `GET /api/lists` with valid `x-guest-id` | 200, lists returned |
| 6.14 | Lists GET without session | Call `GET /api/lists` without header | 401 |
| 6.15 | Session GET with valid session | Call `GET /api/session` with valid header | 200, session data returned |
| 6.16 | Session GET without session | Call `GET /api/session` without header | 401 |

### 6.6 Edge Cases

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| 6.17 | fn is synchronous (not a promise) | `withRetry(() => 'value')` | Resolves to `'value'` |
| 6.18 | fn is an async function | `withRetry(async () => { await delay(10); return 'ok' })` | Resolves to `'ok'` |
| 6.19 | Error with no `code` property | Mock fn: throws `new Error('unknown')` without `code` | Rejects immediately (not treated as SQLITE_BUSY) |

---

## Manual Verification

```powershell
# Check WAL mode
npx better-sqlite3 task-sphere.db "PRAGMA journal_mode;"
# Expected: wal

# Check busy_timeout
npx better-sqlite3 task-sphere.db "PRAGMA busy_timeout;"
# Expected: 5000

# Simulate concurrent write contention (if possible)
# Start multiple simultaneous requests to lists endpoint
```

---

## Test Environment

- Unit tests: vitest with vi.useFakeTimers() for delay testing
- PRAGMA verification: direct SQLite CLI
- Run: `pnpm test:int -- -g "withRetry"`
