# Act 2: Centro de Ayuda — Implementation Tasks

## Task 2.1: Help content data file

**File:** `src/lib/help-content.ts`

- [ ] Create file with `HELP_CATEGORIES` array (6 items):
  ```ts
  export interface HelpCategory {
    id: string
    icon: string
    title: string
    description: string
    color: 'primary' | 'secondary' | 'tertiary' | 'emerald' | 'error'
  }
  ```
- [ ] Add 6 categories from the spec table: getting-started, tasks-lists, focus-mode, settings, data-privacy, integrations
- [ ] Create `FEATURED_ARTICLES` array (3 items):
  ```ts
  export interface HelpArticle {
    id: string
    title: string
    icon: string
    category: string
  }
  ```
- [ ] Export both arrays

## Task 2.2: HelpSearch component

**File:** `src/components/help/HelpSearch.tsx`

- [ ] Add `'use client'` directive
- [ ] Define props: `onSearch: (query: string) => void`
- [ ] State: `inputValue: string`
- [ ] Ref: `debounceRef` for 300ms debounce
- [ ] Input: `rounded-full h-14 pl-14 pr-6` with `bg-surface-container-lowest border border-outline-variant`
- [ ] Search icon: absolute left-5, Material Symbol `search`, color `text-outline` → `group-focus-within:text-primary`
- [ ] Wrapper: `relative w-full max-w-2xl group` with `scale-[1.02]` animation on focus via CSS
- [ ] onChange handler: update inputValue, clear existing debounce, set new timeout calling `onSearch(value)`
- [ ] Placeholder text: "Search for articles, guides, or troubleshooting..."

## Task 2.3: HelpCategoryGrid component

**File:** `src/components/help/HelpCategoryGrid.tsx`

- [ ] Add `'use client'` directive
- [ ] Define props interface:
  ```ts
  interface HelpCategoryGridProps {
    categories: HelpCategory[]
  }
  ```
- [ ] Import `HelpCategory` from `@/lib/help-content`
- [ ] Define color map for icon backgrounds:
  ```ts
  const COLOR_MAP = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary-container/20 text-secondary',
    tertiary: 'bg-tertiary-fixed/40 text-tertiary',
    emerald: 'bg-emerald-50 text-emerald-600',
    error: 'bg-error-container/40 text-error',
  }
  ```
- [ ] Grid: `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6`
- [ ] Each card:
  - Container: `p-8 rounded-2xl bg-surface-container-lowest border border-border-subtle-light hover:border-primary/30 hover:shadow-xl transition-all duration-500 cursor-pointer group`
  - Hover lift: `hover:-translate-y-1` via class or CSS
  - Icon container: `w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110` with color from map
  - Title: `font-headline-md text-headline-md mb-2`
  - Description: `text-text-secondary-light font-body-md text-body-md`
- [ ] Click handler: `console.log('Help category:', category.id)` + toast placeholder
- [ ] Empty state: if `categories.length === 0`, show a centered "No results found" message with search icon

## Task 2.4: Help page

**File:** `src/app/(frontend)/help/page.tsx`

- [ ] Import `HELP_CATEGORIES`, `FEATURED_ARTICLES` from `@/lib/help-content`
- [ ] Import `HelpSearch` from `@/components/help/HelpSearch`
- [ ] Import `HelpCategoryGrid` from `@/components/help/HelpCategoryGrid`
- [ ] Import `DetailPanel` from `@/components/layout/DetailPanel`
- [ ] State: `searchQuery: string` (default '')
- [ ] Derived: `filteredCategories = searchQuery ? HELP_CATEGORIES.filter(...) : HELP_CATEGORIES`
- [ ] Render:
  - Hero section with title + HelpSearch
  - HelpCategoryGrid with filtered categories
  - FeaturedArticles section (if no search active)
  - DetailPanel with contextual help content (xl+ screens)
- [ ] DetailPanel content:
  - Support card (bg-primary, title "Need more help?", 2 buttons)
  - System status section
  - Resource links
  - Decorative image

## Task 2.5: Page navigation polish

**Files:** `src/app/(frontend)/help/page.tsx` + `src/components/layout/Sidebar.tsx`

- [ ] Verify Sidebar Help link has active state when `pathname === '/help'` (already uses `usePathname()` pattern — just verify it works)
- [ ] Verify responsive: help page stacks correctly on mobile
- [ ] Verify dark mode: all cards use `bg-surface-container-lowest` which respects dark

## Task 2.6: Featured Articles section (optional enhancement)

**File:** `src/app/(frontend)/help/page.tsx`

- [ ] Add section below category grid with `mt-20`
- [ ] Section header: "Featured Articles" + "View all articles →" link (placeholder)
- [ ] Render articles from `FEATURED_ARTICLES` array
- [ ] Each article: `p-5 rounded-xl bg-surface-container-lowest border border-border-subtle-light hover:bg-surface-container-low cursor-pointer flex items-center justify-between group`
- [ ] Article layout: description icon + title on left, chevron_right on right
- [ ] Hidden when search query is active

## Task 2.7: Lint & Build

- [ ] Run `pnpm lint` — 0 errors
- [ ] Run `pnpm build` — 0 errors
- [ ] Navigate to `/help`, verify all sections render
- [ ] Test search filter: type "task" → only "Tasks & Lists" and "Getting Started" shown
- [ ] Test empty search: type "zzzzz" → "No results found" message
- [ ] Test responsive: resize to mobile → single column, no DetailPanel

## Estimated Effort

| Task | Files | Est. Time |
|------|-------|-----------|
| 2.1 Help content data | 1 new | 15 min |
| 2.2 HelpSearch | 1 new | 20 min |
| 2.3 HelpCategoryGrid | 1 new | 25 min |
| 2.4 Help page | 1 new | 30 min |
| 2.5 Navigation polish | 0 (verify only) | 5 min |
| 2.6 Featured Articles | same as 2.4 | 10 min |
| 2.7 Lint & Build | — | 10 min |
| **Total** | **3 new files** | **~1.5 hours** |
