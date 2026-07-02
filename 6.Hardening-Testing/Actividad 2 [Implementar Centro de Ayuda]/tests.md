# Act 2: Centro de Ayuda — Test Plan

## Test Strategy

- **Unit (Vitest + jsdom)**: Test HelpSearch debounce, HelpCategoryGrid filtering, help-content data integrity
- **E2E (Playwright)**: Full page render, search interaction, responsive layout
- **Manual**: Visual polish, hover animations, dark mode

---

## Unit Tests (`tests/int/help.int.spec.ts`)

### 2.1 Help Content Data

| # | Scenario | Setup | Assertion |
|---|----------|-------|-----------|
| 2.1 | HELP_CATEGORIES has 6 items | Import constant | `length === 6` |
| 2.2 | Each category has required fields | Check every item | `id`, `icon`, `title`, `description`, `color` are non-empty strings |
| 2.3 | All ids are unique | Map ids, check duplicates | `new Set(ids).size === ids.length` |
| 2.4 | All colors are valid | Check each color | `['primary', 'secondary', 'tertiary', 'emerald', 'error'].includes(color)` |
| 2.5 | FEATURED_ARTICLES has 3 items | Import constant | `length === 3` |
| 2.6 | Each article references valid category | Check `article.category` against HELP_CATEGORIES ids | every article.category exists in categories |

### 2.2 HelpSearch

| # | Scenario | Setup | Steps | Assertion |
|---|----------|-------|-------|-----------|
| 2.7 | Renders search input | Render `<HelpSearch />` | — | Input with placeholder text visible |
| 2.8 | Renders search icon | Render `<HelpSearch />` | — | Material Symbol `search` visible |
| 2.9 | Calls onSearch with debounce | `onSearch` spy, type "task" | Type "task" rapidly | `onSearch` called once with "task" after 300ms |
| 2.10 | Empty input calls onSearch("") | `onSearch` spy | Clear input | `onSearch` called with `""` |
| 2.11 | Focus adds ring class | Render component | Focus input | Input gains focus styles (ring/border) |

### 2.3 HelpCategoryGrid

| # | Scenario | Setup | Assertion |
|---|----------|-------|-----------|
| 2.12 | Renders all categories | Pass `HELP_CATEGORIES` (6 items) | 6 cards visible |
| 2.13 | Renders filtered categories | Pass 2 categories | 2 cards visible |
| 2.14 | Shows empty state | Pass `[]` | "No results found" message visible |
| 2.15 | Each card shows icon + title + description | Check first card | Icon container, title, and description text rendered |
| 2.16 | Card has hover styles | Check first card | `hover:border-primary/30 hover:shadow-xl` classes present |
| 2.17 | Icon container has correct color class | Pass category with `color: 'primary'` | Container has `bg-primary/10 text-primary` |

---

## E2E Tests (`tests/e2e/help.e2e.spec.ts`)

| # | Scenario | Steps | Assertion |
|---|----------|-------|-----------|
| E1 | Help page renders | Navigate to `/help` | Title "How can we help you today?" visible |
| E2 | All 6 categories visible | Navigate to `/help` | 6 cards with titles: Getting Started, Tasks & Lists, Focus Mode, Settings, Data & Privacy, Integrations |
| E3 | Search filters categories | Type "task" in search | "Tasks & Lists" card visible, other cards hidden |
| E4 | Search shows empty state | Type "zzzzz" | "No results found" message visible |
| E5 | Clear search restores all | Type "task", then clear | All 6 categories visible again |
| E6 | Featured articles visible | Navigate to `/help` | 3 article items rendered below category grid |
| E7 | Support card visible (xl+) | Resize to 1400px | "Need more help?" card visible on right |
| E8 | Category card click | Click "Getting Started" card | Console.log fires (no error) |
| E9 | Responsive: search input full width | Resize to 375px | Input width fits viewport, no overflow |

---

## Manual Tests

| # | Scenario | Pass Criteria |
|---|----------|---------------|
| M1 | Search input focus animation | Input scales up to 1.02, blue ring appears |
| M2 | Category cards hover | Card lifts (-translate-y-1), border changes to primary/30, shadow increases |
| M3 | Icon hover animation | Icon container scales to 110% on card hover |
| M4 | Dark mode | All cards have correct dark surface colors, text readable |
| M5 | Detail panel (xl+ screens) | Support card, system status, resources, image all visible |
| M6 | Article hover | Article background changes from white to surface-container-low |
| M7 | Search debounce performance | No lag or excessive re-renders during fast typing |

---

## Edge Cases

| # | Scenario | Expected |
|---|----------|----------|
| EC1 | Search with special characters (regex) | Categories filtered by simple `includes()` — no regex injection |
| EC2 | Extreme long search string (1000 chars) | Input handles gracefully (no maxLength set — no crash) |
| EC3 | Rapid search clearing and re-typing | Debounce prevents stale results |
| EC4 | Help page accessed without session middleware | Still renders (static content, no session dependency) |
| EC5 | Help page with no Sidebar (mobile) | Content fills full width, stacked layout |

---

## Test Environment

- Unit tests: Vitest + jsdom, no special setup needed (pure UI)
- E2E tests: Playwright Chromium, auto-start
- Manual: Chrome DevTools for animation performance
- Run: `pnpm test:int -- -g "Help"` for integration tests
- Run: `pnpm test:e2e -- -g "Help"` for E2E tests
