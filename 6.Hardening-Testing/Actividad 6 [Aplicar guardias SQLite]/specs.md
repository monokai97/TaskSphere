# Act 6: Guardias SQLite — Functional Specifications

## 6.1 `withRetry()` Utility

**File:** `src/lib/with-retry.ts`

### Interface
```ts
async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number     // default: 3
    baseDelayMs?: number    // default: 100
    onRetry?: (attempt: number, error: Error) => void  // optional logging
  },
): Promise<T>
```

### Behavior

| Attempt | Delay | Cumulative |
|---------|-------|------------|
| 1 | 0ms (direct call) | 0ms |
| 2 (if SQLITE_BUSY) | ~100ms (base + jitter) | ~100ms |
| 3 (if SQLITE_BUSY) | ~200ms (2× base + jitter) | ~300ms |
| 4 (if SQLITE_BUSY) | ~400ms (4× base + jitter) | ~700ms |
| After attempt 4 fails | Throw the error | — |

- **Jitter**: random between 0 and delay, applied as `delay + Math.random() * delay`
- **Detection**: `error instanceof Error && 'code' in error && (error as any).code === 'SQLITE_BUSY'`
- **Non-BUSY errors**: thrown immediately (no retry)
- **maxRetries = 0**: disables retry (passthrough)

### Usage
```ts
const result = await withRetry(() =>
  payload.find({ collection: 'tasks', where: { guestId } }),
)
```

## 6.2 SQLite PRAGMA Configuration

**File:** `src/payload.config.ts`

### Current
```ts
db: sqliteAdapter({
  client: {
    url: process.env.DATABASE_URL || '',
  },
}),
```

### Target
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

### Effect

| PRAGMA | Value | Effect |
|--------|-------|--------|
| `journal_mode` | `WAL` | Write-Ahead Logging: writers don't block readers |
| `busy_timeout` | `5000` | Wait 5 seconds for lock before throwing SQLITE_BUSY |

With `busy_timeout=5000`, the number of `SQLITE_BUSY` errors that reach `withRetry` drops significantly — most contention resolves within the 5s window.

## 6.3 API Route Error Boundaries

Apply to ALL API routes: wrap handler body in try/catch and return 503 with `{ error: 'Service unavailable' }` on failure.

### Current Pattern (lists route)
```ts
export async function GET(req: NextRequest) {
  const guestId = req.headers.get('x-guest-id')
  if (!guestId) return NextResponse.json({ error: 'No session' }, { status: 401 })
  await ensureGuestInitialized(guestId)
  // ... payload.find() — no try/catch
  return NextResponse.json(lists)
}
```

### Target Pattern
```ts
export async function GET(req: NextRequest) {
  try {
    const guestId = req.headers.get('x-guest-id')
    if (!guestId) return NextResponse.json({ error: 'No session' }, { status: 401 })
    await ensureGuestInitialized(guestId)
    const lists = await withRetry(() => payload.find({ ... }))
    return NextResponse.json(lists)
  } catch (error) {
    console.error('[GET /api/lists]', error)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
```

### Routes to Update

| File | Current State | Changes Needed |
|------|--------------|----------------|
| `api/lists/route.ts` | No try/catch, no retry | Add try/catch, wrap payload.find with withRetry |
| `api/session/route.ts` | Has try/catch (GET) | Wrap payload calls with withRetry |
