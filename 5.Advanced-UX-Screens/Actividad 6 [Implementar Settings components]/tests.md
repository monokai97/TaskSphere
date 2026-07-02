# Act 6: Settings Components — Test Plan

## Test Strategy

- **Unit (Vitest + jsdom)**: Primary testing — each component is a pure UI element with controlled props
- **Visual/E2E**: Integration with actual settings pages tested in Act 5
- **Manual**: Visual dark mode toggle, animation checks

---

## Unit Tests (`tests/int/settings-components.int.spec.ts`)

### 6.1 SettingsNav

| # | Scenario | Setup | Assertion |
|---|----------|-------|-----------|
| 6.1 | Renders all nav items | Render `<SettingsNav />` | 4 items visible with correct labels |
| 6.2 | Active item highlighted | Mock `usePathname` → `/settings/appearance` | "Apariencia" item has `text-primary font-semibold` |
| 6.3 | Inactive items default style | Mock `usePathname` → `/settings/appearance` | "Notificaciones" item has `text-on-surface-variant` |
| 6.4 | Links have correct hrefs | — | Each `<Link>` has correct `href` matching nav item data |
| 6.5 | Back link to home | — | "← Volver a tareas" links to `/` |
| 6.6 | Hidden on mobile | — | Component wrapper has `hidden md:flex` classes |

### 6.2 ThemeToggle

| # | Scenario | Setup | Assertion |
|---|----------|-------|-----------|
| 6.7 | Renders 3 buttons | Render `<ThemeToggle />` | 3 buttons visible with correct labels |
| 6.8 | Active theme highlighted | `theme="dark"` | Dark button has `border-2 border-primary` |
| 6.9 | No theme = all inactive | `theme={null}` | No button has active border style |
| 6.10 | Click triggers callback | `onThemeChange` spy, click "Oscuro" | `onThemeChange` called with `'dark'` |
| 6.11 | System button renders auto icon | — | Icon is `auto_mode` |

### 6.3 LanguageSelect

| # | Scenario | Setup | Assertion |
|---|----------|-------|-----------|
| 6.12 | Renders dropdown | Render `<LanguageSelect locale="en" />` | Select with 2 options |
| 6.13 | Correct option selected | `locale="es"` | Value is `"es"`, selected text is "Español" |
| 6.14 | Change triggers callback | `onLocaleChange` spy, select "Español" | `onLocaleChange` called with `'es'` |
| 6.15 | Fallback to English | `locale={null}` | `value` falls back to `"en"` |
| 6.16 | Custom arrow icon visible | — | `expand_more` Material Symbol rendered |

### 6.4 NotificationToggles

| # | Scenario | Setup | Assertion |
|---|----------|-------|-----------|
| 6.17 | Renders master toggle | Render `<NotificationToggles enabled={true} />` | Master card with title "Alertas de escritorio" |
| 6.18 | Master toggle on = checked | `enabled={true}` | Master switch `checked` is true |
| 6.19 | Master toggle off = unchecked | `enabled={false}` | Master switch `checked` is false |
| 6.20 | Sub-triggers disabled when master off | `enabled={false}` | Sub-items have `opacity-50` class |
| 6.21 | Sub-triggers active when master on | `enabled={true}` | Sub-items do NOT have `opacity-50` |
| 6.22 | Toggle click calls callback | `onToggle` spy, click master switch | `onToggle` called with `false` (was true) |
| 6.23 | Renders 4 sub-triggers | — | "Recordatorios de tareas", "Nueva lista compartida", "Alertas de fecha límite", "Actualizaciones del sistema" present |
| 6.24 | Sound selector placeholder | — | Dropdown with "Zen Bell" option visible |

### 6.5 IntegrationCard

| # | Scenario | Setup | Assertion |
|---|----------|-------|-----------|
| 6.25 | Connected card renders badge | `connected={true}` | "Conectado" badge with green dot visible |
| 6.26 | Disconnected card hides badge | `connected={false}` | No "Conectado" badge |
| 6.27 | Connected card shows manage button | `connected={true}` | Button text is "Administrar" with bordered style |
| 6.28 | Disconnected card shows connect button | `connected={false}` | Button text is "Conectar" with primary style |
| 6.29 | Action calls callback | `onAction` spy, click button | `onAction` called with `(id, 'manage')` or `(id, 'connect')` |
| 6.30 | Card shows name + description | — | Name and description text rendered |
| 6.31 | Icon img rendered | — | `<img>` with correct src/alt |
| 6.32 | Dashed variant for suggestion | Integrations page uses `border-dashed` class | Request card has dashed border |

---

## E2E Smoke Tests

These are covered in Act 5 E2E tests (screens test components in context). Key cross-cutting tests:

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| E1 | SettingsNav active state syncs with URL | Navigate to `/settings/integrations` | Sync nav item has active style |
| E2 | Theme toggle persists dark mode | Click "Oscuro", reload page | `html` has `dark` class, button still active |
| E3 | Language persists on reload | Select "Español", reload | Dropdown shows "Español" |

---

## Edge Cases

| # | Scenario | Expected |
|---|----------|----------|
| EC1 | ThemeToggle — rapid clicks | No crash, last value wins |
| EC2 | LanguageSelect — programmatic value change | Dropdown updates without user interaction |
| EC3 | NotificationToggles — master toggle + rapid double-click | Only one mutation fires (TanStack Query handles dedup) |
| EC4 | IntegrationCard — missing icon URL | Show fallback Material Symbol icon |
| EC5 | SettingsNav — pathname not in items | No item active (all inactive) |

---

## Test Setup

- Components rendered in jsdom test environment
- `usePathname` mocked for SettingsNav tests
- Props passed directly (no provider wrapping needed — pure UI for unit tests)
- Run: `pnpm test:int -- -g "Settings components"`
