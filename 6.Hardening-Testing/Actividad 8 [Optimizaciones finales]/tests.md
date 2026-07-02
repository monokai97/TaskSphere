# Act 8: Optimizaciones finales — Test Plan

## Test Strategy

- **Manual visual verification**: Animations, dark mode, favicon
- **Browser DevTools**: Performance, accessibility, meta tags
- **Lighthouse**: PWA, SEO, performance scores

---

## 8.1 Database Indexes

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| I1 | Index exists on TaskLogs.guestId | Run `PRAGMA index_list(task-logs)` in SQLite CLI | Index on `guestId` present |
| I2 | Index exists on Tasks.sortOrder | `PRAGMA index_list(tasks)` | Index on `sortOrder` present |
| I3 | Index exists on Lists.sortOrder | `PRAGMA index_list(lists)` | Index on `sortOrder` present |
| I4 | Collection schema loads without errors | `pnpm dev` or `pnpm build` | No schema errors |

## 8.2 Meta Tags & Favicon

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| M1 | Favicon loads | Open app in browser, check network tab for `/favicon.svg` | Status 200, SVG content-type |
| M2 | Title renders | Check browser tab / document.title | "Task Sphere" |
| M3 | Description meta tag | View page source for `<meta name="description">` | Content matches expected |
| M4 | Viewport meta tag | View page source for `<meta name="viewport">` | `width=device-width, initial-scale=1` |
| M5 | Theme-color meta tag | View page source for `<meta name="theme-color">` | `#004ac6` |
| M6 | Open Graph tags present | View page source for `<meta property="og:title">` etc. | All OG tags render |
| M7 | Manifest served | Fetch `/manifest.json` | Status 200, valid JSON |

## 8.3 Dark Mode

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| D1 | Toggle to dark mode | Click theme toggle → "Dark" | `html` element has `class="dark"`, body background is dark |
| D2 | GlassPanel adapts | View glass-panel element in dark mode | Background rgba(24,24,27,0.8) |
| D3 | Sidebar adapts | View sidebar in dark mode | Background is dark |
| D4 | DetailPanel adapts | Open detail panel in dark mode | Background is dark |
| D5 | Input fields adapt | View input fields in dark mode | Dark background, light text |
| D6 | Custom scrollbar adapts | View scrollbar in dark mode | Thumb color matches dark theme |
| D7 | Toggle back to light mode | Click "Light" | `html` class removed, body is light |
| D8 | System preference respected | Set OS to dark, click "System" | `html` class auto-syncs |

## 8.4 Animations

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| A1 | AddListModal animates | Click "Add list" | Modal content scales in (scale-in), overlay fades in (fade-in) |
| A2 | DetailPanel slides in | Click a task | Panel slides from right (slide-in) |
| A3 | TaskItem slides up | Load task list | Items appear with staggered slide-up animation |
| A4 | Button hover effect | Hover primary button | Scale to 1.02 over 200ms |
| A5 | Card hover effect | Hover IntegrationCard | Slight lift + shadow (translate-y -0.5, shadow-lg) |
| A6 | EmptyState fades in | View empty list | Content fades in (fade-in) |
| A7 | Animations at 60fps | Record performance in Chrome DevTools | No jank, smooth 60fps |
| A8 | Reduced motion respected | Set OS to "Reduce motion" | Animations disabled or simplified |

## 8.5 Lighthouse Scores (Optional)

| # | Metric | Target |
|---|--------|--------|
| L1 | Performance | ≥ 90 |
| L2 | Accessibility | ≥ 95 |
| L3 | Best Practices | ≥ 90 |
| L4 | SEO | ≥ 90 |
| L5 | PWA | Basic installability met |

---

## Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome 125+ | Full support |
| Firefox 130+ | Full support |
| Edge 125+ | Full support |
| Safari 18+ | Most features (check backdrop-filter compatibility) |
