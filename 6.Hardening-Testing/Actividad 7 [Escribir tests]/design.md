# Act 7: Escribir tests — Design

## Integration Test Architecture

Each API integration test file follows the same pattern:

```ts
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

const TEST_GUEST = 'test-api-' + Date.now()
const BASE = 'http://localhost:3000'
const HEADERS = { 'x-guest-id': TEST_GUEST, 'Content-Type': 'application/json' }

function api(path: string) {
  return `${BASE}/api${path}`
}

let payload: Payload

beforeAll(async () => {
  const payloadConfig = await config
  payload = await getPayload({ config: payloadConfig })
  await ensureTestData() // create minimal prerequisites
})

afterAll(async () => {
  await cleanTestData() // delete everything created
})
```

### Why `fetch()` instead of direct `payload.*` calls

| Aspect | `fetch()` (chosen) | `payload.*` (existing tests) |
|--------|-------------------|------------------------------|
| Validates Zod middleware | ✅ | ❌ |
| Validates HTTP status codes | ✅ | ❌ |
| Validates error response shape | ✅ | ❌ |
| Validates headers (Content-Disposition) | ✅ | ❌ |
| Speed | ~2ms overhead per request | Instant |
| Simplicity | Same as existing tests | Same |

Decision: **Use `fetch()`** for API route tests. Keep `payload.*` for collection schema tests (existing `collections.int.spec.ts`).

### Server Requirement

Integration tests that use `fetch()` require a running dev server. We have two options:

**Option A**: Start dev server in CI before tests (configurable via `BASE_URL` env var).
**Option B**: Embed the request handler using Next.js `request` handler.

For simplicity, **Option A** — tests assume `http://localhost:3000` is running. Add `BASE_URL` env var for CI flexibility.

## e2e Test Architecture

```ts
import { test, expect } from '@playwright/test'

test.describe('Tasks e2e', () => {
  test('create task from AddTaskBar', async ({ page }) => {
    await page.goto('/')
    await page.fill('[data-testid="add-task-input"]', 'Buy groceries')
    await page.press('[data-testid="add-task-input"]', 'Enter')
    await expect(page.locator('text=Buy groceries')).toBeVisible()
  })
})
```

Uses `data-testid` attributes. If components don't have them, add minimal test IDs.

### Playwright Configuration

- Browser: Chromium (headless)
- Base URL: `http://localhost:3000`
- Auto-start dev server via Playwright's `webServer` config option (or `pnpm test:e2e` handles it as per AGENTS.md)

## Test Data Isolation

Each test file uses a unique `TEST_GUEST` value (appended with `Date.now()`). This guarantees no cross-contamination between test runs, even if cleanup fails.

## File Structure

```
tests/
├── int/
│   ├── tasks-api.int.spec.ts      # NEW — tasks API route tests
│   ├── lists-api.int.spec.ts      # NEW — lists API route tests
│   ├── session-api.int.spec.ts    # RENAME from session-api.int.spec.ts or add tests
│   ├── export-api.int.spec.ts     # NEW — export route tests
│   ├── api.int.spec.ts            # existing (minimal, keep)
│   ├── collections.int.spec.ts    # existing (keep, schema tests)
│   └── ...
└── e2e/
    └── tasks.e2e.spec.ts          # NEW — Playwright e2e tests
```

Note: `session-api.int.spec.ts` already exists. Either extend it with new tests (preferred) or replace its content entirely.
