# Act 3: Export endpoint — Proposal

## Problem Statement

Users have no way to download their data from Task Sphere. Although the app is guest-first (anonymous), users invest time creating tasks, organizing lists, and building focus history. Without an export feature, all data is locked inside SQLite with no portability.

## Proposed Solution

Create a single API route `GET /api/export` that compiles all guest data into a downloadable JSON file:

| Data Included | Source Collection | Why |
|---------------|-------------------|-----|
| Profile / Session | `guest-sessions` | Preferences (theme, locale) |
| Lists | `lists` | Custom list structure |
| Tasks | `tasks` | All tasks with status, dates, subtasks |
| Activity Logs | `task-logs` | Audit trail of changes |
| Focus Sessions | `focus-sessions` | Pomodoro history |
| Export Metadata | — | Timestamp + version info |

## No New Collections

This activity creates **zero new PayloadCMS collections**. All data is read-only via `payload.find()` on existing collections. The only new code is:
- `src/app/(frontend)/api/export/route.ts` — API route
- `src/lib/export-schema.ts` — Zod schema for output validation (or add to existing schemas.ts)

## Dependencies

- **Existing**: PayloadCMS collections (Tasks, Lists, TaskLogs, GuestSessions, FocusSessions)
- **Existing**: API Route pattern (Iron-Session + `x-guest-id` header)
- **Act 6**: `withRetry()` helper (optional enhancement — direct call without retry is acceptable for read-only)

## Non-Goals

- No CSV/PDF export (JSON only for MVP)
- No streaming — full JSON in memory (acceptable for guest-scale data: ≤1000 tasks)
- No email delivery of export (download directly in browser)
- No scheduled/automatic exports (manual trigger only)
