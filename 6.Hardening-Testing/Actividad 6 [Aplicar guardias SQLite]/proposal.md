# Act 6: Guardias SQLite — Proposal

## Problem Statement

SQLite is a single-writer database. Under concurrent requests (e.g., rapid task status toggles, parallel focus session writes), the driver throws `SQLITE_BUSY` errors. The app currently has:

1. **No retry logic** — any `SQLITE_BUSY` error propagates as a 500 to the client
2. **No WAL mode** — default rollback journal causes read-write contention
3. **No busy_timeout** — the driver fails immediately instead of waiting for the lock
4. **No error boundaries** — API routes lack try/catch, so unhandled errors are opaque

## Proposed Solution

| Component | What | Why |
|-----------|------|-----|
| `withRetry()` | Generic retry wrapper (exponential backoff, 3 attempts) | Transparently retries SQLITE_BUSY without coupling it to business logic |
| WAL mode | `PRAGMA journal_mode=WAL` | Allows concurrent reads during writes |
| `busy_timeout=5000` | `PRAGMA busy_timeout=5000` | Waits up to 5s for the lock instead of failing immediately |
| try/catch in all routes | Consistent error wrapping | Each API route returns 503 instead of raw errors |

## Scope

| Category | Files |
|----------|-------|
| New | `src/lib/with-retry.ts` |
| Modified | `src/payload.config.ts` (SQLite PRAGMA config) |
| Modified | `src/app/(frontend)/api/lists/route.ts` (try/catch + withRetry) |
| Modified | `src/app/(frontend)/api/session/route.ts` (try/catch + withRetry) |

## Non-Goals

- No migration to PostgreSQL/MySQL — SQLite is intentional for single-server deployment
- No connection pooling — better-sqlite3 is synchronous single-connection
- No distributed locking — not needed for single-process Next.js
