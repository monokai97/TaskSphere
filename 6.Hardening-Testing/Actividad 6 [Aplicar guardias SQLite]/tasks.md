# Act 6: Guardias SQLite — Implementation Tasks

## Task 6.1: withRetry utility

**File:** `src/lib/with-retry.ts`

- [ ] Create file with exported `withRetry<T>()` function
- [ ] Signature:
  ```ts
  export async function withRetry<T>(
    fn: () => Promise<T>,
    options?: {
      maxRetries?: number
      baseDelayMs?: number
      onRetry?: (attempt: number, error: Error) => void
    },
  ): Promise<T>
  ```
- [ ] Implement retry loop:
  - [ ] `for (let attempt = 1; ; attempt++)`
  - [ ] `try { return await fn() } catch (error)`
  - [ ] If `attempt > maxRetries` → throw
  - [ ] If error is NOT SQLITE_BUSY → throw
  - [ ] Else: call `onRetry` callback if provided
  - [ ] Calculate delay: `baseDelayMs * 2^(attempt-1) + random jitter`
  - [ ] `await new Promise(resolve => setTimeout(resolve, delay))`
- [ ] Export the function

## Task 6.2: SQLite PRAGMA configuration

**File:** `src/payload.config.ts`

- [ ] Modify `sqliteAdapter({ client: { url } })` to include PRAGMAs:
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

## Task 6.3: Apply to lists GET route

**File:** `src/app/(frontend)/api/lists/route.ts`

- [ ] Import `withRetry` from `@/lib/with-retry`
- [ ] Wrap entire handler in try/catch
- [ ] Wrap `payload.find()` with `withRetry()`
- [ ] On catch: log error, return `{ error: 'Service unavailable' }` with 503

## Task 6.4: Apply to session routes

**File:** `src/app/(frontend)/api/session/route.ts`

- [ ] Import `withRetry` from `@/lib/with-retry`
- [ ] In GET: wrap `payload.find()` with `withRetry()`
- [ ] In PATCH (when created in Phase 5 Act 7): wrap `payload.find()` and `payload.update()` with `withRetry()`
- [ ] Ensure both handlers have try/catch (GET already does)

## Task 6.5: Verify & test

- [ ] Start dev server
- [ ] Verify WAL mode is active:
  ```powershell
  npx better-sqlite3 task-sphere.db "PRAGMA journal_mode"
  ```
  Should output `wal`
- [ ] Verify busy_timeout:
  ```powershell
  npx better-sqlite3 task-sphere.db "PRAGMA busy_timeout"
  ```
  Should output `5000`
- [ ] Call `GET /api/lists` with valid session → 200
- [ ] Call `GET /api/lists` without session → 401 (must still work before try/catch)

## Task 6.6: Lint & Build

- [ ] `pnpm lint` — 0 errors
- [ ] `pnpm build` — 0 errors
- [ ] Verify `withRetry.ts` has no TypeScript errors

## Estimated Effort

| Task | Files | Est. Time |
|------|-------|-----------|
| 6.1 withRetry utility | 1 new | 20 min |
| 6.2 SQLite PRAGMA | 1 modified | 5 min |
| 6.3 Lists route | 1 modified | 10 min |
| 6.4 Session route | 1 modified | 10 min |
| 6.5 Verify & test | — | 15 min |
| 6.6 Lint & Build | — | 5 min |
| **Total** | **1 new + 3 modified** | **~1 hour** |
