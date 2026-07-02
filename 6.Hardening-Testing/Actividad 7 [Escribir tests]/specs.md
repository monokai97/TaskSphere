# Act 7: Escribir tests — Functional Specifications

## 7.1 Integration: Tasks API (`tests/int/tasks-api.int.spec.ts`)

### Setup
```ts
const TEST_GUEST = 'test-api-tasks-' + Date.now()
const BASE_URL = 'http://localhost:3000'

function headers(guestId: string): HeadersInit {
  return { 'x-guest-id': guestId, 'Content-Type': 'application/json' }
}
```

### Test Cases

| # | Name | Method | Body | Assertions |
|---|------|--------|------|------------|
| T1 | create and list tasks | POST /api/tasks + GET /api/tasks | `{ title: 'Buy milk', list: 1 }` | POST→201, GET→array includes task |
| T2 | reject task without title | POST /api/tasks | `{ list: 1 }` | 400 |
| T3 | reject task without list | POST /api/tasks | `{ title: 'No list' }` | 400 |
| T4 | toggle task status | PATCH /api/tasks/[id] | `{ status: 'completed' }` | 200, status='completed' |
| T5 | toggle task important | PATCH /api/tasks/[id] | `{ important: true }` | 200, important=true |
| T6 | delete task | DELETE /api/tasks/[id] | — | 200, GET returns empty |
| T7 | reject unauthorized access | GET /api/tasks | no header | 401 |
| T8 | guest isolation: guest B cannot see guest A's tasks | POST for A, GET for B | — | B's list doesn't contain A's task |

## 7.2 Integration: Lists API (`tests/int/lists-api.int.spec.ts`)

| # | Name | Method | Body | Assertions |
|---|------|--------|------|------------|
| L1 | create and list lists | POST /api/lists + GET /api/lists | `{ name: 'Shopping', icon: 'shopping_cart', color: '#ff0000' }` | POST→201, GET→array includes list |
| L2 | update list name | PATCH /api/lists/[id] | `{ name: 'Groceries' }` | 200, name='Groceries' |
| L3 | delete non-default list | DELETE /api/lists/[id] | — | 200 |
| L4 | reject delete of default list | DELETE /api/lists/[id] where isDefault=true | — | 409 |
| L5 | batch reorder lists | PATCH /api/lists/reorder | `{ lists: [{ id, sortOrder: 1 }, ...] }` | 200 |
| L6 | reject create without name | POST /api/lists | `{}` | 400 |

## 7.3 Integration: Session API (`tests/int/session-api.int.spec.ts`)

| # | Name | Method | Body | Assertions |
|---|------|--------|------|------------|
| S1 | get session returns profile | GET /api/session | — | 200, guestId matches |
| S2 | update session preferences | PATCH /api/session | `{ theme: 'dark', locale: 'en' }` | 200, theme/updated match |
| S3 | update session notifications | PATCH /api/session | `{ notificationsEnabled: false }` | 200, notificationsEnabled=false |
| S4 | reject session with invalid locale | PATCH /api/session | `{ locale: 'fr' }` | 400 |
| S5 | reject session without auth | GET /api/session | no header | 401 |

## 7.4 Integration: Export API (`tests/int/export-api.int.spec.ts`)

| # | Name | Method | Assertions |
|---|------|--------|------------|
| E1 | export returns all guest data | GET /api/export | 200, body has `profile`, `lists`, `tasks`, `taskLogs` |
| E2 | export returns 401 without auth | GET /api/export | 401 |
| E3 | export has Content-Disposition header | GET /api/export | Header `Content-Disposition` contains `attachment` |
| E4 | export includes focusSessions | Create a focus session, GET /api/export | `body.focusSessions.length >= 1` |
| E5 | export guest isolation | Data from guest B not in guest A's export | `body` doesn't contain B's data |

## 7.5 e2e: Tasks (`tests/e2e/tasks.e2e.spec.ts`)

| # | Name | Actions | Assertions |
|---|------|---------|------------|
| C1 | create task from AddTaskBar | Navigate to app, type task name, press Enter | Task appears in list |
| C2 | complete a task | Click checkbox on task | Task shows completed visual state |
| C3 | delete all tasks → empty state | Delete all tasks via UI | Empty state component visible |
