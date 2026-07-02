# Act 5: Reorder endpoint — Implementation Tasks

## Task 5.0: Prerequisites

- [ ] Verify `src/lib/schemas.ts` exists (or create it for shared Zod schemas)
- [ ] Verify `withRetry` utility exists in `src/lib/with-retry.ts` (optional — skip retry on first implementation)
- [ ] Verify Task collection has `sortOrder` field with `index: false`

## Task 5.1: Zod schema

**File:** `src/lib/schemas.ts` (add to existing)

- [ ] Define `ReorderTaskItemSchema`:
  ```ts
  export const ReorderTaskItemSchema = z.object({
    id: z.number().int().positive(),
    sortOrder: z.number().int().min(0),
  })
  ```
- [ ] Define `ReorderTasksInputSchema`:
  ```ts
  export const ReorderTasksInputSchema = z.object({
    tasks: z.array(ReorderTaskItemSchema)
      .min(1, 'At least one task required')
      .max(200, 'Maximum 200 tasks per request'),
  }).refine(
    (data) => new Set(data.tasks.map(t => t.id)).size === data.tasks.length,
    { message: 'Duplicate task IDs are not allowed' },
  )
  ```
- [ ] Export both schemas

## Task 5.2: API route

**File:** `src/app/(frontend)/api/tasks/reorder/route.ts`

- [ ] Create file structure:
  ```
  src/app/(frontend)/api/tasks/
  └── reorder/
      └── route.ts
  ```
- [ ] Export `async function PATCH(req: NextRequest)`

### Imports
```ts
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { ReorderTasksInputSchema } from '@/lib/schemas'
import { withRetry } from '@/lib/with-retry'
```

### Implementation

- [ ] Extract `guestId` from header → 401 if missing
- [ ] Parse JSON body → try/catch for invalid JSON → 400
- [ ] Validate with `ReorderTasksInputSchema.safeParse()` → 400 on failure
- [ ] Initialize PayloadCMS:
  ```ts
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  ```
- [ ] Fetch guest's tasks (single query):
  ```ts
  const tasks = await payload.find({
    collection: 'tasks',
    where: { guestId: { equals: guestId } },
    limit: 200,
    depth: 0,
  })
  const validIds = new Set(tasks.docs.map(t => t.id))
  ```
- [ ] Check ownership:
  ```ts
  const mismatched = items.filter(item => !validIds.has(item.id))
  if (mismatched.length > 0) {
    return NextResponse.json({
      error: 'Some tasks do not belong to this session',
      mismatchedIds: mismatched.map(m => m.id),
    }, { status: 403 })
  }
  ```
- [ ] Batch update:
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
  - If `withRetry` not available yet, use direct `Promise.all` with `payload.update`
- [ ] Return 200:
  ```ts
  NextResponse.json({ success: true, updated: items.length })
  ```

### Error handling

- [ ] Wrap entire handler in try/catch
- [ ] On catch: log error, return 503

## Task 5.3: Test the endpoint

- [ ] Start dev server
- [ ] Create 3 tasks via existing API or direct payload call
- [ ] Reorder them:
  ```powershell
  $body = '{"tasks":[{"id":1,"sortOrder":2},{"id":2,"sortOrder":0},{"id":3,"sortOrder":1}]}'
  curl.exe -X PATCH http://localhost:3000/api/tasks/reorder -H "x-guest-id: test-guest" -H "Content-Type: application/json" -d $body
  ```
- [ ] Verify `{ success: true, updated: 3 }`
- [ ] Verify tasks are now in order: id=2 (sortOrder=0), id=3 (sortOrder=1), id=1 (sortOrder=2)
- [ ] Test error cases:
  - Without header → 401
  - Invalid body → 400
  - Wrong task ID → 403
  - Empty tasks array → 400
  - Duplicate IDs → 400

## Task 5.4: Lint & Build

- [ ] `pnpm lint` — 0 errors
- [ ] `pnpm build` — 0 errors

## Estimated Effort

| Task | Files | Est. Time |
|------|-------|-----------|
| 5.0 Prerequisites | — | 5 min |
| 5.1 Zod schema | 0–1 (add to schemas.ts) | 10 min |
| 5.2 API route | 1 new | 35 min |
| 5.3 Test | — | 15 min |
| 5.4 Lint & Build | — | 10 min |
| **Total** | **1–2 new/modified files** | **~1.25 hours** |
