# Act 5: Reorder endpoint (batch) — Proposal

## Problem Statement

Task reorder is triggered by drag & drop in both stack views (My Day, Important, Planned, Tasks) and list views (`/lists/[id]`). Currently there is no batch endpoint to update `sortOrder` for multiple tasks atomically.

The existing pattern from lists (`PATCH /api/lists/reorder`) proves the model works. Tasks need the same capability.

## Proposed Solution

A single endpoint `PATCH /api/tasks/reorder` that:

1. Receives `{ tasks: { id: number, sortOrder: number }[] }`
2. Validates the input with Zod (max 200 items, each `id` unique)
3. Verifies every task belongs to the requesting guest (`guestId` match)
4. Updates each task's `sortOrder` field
5. Returns `{ success: true, updated: N }`

## Relationship to Existing

| Aspect | Lists Reorder (Phase 5 Act 4) | Tasks Reorder (this Act) |
|--------|-------------------------------|--------------------------|
| Endpoint | `PATCH /api/lists/reorder` | `PATCH /api/tasks/reorder` |
| Max batch | 20 lists | 200 tasks |
| Ownership check | N/A (access control only) | Explicit per-task guestId verification |
| Sort scope | Global (across all lists) | Per-guest (global sort for stacks) |
| Retry | `withRetry()` | `withRetry()` (same pattern) |

## No New Collections / Schemas

- Zero new PayloadCMS collections
- Zod schema `ReorderTasksInput` added to `src/lib/schemas.ts` (or dedicated file)
- Task already has `sortOrder` field (nullable number)

## Dependencies

- `src/lib/with-retry.ts` from Act 6 (optional — direct `payload.update` loop works without retry)
- Task collection's `sortOrder` field (already exists in `src/payload-types.ts`)
