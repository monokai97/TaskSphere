# Act 1: Focus Session — Proposal

## Problem Statement

The app currently has no Focus Session (Pomodoro) functionality. Users cannot:
- Start a focus timer with configurable duration
- See progress via an animated SVG circular ring
- Track daily focus statistics (sessions completed, total minutes, streaks)
- Listen to ambient sounds during focus sessions
- Persist focus session history for productivity tracking

The `FocusSessions` collection already exists in PayloadCMS (read/create only, update/delete blocked) but has no API endpoints, hooks, or UI components.

## Proposed Solution

Create a complete Focus Session module:

| Layer | Files | Purpose |
|-------|-------|---------|
| **Page** | `src/app/(frontend)/focus/page.tsx` | Fullscreen focus layout with 3-column grid |
| **API** | `src/app/(frontend)/api/focus/route.ts` | POST create session on completion |
| **API** | `src/app/(frontend)/api/focus/stats/route.ts` | GET aggregated daily stats |
| **Components** | `src/components/focus/FocusTimer.tsx` | SVG circular timer with start/pause/reset |
| **Components** | `src/components/focus/FocusStats.tsx` | Daily performance metrics |
| **Components** | `src/components/focus/AmbientSoundPicker.tsx` | 4-sound ambient player |
| **Hook** | `src/hooks/useFocusSessions.ts` | `useFocusSessions(date)`, `useCreateFocusSession()` |

## UI Reference

The HTML prototype at `ui-resources/17.Focus Session/17.Focus Session.html` shows a 3-column layout: controls (left) + timer (center) + stats (right), with SVG circular progress, ambient sound grid, and volume slider.

## Dependencies

- **Existing**: `FocusSessions` collection (already in `payload.config.ts` and `payload-types.ts`)
- **Existing**: `CreateFocusSessionInput` Zod schema (in `src/lib/schemas.ts` from design.md)
- **Existing**: `Sidebar` component (focus nav link to be added)
- **None on other Phase 6 activities**: Act 1 is independent

## Non-Goals

- No OAuth or account linking for the focus feature
- No advanced analytics (trends, charts) — only daily stats
- No Break timer timer logic (break timers are visual buttons only for MVP)
- No Task-selector real integration (dropdown is visual placeholder for MVP)
