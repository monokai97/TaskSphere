# Act 8: Optimizaciones finales — Implementation Tasks

## Task 8.0: Prerequisites

- [ ] Read the HTML prototypes in `ui-resources/` to refresh animation targets
- [ ] Verify current `pnpm lint` passes
- [ ] Verify current `pnpm build` passes
- [ ] Check current `public/` directory exists (create if not)

## Task 8.1: Database indexes

**Files:** `src/collections/Tasks.ts`, `src/collections/Lists.ts`, `src/collections/TaskLogs.ts`, `src/collections/FocusSessions.ts`

- [ ] `src/collections/TaskLogs.ts`: Add `index: true` to `guestId` field
- [ ] `src/collections/Tasks.ts`: Add `index: true` to `sortOrder` field
- [ ] `src/collections/Lists.ts`: Add `index: true` to `sortOrder` field
- [ ] Document composite index `[guestId, list]` as future optimization (not implemented — PayloadCMS limitation)

## Task 8.2: Meta tags + Favicon + PWA

**Files:** `src/app/(frontend)/layout.tsx`, `public/favicon.svg`, `public/manifest.json`

### Metadata enhancement
- [ ] `layout.tsx`: Update `metadata` export:
  ```ts
  export const metadata = {
    title: 'Task Sphere',
    description: 'Task Sphere — Gestión de tareas simple y elegante',
    icons: { icon: '/favicon.svg' },
    manifest: '/manifest.json',
    other: { 'theme-color': '#004ac6' },
    openGraph: {
      title: 'Task Sphere',
      description: 'Gestión de tareas simple y elegante',
      type: 'website',
      siteName: 'Task Sphere',
    },
  }
  ```

### Favicon
- [ ] Create `public/favicon.svg` with minimal SVG:
  ```svg
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="15" fill="#004ac6"/>
    <text x="16" y="21" text-anchor="middle" fill="white" font-family="Geist, sans-serif" font-size="14" font-weight="700">TS</text>
  </svg>
  ```

### PWA Manifest
- [ ] Create `public/manifest.json`:
  ```json
  {
    "name": "Task Sphere",
    "short_name": "TaskSphere",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#f8f9fa",
    "theme_color": "#004ac6"
  }
  ```

## Task 8.3: Dark mode audit

**File:** `src/app/(frontend)/styles.css`

- [ ] Add body dark background:
  ```css
  .dark body {
    background-color: #09090B;
  }
  ```
- [ ] Add sidebar dark variant:
  ```css
  .dark .glass-sidebar {
    background: rgba(24, 24, 27, 0.95);
  }
  ```
- [ ] Add detail-panel dark variant:
  ```css
  .dark .detail-panel {
    background: rgba(24, 24, 27, 0.95);
  }
  ```
- [ ] Add input dark overrides:
  ```css
  .dark input,
  .dark textarea,
  .dark select {
    background-color: #18181B;
    border-color: rgba(39, 39, 42, 0.5);
    color: #f4f4f5;
  }
  ```

**Component audit** (check these files for missing `dark:` classes):
- [ ] `src/components/layout/Sidebar.tsx` — verify z-index and dark background
- [ ] `src/components/layout/DetailPanel.tsx` — verify dark background
- [ ] `src/components/tasks/TaskItem.tsx` — verify hover states in dark
- [ ] `src/components/tasks/AddTaskBar.tsx` — verify input background in dark
- [ ] `src/components/lists/AddListModal.tsx` — verify modal overlay and card in dark
- [ ] `src/components/ui/EmptyState.tsx` — verify text colors in dark

## Task 8.4: Animations

**File:** `tailwind.config.ts`

- [ ] Add `fade-in` keyframe:
  ```ts
  'fade-in': {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  ```
- [ ] Add `scale-in` keyframe:
  ```ts
  'scale-in': {
    '0%': { transform: 'scale(0.95)', opacity: '0' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  },
  ```
- [ ] Add `slide-up` keyframe:
  ```ts
  'slide-up': {
    '0%': { transform: 'translateY(8px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  ```
- [ ] Add animation configs:
  ```ts
  'fade-in': 'fade-in 0.3s ease forwards',
  'scale-in': 'scale-in 0.2s ease forwards',
  'slide-up': 'slide-up 0.3s ease forwards',
  ```

**Component animation integration:**

- [ ] `AddListModal`: Add `animate-scale-in` to modal card, `animate-fade-in` to overlay
- [ ] `DetailPanel`: Add `animate-slide-in` on open
- [ ] `TaskItem`: Add `animate-slide-up` with staggered `style={{ animationDelay }}`
- [ ] Buttons (primary/secondary): Add `transition-all duration-200 hover:scale-[1.02]`
- [ ] `IntegrationCard`: Add `transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`
- [ ] `EmptyState`: Add `animate-fade-in`

## Task 8.5: Verify

- [ ] `pnpm lint` — 0 errors
- [ ] `pnpm build` — 0 errors
- [ ] `pnpm dev` — app starts without warnings
- [ ] Visually verify:
  - Dark mode toggle works on all pages
  - Animations play smoothly (check Chrome DevTools Performance tab, 60fps)
  - Favicon appears in browser tab
  - Meta tags render correctly in page source HTML
  - PWA manifest is served at `/manifest.json`

## Estimated Effort

| Task | Files | Est. Time |
|------|-------|-----------|
| 8.0 Prerequisites | — | 5 min |
| 8.1 Database indexes | 3–4 modified | 15 min |
| 8.2 Meta + Favicon + PWA | 1 modified + 2 new | 15 min |
| 8.3 Dark mode audit | 1–7 modified | 30 min |
| 8.4 Animations | 1 modified + 5+ components | 40 min |
| 8.5 Verify | — | 15 min |
| **Total** | **~15 files** | **~2 hours** |
