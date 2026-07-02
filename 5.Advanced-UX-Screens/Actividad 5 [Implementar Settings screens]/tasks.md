# Act 5: Settings Screens — Implementation Tasks

## Prerequisites

- [ ] Act 7: `useSession` / `useUpdateSession` hook exists at `src/hooks/useSession.ts`
- [ ] Act 6: `SettingsNav` component exists at `src/components/settings/SettingsNav.tsx`
- [ ] Act 6: `ThemeToggle` component exists at `src/components/settings/ThemeToggle.tsx`
- [ ] Act 6: `LanguageSelect` component exists at `src/components/settings/LanguageSelect.tsx`
- [ ] Act 6: `NotificationToggles` component exists at `src/components/settings/NotificationToggles.tsx`
- [ ] Act 6: `IntegrationCard` component exists at `src/components/settings/IntegrationCard.tsx`

## Task 5.1: Settings Layout

**File:** `src/app/(frontend)/settings/layout.tsx`

- [ ] Create layout with 2-column flex container
- [ ] Import `<SettingsNav />` from `@/components/settings/SettingsNav`
- [ ] Render SettingsNav (280px fixed width) on left
- [ ] Render `{children}` in flex-1 overflow-y-auto container
- [ ] Add responsive: hide SettingsNav on screens <md, show hamburger toggle
- [ ] Add optional DetailPanel (xl+ screens) with contextual help content from Config Main HTML
- [ ] Import `DetailPanel` from `@/components/layout/DetailPanel`

## Task 5.2: Config Main Page

**File:** `src/app/(frontend)/settings/page.tsx`

- [ ] Add `'use client'` directive (uses useSession hook)
- [ ] Import `useSession` from `@/hooks/useSession`
- [ ] Create SummaryCard sub-component (reusable within page):
  - Props: `icon: string`, `title: string`, `value: string`, `href: string`
  - Styling: `bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow`
  - Footer with `<Link>`: "Configurar →"
- [ ] Loading state: 4 skeleton cards with `animate-pulse`
- [ ] Error state: `<EmptyState>` with retry button
- [ ] Render 4 summary cards in 2x2 grid:
  1. Apariencia → shows current theme name + locale
  2. Notificaciones → "Enabled" / "Disabled"
  3. Integraciones → "X conectadas" (hardcoded count for now)
  4. Sincronización → "Al día" (static placeholder)
- [ ] Each card links to corresponding sub-page

## Task 5.3: Appearance Page

**File:** `src/app/(frontend)/settings/appearance/page.tsx`

- [ ] Add `'use client'` directive
- [ ] Import `useSession`, `useUpdateSession` from `@/hooks/useSession`
- [ ] Import `<ThemeToggle />` from `@/components/settings/ThemeToggle`
- [ ] Import `<LanguageSelect />` from `@/components/settings/LanguageSelect`
- [ ] Render header with `display-xl` title + subtitle
- [ ] Render ThemeToggle, passing `theme={data.theme}` + `onThemeChange`
- [ ] Render LanguageSelect, passing `locale={data.locale}` + `onLocaleChange`
- [ ] Add placeholder sections (visual only):
  - Accent color: 5 color buttons in a row
  - Density: 2 radio buttons (Espacioso / Compacto)
- [ ] Handle loading state: skeleton for ThemeToggle and LanguageSelect areas
- [ ] Handle error state: EmptyState with retry

## Task 5.4: Notifications Page

**File:** `src/app/(frontend)/settings/notifications/page.tsx`

- [ ] Add `'use client'` directive
- [ ] Import `useSession`, `useUpdateSession` from `@/hooks/useSession`
- [ ] Import `<NotificationToggles />` from `@/components/settings/NotificationToggles`
- [ ] Render header with `display-xl` title + subtitle
- [ ] Render NotificationToggles, passing `enabled={data.notificationsEnabled}` + `onToggle`
- [ ] Add placeholder sections:
  - Sound selector dropdown (5 options, visual only)
  - Alert style (2 visual cards: Banner / Alert, visual only)
  - "Test Notification" button → shows toast for 5s
- [ ] Footer with "Save Changes" (refreshes page) + "Cancel" (navigate back)
- [ ] Handle loading + error states
- [ ] On mobile, stack all sections vertically

## Task 5.5: Integrations Page

**File:** `src/app/(frontend)/settings/integrations/page.tsx`

- [ ] Add `'use client'` directive
- [ ] Import `<IntegrationCard />` from `@/components/settings/IntegrationCard`
- [ ] Render header with `display-xl` title + subtitle
- [ ] Render 3 sections with section headers (icon + h3):
  - Calendars: Google Calendar (connected) + Outlook (connect)
  - Communication: Slack (connected) + Teams (connect)
  - Automation: Zapier (connect) + Request Integration (dashed card)
- [ ] Each section uses `xl:grid-cols-2 gap-6`
- [ ] Integration data defined as a constant array (hardcoded for MVP):
  ```ts
  const INTEGRATIONS = [
    { id: 'google-calendar', name: 'Google Calendar', ... },
    { id: 'outlook', name: 'Outlook Calendar', ... },
    // ...
  ]
  ```
- [ ] Action buttons: `console.log('Connect: ${id}')` for now
- [ ] Handle loading state: show `animate-pulse` card placeholders
- [ ] Handle error state: EmptyState with retry

## Task 5.6: Integration and Polish

- [ ] Verify all routes render without 404s
- [ ] Verify SettingsNav active state highlights correct nav item
- [ ] Verify ThemeToggle immediately applies dark class to `<html>`
- [ ] Verify mobile responsiveness (hamburger menu for SettingsNav)
- [ ] Verify loading skeletons match actual card dimensions
- [ ] Run `pnpm lint` — no errors
- [ ] Run `pnpm build` — no errors

## Estimated Effort

| Task | Files | Est. Time |
|------|-------|-----------|
| 5.1 Layout | 1 new | 30 min |
| 5.2 Config Main | 1 new | 45 min |
| 5.3 Appearance | 1 new | 30 min |
| 5.4 Notifications | 1 new | 45 min |
| 5.5 Integrations | 1 new | 30 min |
| 5.6 Polish | — | 30 min |
| **Total** | **5 files** | **~3.5 hours** |
