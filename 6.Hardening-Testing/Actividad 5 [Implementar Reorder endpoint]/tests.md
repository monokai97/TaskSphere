# Act 5: Reorder endpoint — Test Plan

## Test Strategy

- **Integration (Vitest)**: Primary — comprehensive coverage of validation, ownership, batch update
- **Manual**: curl for quick smoke test

---

## Integration Tests (`tests/int/reorder.int.spec.ts`)

### Setup

```ts
const TEST_GUEST = 'test-reorder-guest'
let taskIds: number[] = []

beforeAll(async () => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  // Clean any previous test data
  await payload.delete({ collection: 'tasks', where: { guestId: { equals: TEST_GUEST } }, overrideAccess: true })
  // Create 5 test tasks with sequential sortOrder
  for (let i = 0; i < 5; i++) {
    const task = await payload.create({
      collection: 'tasks',
      data: { title: `Reorder task ${i}`, guestId: TEST_GUEST, status: 'pending', list: 1, sortOrder: i },
    })
    taskIds.push(task.id)
  }
})

afterAll(async () => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  await payload.delete({ collection: 'tasks', where: { guestId: { equals: TEST_GUEST } }, overrideAccess: true })
})
```

### 5.1 Auth & Validation

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| 5.1 | Returns 401 without x-guest-id | PATCH /api/tasks/reorder without header | Status 401 |
| 5.2 | Returns 400 for empty body | PATCH with no body | Status 400 |
| 5.3 | Returns 400 for invalid JSON | PATCH with body `not-json` | Status 400 |
| 5.4 | Returns 400 for empty tasks array | PATCH with `{ tasks: [] }` | Status 400 |
| 5.5 | Returns 400 for duplicate IDs | PATCH with `{ tasks: [{id:1,sortOrder:0},{id:1,sortOrder:1}] }` | Status 400 |
| 5.6 | Returns 400 for negative sortOrder | PATCH with `{ tasks: [{id:1,sortOrder:-1}] }` | Status 400 |
| 5.7 | Returns 400 for non-integer id | PATCH with `{ tasks: [{id:"abc",sortOrder:0}] }` | Status 400 |

### 5.2 Ownership Check

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| 5.8 | Returns 403 for task not belonging to guest | PATCH with a task ID owned by a different guest | Status 403, `mismatchedIds` includes the foreign ID |
| 5.9 | Returns 403 when ALL tasks are foreign | PATCH with 3 IDs all owned by another guest | Status 403, `mismatchedIds.length === 3` |
| 5.10 | Returns 403 when SOME tasks are foreign | PATCH with 2 owned + 1 foreign | Status 403, `mismatchedIds.length === 1` |

### 5.3 Successful Reorder

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| 5.11 | Reverses sortOrder of 5 tasks | PATCH with reversed sortOrders | Status 200, `updated: 5` |
| 5.12 | SortOrder is persisted after reorder | After 5.11, query tasks sorted by sortOrder | Tasks appear in reversed order |
| 5.13 | Single task reorder | PATCH with `[{id:3, sortOrder:99}]` | Status 200, `updated: 1` |
| 5.14 | Reorder sets consecutive sortOrders | PATCH with 0,1,2,3,4 | SortOrders match exactly |

### 5.4 Data Integrity

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| 5.15 | Only sortOrder changes (other fields unchanged) | After reorder, read a task's full data | `title`, `status`, `list`, `guestId` unchanged |
| 5.16 | Guest isolation: reorder doesn't affect other guests | Create tasks for guest B, reorder guest A tasks | Guest B's task sortOrders unchanged |
| 5.17 | Retry on SQLITE_BUSY (simulated) | Mock payload.update to throw SQLITE_BUSY once | Retry succeeds, final sortOrder correct |

### 5.5 Edge Cases

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| 5.18 | Max batch size (200 tasks) | Create 200 tasks, reorder all | Status 200, `updated: 200` |
| 5.19 | Exceeds max batch (201 tasks) | Submit 201 items | Status 400 |
| 5.20 | Same sortOrder for multiple tasks (allowed) | PATCH with `[{id:1,sortOrder:5},{id:2,sortOrder:5}]` | Status 200 (no uniqueness constraint on sortOrder) |
| 5.21 | Task deleted between validation and update | Delete task right after pre-check | Error thrown (acceptable — retry resolves) |

---

## Manual Tests

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| M1 | Browser DevTools test | Open app, use DnD on stack page, observe network tab | PATCH /api/tasks/reorder called with correct payload |
| M2 | Reorder with open DetailPanel | Drag task while detail panel is open | SortOrder updates, detail panel still shows correct task |

---

## Test Environment

- Run: `pnpm test:int -- -g "Reorder"`
- Uses test helpers from `tests/helpers/` for PayloadCMS setup
- Requires: existing tasks API endpoint or direct `payload.create` for test data setup
