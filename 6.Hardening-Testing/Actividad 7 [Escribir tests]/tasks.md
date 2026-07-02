# Act 7: Escribir tests — Implementation Tasks

## Task 7.0: Prerequisites

- [ ] Verify dev server starts successfully with `pnpm dev`
- [ ] Verify existing tests pass: `pnpm test:int`
- [ ] Verify Playwright is installed: `npx playwright --version`
- [ ] If no `data-testid` attributes on components, add minimal ones:
  - `data-testid="add-task-input"` on the AddTaskBar input
  - `data-testid="task-item"` on each TaskItem wrapper
  - `data-testid="empty-state"` on EmptyState component

## Task 7.1: Tasks API integration tests

**File:** `tests/int/tasks-api.int.spec.ts`

- [ ] Create file with existing test pattern (imports, TEST_GUEST, headers helper)
- [ ] **Test T1**: create + list tasks
  - `fetch(api('/tasks'), { method: 'POST', headers, body: { title, list: 1 } })` → 201
  - `fetch(api('/tasks'), { headers })` → 200, array includes created task
- [ ] **Test T2**: reject without title → 400
- [ ] **Test T3**: reject without list → 400
- [ ] **Test T4**: PATCH to toggle status → 200, status='completed'
- [ ] **Test T5**: PATCH to toggle important → 200, important=true
- [ ] **Test T6**: DELETE → 200, then GET returns empty for that task
- [ ] **Test T7**: GET without header → 401
- [ ] **Test T8**: guest isolation — create as A, GET as B → B's list doesn't include A's task
- [ ] Add `afterAll` to clean up test data

## Task 7.2: Lists API integration tests

**File:** `tests/int/lists-api.int.spec.ts`

- [ ] **Test L1**: create + list lists → 201, GET includes it
- [ ] **Test L2**: PATCH update name → 200, name updated
- [ ] **Test L3**: DELETE non-default list → 200
- [ ] **Test L4**: DELETE default list → 409
- [ ] **Test L5**: PATCH /api/lists/reorder → 200
- [ ] **Test L6**: POST without name → 400
- [ ] Add `afterAll` cleanup

## Task 7.3: Session API integration tests

**File:** `tests/int/session-api.int.spec.ts` (extends existing, or create new)

- [ ] Read existing file to see what's already tested
- [ ] **Test S1**: GET returns profile with matching guestId
- [ ] **Test S2**: PATCH theme + locale → 200, updated values
- [ ] **Test S3**: PATCH notificationsEnabled → 200
- [ ] **Test S4**: PATCH invalid locale → 400
- [ ] **Test S5**: GET without header → 401

## Task 7.4: Export API integration tests

**File:** `tests/int/export-api.int.spec.ts`

- [ ] **Test E1**: export returns all sections (profile, lists, tasks, taskLogs, focusSessions)
  - Create data in all collections
  - GET /api/export → 200, body has all 5 sections
- [ ] **Test E2**: 401 without auth header
- [ ] **Test E3**: Content-Disposition header present
- [ ] **Test E4**: focusSessions included after creating one
- [ ] **Test E5**: guest isolation
- [ ] Add `afterAll` cleanup

## Task 7.5: e2e Tasks tests

**File:** `tests/e2e/tasks.e2e.spec.ts`

- [ ] Check Playwright config in the project (find `playwright.config.ts`)
- [ ] **Test C1**: create task from AddTaskBar
  ```ts
  await page.goto('/')
  await page.fill('[data-testid="add-task-input"]', 'Buy groceries')
  await page.press('[data-testid="add-task-input"]', 'Enter')
  await expect(page.locator('text=Buy groceries')).toBeVisible()
  ```
- [ ] **Test C2**: complete a task
  ```ts
  await page.click('[data-testid="task-item"] >> nth=0')
  // or click the checkbox within the first task
  ```
- [ ] **Test C3**: delete all tasks → empty state visible
  ```ts
  // Delete tasks until none remain
  await expect(page.locator('[data-testid="empty-state"]')).toBeVisible()
  ```

## Task 7.6: Run & verify

- [ ] `pnpm test:int` — all integration tests pass (new + existing)
- [ ] `pnpm test:e2e` — all e2e tests pass
- [ ] `pnpm lint` — 0 errors in test files

## Estimated Effort

| Task | Files | Est. Time |
|------|-------|-----------|
| 7.0 Prerequisites | 1–3 (data-testid) | 15 min |
| 7.1 Tasks API tests | 1 new | 25 min |
| 7.2 Lists API tests | 1 new | 20 min |
| 7.3 Session API tests | 1 modified | 15 min |
| 7.4 Export API tests | 1 new | 20 min |
| 7.5 e2e tests | 1 new | 30 min |
| 7.6 Run & verify | — | 10 min |
| **Total** | **4 new + 1–3 modified** | **~2.25 hours** |
