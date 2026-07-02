# Act 5: Reorder endpoint — Functional Specifications

## 5.1 API Route

**Endpoint:** `PATCH /api/tasks/reorder`
**File:** `src/app/(frontend)/api/tasks/reorder/route.ts`

### Request
```
PATCH /api/tasks/reorder
Content-Type: application/json
x-guest-id: <from middleware>

{
  "tasks": [
    { "id": 1, "sortOrder": 0 },
    { "id": 42, "sortOrder": 1 },
    { "id": 7, "sortOrder": 2 }
  ]
}
```

### Response (200)
```json
{
  "success": true,
  "updated": 3
}
```

### Response (400 — Zod validation)
```json
{
  "error": "Validation failed",
  "details": {
    "tasks": {
      "_errors": [],
      "0": { "id": { "_errors": ["Required"] } }
    }
  }
}
```

### Response (401 — No session)
```json
{ "error": "No session" }
```

### Response (403 — Task ownership mismatch)
```json
{
  "error": "Some tasks do not belong to this session",
  "mismatchedIds": [99, 100]
}
```

### Response (503 — PayloadCMS / DB error)
```json
{ "error": "Service unavailable" }
```

## 5.2 Zod Schema

**File:** `src/lib/schemas.ts` (add to existing) or `src/lib/reorder-schema.ts`

```ts
import { z } from 'zod'

export const ReorderTaskItemSchema = z.object({
  id: z.number().int().positive(),
  sortOrder: z.number().int().min(0),
})

export const ReorderTasksInputSchema = z.object({
  tasks: z.array(ReorderTaskItemSchema)
    .min(1, 'At least one task is required')
    .max(200, 'Maximum 200 tasks per request'),
}).refine(
  (data) => {
    const ids = data.tasks.map(t => t.id)
    return new Set(ids).size === ids.length
  },
  { message: 'Duplicate task IDs are not allowed' },
)
```

## 5.3 Logic Flow

```
1. Extract x-guest-id → 401 if missing
2. Parse & validate body with ReorderTasksInputSchema → 400 if invalid
3. Initialize PayloadCMS client
4. Fetch ALL tasks for this guest in one query:
   payload.find({
     collection: 'tasks',
     where: { guestId: { equals: guestId } },
     limit: 200,
     depth: 0,
   })
5. Build Set<id> of guest's actual task IDs
6. Check every reorder item's ID is in the set:
   If any missing → 403 with mismatchedIds
7. For each reorder item, update task sortOrder:
   Promise.all(items.map(item =>
     payload.update({ collection: 'tasks', id: item.id, data: { sortOrder: item.sortOrder }, depth: 0 })
   ))
8. Return { success: true, updated: items.length }
```

## 5.4 Edge Cases

| Scenario | Behavior |
|----------|----------|
| Single task reorder | Works (batch of 1) |
| 200 tasks reordered | Works (max limit) |
| 201+ tasks submitted | 400 (Zod max validation) |
| Duplicate IDs in request | 400 (Zod refine validation) |
| Task ID doesn't belong to guest | 403 with list of mismatched IDs |
| Guest has no tasks | 403 (no task IDs match any reorder item) |
| SQLITE_BUSY during update | `withRetry()` auto-retries up to 3 times |
| One update fails (e.g., task deleted between validation and update) | Error thrown; partial updates are NOT rolled back. Acceptable for reorder (can retry) |
| Empty tasks array | 400 (Zod min validation) |
| sortOrder negative | 400 (Zod int min 0) |
| sortOrder non-integer | 400 (Zod int validation) |
| Missing `tasks` field | 400 (Zod required field) |
