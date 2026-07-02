# Act 4: Garbage Collection — Functional Specifications

## 4.1 Endpoint

**Route:** `GET /api/maintenance/cleanup`
**File:** `src/app/(frontend)/api/maintenance/cleanup/route.ts`

### Headers
| Header | Required | Purpose |
|--------|----------|---------|
| `x-cleanup-key` | Production only | Matches `CLEANUP_SECRET` env var |
| (none) | Development | No auth needed when `NODE_ENV=development` |

### Request
```
GET /api/maintenance/cleanup
x-cleanup-key: <secret>  (required in production)
```

### Response (200)
```json
{
  "success": true,
  "deletedSessions": 3,
  "deletedTasks": 47,
  "deletedLists": 12,
  "deletedLogs": 89,
  "executedAt": "2026-06-21T03:00:00.000Z"
}
```

### Response (403 — Production, missing/invalid key)
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing cleanup key"
}
```

### Response (500)
```json
{
  "error": "Cleanup failed",
  "message": "SQLITE_BUSY: database is locked"
}
```

## 4.2 Logic Flow

```
1. Guard: Verify authorization
   ├─ DEV mode → skip check
   └─ PROD → require x-cleanup-key === CLEANUP_SECRET env var → 403 if mismatch

2. Initialize PayloadCMS client

3. Find expired GuestSessions:
   payload.find({
     collection: 'guest-sessions',
     where: { expiresAt: { less_than: new Date().toISOString() } },
     limit: 100,                          // max 100 per run
     overrideAccess: true,                 // bypass delete: () => false
   })

4. Collect expired guestIds:
   expiredIds = sessions.docs.map(s => s.guestId)

5. If expiredIds.length === 0 → return early: { deletedSessions: 0, ... }

6. Cascade delete (sequential, respecting dependency order):
   a. DELETE Tasks where guestId IN expiredIds
      → payload.delete({ collection: 'tasks', where: { guestId: { in: expiredIds } }, overrideAccess: true })
      → store deletedTasks count

   b. DELETE TaskLogs where guestId IN expiredIds
      → payload.delete({ collection: 'task-logs', where: { guestId: { in: expiredIds } }, overrideAccess: true })
      → store deletedLogs count

   c. DELETE Lists where guestId IN expiredIds
      → payload.delete({ collection: 'lists', where: { guestId: { in: expiredIds } }, overrideAccess: true })
      → store deletedLists count

   d. DELETE GuestSessions where guestId IN expiredIds
      → payload.delete({ collection: 'guest-sessions', where: { guestId: { in: expiredIds } }, overrideAccess: true })
      → store deletedSessions count (== expiredIds.length)

7. Return report
```

## 4.3 Cascade Order Rationale

| Step | Collection | Why First? |
|------|-----------|------------|
| 1. Tasks | `tasks` | Child data — no other collection references tasks (TaskLogs references task.id, but that's fine — logs can reference deleted task IDs) |
| 2. TaskLogs | `task-logs` | Audit log — must survive tasks deletion (but for GC, we delete everything) |
| 3. Lists | `lists` | Tasks reference lists, but tasks are already deleted in step 1 |
| 4. GuestSessions | `guest-sessions` | Root — deleted last after all dependent data is gone |

## 4.4 Edge Cases

| Scenario | Behavior |
|----------|----------|
| No expired sessions | Immediate 200 with all zeros |
| Expired guest has no tasks | `deletedTasks: 0`, continue to logs |
| Single expired session | Cascade runs normally |
| 100+ expired sessions | Limit is 100 per run; re-run to catch more |
| `payload.delete` returns 0 affected rows | Count as 0 (expected for empty guests) |
| One delete step fails (SQLITE_BUSY) | Retry with exponential backoff via `withRetry()` (up to 3 attempts). If still fails, return 500. Previous steps' deletes are NOT rolled back (atomicity not guaranteed — acceptable for maintenance) |
| Overlapping concurrent cleanup runs | Each run independently; idempotent (second find will see fewer expired sessions) |
| Guest session is exactly at expiry boundary (`expiresAt === now()`) | `less_than` comparison excludes exact equality — session will be cleaned on next run |

## 4.5 Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `CLEANUP_SECRET` | Production | — | Shared secret to authorize cleanup calls |
