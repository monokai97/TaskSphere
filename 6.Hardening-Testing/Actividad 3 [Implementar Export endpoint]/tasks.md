# Act 3: Export endpoint — Implementation Tasks

## Task 3.0: Prerequisites check

- [ ] Verify `src/lib/schemas.ts` exists or create it for shared Zod schemas
- [ ] Verify `withRetry` utility exists in `src/lib/utils.ts` (optional — direct calls without retry acceptable for read-only)
- [ ] Verify `FocusSessions` collection is registered in `payload.config.ts`

## Task 3.1: Export Zod schema

**File:** `src/lib/export-schema.ts`

- [ ] Import `z` from `zod`
- [ ] Define `TaskExportSchema`: object with all task fields flattened (list as number, not relationship)
- [ ] Define `ExportDataSchema`: top-level object with `exportedAt`, `version`, `profile`, `lists`, `tasks`, `taskLogs`, `focusSessions`
- [ ] Make `profile` nullable (guest without GuestSession)
- [ ] Make all array fields default to empty array (never undefined)
- [ ] Export `ExportDataSchema` and its inferred type `ExportData`
- [ ] Ensure the schema matches the `specs.md` contract exactly

## Task 3.2: Task normalization utility

**File:** `src/app/(frontend)/api/export/route.ts` (inline)

- [ ] Create `normalizeTask(task: any): TaskExport` function
- [ ] Handle `list` field: if object, extract `.id`; if number, use directly
- [ ] Handle nullable fields gracefully (dueDate, completedAt, description, subtasks)

## Task 3.3: Export API route

**File:** `src/app/(frontend)/api/export/route.ts`

- [ ] Create file with `export async function GET(req: NextRequest)`
- [ ] Import from `@payload-config`
- [ ] Import `getPayload` from `payload`
- [ ] Import `ExportDataSchema` from `@/lib/export-schema`
- [ ] Extract `x-guest-id` header → 401 if missing
- [ ] Wrap entire handler in try/catch → 500 on error

### Query execution:

- [ ] `const payloadConfig = await config`
- [ ] `const payload = await getPayload({ config: payloadConfig })`
- [ ] Run 5 parallel queries with `Promise.all`:
  ```ts
  const [sessionRes, listsRes, tasksRes, logsRes, focusRes] = await Promise.all([
    payload.find({ collection: 'guest-sessions', where: { guestId: { equals: guestId } }, limit: 1, depth: 0 }),
    payload.find({ collection: 'lists', where: { guestId: { equals: guestId } }, sort: 'sortOrder', depth: 0 }),
    payload.find({ collection: 'tasks', where: { guestId: { equals: guestId } }, sort: 'sortOrder', depth: 0 }),
    payload.find({ collection: 'task-logs', where: { guestId: { equals: guestId } }, sort: 'timestamp', depth: 0 }),
    payload.find({ collection: 'focus-sessions', where: { guestId: { equals: guestId } }, sort: 'date', depth: 0 }),
  ])
  ```

### Compile export object:

- [ ] Build export object:
  ```ts
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    profile: sessionRes.docs[0] ?? null,
    lists: listsRes.docs,
    tasks: tasksRes.docs.map(normalizeTask),
    taskLogs: logsRes.docs,
    focusSessions: focusRes.docs,
  }
  ```

### Validate & respond:

- [ ] Validate with `ExportDataSchema.safeParse(exportData)`
  - [ ] If invalid: `console.warn('Export validation warning:', result.error)` — still return data
- [ ] Generate filename: `task-sphere-export-${new Date().toISOString().split('T')[0]}.json`
- [ ] Return `NextResponse.json` with:
  - Status 200
  - Headers: `Content-Type: application/json`, `Content-Disposition: attachment; filename="..."`
  - Body: validated data (or raw data if validation failed)

## Task 3.4: Test the endpoint

- [ ] Start dev server with `pnpm dev`
- [ ] Test with curl:
  ```powershell
  curl.exe -X GET http://localhost:3000/api/export -H "x-guest-id: test-guest-123"
  ```
- [ ] Verify 401 without header:
  ```powershell
  curl.exe -X GET http://localhost:3000/api/export
  ```
- [ ] Verify response has `Content-Disposition: attachment` header
- [ ] Verify JSON structure matches ExportDataSchema
- [ ] Verify all arrays present (even if empty)

## Task 3.5: Lint & Build

- [ ] Run `pnpm lint` — 0 errors
- [ ] Run `pnpm build` — 0 errors
- [ ] Verify `task-logs` read access: ensure the internal Payload client can read task-logs (bypass access control via server-side call)

## Estimated Effort

| Task | Files | Est. Time |
|------|-------|-----------|
| 3.0 Prerequisites | — | 5 min |
| 3.1 Export Zod schema | 1 new | 15 min |
| 3.2 Task normalization | same as 3.3 | 5 min |
| 3.3 Export route | 1 new | 35 min |
| 3.4 Test | — | 15 min |
| 3.5 Lint & Build | — | 10 min |
| **Total** | **2 new files** | **~1.5 hours** |
