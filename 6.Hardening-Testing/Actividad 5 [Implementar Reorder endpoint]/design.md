# Act 5: Reorder endpoint — Design

## Visual Mapping

No dedicated UI — this endpoint is consumed by drag & drop handlers in:
- **Stack pages** (My Day, Important, Planned, Tasks): `onDragEnd` from `@dnd-kit` or HTML5 DnD calls `PATCH /api/tasks/reorder`
- **List detail page** (`/lists/[id]`): same pattern, scoped to the list's tasks

## Data Flow

```
User drops task at new position
  │
  ├─ Client computes new sortOrder for all visible tasks
  │   └─ e.g. tasks.map((t, i) => ({ id: t.id, sortOrder: i }))
  │
  ├─ PATCH /api/tasks/reorder { tasks: [...] }
  │
  ├─ 1. Extract x-guest-id → 401
  ├─ 2. Zod validate → 400
  ├─ 3. payload.find(tasks, guestId) → get validSet<id>
  ├─ 4. Check all IDs in validSet → 403 if mismatch
  ├─ 5. Promise.all(payload.update each task) → { success: true, updated: N }
  │
  └─ Response to client
```

## Ownership Verification Strategy

Two-step approach:

1. **Pre-check** (batch query): Fetch all of the guest's tasks (limit 200, depth 0). Build a `Set<number>` of valid IDs.
2. **Cross-check**: Verify each item in the request has `id ∈ validSet`. Collect mismatches.
3. **Reject if mismatches**: Return 403 with `mismatchedIds` array — client can log or alert.

This is more efficient than `findByID` per item (N queries) — a single `find` with `limit: 200` is ~5ms on SQLite.

## Update Strategy

```ts
await withRetry(() =>
  Promise.all(
    items.map(item =>
      payload.update({
        collection: 'tasks',
        id: item.id,
        data: { sortOrder: item.sortOrder },
        depth: 0,
      }),
    ),
  ),
)
```

**Why `Promise.all`** (parallel):
- 200 updates in parallel is fast (~100ms total on SQLite WAL)
- SQLite handles concurrent writes via WAL mode
- If `withRetry` catches `SQLITE_BUSY`, it retries the entire batch
- Each update writes only `sortOrder` — minimal contention on non-indexed field

## Partial Update Failure

If task A updates but task B fails (e.g., deleted between validation and update), the request throws and the client retries. This is acceptable because:
- The client retries the full batch with current state
- Inconsistent sortOrder is temporary (milliseconds)
- The UI already represents optimistic state; retry reconciles

## Comparison to Alternatives

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Promise.all updates** | Simple, fast, matches lists pattern | Partial failure possible | ✅ Chosen |
| Sequential updates | Atomic per item, no overloading | Slow (200 sequential DB ops) | ❌ Too slow |
| Raw SQL UPDATE | Fastest, single query | Bypasses Payload hooks | ❌ Not worth it |
| Transaction-wrapped | Atomic rollback | Payload doesn't expose raw transactions | ❌ Not supported |

## Error Responses

| Code | Body | Trigger |
|------|------|---------|
| 400 | `{ error: 'Validation failed', details }` | Zod parse failure |
| 401 | `{ error: 'No session' }` | Missing `x-guest-id` |
| 403 | `{ error: 'Some tasks do not belong...', mismatchedIds }` | ID ownership mismatch |
| 503 | `{ error: 'Service unavailable' }` | PayloadCMS error after retries exhausted |
