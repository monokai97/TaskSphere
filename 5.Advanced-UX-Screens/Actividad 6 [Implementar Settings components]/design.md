# Act 6: Settings Components — Design

## Component Tree & Dependencies

```
SettingsNav                 ThemeToggle                LanguageSelect
  └── Link → /settings        ├── Button("Claro")        └── select
  ├── Link → /appearance      ├── Button("Oscuro")            ├── option(en)
  ├── Link → /notifications   └── Button("Auto")              └── option(es)
  └── Link → /integrations

NotificationToggles          IntegrationCard
  ├── MasterToggle             ├── img (48px icon)
  │     ├── icon               ├── StatusBadge
  │     ├── title+desc         ├── name (headline-md)
  │     └── Switch             ├── description
  └── SubTrigger[4]            └── ActionButton
        ├── icon
        ├── title+desc
        └── Switch
```

## State Handling

| Component | Loading | Empty | Error | Edge |
|-----------|---------|-------|-------|------|
| SettingsNav | N/A (static links) | N/A | N/A | Active state syncs with pathname |
| ThemeToggle | Initial theme null → 0 active buttons | N/A | N/A | Rapid clicks: last wins |
| LanguageSelect | Initial locale null → show "Seleccionar" | N/A | N/A | Invalid values ignored |
| NotificationToggles | Master reads from session | N/A | N/A | Sub-triggers disabled when master=off |
| IntegrationCard | N/A (parent passes data) | N/A | N/A | `onAction` fires callback only |

## Visual Design Details

### SettingsNav
```
┌─────────────────────┐
│ Configuración       │ ← headline-md
│                     │
│ ● Configuración     │ ← active (bg-white, border-l-4 border-primary)
│   Apariencia        │ ← inactive
│   Notificaciones    │
│   Integraciones     │
│                     │
│ ← Volver a tareas   │ ← link
└─────────────────────┘
```

### ThemeToggle
```
┌──────────┬──────────┬──────────┐
│  ☀️      │  🌙      │  🤖      │
│ Claro    │ Oscuro   │ Auto     │
│ (active) │          │          │
└──────────┴──────────┴──────────┘
```

### IntegrationCard
```
┌──────────────────────────────────┐
│ [icon]                    ● Connected │
│ Google Calendar                   │
│ Sync events as FocusFlow tasks.. │
│ [ Manage Connection ]            │
└──────────────────────────────────┘
```

## Data Flow

```
SettingsNav: usePathname() → isActive(route)
ThemeToggle: props.theme → active button, onThemeChange → useUpdateSession({ theme })
LanguageSelect: props.locale → selected option, onLocaleChange → useUpdateSession({ locale })
NotificationToggles: props.enabled → switch state, onToggle → useUpdateSession({ notificationsEnabled })
IntegrationCard: props.connected → status badge + action variant, onAction → parent handler
```

## Responsive Behavior

| Component | Mobile (<768px) | Desktop (≥768px) |
|-----------|----------------|------------------|
| SettingsNav | `hidden` (replaced by hamburger) | `flex` column, 280px |
| ThemeToggle | 3 buttons stacked? No — grid shrinks | `grid-cols-3 gap-4` |
| LanguageSelect | Full width | Max-w-md |
| NotificationToggles | Stacked cards | Same (single column) |
| IntegrationCard | Single column grid | `xl:grid-cols-2` |

## Accessibility

- All toggle switches have `role="switch"` and `aria-checked`
- Buttons have `aria-label` or visible text
- Theme toggle buttons use `aria-pressed` for active state
- SettingsNav uses `<nav>` with `<ul>` and `<li>` for proper navigation semantics
- Language `<select>` has associated `<label>`
- Focus rings: `focus:ring-2 focus:ring-primary/20 focus:outline-none`
