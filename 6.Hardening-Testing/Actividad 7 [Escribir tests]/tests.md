# Act 7: Escribir tests — Meta Test Plan

This document specifies how to verify the test suite itself.

## Verification Checklist

| # | Check | How |
|---|-------|-----|
| V1 | All integration tests pass | `pnpm test:int` exits 0 |
| V2 | All e2e tests pass | `pnpm test:e2e` exits 0 |
| V3 | No tests are skipped | Jest/Vitest summary shows 0 skipped |
| V4 | `pnpm lint` passes | 0 errors in test files |
| V5 | `pnpm build` passes | 0 errors (tests don't affect build) |

## Integration Test Coverage Map

| File | Tests | Area | Dependencies |
|------|-------|------|-------------|
| `tests/int/tasks-api.int.spec.ts` | 8 | Tasks CRUD via API routes | Server running, Tasks collection |
| `tests/int/lists-api.int.spec.ts` | 6 | Lists CRUD + reorder via API | Server running, Lists collection |
| `tests/int/session-api.int.spec.ts` | 5 | Session GET/PATCH via API | Server running, GuestSessions collection |
| `tests/int/export-api.int.spec.ts` | 5 | Export aggregation via API | Server running, all collections |
| `tests/int/collections.int.spec.ts` | existing | Schema validation + hooks | Direct Payload client, all collections |
| `tests/int/api.int.spec.ts` | existing | Minimal Payload connectivity | Direct Payload client |

## e2e Test Coverage

| File | Tests | Area | Dependencies |
|------|-------|------|-------------|
| `tests/e2e/tasks.e2e.spec.ts` | 3 | Full browser flow: create → complete → empty state | Server running, Chromium, data-testid attributes |

## CI Integration

The AGENTS.md specifies:
- `pnpm test:int` — Vitest integration tests
- `pnpm test:e2e` — Playwright e2e (auto-starts dev server)

Ensure CI runs both. The test files should not require any special CI configuration beyond what's already in the pipeline.

## Test Data Cleanup Verification

Each suite must clean up after itself. Verify by:
1. Run the test file in isolation
2. Run `pnpm dev` and query the database — no test-prefixed `guestId` should remain
3. Example SQLite query:
   ```sql
   SELECT guestId FROM tasks WHERE guestId LIKE 'test-api-%';
   ```
   Should return 0 rows.

## Edge Cases to Test in the Test Framework

| # | Scenario | Expected |
|---|----------|----------|
| E1 | Dev server not running when integration tests run | Clear error message suggesting to start `pnpm dev` |
| E2 | Playwright not installed when e2e tests run | Clear error message |
| E3 | Database file missing | `CLEANUP` in beforeAll handles initialization |
