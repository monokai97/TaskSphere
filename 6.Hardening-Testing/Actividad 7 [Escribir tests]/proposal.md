# Act 7: Escribir tests — Proposal

## Problem Statement

The current test suite covers PayloadCMS collection schemas (field validation, hooks, access control) but has **zero tests for the API routes** — the thin proxy endpoints that frontend components call. Additionally, there are no e2e tests for the critical user flow (create task → complete task → empty state).

## Proposed Solution

| Suite | Type | Files | Tests | Duration |
|-------|------|-------|-------|----------|
| Tasks API | Integration | `tests/int/tasks-api.int.spec.ts` | 8 tests | <2s |
| Lists API | Integration | `tests/int/lists-api.int.spec.ts` | 6 tests | <2s |
| Session API | Integration | `tests/int/session-api.int.spec.ts` | 5 tests | <2s |
| Export API | Integration | `tests/int/export-api.int.spec.ts` | 5 tests | <2s |
| Tasks e2e | Playwright | `tests/e2e/tasks.e2e.spec.ts` | 3 tests | <30s |

## Test Philosophy

1. **Integration tests call `fetch()` against the actual API routes**, not PayloadCMS directly. This validates the full chain: middleware → Zod → PayloadCMS → response.
2. **e2e tests use Playwright** to simulate real user interaction in Chromium.
3. **No mocks** — all tests use the real SQLite database (WAL mode, ephemeral or test-prefixed data).
4. **Each suite cleans up after itself** in `afterAll`/`afterEach`.
