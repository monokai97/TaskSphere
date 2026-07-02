# Act 5: Settings Screens — Design

## Component Tree

```
StacksLayout (or root)
  └── SettingsLayout (settings/layout.tsx)
        ├── SettingsNav (280px fixed) ← Act 6
        │     ├── Logo/Header "Configuración"
        │     ├── Nav item: Apariencia (/settings/appearance)
        │     ├── Nav item: Notificaciones (/settings/notifications)
        │     ├── Nav item: Integraciones (/settings/integrations)
        │     └── Back link: "← Volver a tareas" (/)
        ├── Settings Content (flex-1 overflow-y-auto)
        │     ├── page.tsx → ConfigMain
        │     │     ├── Header (display-xl)
        │     │     ├── SummaryCard[0] → Apariencia (theme + locale)
        │     │     ├── SummaryCard[1] → Notificaciones (enabled/disabled)
        │     │     ├── SummaryCard[2] → Integraciones (count)
        │     │     └── SummaryCard[3] → Sincronización (placeholder)
        │     ├── appearance/page.tsx → AppearancePage
        │     │     ├── Header
        │     │     ├── ThemeToggle ← Act 6
        │     │     ├── LanguageSelect ← Act 6
        │     │     ├── AccentColor (placeholder)
        │     │     └── Density (placeholder)
        │     ├── notifications/page.tsx → NotificationsPage
        │     │     ├── Header
        │     │     ├── NotificationToggles ← Act 6
        │     │     ├── SoundSelector (placeholder)
        │     │     ├── AlertStyle (placeholder)
        │     │     ├── TestNotification button
        │     │     └── Save/Cancel footer
        │     └── integrations/page.tsx → IntegrationsPage
        │           ├── Header
        │           ├── CalendarSection
        │           │     ├── IntegrationCard[Google] ← Act 6
        │           │     └── IntegrationCard[Outlook] ← Act 6
        │           ├── CommunicationSection
        │           │     ├── IntegrationCard[Slack] ← Act 6
        │           │     └── IntegrationCard[Teams] ← Act 6
        │           ├── AutomationSection
        │           │     ├── IntegrationCard[Zapier] ← Act 6
        │           │     └── IntegrationCard[Request] ← Act 6
        │           └── (footer)
        └── DetailPanel (384px, hidden <xl) — contextual help
              ├── Help card ("Soporte FocusFlow")
              ├── Usage stats (placeholder)
              └── Security info (placeholder)
```

## Data Flow

```
useSession() ← Act 7 ← GET /api/session
  │
  ├── page.tsx: reads theme, locale, notificationsEnabled, integrations
  ├── appearance/page.tsx: reads theme, locale
  ├── notifications/page.tsx: reads notificationsEnabled
  └── integrations/page.tsx: reads integrations (future)

useUpdateSession({ theme, locale, notificationsEnabled }) ← Act 7
  │
  ├── ThemeToggle calls useUpdateSession({ theme: 'dark' })
  ├── LanguageSelect calls useUpdateSession({ locale: 'es' })
  └── NotificationToggles calls useUpdateSession({ notificationsEnabled: false })
```

## Responsive Behavior

| Breakpoint | Layout |
|-----------|--------|
| ≥1280px (xl) | SettingsNav + Content + DetailPanel (3-column) |
| ≥768px (md) | SettingsNav + Content (2-column) |
| <768px (sm) | Content only, hamburger menu for SettingsNav |

## User Flows

### Flow A: Change Theme
1. User clicks "Settings" in sidebar → `/settings`
2. Clicks "Apariencia" card or nav item → `/settings/appearance`
3. Clicks "Oscuro" button → `<ThemeToggle>` calls `useUpdateSession({ theme: 'dark' })`
4. TanStack Query PATCHes `/api/session` → updates `guest-sessions.theme`
5. Mutation `onSuccess` invalidates `useSession` cache
6. ThemeProvider's `useEffect` detects `session.theme === 'dark'` → adds `dark` class to `<html>`
7. UI immediately reflects dark mode

### Flow B: Configure Notifications
1. User navigates to Notifications page
2. Toggles master switch OFF → `useUpdateSession({ notificationsEnabled: false })`
3. Toast confirmation shown
4. All sub-triggers become visual-only disabled state

### Flow C: View Integrations
1. User navigates to Integrations page
2. Grid displays all integration cards with current status
3. "Manage Connection" / "Connect Account" buttons are placeholders (console.log or toast)
4. MVP: no server round-trip for integration actions

## Existing Components Consumed

| Component | File | Props |
|-----------|------|-------|
| `GlassPanel` | `src/components/common/GlassPanel.tsx` | children, className |
| `DetailPanel` | `src/components/layout/DetailPanel.tsx` | open, onClose, children, className |
| `EmptyState` | `src/components/ui/EmptyState.tsx` | icon, title, description |

## Components to Create (Act 6 — referenced here)

| Component | Expected File | Expected Props |
|-----------|---------------|----------------|
| `SettingsNav` | `src/components/settings/SettingsNav.tsx` | (none — uses usePathname) |
| `ThemeToggle` | `src/components/settings/ThemeToggle.tsx` | theme, onThemeChange |
| `LanguageSelect` | `src/components/settings/LanguageSelect.tsx` | locale, onLocaleChange |
| `NotificationToggles` | `src/components/settings/NotificationToggles.tsx` | enabled, onToggle |
| `IntegrationCard` | `src/components/settings/IntegrationCard.tsx` | name, icon, description, status, actionLabel, onAction |

## Hook to Create (Act 7 — referenced here)

| Hook | Expected File | Returns |
|------|---------------|---------|
| `useSession` | `src/hooks/useSession.ts` | `{ data: SessionData, isLoading, error }` |
| `useUpdateSession` | `src/hooks/useSession.ts` | `{ mutate: (data) => void, isPending }` |
