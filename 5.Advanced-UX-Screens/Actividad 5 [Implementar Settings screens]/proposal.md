# Act 5: Settings Screens — Proposal

## Problem Statement

The application currently has no settings UI. The sidebar links to `/settings` but the route returns 404. Users cannot:

- View or change their theme preference (light/dark/system)
- Switch interface language (ES/EN)
- Configure desktop notification toggles
- See or manage connected integrations (Google Calendar, Slack, etc.)
- Access a centralized settings hub

This forces developers to manipulate `guest-sessions` fields directly via the PayloadCMS admin panel, which breaks the guest-first anonymous UX.

## Proposed Solution

Implement 5 Next.js page files under `src/app/(frontend)/settings/`:

| Route | Purpose |
|-------|---------|
| `/settings` (page.tsx) | Config Main — overview with summary cards + direct links to each sub-section |
| `/settings/layout.tsx` | Shared layout with `<SettingsNav />` secondary sidebar + `<DetailPanel />` for contextual help |
| `/settings/appearance/page.tsx` | Theme selector (ThemeToggle) + Language selector (LanguageSelect) |
| `/settings/notifications/page.tsx` | Desktop notification master toggle + per-trigger toggles (NotificationToggles) |
| `/settings/integrations/page.tsx` | Integration cards grid (IntegrationCard) — Google Calendar, Slack, Outlook, Zapier |

## Dependencies

- **Act 6** (Settings components): `<SettingsNav />`, `<ThemeToggle />`, `<LanguageSelect />`, `<NotificationToggles />`, `<IntegrationCard />`
- **Act 7** (useSession hook): `useSession()` for reading preferences, `useUpdateSession()` for persisting changes
- **Existing**: `DetailPanel.tsx` (contextual help sidebar), `GlassPanel.tsx`, `GuestSession` collection fields

## Non-Goals

- Do NOT implement the actual OAuth flows for integrations (post-MVP)
- Do NOT implement the "Profile" or "Account" sections (guest-first UX has no accounts)
- Do NOT implement billing/plan settings (post-MVP)
