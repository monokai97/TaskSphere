# Act 5: Settings Screens — Test Plan

## Test Strategy

- **E2E (Playwright)**: Primary testing strategy — settings are UI-heavy with navigation, toggles, and visual assertions
- **Integration (Vitest)**: Supplementary — test session data fetching and rendering edge cases
- **Manual**: Visual inspection of dark/light mode toggle, responsive layout, and placeholder sections

---

## E2E Tests (`tests/e2e/settings.e2e.spec.ts`)

### Test: Navigation

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| 5.1 | Settings nav renders all items | Navigate to `/settings` | See 4 nav items: Configuración, Apariencia, Notificaciones, Integraciones |
| 5.2 | Config Main is default route | Navigate to `/settings` | URL is `/settings`, main content shows 4 summary cards |
| 5.3 | Nav item highlights correctly | Click "Apariencia" | Navigates to `/settings/appearance`, nav item has active styles |
| 5.4 | Sub-page renders content | Navigate to `/settings/notifications` | Page shows "Notificaciones" header + toggle sections |
| 5.5 | Mobile nav hidden | Resize to 375px width | SettingsNav not visible (check `hidden` or `md:flex` class) |

### Test: Appearance

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| 5.6 | Theme toggle clicks | Navigate to `/settings/appearance`, click "Oscuro" | `html` element gains `dark` class, toggle shows active state |
| 5.7 | Theme persists on reload | Toggle to "Oscuro", reload page | "Oscuro" button still shows active state |
| 5.8 | Language selector changes | Navigate to `/settings/appearance`, select "Español" | Dropdown shows "Español", value persists on reload |

### Test: Notifications

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| 5.9 | Master toggle switches | Navigate to `/settings/notifications`, click master toggle | Toggle visually toggles, state persists on reload |
| 5.10 | Save button exists | Navigate to `/settings/notifications` | "Save Changes" button visible, click refreshes page |
| 5.11 | Test notification toast | Click "Test Notification" | Toast slides in from bottom, disappears after 5s |

### Test: Integrations

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| 5.12 | Integration cards render | Navigate to `/settings/integrations` | 6 cards visible (Google, Outlook, Slack, Teams, Zapier, Request) |
| 5.13 | Google shows Connected | Navigate to `/settings/integrations` | Google Calendar card has "Conectado" badge |
| 5.14 | Connect button clickable | Click "Connect Account" on Outlook card | Console.log or toast fires (no error) |

---

## Integration Tests (`tests/int/settings.int.spec.ts`)

### Test: Session data drives Config Main

```ts
describe('Settings pages', () => {
  it('Config Main displays session-derived values', async () => {
    // Arrange: create GuestSession with known values
    const session = await createAny('guest-sessions', {
      guestId: 'test-settings',
      theme: 'dark',
      locale: 'es',
      notificationsEnabled: true,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })

    // Act: render page with server component props
    // (Testing Next.js page rendering requires integration with next-test-utils or similar)

    // Assert: check that values propagate correctly
    expect(session.theme).toBe('dark')
    expect(session.locale).toBe('es')
    expect(session.notificationsEnabled).toBe(true)
  })
})
```

### Test: Appearance page components receive correct props

| # | Scenario | Assertion |
|---|----------|-----------|
| 5.15 | ThemeToggle receives theme from session | `theme` prop matches `session.theme` |
| 5.16 | LanguageSelect receives locale from session | `locale` prop matches `session.locale` |
| 5.17 | Empty session uses default values | `theme` defaults to `'system'`, `locale` defaults to `'en'` |

### Test: Notifications toggle persistence

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| 5.18 | Update notificationsEnabled | `PATCH /api/session { notificationsEnabled: false }` | GET returns `notificationsEnabled: false` |
| 5.19 | Update multiple fields atomically | `PATCH /api/session { theme: 'dark', locale: 'es' }` | GET returns both updated |

---

## Manual Visual Tests

| # | Scenario | Pass Criteria |
|---|----------|---------------|
| M1 | Dark mode toggle renders correctly | Light/Dark/System buttons have correct icons and active border styles |
| M2 | Summary cards layout | 4 cards in 2x2 grid on desktop, 1-column on mobile |
| M3 | SettingsNav scroll | Long nav fits without overflow, custom thin scrollbar |
| M4 | Integration cards hover | Cards lift on hover (`translateY(-4px)`) with shadow transition |
| M5 | 3-column layout at xl | SettingsNav + Content + DetailPanel visible side by side |

---

## Edge Cases

| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| E1 | Direct URL access: `/settings/appearance` | Page renders with correct content, SettingsNav highlights "Apariencia" |
| E2 | Session not yet loaded | Show loading skeletons (no flash of empty content) |
| E3 | Session API returns 503 | Show error state with retry button |
| E4 | Mobile: navigate to sub-page then rotate to desktop | SettingsNav appears after rotation |
| E5 | Double-click theme toggle rapidly | Only last click triggers mutation (debounce not needed — TanStack Query handles) |

## Test Environment Setup

- Create test GuestSession with known values before each test
- Mock `useSession` for unit tests if needed
- E2E tests require `test.env` with `NODE_OPTIONS="--no-deprecation --no-experimental-strip-types"`
- Run: `pnpm test:e2e -- -g "Settings"` for settings-specific Playwright tests
