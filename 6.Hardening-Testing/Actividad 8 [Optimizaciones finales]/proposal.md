# Act 8: Optimizaciones finales — Proposal

## Problem Statement

The app is functionally complete but lacks production polish in four areas:

| Area | Current State | Impact |
|------|--------------|--------|
| Database indexes | `guestId` indexed on 3/4 collections, no composite index | Slow list queries (full scan on `[guestId, list]` filter) |
| Meta / PWA | Basic `<title>`, no favicon, no manifest | Poor share preview, no PWA install |
| Dark mode | Tailwind `class` mode + `.dark` CSS in styles.css | Some components may not have dark variants |
| Animations | Only `slide-in` keyframe defined | Missing fade-in, scale-on-hover, smooth transitions from HTML prototypes |

## Proposed Solution

### 8.1 Database indexes
- Add `index: true` to TaskLogs.guestId
- Add sort indexes on `Tasks.sortOrder` and `Lists.sortOrder`
- Add composite index on `Tasks.[guestId, list]` for the most frequent query pattern

### 8.2 Meta tags + favicon
- Add `<meta charset>`, `<meta viewport>`, `<meta theme-color>` to root layout
- Create SVG favicon (Task Sphere logo)
- Create basic `manifest.json` for PWA
- Add Open Graph meta tags for social preview

### 8.3 Dark mode audit
- Verify all `.dark` CSS variants exist for glass-panel, scrollbar, sidebar, detail-panel
- Add `dark:` Tailwind classes to any component missing them
- Ensure body background changes in dark mode

### 8.4 Animations from prototypes
- Add `fade-in`, `scale-in`, `slide-up` keyframes to tailwind config
- Apply `fade-in` to modals (AddListModal)
- Apply `slide-up` to TaskItem on mount
- Apply `scale-on-hover` to buttons and cards
- Ensure 0.2s ease transitions on interactive elements
