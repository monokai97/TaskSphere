# Act 8: Optimizaciones finales — Design

## 8.1 Composite Index Strategy

### Problem
The most frequent query pattern is:
```sql
SELECT * FROM tasks WHERE guestId = ? AND list = ? ORDER BY sortOrder ASC
```

Without a composite index `[guestId, list]`, SQLite uses the `guestId` index then scans all matching rows to filter by `list`. With the composite index, the filter is a direct index lookup.

### PayloadCMS Limitation
PayloadCMS 3.85 does not expose a `compoundIndex` field option. The solution is to add the composite index via a raw SQL migration that runs once:

```ts
// Added to the collection config's hooks, or run as a one-time migration
const createCompositeIndex = async () => {
  const { getPayload } = await import('payload')
  const config = await import('@payload-config')
  const payload = await getPayload({ config: config.default })
  // Access the underlying SQLite database
  // This is not directly exposed by PayloadCMS
}
```

**Alternative (simpler)**: The `guestId` and `list` individual indexes are sufficient for MVP. The composite index provides marginal benefit at guest-scale (≤1000 tasks). Document as a future optimization.

### Sort Order Indexes
Add `index: true` to `Tasks.sortOrder` and `Lists.sortOrder` for ORDER BY performance.

### TaskLogs.guestId Index
TaskLogs is queried by `guestId` during GC and Export. Without an index, every GC run scans the entire table. Add `index: true`.

## 8.2 Meta & PWA Design

### Favicon — Minimal SVG

A simple SVG favicon matching the brand:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="15" fill="#004ac6"/>
  <text x="16" y="21" text-anchor="middle" fill="white" font-family="Geist, sans-serif" font-size="14" font-weight="700">TS</text>
</svg>
```

### Open Graph
Open Graph tags improve share previews in messaging apps and social media. The metadata export already supports this via Next.js:

```ts
openGraph: {
  title: 'Task Sphere',
  description: 'Gestión de tareas simple y elegante',
  type: 'website',
  siteName: 'Task Sphere',
}
```

### Viewport & Charset
Next.js App Router automatically adds `<meta charset="utf-8">` and `<meta name="viewport" content="width=device-width">` when using the `metadata` export with `generateMetadata`. Verify these are present in the rendered HTML.

## 8.3 Dark Mode Audit Design

### Current Dark Mode State
- `tailwind.config.ts`: `darkMode: 'class'`
- `styles.css`: `.dark .glass-panel` (background), `.dark .custom-scrollbar-thumb`
- `ThemeProvider`: Sets `dark` class on `<html>` element

### Missing Dark Variants Audit Checklist

| Location | Has Dark Mode? | Fix |
|----------|---------------|-----|
| `body` background | ❌ | Add to styles.css |
| `glass-sidebar` | ❌ | Add `.dark .glass-sidebar` |
| `DetailPanel` | Unknown | Add `dark:bg-surface-dark` |
| `TaskItem` | Unknown | Add `dark:hover:bg-surface-elevated-dark` |
| `AddTaskBar` | Unknown | Add `dark:bg-surface-dark dark:border-border-subtle-dark` |
| Modal overlay bg | Unknown | Add `dark:bg-black/60` |
| Input fields | Unknown | Add `dark:bg-surface-dark dark:text-on-surface` |

### Approach
Not all components need individual attention. Add global CSS rules for common dark patterns:

```css
/* Inputs */
input, textarea, select {
  @apply dark:bg-surface-dark dark:text-on-surface dark:border-border-subtle-dark;
}

/* Detail panel */
.detail-panel {
  background: rgba(255, 255, 255, 0.95);
}
.dark .detail-panel {
  background: rgba(24, 24, 27, 0.95);
}
```

## 8.4 Animation Design

### Animation Categories

| Category | Duration | Easing | Example |
|----------|----------|--------|---------|
| Enter (modal, panel) | 0.3–0.4s | `cubic-bezier(0.16, 1, 0.3, 1)` | AddListModal scale-in |
| Exit (modal, panel) | 0.15–0.2s | `ease-in` | DetailPanel close |
| Hover (button, card) | 0.2s | `ease` | Primary button scale[1.02] |
| List item mount | 0.3s | `ease-out` | TaskItem slide-up |
| Loading shimmer | 1.5s infinite | `linear` | Skeleton loader |

### Implementation Pattern

Use Tailwind utility classes for hover animations:
```tsx
<button className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
```

Use CSS classes for mount animations:
```tsx
// Tailwind doesn't support staggered animations easily.
// Use inline style with --index:
<div style={{ animationDelay: `${index * 50}ms` }} className="animate-slide-up">
```

### Key Visual Reference (from HTML prototypes)

The HTML prototypes in `ui-resources/` show:
- `17.Focus Session`: SVG circular timer with smooth stroke animation
- `8.Config Main`: Settings panels with fade transitions
- Various: Scale-on-hover for cards, slide-in for side panels

Match these in the components.
