# Act 6: Guardias SQLite — Design

## Architecture

```
┌───────────────────────────────────────────────────────┐
│                    API Route                           │
│                                                       │
│  try {                                                │
│    const result = await withRetry(() =>               │
│      payload.create/update/delete/find(...)            │
│    )                                                   │
│    return NextResponse.json(result)                   │
│  } catch (error) {                                    │
│    console.error(...)                                  │
│    return NextResponse.json({ error: ... }, 503)      │
│  }                                                     │
└───────────────────────┬───────────────────────────────┘
                        │
┌───────────────────────▼───────────────────────────────┐
│                  withRetry()                           │
│                                                       │
│  attempt = 1 → fn()                                   │
│    └─ SQLITE_BUSY? → delay(100ms + jitter) → retry   │
│    └─ SQLITE_BUSY? → delay(200ms + jitter) → retry   │
│    └─ SQLITE_BUSY? → delay(400ms + jitter) → retry   │
│    └─ SQLITE_BUSY? → throw original error             │
│    └─ Other error → throw immediately                 │
│    └─ Success → return result                         │
└───────────────────────┬───────────────────────────────┘
                        │
┌───────────────────────▼───────────────────────────────┐
│               PayloadCMS + SQLite (WAL)               │
│                                                       │
│  PRAGMA journal_mode = WAL    ← concurrent reads      │
│  PRAGMA busy_timeout = 5000   ← wait up to 5s         │
└───────────────────────────────────────────────────────┘
```

## `withRetry()` Design Details

### Exponential Backoff Formula

```
delay = baseDelayMs * (2 ^ (attempt - 2)) + random(0, baseDelayMs * (2 ^ (attempt - 2)))
```

Where `attempt` starts at 1 (first call, no delay). Retries start at attempt 2.

| attempt | baseDelayMs=100 | with jitter |
|---------|-----------------|-------------|
| 1 (call) | 0 | 0 |
| 2 (retry) | 100 | 100–200ms |
| 3 (retry) | 200 | 200–400ms |
| 4 (retry) | 400 | 400–800ms |

### Full Implementation

```ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number
    baseDelayMs?: number
    onRetry?: (attempt: number, error: Error) => void
  },
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 100, onRetry } = options ?? {}

  for (let attempt = 1; ; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (
        attempt > maxRetries ||
        !(error instanceof Error && 'code' in error && (error as any).code === 'SQLITE_BUSY')
      ) {
        throw error
      }

      if (onRetry) onRetry(attempt, error as Error)

      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * baseDelayMs * Math.pow(2, attempt - 1)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}
```

## SQLite PRAGMA via PayloadCMS

The `@payloadcms/db-sqlite` adapter passes `client` options directly to `better-sqlite3`. The `pragma` field in options sets PRAGMAs at database open time:

```ts
db: sqliteAdapter({
  client: {
    url: process.env.DATABASE_URL || '',
    options: {
      pragma: {
        journal_mode: 'WAL',
        busy_timeout: 5000,
      },
    },
  },
}),
```

This is equivalent to running:
```sql
PRAGMA journal_mode=WAL;
PRAGMA busy_timeout=5000;
```

## Existing Route Rewrites

### `src/app/(frontend)/api/lists/route.ts`

**Current**: 25 lines, no try/catch, no error handling.
**Target**: wrap with try/catch, add withRetry to payload.find.

### `src/app/(frontend)/api/session/route.ts`

**Current**: Has try/catch in GET but no withRetry.
**Target**: add withRetry to payload.find calls.

## Routes NOT yet on disk (covered by future implementation tasks)

These routes are designed in Phase 5/6 artifacts but not yet implemented. When they are created, the pattern should be:
```ts
export async function GET(req: NextRequest) {
  try {
    // ... validation ...
    const result = await withRetry(() => payload.find({ ... }))
    return NextResponse.json(result)
  } catch (error) {
    console.error('...', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
```

Future routes that MUST follow this pattern:
- `api/tasks/reorder/route.ts` (Act 5)
- `api/lists/[id]/route.ts` (Phase 5 Act 4)
- `api/lists/reorder/route.ts` (Phase 5 Act 4)
- `api/focus/route.ts` (Phase 6 Act 1)
- `api/focus/stats/route.ts` (Phase 6 Act 1)
- `api/export/route.ts` (Phase 6 Act 3)
- `api/maintenance/cleanup/route.ts` (Phase 6 Act 4)
