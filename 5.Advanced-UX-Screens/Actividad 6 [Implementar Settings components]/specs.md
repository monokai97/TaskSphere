# Act 6: Settings Components — Functional Specifications

## 6.1 SettingsNav (`src/components/settings/SettingsNav.tsx`)

### Props
```ts
// None — uses usePathname() from next/navigation for active state
```

### Behavior
- Renders a `<nav>` element with 4 `<Link>` items
- Items:
  | Route | Icon | Label |
  |-------|------|-------|
  | `/settings` | `settings` | Configuración |
  | `/settings/appearance` | `palette` | Apariencia |
  | `/settings/notifications` | `notifications` | Notificaciones |
  | `/settings/integrations` | `sync` | Integraciones |
- Active detection: `usePathname() === route`
- Active style: `bg-white shadow-sm text-primary font-semibold rounded-lg` with `border-l-4 border-primary` indicator
- Inactive style: `text-on-surface-variant hover:bg-surface-variant/40`
- Mobile: hidden below md breakpoint via `hidden md:flex`
- Scrollable with custom thin scrollbar (webkit)
- "Configuración" header at top with `headline-md`
- "← Volver a tareas" link at bottom

## 6.2 ThemeToggle (`src/components/settings/ThemeToggle.tsx`)

### Props
```ts
interface ThemeToggleProps {
  theme?: 'light' | 'dark' | 'system' | null
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void
}
```

### Behavior
- 3 buttons in a row (`grid grid-cols-3 gap-4`)
- Each button: icon (Material Symbol) + text label
  - Light: `light_mode` / "Claro"
  - Dark: `dark_mode` / "Oscuro"
  - System: `auto_mode` / "Auto"
- Active button: `border-2 border-primary bg-white dark:bg-surface-dark shadow-sm`
- Inactive button: `border border-outline-variant/30 hover:border-outline-variant`
- Active button icon uses FILL variant (`font-variation-settings: 'FILL' 1`)
- Clicking calls `onThemeChange(newTheme)`

### States
| State | Rendering |
|-------|-----------|
| No initial theme | No button active (all inactive) |
| `theme === 'dark'` | Dark button active |
| Disabled | Not supported — always interactive |

## 6.3 LanguageSelect (`src/components/settings/LanguageSelect.tsx`)

### Props
```ts
interface LanguageSelectProps {
  locale?: 'es' | 'en' | null
  onLocaleChange: (locale: 'es' | 'en') => void
}
```

### Behavior
- Dropdown `<select>` styled with custom icon
- Options: English (en), Español (es)
- Styled with `bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3`
- Custom dropdown arrow icon (Material Symbol `expand_more`)
- On change, calls `onLocaleChange(newLocale)`
- Wrap in section with label "IDIOMA DE INTERFAZ"

## 6.4 NotificationToggles (`src/components/settings/NotificationToggles.tsx`)

### Props
```ts
interface NotificationTogglesProps {
  enabled?: boolean | null
  onToggle: (enabled: boolean) => void
}
```

### Behavior
- Master toggle card: icon + title + description + toggle switch
  - Icon: `desktop_windows` in `bg-primary/10` container
  - Title: "Alertas de escritorio"
  - Description: "Notificaciones nativas para recordatorios de tareas"
- 4 sub-trigger items (visual-only, controlled by master toggle):
  1. `notifications_active` — "Recordatorios de tareas" — "Alertas para horas de inicio y recordatorios"
  2. `group_add` — "Nueva lista compartida" — "Notificar cuando te inviten a una lista" (placeholder)
  3. `event_busy` — "Alertas de fecha límite" — "Alertas de alta prioridad para fechas próximas a vencer"
  4. `update` — "Actualizaciones del sistema" — "Anuncios de mantenimiento y nuevas funciones" (placeholder)
- Master toggle: custom switch component using `peer` + tailwind classes
  - On: `bg-primary`, dot moves right
  - Off: `bg-gray-200`, dot moves left
- When master is off, sub-triggers show reduced opacity (opacity-50) to indicate disabled state
- Always calls `onToggle(enabled)` with the new value

## 6.5 IntegrationCard (`src/components/settings/IntegrationCard.tsx`)

### Props
```ts
interface IntegrationCardProps {
  id: string
  name: string
  description: string
  icon: string // URL or Material Symbol name
  connected: boolean
  onAction: (id: string, action: 'connect' | 'manage' | 'disconnect') => void
}
```

### Behavior
- Card with `rounded-xl border border-border-subtle-light hover:border-primary-container/30 hover:shadow-xl transition-all duration-300`
- Layout: icon (48px rounded-lg) + status badge on top row, name + description below, action button at bottom
- When `connected === true`:
  - Status badge: green dot + "Conectado" (`bg-green-50 text-green-600`)
  - Action button: "Administrar" — `border border-border-subtle-light text-on-surface-variant`
- When `connected === false`:
  - No status badge
  - Action button: "Conectar" — `bg-primary text-white shadow-md`
- On action click, calls `onAction(id, 'connect' | 'manage')`
- Dashed border variant available for "Request Integration" card (suggestion card)
- Hover effect: `translateY(-4px)` lift via CSS transition
