# Act 3: Export endpoint — Design

## Visual Mapping

No HTML/UI mapping — this is a pure backend endpoint. The export feature is triggered from a button in Settings (to be added post-MVP or via manual URL navigation for now).

## Data Flow

```
User sends GET /api/export
  │
  ├─ 1. Extract x-guest-id from headers
  │     └─ Missing → 401
  │
  ├─ 2. getPayload({ config })
  │
  ├─ 3. Parallel queries (Promise.all):
  │     ├─ payload.find(guest-sessions, where: { guestId }, limit: 1)
  │     ├─ payload.find(lists, where: { guestId }, sort: 'sortOrder')
  │     ├─ payload.find(tasks, where: { guestId }, sort: 'sortOrder', depth: 0)
  │     ├─ payload.find(task-logs, where: { guestId }, sort: 'timestamp')
  │     └─ payload.find(focus-sessions, where: { guestId }, sort: 'date')
  │
  ├─ 4. Compile ExportData:
  │     {
  │       exportedAt: new Date().toISOString(),
  │       version: '1.0.0',
  │       profile: session?.docs[0] ?? null,
  │       lists: lists.docs,
  │       tasks: tasks.docs.map(normalizeTask),
  │       taskLogs: taskLogs.docs,
  │       focusSessions: focusSessions.docs,
  │     }
  │
  ├─ 5. Validate with ExportSchema
  │     └─ Invalid → log warning (defensive, still return data)
  │
  └─ 6. Return Response:
        Status: 200
        Headers:
          Content-Type: application/json
          Content-Disposition: attachment; filename="task-sphere-export-{date}.json"
        Body: ExportData JSON
```

## Parallel Query Design

```ts
const [sessionResult, listsResult, tasksResult, logsResult, focusResult] =
  await Promise.all([
    payload.find({ collection: 'guest-sessions', where: { guestId: { equals: guestId } }, limit: 1, depth: 0 }),
    payload.find({ collection: 'lists', where: { guestId: { equals: guestId } }, sort: 'sortOrder', depth: 0 }),
    payload.find({ collection: 'tasks', where: { guestId: { equals: guestId } }, sort: 'sortOrder', depth: 0 }),
    payload.find({ collection: 'task-logs', where: { guestId: { equals: guestId } }, sort: 'timestamp', depth: 0 }),
    payload.find({ collection: 'focus-sessions', where: { guestId: { equals: guestId } }, sort: 'date', depth: 0 }),
  ])
```

**Why parallel**: The 5 queries are independent (no cross-referencing until compile step). Parallel execution reduces total latency from ~200ms (sequential) to ~60ms (parallel with SQLite WAL mode).

## Task Normalization

The `tasks` collection has a `list` field that is a relationship. In the export, we want the raw `list.id` (number), not the populated object. Using `depth: 0` in the query achieves this, but we should explicitly map to ensure consistency:

```ts
function normalizeTask(task: any): TaskExport {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    important: task.important,
    dueDate: task.dueDate,
    list: typeof task.list === 'object' ? task.list.id : task.list,
    sortOrder: task.sortOrder,
    completedAt: task.completedAt,
    subtasks: task.subtasks,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }
}
```

## Access Control Consideration

**TaskLogs access issue**: The `TaskLogs` collection has `access.read: () => false` in its config, which blocks reads via the REST API. However, the export route uses PayloadCMS's internal Node.js client (`getPayload()` + `payload.find()`) which runs **server-side in the same process**. PayloadCMS's access control functions receive a `req` object — if no `req` is provided (or if it's an internal call), Payload may still enforce access control.

**Solution**: Ensure the `payload.find()` call for task-logs includes the `req` with the `x-guest-id` header, so access control passes. Alternatively, if access control still blocks, add a server-side utility function that queries the database directly using the PayloadCMS internal API (bypassing access control for this admin-level operation).

## No New PayloadCMS Types

The export consumes existing types from `src/payload-types.ts`:

```ts
import type { GuestSession, List, Task, TaskLog, FocusSession } from '@/payload-types'
```

The export output is validated by a Zod schema defined in `src/lib/export-schema.ts`.

## Error Handling Matrix

| Layer | Error | Response | Log |
|-------|-------|----------|-----|
| Auth | No x-guest-id header | 401 `{ error: 'No session' }` | No |
| Payload | DB connection failed | 500 `{ error: 'Export failed' }` | Yes |
| Payload | Query timeout | 500 `{ error: 'Export failed' }` | Yes |
| Zod | Validation fails (compile error) | Still return 200 + data (log warning) | Yes |
| JSON | Circular reference in data | 500 `{ error: 'Export failed' }` | Yes |
