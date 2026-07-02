# Act 4: Garbage Collection — Implementation Tasks

## Task 4.0: Prerequisites

- [ ] Verify `CLEANUP_SECRET` is in `.env` (production) — optional for dev
- [ ] Verify `withRetry` utility exists in `src/lib/utils.ts` (if Act 6 done) — optional fallback
- [ ] Verify all 4 collections have `guestId` field with `index: true`

## Task 4.1: Auth guard utility

**File:** inline in `route.ts`, or extract to `src/lib/cleanup-auth.ts`

- [ ] Create `function isAuthorized(req: NextRequest): boolean`
  - [ ] If `process.env.NODE_ENV === 'development'` → `return true`
  - [ ] Else → read `x-cleanup-key` header, compare with `process.env.CLEANUP_SECRET`
  - [ ] `return header === secret`

## Task 4.2: Cleanup route

**File:** `src/app/(frontend)/api/maintenance/cleanup/route.ts`

- [ ] Create file with `export async function GET(req: NextRequest)`
- [ ] Import: `getPayload`, `config`, `NextRequest`, `NextResponse`

### Auth guard

- [ ] Call `if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized', message: 'Invalid or missing cleanup key' }, { status: 403 })`

### Find expired sessions

- [ ] `const payloadConfig = await config`
- [ ] `const payload = await getPayload({ config: payloadConfig })`
- [ ] Query expired sessions:
  ```ts
  const expired = await payload.find({
    collection: 'guest-sessions',
    where: { expiresAt: { less_than: new Date().toISOString() } },
    limit: 100,
    overrideAccess: true,
  })
  ```
- [ ] Extract `expiredIds = expired.docs.map(s => s.guestId)`

### Early return

- [ ] If `expiredIds.length === 0` → return `{ success: true, deletedSessions: 0, deletedTasks: 0, deletedLists: 0, deletedLogs: 0, executedAt: new Date().toISOString() }`

### Cascade delete (sequential)

- [ ] Delete tasks:
  ```ts
  const deletedTasks = await payload.delete({
    collection: 'tasks',
    where: { guestId: { in: expiredIds } },
    overrideAccess: true,
  })
  ```
  - Store `deletedTasks.errors?.length ?? 0` (or count from result)

- [ ] Delete task-logs:
  ```ts
  const deletedLogs = await payload.delete({
    collection: 'task-logs',
    where: { guestId: { in: expiredIds } },
    overrideAccess: true,
  })
  ```

- [ ] Delete lists:
  ```ts
  const deletedLists = await payload.delete({
    collection: 'lists',
    where: { guestId: { in: expiredIds } },
    overrideAccess: true,
  })
  ```

- [ ] Delete guest-sessions:
  ```ts
  const deletedSessions = await payload.delete({
    collection: 'guest-sessions',
    where: { guestId: { in: expiredIds } },
    overrideAccess: true,
  })
  ```

### Count extraction

- [ ] Each `payload.delete` returns `{ docs: [], errors: [] }`. Count affected as `expiredIds.length` for sessions (all should match), and from response totals for others.
- [ ] Alternative: use `result.docs.length` to count actually deleted rows.

### Response

- [ ] Return 200:
  ```ts
  NextResponse.json({
    success: true,
    deletedSessions: deletedSessions.docs.length,
    deletedTasks: deletedTasks.docs.length,
    deletedLists: deletedLists.docs.length,
    deletedLogs: deletedLogs.docs.length,
    executedAt: new Date().toISOString(),
  })
  ```

### Error handling

- [ ] Wrap entire cascade in try/catch
- [ ] On error: log the error, return 500 `{ error: 'Cleanup failed', message: error.message }`

## Task 4.3: Test the endpoint

- [ ] Start dev server
- [ ] Create a GuestSession with `expiresAt` in the past:
  ```powershell
  # Use SQLite directly or via Payload admin to create an expired session
  ```
- [ ] Call cleanup:
  ```powershell
  curl.exe -X GET http://localhost:3000/api/maintenance/cleanup
  ```
- [ ] Verify `deletedSessions >= 1` in response
- [ ] Verify all tasks/lists/logs for that guest are gone
- [ ] Test production guard:
  ```powershell
  $env:NODE_ENV="production"
  curl.exe -X GET http://localhost:3000/api/maintenance/cleanup
  # Should return 403
  ```
- [ ] Test with correct key:
  ```powershell
  curl.exe -X GET http://localhost:3000/api/maintenance/cleanup -H "x-cleanup-key: your-secret"
  ```

## Task 4.4: Lint & Build

- [ ] `pnpm lint` — 0 errors
- [ ] `pnpm build` — 0 errors

## Estimated Effort

| Task | Files | Est. Time |
|------|-------|-----------|
| 4.0 Prerequisites | — | 5 min |
| 4.1 Auth guard | 1 new (or inline) | 10 min |
| 4.2 Cleanup route | 1 new | 45 min |
| 4.3 Test | — | 20 min |
| 4.4 Lint & Build | — | 10 min |
| **Total** | **1–2 new files** | **~1.5 hours** |
