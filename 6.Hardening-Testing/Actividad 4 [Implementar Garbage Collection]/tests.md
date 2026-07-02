# Act 4: Garbage Collection — Test Plan

## Test Strategy

- **Integration (Vitest)**: Primary — test the cleanup logic by creating expired sessions and verifying cascade delete
- **Manual**: curl for auth guard verification

---

## Integration Tests (`tests/int/cleanup.int.spec.ts`)

### Setup

```ts
const TEST_GUEST_EXPIRED = 'test-cleanup-expired'
const TEST_GUEST_ACTIVE = 'test-cleanup-active'

async function createExpiredSession(guestId: string) {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const past = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
  await payload.create({
    collection: 'guest-sessions',
    data: {
      guestId,
      createdAt: past.toISOString(),
      lastActiveAt: past.toISOString(),
      expiresAt: past.toISOString(), // already expired
    },
    overrideAccess: true,
  })
}
```

### 4.1 Auth & Validation

| # | Scenario | Setup | Steps | Assertion |
|---|----------|-------|-------|-----------|
| 4.1 | Returns 403 in production without key | `NODE_ENV=production`, no header | GET /api/maintenance/cleanup | Status 403, body `{ error: 'Unauthorized' }` |
| 4.2 | Returns 403 with wrong key | `NODE_ENV=production`, header `x-cleanup-key: wrong` | GET /api/maintenance/cleanup | Status 403 |
| 4.3 | Returns 200 in dev without key | Default (NODE_ENV=development) | GET /api/maintenance/cleanup | Status 200 |
| 4.4 | Response has all expected fields | Dev mode | GET /api/maintenance/cleanup | Body has `success`, `deletedSessions`, `deletedTasks`, `deletedLists`, `deletedLogs`, `executedAt` |

### 4.2 No Expired Sessions

| # | Scenario | Setup | Steps | Assertion |
|---|----------|-------|-------|-----------|
| 4.5 | Returns all zeros when nothing expired | No expired sessions exist | GET /api/maintenance/cleanup | `body.deletedSessions === 0`, all other counts === 0 |
| 4.6 | Active sessions are not deleted | Create an active session (expiresAt in future) | GET /api/maintenance/cleanup | Session still exists after cleanup |

### 4.3 Cascade Delete

| # | Scenario | Setup | Steps | Assertion |
|---|----------|-------|-------|-----------|
| 4.7 | Deletes expired session | Create expired GuestSession | GET /api/maintenance/cleanup | `body.deletedSessions === 1`, session no longer exists |
| 4.8 | Deletes tasks of expired guest | Create expired session + 5 tasks | GET /api/maintenance/cleanup | `body.deletedTasks === 5`, tasks collection empty for that guest |
| 4.9 | Deletes lists of expired guest | Create expired session + 3 lists | GET /api/maintenance/cleanup | `body.deletedLists === 3`, lists collection empty for that guest |
| 4.10 | Deletes task-logs of expired guest | Create expired session + make task changes to create logs | GET /api/maintenance/cleanup | `body.deletedLogs >= 1`, logs collection empty for that guest |
| 4.11 | Does NOT delete active guest's data | Create active session + tasks/lists | GET /api/maintenance/cleanup | Active guest's data intact after cleanup |

### 4.4 Data Isolation

| # | Scenario | Setup | Steps | Assertion |
|---|----------|-------|-------|-----------|
| 4.12 | Only expired guest's tasks deleted | 2 expired guests (A, B) + 1 active guest (C), each with tasks | GET /api/maintenance/cleanup | Tasks of A+B deleted, tasks of C intact |
| 4.13 | Multiple expired sessions cleaned in single run | Create 3 expired sessions | GET /api/maintenance/cleanup | `body.deletedSessions === 3` |

### 4.5 Edge Cases

| # | Scenario | Setup | Steps | Assertion |
|---|----------|-------|-------|-----------|
| 4.14 | Expired guest with only lists (no tasks) | Expired session with 2 lists | GET /api/maintenance/cleanup | `deletedLists === 2`, `deletedTasks === 0` |
| 4.15 | Expired guest with only task-logs (no tasks or lists) | Expired session + create+delete a task (creates logs) | GET /api/maintenance/cleanup | `deletedLogs >= 1`, `deletedTasks === 0`, `deletedLists === 0` |
| 4.16 | 404 (no such route) on wrong method | — | POST /api/maintenance/cleanup | Status 404 (only GET is defined) |
| 4.17 | Idempotent: second run returns zeros | Run cleanup once, then run again | GET /api/maintenance/cleanup (2nd time) | All counts === 0 |

---

## Manual Tests

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| M1 | Production auth | `$env:NODE_ENV="production"` then curl without key | 403 response |
| M2 | Production with correct key | Set CLEANUP_SECRET, curl with correct header | 200 with counts |
| M3 | Partial cascade (simulate failure) | Stop DB during cleanup | 500 error, data partially deleted (rerun to complete) |

---

## Cleanup in afterAll

```ts
afterAll(async () => {
  // Remove any leftover test data
  await payload.delete({
    collection: 'guest-sessions',
    where: { guestId: { in: [TEST_GUEST_EXPIRED, TEST_GUEST_ACTIVE] } },
    overrideAccess: true,
  })
  // Cascade cleanup is handled by the endpoint; but for afterAll we may need to clean even active guests
})
```

---

## Test Environment

- Run: `pnpm test:int -- -g "Cleanup"`
- Requires: PayloadCMS with SQLite, same test helpers as other int tests
- Impersonation: Use `overrideAccess: true` in test setup to create expired sessions directly
