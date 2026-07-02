# Act 3: Export endpoint — Test Plan

## Test Strategy

- **Integration (Vitest)**: Primary — test the route logic against real PayloadCMS queries using test helpers
- **Manual**: curl for header verification and file download behavior

---

## Integration Tests (`tests/int/export.int.spec.ts`)

### Setup

```ts
// Uses existing test helpers: createAny, deleteAny, mockReq
const TEST_GUEST = 'test-export-guest'
```

### 3.1 Auth & Validation

| # | Scenario | Setup | Assertion |
|---|----------|-------|-----------|
| 3.1 | Returns 401 without x-guest-id | Call GET /api/export without header | Status 401, body `{ error: 'No session' }` |
| 3.2 | Returns 200 with valid session | Call GET /api/export with TEST_GUEST header | Status 200 |
| 3.3 | Response has Content-Disposition header | Valid request | Header `Content-Disposition` includes `attachment; filename="task-sphere-export-` |
| 3.4 | Response is valid JSON | Valid request | Body parses as JSON without error |

### 3.2 Empty Guest Export

| # | Scenario | Setup | Steps | Assertion |
|---|----------|-------|-------|-----------|
| 3.5 | Profile is null for unknown guest | No GuestSession exists | GET /api/export | `body.profile` is null |
| 3.6 | All arrays are empty | No data exists | GET /api/export | `body.tasks`, `body.lists`, `body.taskLogs`, `body.focusSessions` are all `[]` |
| 3.7 | exportedAt is present | — | GET /api/export | `body.exportedAt` is valid ISO datetime string |
| 3.8 | version is present | — | GET /api/export | `body.version === '1.0.0'` |

### 3.3 Guest With Data

| # | Scenario | Setup | Steps | Assertion |
|---|----------|-------|-------|-----------|
| 3.9 | Profile matches session | Create GuestSession with known values | GET /api/export | `body.profile.guestId === TEST_GUEST`, `body.profile.theme === 'dark'` |
| 3.10 | Lists are exported | Create 2 lists for guest | GET /api/export | `body.lists.length === 2`, names match |
| 3.11 | Tasks are exported | Create 3 tasks for guest | GET /api/export | `body.tasks.length === 3` |
| 3.12 | Tasks have list as number | Create task with list relationship | GET /api/export | `body.tasks[0].list` is a number (not an object) |
| 3.13 | TaskLogs are exported | Create task (triggers afterChange hook) | GET /api/export | `body.taskLogs.length >= 1` |
| 3.14 | FocusSessions are exported | Create 2 focus sessions | GET /api/export | `body.focusSessions.length === 2` |
| 3.15 | Data isolation: guest A doesn't see guest B's data | Create data for 2 different guests | GET /api/export for guest A | Only guest A's data in response |

### 3.4 Data Integrity

| # | Scenario | Setup | Assertion |
|---|----------|-------|-----------|
| 3.16 | Task subtasks exported correctly | Create task with 2 subtasks | `body.tasks[0].subtasks.length === 2`, titles match |
| 3.17 | Task status values preserved | Create task with status 'completed' | `body.tasks[0].status === 'completed'` |
| 3.18 | TaskLog operations preserved | Toggle task status (creates UPDATE log) | Log with `operation: 'UPDATE'` present |
| 3.19 | Lists sorted by sortOrder | Create lists with sortOrder 1, 0 | Lists appear in order 0, 1 |

### 3.5 Edge Cases

| # | Scenario | Setup | Assertion |
|---|----------|-------|-----------|
| 3.20 | Guest with only focus sessions (no tasks) | Create focus sessions but no tasks | `body.tasks: []`, `body.focusSessions.length > 0` |
| 3.21 | Guest with only task-logs (no tasks remaining) | Delete all tasks after creating them | `body.tasks: []`, `body.taskLogs.length > 0` (logs survive) |
| 3.22 | ISO date format in all date fields | Create data with known dates | All date fields match ISO 8601 regex |

---

## Manual / E2E Tests

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| M1 | File downloads correctly | Navigate to /api/export in browser with active session | File downloads, filename starts with "task-sphere-export-" |
| M2 | JSON file opens in editor | Open downloaded file in VS Code | Valid JSON, all sections present |
| M3 | Import to another tool (postman) | Use Postman with x-guest-id header | 200 response, readable JSON |

---

## Edge Cases

| # | Scenario | Expected |
|---|----------|----------|
| EC1 | PayloadCMS is down (DB unavailable) | 500 error with message |
| EC2 | TaskLog collection read is blocked by access control | Server-side internal client bypasses read restriction; if it fails, log warning and return empty array |
| EC3 | Extremely long task title (500 chars) | Exported as-is, no truncation |
| EC4 | Special characters in task/list names (emoji, Unicode) | Exported correctly (JSON supports Unicode) |
| EC5 | Concurrent export requests | Each request independent, no race conditions (read-only) |

---

## Test Environment

- Integration tests: use existing `tests/helpers/` (createAny, deleteAny, mockReq)
- Import `payload` directly with `getPayload()` for setup
- Clean up all test data in `afterAll`:
  ```ts
  afterAll(async () => {
    await deleteAny('guest-sessions', { where: { guestId: { equals: TEST_GUEST } } })
    // ... cascade delete
  })
  ```
- Run: `pnpm test:int -- -g "Export"`
