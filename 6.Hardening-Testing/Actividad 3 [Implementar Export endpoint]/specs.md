# Act 3: Export endpoint — Functional Specifications

## 3.1 API Route

**Endpoint:** `GET /api/export`
**File:** `src/app/(frontend)/api/export/route.ts`

### Request
```
GET /api/export
x-guest-id: <from middleware>
```

### Response (200)
```json
{
  "exportedAt": "2026-06-21T12:00:00.000Z",
  "version": "1.0.0",
  "profile": {
    "guestId": "abc-123-def",
    "createdAt": "2026-06-14T10:00:00.000Z",
    "theme": "system",
    "locale": "es",
    "notificationsEnabled": true
  },
  "lists": [
    {
      "id": 1,
      "name": "My Day",
      "icon": "light_mode",
      "color": null,
      "isDefault": true,
      "sortOrder": 0
    }
  ],
  "tasks": [
    {
      "id": 42,
      "title": "Design system audit",
      "description": "Review all tokens",
      "status": "pending",
      "important": true,
      "dueDate": "2026-06-25T00:00:00.000Z",
      "list": 1,
      "sortOrder": 0,
      "completedAt": null,
      "subtasks": [
        { "title": "Colors", "completed": true },
        { "title": "Typography", "completed": false }
      ],
      "createdAt": "2026-06-20T08:00:00.000Z",
      "updatedAt": "2026-06-20T08:00:00.000Z"
    }
  ],
  "taskLogs": [
    {
      "id": 100,
      "task": 42,
      "operation": "CREATE",
      "previousState": null,
      "newState": { "title": "Design system audit", "status": "pending" },
      "timestamp": "2026-06-20T08:00:00.000Z"
    }
  ],
  "focusSessions": [
    {
      "id": 10,
      "duration": 25,
      "completed": true,
      "completedAt": "2026-06-21T09:30:00.000Z",
      "date": "2026-06-21"
    }
  ]
}
```

### Response Headers
```
Content-Type: application/json
Content-Disposition: attachment; filename="task-sphere-export-2026-06-21.json"
```

### Error Responses
| Status | Body | When |
|--------|------|------|
| 401 | `{ "error": "No session" }` | Missing `x-guest-id` header |
| 500 | `{ "error": "Export failed" }` | PayloadCMS query error |

## 3.2 Zod Schema (Output Validation)

**File:** `src/lib/export-schema.ts`

```ts
const ExportSchema = z.object({
  exportedAt: z.string().datetime(),
  version: z.string(),
  profile: z.object({
    guestId: z.string(),
    createdAt: z.string().datetime(),
    theme: z.string().nullable().optional(),
    locale: z.string().nullable().optional(),
    notificationsEnabled: z.boolean().nullable().optional(),
  }).nullable(),
  lists: z.array(z.object({
    id: z.number(),
    name: z.string(),
    icon: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    isDefault: z.boolean().nullable().optional(),
    sortOrder: z.number().nullable().optional(),
  })),
  tasks: z.array(z.object({
    id: z.number(),
    title: z.string(),
    description: z.string().nullable().optional(),
    status: z.enum(['pending', 'completed']),
    important: z.boolean().nullable().optional(),
    dueDate: z.string().nullable().optional(),
    list: z.number(),
    sortOrder: z.number().nullable().optional(),
    completedAt: z.string().nullable().optional(),
    subtasks: z.array(z.object({
      title: z.string(),
      completed: z.boolean().nullable().optional(),
    })).nullable().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })),
  taskLogs: z.array(z.object({
    id: z.number(),
    task: z.number(),
    operation: z.enum(['CREATE', 'UPDATE', 'DELETE']),
    previousState: z.any().nullable().optional(),
    newState: z.any().nullable().optional(),
    timestamp: z.string().datetime(),
  })),
  focusSessions: z.array(z.object({
    id: z.number(),
    duration: z.number(),
    completed: z.boolean().nullable().optional(),
    completedAt: z.string().nullable().optional(),
    date: z.string(),
  })),
})
```

## 3.3 Logic Flow

1. Extract `x-guest-id` from request headers → 401 if missing
2. Initialize PayloadCMS client (`getPayload`)
3. Query 5 collections in parallel (`Promise.all`):
   - `guest-sessions`: find by guestId, limit 1
   - `lists`: find by guestId, sort by sortOrder
   - `tasks`: find by guestId, sort by sortOrder, depth 0 (avoid populating list relationship)
   - `task-logs`: find by guestId, sort by timestamp
   - `focus-sessions`: find by guestId, sort by date
4. Compile `ExportData` object
5. Validate with Zod `ExportSchema`
6. Return JSON response with `Content-Disposition: attachment`
7. On any PayloadCMS error → 500

## 3.4 Edge Cases

| Scenario | Behavior |
|----------|----------|
| Guest has no sessions | `profile: null`, all arrays empty |
| Guest has tasks but no lists | tasks array empty (orphan tasks shouldn't exist, but handled gracefully) |
| Guest has no focus sessions | `focusSessions: []` |
| TaskLogs access control (write-only) | The collection's `read: () => false` blocks export. **Solution**: Export route uses internal PayloadCMS client (bypasses access control because it runs server-side in the same process) |
| Very large dataset (>1000 tasks) | Full JSON in memory — acceptable for guest-scale; log warning if count > 1000 |
| Concurrent export requests | Each request runs independently; no race condition (read-only) |
