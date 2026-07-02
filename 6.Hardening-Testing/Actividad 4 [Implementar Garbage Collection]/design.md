# Act 4: Garbage Collection — Design

## Visual Mapping

No UI — this is a headless maintenance endpoint.

## Data Flow

```
GET /api/maintenance/cleanup
  │
  ├─ authGuard()
  │   ├─ DEV → skip
  │   └─ PROD → header !== CLEANUP_SECRET → 403
  │
  ├─ getPayload()
  │
  ├─ payload.find('guest-sessions', expiresAt < now(), limit 100, overrideAccess: true)
  │   └─ map to expiredIds: string[]
  │       └─ expiredIds.length === 0 → return { deletedSessions: 0, deletedTasks: 0, ... }
  │
  ├─ sequential deletes (withRetry each):
  │   ├─ 1. payload.delete(tasks, guestId IN expiredIds, overrideAccess: true)  → count1
  │   ├─ 2. payload.delete(task-logs, guestId IN expiredIds, overrideAccess: true) → count2
  │   ├─ 3. payload.delete(lists, guestId IN expiredIds, overrideAccess: true) → count3
  │   └─ 4. payload.delete(guest-sessions, guestId IN expiredIds, overrideAccess: true) → count4
  │
  └─ Response 200: { success: true, deletedTasks: count1, deletedLogs: count2, deletedLists: count3, deletedSessions: count4, executedAt }
```

## Why Sequential (not parallel)

Each delete step depends on the previous completing to avoid SQLite contention:
- Sequential deletes = 1 active transaction at a time → lower SQLITE_BUSY probability
- Parallel deletes = 4 simultaneous transactions → high lock contention on SQLite
- Total expected time for sequential: ~200ms (50ms per batch). Acceptable for a maintenance endpoint.

## `overrideAccess: true` Strategy

Every `payload.delete()` and `payload.find()` call in this route uses `overrideAccess: true`. This is necessary because:

| Collection | Access Control Rule | Why Bypass Needed |
|------------|-------------------|-------------------|
| `guest-sessions` | `delete: () => false` | Endpoint must delete expired sessions regardless of auth |
| `tasks` | `delete: ({ req }) => ...` (filters by guestId) | Cleanup operates on server-side guestId list, not the request's guestId |
| `lists` | Same pattern as tasks | Same reason |
| `task-logs` | Same pattern | Same reason |

Without `overrideAccess: true`, the `payload.delete()` calls would either reject the operation or scope it to the server's own (non-existent) guest session.

## `withRetry()` Integration

Each of the 4 delete calls is wrapped in the `withRetry()` helper (designed in Act 6):

```ts
const deletedTasks = await withRetry(() =>
  payload.delete({
    collection: 'tasks',
    where: { guestId: { in: expiredIds } },
    overrideAccess: true,
  }),
  3
)
```

If `withRetry` is not yet implemented, a direct `payload.delete()` call is acceptable as an interim solution — SQLITE_BUSY is rare on maintenance endpoints that run during low traffic.

## Idempotency

The endpoint is idempotent: running it multiple times with the same state produces the same result (the 2nd run finds 0 expired sessions). Partial failures (e.g., tasks deleted but lists step failed) don't cause data corruption — the 2nd run picks up the remaining work.

## Comparison to Alternatives

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Payload delete with overrideAccess** | Simple, uses existing patterns | Requires bypassing RC | ✅ Chosen |
| Raw SQL DELETE | Fastest, no access control overhead | Bypasses Payload hooks (afterDelete, etc.) | ❌ Too risky |
| Mark as inactive (soft delete) | Reversible, auditable | Requires schema changes, GC still needed | ❌ Over-engineering |
| TTL index (SQLite feature) | Automatic, no code | Not supported by PayloadCMS SQLite adapter | ❌ Not available |
