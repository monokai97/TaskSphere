# Act 1: Focus Session — Test Plan

## Test Strategy

- **Integration (Vitest)**: Test API endpoints (POST /api/focus, GET /api/focus/stats) and the useFocusSessions hook
- **E2E (Playwright)**: Full flow — navigate to /focus, start timer, wait for completion, verify stats update
- **Manual**: Timer animation, sound, SVG rendering

---

## Integration Tests (`tests/int/focus.int.spec.ts`)

### 1.1 POST /api/focus

| # | Scenario | Setup | Steps | Assertion |
|---|----------|-------|-------|-----------|
| 1.1 | Creates session on completion | Valid x-guest-id header | POST `{ "duration": 25 }` | 201, response has `id`, `guestId`, `duration: 25`, `completed: true`, `completedAt` is ISO string, `date` is today |
| 1.2 | Rejects missing x-guest-id | No header | POST `{ "duration": 25 }` | 401 `{ error: 'No session' }` |
| 1.3 | Rejects invalid duration | Valid header | POST `{ "duration": 0 }` | 400 with Zod validation error |
| 1.4 | Rejects negative duration | Valid header | POST `{ "duration": -5 }` | 400 |
| 1.5 | Rejects duration > 120 | Valid header | POST `{ "duration": 121 }` | 400 |
| 1.6 | Rejects missing body | Valid header | POST `{}` | 400 |
| 1.7 | Creates multiple sessions | Valid header | POST x3 with duration 25 | 3 docs in DB with same guestId, same date |

### 1.2 GET /api/focus/stats

| # | Scenario | Setup | Steps | Assertion |
|---|----------|-------|-----------|---------|
| 1.8 | Returns zero stats for new guest | No focus sessions exist | GET | `{ sessionsToday: 0, totalMinutes: 0, dayStreak: 0 }` |
| 1.9 | Returns correct stats after sessions | Create 3 sessions (25, 15, 25) | GET | `sessionsToday: 3, totalMinutes: 65` |
| 1.10 | Ignores incomplete sessions | Create 1 completed + 1 not completed | GET | Only completed session counted |
| 1.11 | Returns 401 without auth | No x-guest-id | GET | 401 |
| 1.12 | Filters by date param | Create sessions yesterday, get today | GET `?date=2026-06-20` | Sessions from that date only |
| 1.13 | Day streak calculation | Create sessions on 3 consecutive days | GET | `dayStreak: 3` |
| 1.14 | Day streak resets after gap | Sessions on day 1 and day 3 (no day 2) | GET | `dayStreak: 1` |

### 1.3 Hook — useFocusSessions / useCreateFocusSession

| # | Scenario | Setup | Assertion |
|---|----------|-------|-----------|
| 1.15 | useFocusSessions fetches stats | Mock GET returns `{ sessionsToday: 5 }` | `data.sessionsToday === 5` |
| 1.16 | useFocusSessions shows loading | Mock fetch delayed | `isLoading === true` initially |
| 1.17 | useCreateFocusSession POSTs on mutate | Call `mutate({ duration: 25 })` | Fetch called with method POST, body `{"duration":25}` |
| 1.18 | useCreateFocusSession invalidates stats | Call `mutate`, then check cache | `['focus-stats', today]` query is stale |

---

## E2E Tests (`tests/e2e/focus.e2e.spec.ts`)

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| E1 | Focus page renders | Navigate to `/focus` | Title "Focus Session" visible, timer shows "25:00" |
| E2 | Timer starts on play | Click play button | Timer counts down, SVG ring animates |
| E3 | Timer pauses | Click pause button | Timer stops, SVG ring freezes |
| E4 | Timer resets | Click reset button | Timer returns to "25:00", SVG ring at 100% |
| E5 | Duration selection | Click "15 min Break" | Timer shows "15:00", progress resets |
| E6 | Stats display after completion | Complete a 1-min focus session (wait) | Sessions Today increments by 1 |
| E7 | Ambient sound buttons | Click "Rainfall" | Button shows active border style |
| E8 | Volume slider | Slide volume to 75 | Slider value updates |
| E9 | Focus nav link in sidebar | Navigate to `/` | Sidebar has "Focus" link with timer icon |

---

## Manual Tests

| # | Scenario | Pass Criteria |
|---|----------|---------------|
| M1 | SVG circle animation | Ring smoothly decreases during countdown, wraps around (starts from top, moves clockwise) |
| M2 | Timer format | Numbers use tabular-nums (no layout shift during countdown) |
| M3 | Completion sound | Short chime plays when timer reaches 00:00 |
| M4 | Multiple rapid starts/stops | Timer correctly resumes from paused state, no accumulated interval leaks |
| M5 | Stats card layout | Sessions Today in primary color, Total Focus Time in on-surface, Day Streak with fire icon in secondary color |
| M6 | Quote card | Random quote shown from hardcoded list, lightbulb icon + italic text |
| M7 | Mobile layout | Single column stack, no horizontal overflow |
| M8 | Dark mode | Cards render with correct dark mode surface colors |

---

## Edge Cases

| # | Scenario | Expected |
|---|----------|----------|
| EC1 | Navigate away during active timer | Timer stops (cleanup on unmount), no phantom intervals |
| EC2 | Click play multiple times rapidly | Only one interval starts (guard with `if (timerState !== 'idle' && timerState !== 'paused') return`) |
| EC3 | Session created with wrong date near midnight | Use `toISOString().split('T')[0]` in UTC to avoid date boundary issues |
| EC4 | Stats query with unsupported date format | Return 400 (validate query param) |
| EC5 | Focus page with no stats API | Timer still works, stats show 0 or skeleton |

---

## Test Environment

- Integration tests: Vitest + jsdom, mock fetch for hook tests, direct payload calls for API tests
- E2E tests: Playwright with Chromium, auto-start dev server
- Manual: Chrome DevTools for animation performance (60fps check)
- Run: `pnpm test:int -- -g "Focus"` for integration tests
- Run: `pnpm test:e2e -- -g "Focus"` for E2E tests
