# Act 2: Centro de Ayuda — Functional Specifications

## 2.1 Help Page (`/help`)

**File:** `src/app/(frontend)/help/page.tsx`

### Layout
- Uses parent layout with `<Sidebar />` already in place
- Main content area: centered, `max-w-5xl mx-auto`, `p-container-padding`
- Right-side detail panel (xl+ screens): Support card + Resource links

### Sections (top to bottom)
1. **Hero**: Title "How can we help you today?" + `<HelpSearch />`
2. **Category Grid**: `<HelpCategoryGrid />` with filtered results
3. **Featured Articles** (optional): "View all articles" link + list of 3 article items

## 2.2 HelpSearch (`src/components/help/HelpSearch.tsx`)

### Props
```ts
interface HelpSearchProps {
  onSearch: (query: string) => void
}
```

### Behavior
- Rounded-full search input (`rounded-full h-14 pl-14 pr-6`)
- Search icon (`search` Material Symbol) positioned absolutely on the left
- Placeholder text: "Search for articles, guides, or troubleshooting..."
- On input change, calls `onSearch(value)` with debounce (300ms)
- Focus state: ring-4 ring-primary/10, border-primary
- Wrapper scale animation on focus: `scale-[1.02]`

### States
| State | Behavior |
|-------|----------|
| Default | Ghost text, outline border, search icon |
| Focused | Scale up 1.02, blue ring, blue border |
| With text | Normal, filter applied by parent |

## 2.3 HelpCategoryGrid (`src/components/help/HelpCategoryGrid.tsx`)

### Props
```ts
interface HelpCategoryGridProps {
  categories: HelpCategory[]
}

interface HelpCategory {
  id: string
  icon: string
  title: string
  description: string
  color: 'primary' | 'secondary' | 'tertiary' | 'error' | 'emerald'
}
```

### Behavior
- 2×3 responsive grid (`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6`)
- Each card:
  - `p-8 rounded-2xl bg-surface-container-lowest border border-border-subtle-light`
  - Hover: `hover:border-primary/30 hover:shadow-xl`, card lifts (`-translate-y-1`)
  - Icon container: `w-12 h-12 rounded-xl` with color based on category
  - Title: `headline-md`
  - Description: `text-text-secondary-light body-md`
  - Click: `console.log('Navigate to category:', id)` (placeholder — "Coming soon")
- When filtered (search active), only matching categories are shown
- If no results: show "No results found" message

### Default Categories (from phase spec)
| # | Id | Title | Icon | Description | Color |
|---|-----|-------|------|-------------|-------|
| 1 | getting-started | Getting Started | `rocket_launch` | Master the basics of Task Sphere — create tasks, navigate stacks, and customize your workspace. | primary |
| 2 | tasks-lists | Tasks & Lists | `check_circle` | Organize your workflow with tasks, substeps, due dates, and custom lists. | secondary |
| 3 | focus-mode | Focus Mode | `timeline` | Use the Pomodoro timer, ambient sounds, and track your daily focus stats. | tertiary |
| 4 | settings | Settings | `settings` | Change theme, language, configure notifications, and manage integrations. | emerald |
| 5 | data-privacy | Data & Privacy | `shield` | Learn about guest sessions, data export, and how your information is protected. | error |
| 6 | integrations | Integrations | `sync` | Connect Google Calendar, Slack, and more to automate your workflow. | primary-fixed-dim |

## 2.4 Help Content Data (`src/lib/help-content.ts`)

### Structure
```ts
export const HELP_CATEGORIES: HelpCategory[] = [ /* 6 categories */ ]

export const FEATURED_ARTICLES: HelpArticle[] = [
  {
    id: 'quickstart',
    title: 'Setting up your first smart workflow',
    icon: 'description',
    category: 'getting-started',
  },
  {
    id: 'sync-guide',
    title: 'How to use multi-device sync seamlessly',
    icon: 'description',
    category: 'data-privacy',
  },
  {
    id: 'recover-tasks',
    title: 'Understanding guest sessions and data',
    icon: 'description',
    category: 'data-privacy',
  },
]
```

## 2.5 Detail Panel (contextual sidebar, xl+ screens)

### Sections
1. **Support Card** (bg-primary, text-on-primary):
   - Title: "Need more help?"
   - Description: "Our dedicated support team is available 24/7"
   - "Chat with Support" button (placeholder)
   - "Contact Email" button (placeholder)
2. **System Status**:
   - Green ping dot + "All systems operational"
3. **Resources**:
   - Community Forum
   - Video Tutorials
   - Release Notes
4. **Visual Asset**: Gradient overlay image card "Focus Sessions Guide"
