# Act 8: Optimizaciones finales — Functional Specifications

## 8.1 Database Indexes

### Changes by Collection

| Collection | Field | Current | Target |
|-----------|-------|---------|--------|
| Tasks | `guestId` | `index: true` | Keep |
| Tasks | `sortOrder` | no index | Add `index: true` for sort performance |
| Tasks | `[guestId, list]` | no composite | Add composite index definition |
| Lists | `guestId` | `index: true` | Keep |
| Lists | `sortOrder` | no index | Add `index: true` |
| TaskLogs | `guestId` | no index | Add `index: true` for GC + export |
| FocusSessions | `guestId` | `index: true` | Keep |
| GuestSessions | `guestId` | `index: true, unique: true` | Keep |

### Composite Index on Tasks

PayloadCMS supports compound indexes via the `index` field option with compound syntax. However, Payload's field-level `index: true` only creates single-column indexes. For a composite index `[guestId, list]`, we need to use Payload's `index` property with a compound configuration or define it in the collection's `indexes` property.

Since PayloadCMS 3.x doesn't expose a direct way to define composite indexes through the config API, the recommended approach is:
1. Ensure both `guestId` and `list` have individual indexes (already true)
2. Add a migration script or raw SQL to create the composite index:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_tasks_guestId_list ON tasks("guestId", "list");
   ```
3. For MVP, individual indexes suffice. The composite index is a performance optimization to add when the dataset grows.

## 8.2 Meta tags + Favicon

### Root Layout Updates

```tsx
export const metadata = {
  title: 'Task Sphere',
  description: 'Task Sphere — Gestión de tareas simple y elegante',
  icons: {
    icon: '/favicon.svg',
  },
  manifest: '/manifest.json',
  other: {
    'theme-color': '#004ac6',
  },
  openGraph: {
    title: 'Task Sphere',
    description: 'Gestión de tareas simple y elegante',
    type: 'website',
  },
}
```

### Favicon (`public/favicon.svg`)

An SVG favicon matching the Task Sphere brand (blue circle with "TS" or a sphere icon). Minimum viable: a simple SVG with `#004ac6` primary color.

### Manifest (`public/manifest.json`)

```json
{
  "name": "Task Sphere",
  "short_name": "TaskSphere",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f8f9fa",
  "theme_color": "#004ac6",
  "icons": []
}
```

### HTML Viewport (in `layout.tsx`)

Add to the `<head>` section:
```tsx
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta charSet="utf-8" />
```
(Next.js metadata API handles these via the `metadata` export.)

## 8.3 Dark Mode Audit

### CSS additions to `styles.css`

```css
/* Body background */
body {
  background-color: #f8f9fa; /* surface */
}
.dark body {
  background-color: #09090B; /* canvas-dark */
}

/* Sidebar dark variant */
.dark .glass-sidebar {
  background: rgba(24, 24, 27, 0.95);
}
```

### Components to verify

| Component | Has Dark Mode? | Action Needed |
|-----------|---------------|---------------|
| Sidebar | Partially (glass-sidebar class) | Add `.dark .glass-sidebar` background |
| DetailPanel | Unknown | Verify or add `dark:` classes |
| GlassPanel | Yes (`.dark .glass-panel`) | OK |
| TaskItem | Unknown | Verify or add `dark:` hover states |
| AddTaskBar | Unknown | Verify or add `dark:` classes |
| Modal overlays | Unknown | Add `dark:` surface color |

## 8.4 Animations from Prototypes

### New Keyframes in `tailwind.config.ts`

```ts
keyframes: {
  'slide-in': { /* existing */ },
  'fade-in': {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  'scale-in': {
    '0%': { transform: 'scale(0.95)', opacity: '0' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
  'slide-up': {
    '0%': { transform: 'translateY(8px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
},
animation: {
  'slide-in': 'slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  'fade-in': 'fade-in 0.3s ease forwards',
  'scale-in': 'scale-in 0.2s ease forwards',
  'slide-up': 'slide-up 0.3s ease forwards',
},
```

### Component-Mapped Animations

| Component | Animation | Trigger |
|-----------|-----------|---------|
| AddListModal (overlay) | `fade-in` (bg) + `scale-in` (content) | On mount |
| DetailPanel | `slide-in` from right | On open |
| TaskItem | `slide-up` | On mount (staggered by index) |
| Empty state | `fade-in` | On mount |
| Butkins (primary, ghost) | `transition-all duration-200` + `hover:scale-[1.02]` | On hover |
| IntegrationCard | `transition-all duration-200` + `hover:shadow-lg hover:-translate-y-0.5` | On hover |
| FocusTimer | `transition-all duration-1000` (SVG stroke) | On progress change |
