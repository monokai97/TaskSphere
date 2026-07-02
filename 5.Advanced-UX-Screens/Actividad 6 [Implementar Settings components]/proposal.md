# Act 6: Settings Components — Proposal

## Problem Statement

The settings screens (Act 5) need reusable UI components for theme selection, language switching, notification configuration, integration management, and internal navigation. Without these, each settings page would duplicate logic and styling, violating DRY.

## Proposed Solution

Create 5 reusable client components under `src/components/settings/`:

| Component | Purpose | Consumed By |
|-----------|---------|-------------|
| `SettingsNav` | Left sidebar navigation for settings pages | `settings/layout.tsx` |
| `ThemeToggle` | 3-option theme selector (Light/Dark/System) | `settings/appearance/page.tsx` |
| `LanguageSelect` | Locale dropdown (ES/EN) | `settings/appearance/page.tsx` |
| `NotificationToggles` | Master toggle + sub-trigger toggles for desktop notifications | `settings/notifications/page.tsx` |
| `IntegrationCard` | Card component showing integration icon, name, status, action | `settings/integrations/page.tsx` |

## Dependencies

- **Act 7** (useSession hook): All mutations via `useUpdateSession()`
- **Existing**: `GlassPanel`, `EmptyState`, Material Symbols, Tailwind classes from the design system

## Non-Goals

- No complex form validation (leaf fields only — theme, locale, notificationsEnabled)
- No OAuth integration flows within these components
- No server components — all are `'use client'`
