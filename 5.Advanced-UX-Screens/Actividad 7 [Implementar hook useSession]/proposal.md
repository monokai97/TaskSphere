# Act 7: Hook useSession — Proposal

## Problem Statement

Guest session preferences (theme, locale, notificationsEnabled) are currently scattered across multiple concerns:
- `ThemeProvider` stores `theme` in localStorage but never syncs with the server
- Config Main page needs session data but has no shared hook
- Each settings page would otherwise duplicate the same fetch/mutation logic

## Proposed Solution

Create a centralized `useSession` TanStack Query hook that:

1. **Reads** session data via existing `GET /api/session`
2. **Writes** preferences via new `PATCH /api/session`
3. **Syncs** `theme` changes with the existing `ThemeProvider` (via `useContext`)

## Dependencies

- **Existing**: `GET /api/session` route, `ThemeProvider` with `useTheme()` context, `QueryProvider`
- **New**: `PATCH /api/session` route (created as part of this activity)
- **Consumers**: Act 5 (all settings pages), Act 6 (ThemeToggle, LanguageSelect, NotificationToggles)

## Non-Goals

- No user authentication — guest-first only
- No session creation here (done by `ensureGuestInitialized` in `payload-client.ts`)
- No DELETE functionality (already exists in session route)
- No real-time subscriptions (staleTime: 5min is sufficient for preferences)
