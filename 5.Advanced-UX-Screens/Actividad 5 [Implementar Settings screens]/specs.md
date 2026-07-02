# Act 5: Settings Screens — Functional Specifications

## 5.1 Settings Layout (`src/app/(frontend)/settings/layout.tsx`)

### Behavior
- 2-column layout: `<SettingsNav />` (280px fixed) on the left, child content on the right
- Sidebar includes a "Configuración" header + nav items: Apariencia, Notificaciones, Integraciones (the 3 guest-relevant sections)
- Active state: `bg-white shadow-sm text-primary font-semibold` with `border-l-4 border-primary` indicator
- Nav items link via `<Link>` to `/settings`, `/settings/appearance`, `/settings/notifications`, `/settings/integrations`
- Below 768px (md breakpoint), the SettingsNav is hidden and a mobile dropdown/menu icon replaces it
- Optional right-side `<DetailPanel>` with contextual help content (visible above xl breakpoint)
- Wrap with `GlassPanel` or `bg-surface` container for consistency with the 3-column architecture

### Route Map
| Nav Item | Icon | Route |
|----------|------|-------|
| Configuración (overview) | `settings` | `/settings` |
| Apariencia | `palette` | `/settings/appearance` |
| Notificaciones | `notifications` | `/settings/notifications` |
| Integraciones | `sync` | `/settings/integrations` |

## 5.2 Config Main (`src/app/(frontend)/settings/page.tsx`)

### Behavior
- 4 summary cards in a 2x2 grid (md+) or 1-column stack (sm)
- Each card shows: icon, title, current value summary, "Configure" link
- Cards read data from `useSession()` hook:
  - **Apariencia**: Shows current theme (Claro/Oscuro/Auto) + locale (ES/EN)
  - **Notificaciones**: Shows "Enabled" / "Disabled" based on `notificationsEnabled`
  - **Integraciones**: Shows count of connected integrations
  - **Sincronización**: Shows "Last synced" (placeholder — static for now)
- Cards use `bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm` styling
- Each card has a `<Link>` to its sub-page

### Loading State
- Use `animate-pulse` skeleton matching card dimensions while `useSession()` loads

### Error State
- Show an `<EmptyState>` component with "Unable to load settings" message + retry button

## 5.3 Appearance Page (`src/app/(frontend)/settings/appearance/page.tsx`)

### Behavior
- Section header: "Apariencia" + subtitle
- **Tema**: `<ThemeToggle />` component — 3-option selector (Light/Dark/System) with preview icons
  - Reads `session.theme`, writes via `useUpdateSession({ theme })`
  - ThemeProvider synchronizes the `dark` class on `<html>` element
- **Idioma**: `<LanguageSelect />` — dropdown with ES/EN options
  - Reads `session.locale`, writes via `useUpdateSession({ locale })`
- **Color de acento** (placeholder): 5 color swatches (blue, emerald, purple, rose, amber) — visual only, no persistence yet
- **Densidad** (placeholder): 2 radio buttons (Espacioso / Compacto) — visual only, no persistence yet

### Validation
- `useUpdateSession` mutation handles all writes; no local Zod needed for these leaf fields

## 5.4 Notifications Page (`src/app/(frontend)/settings/notifications/page.tsx`)

### Behavior
- Section header: "Notificaciones" + subtitle
- `<NotificationToggles />` component:
  - Master toggle: "Enable Desktop Notifications" with icon
  - 4 per-trigger toggles: Task Reminders, New Shared List (placeholder), Due Date Alerts, System Updates (placeholder)
  - `notificationsEnabled` stored on `guest-sessions`
  - Sub-triggers are visual-only (individual toggle state not persisted — simplified to master toggle only for MVP)
- Sound selector (placeholder): dropdown with 5 options (Zen Bell, Minimal Chirp, Soft Pulse, Mechanical Click, None)
- Alert style preview (placeholder): 2 visual style cards (Banner / Alert) — visual only
- "Test Notification" button: triggers a toast for 5s (client-side only, no server round-trip)
- Footer: "Save Changes" button + "Cancel" link

## 5.5 Integrations Page (`src/app/(frontend)/settings/integrations/page.tsx`)

### Behavior
- Section header: "Integraciones" + subtitle
- 3 sections: Calendars, Communication, Automation
- Each section has a 2-column grid (`xl:grid-cols-2`) of `<IntegrationCard />` components
- Cards show: icon (img), name, description, status badge (Connected / Connect), action button
- **Google Calendar**: Status "Conectado" with "Manage Connection" button (placeholder)
- **Outlook Calendar**: "Connect Account" button (placeholder)
- **Slack**: Status "Conectado" with "Manage Notifications" button (placeholder)
- **Microsoft Teams**: "Connect Account" button (placeholder)
- **Zapier**: "Setup Zaps" button (placeholder)
- "Request Integration" dashed card: icon + text + "Submit a request" link
- Integration statuses hardcoded for now; real OAuth is post-MVP

## Data Model (GuestSession fields consumed)

| Field | Type | Values | Used By |
|-------|------|--------|---------|
| `theme` | select | light, dark, system | Appearance page |
| `locale` | select | es, en | Appearance page |
| `notificationsEnabled` | checkbox | true/false | Notifications page |
| `integrations` | JSON | array of integration objects | Integrations page (MVP: hardcoded) |
