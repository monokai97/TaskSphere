# Act 2: Centro de Ayuda — Design

## Visual Mapping: HTML → Implementation

Since Act 2 has **zero PayloadCMS dependency**, there is no collection/block mapping. All elements are static JSX + CSS:

| HTML Element | Implementation | Notes |
|-------------|----------------|-------|
| Hero title "How can we help you today?" | Static JSX in `page.tsx` | font-display-xl |
| Search input (rounded-full, icon prefix) | `<HelpSearch />` component | Client-side debounced filter |
| Category cards (2×2 in HTML, 2×3 per spec) | `<HelpCategoryGrid />` component | Data from `src/lib/help-content.ts` |
| Icon containers with color | CSS class based on `color` prop | Each category has a distinct accent color |
| Featured articles list | Static JSX in `page.tsx` | Data from `src/lib/help-content.ts` |
| Support card (bg-primary) | Static JSX in aside | "Chat with Support" + "Contact Email" buttons (placeholder) |
| System status (green ping dot) | Static JSX | `animate-ping` + emerald dot |
| Resource links | Static `<a>` tags | Community Forum, Video Tutorials, Release Notes |
| Visual asset image | Static `<img>` with gradient overlay | Decorative only |

## Component Tree

```
HelpPage (/help)
  ├── Hero Section
  │     ├── Title: "How can we help you today?"
  │     └── HelpSearch
  │           ├── search icon (absolute)
  │           └── input (rounded-full)
  │
  ├── HelpCategoryGrid
  │     └── HelpCategoryCard[6]
  │           ├── icon container (w-12 h-12 rounded-xl, colored bg)
  │           ├── title (headline-md)
  │           └── description (body-md, text-secondary)
  │
  ├── FeaturedArticles section
  │     ├── Header "Featured Articles" + "View all" link
  │     └── ArticleItem[3]
  │           ├── description icon
  │           ├── title
  │           └── chevron_right icon
  │
  └── DetailPanel (aside, xl+ screens)
        ├── SupportCard (bg-primary)
        │     ├── Title + description
        │     ├── Chat button
        │     └── Email button
        ├── SystemStatus (ping dot + text)
        ├── ResourceLinks
        └── VisualImage (gradient overlay)
```

## Data Flow

```
User types in HelpSearch
  │
  ├─ debounce 300ms
  │
  └─ onSearch(query) → parent state `searchQuery`
        │
        └─ filter HELP_CATEGORIES
              │
              ├─ categories.filter(cat =>
              │     cat.title.toLowerCase().includes(query) ||
              │     cat.description.toLowerCase().includes(query)
              │   )
              │
              └─ pass filtered[] to HelpCategoryGrid
                    │
                    ├─ if filtered.length === 0 → "No results found"
                    └─ else → render cards
```

## No PayloadCMS Collections Schema

This activity does not introduce or modify any PayloadCMS collection. The entire feature is:

| Component | File Type | Data Source |
|-----------|-----------|-------------|
| `src/app/(frontend)/help/page.tsx` | Next.js page (can be server component) | Static data from `help-content.ts` |
| `src/lib/help-content.ts` | TypeScript data | Hardcoded constants |
| `src/components/help/HelpSearch.tsx` | Client component | Local state |
| `src/components/help/HelpCategoryGrid.tsx` | Client component (for interactivity) | Props from parent |

## State Handling

| Component | Loading | Empty | Edge |
|-----------|---------|-------|------|
| HelpSearch | N/A (instant render) | N/A | Debounce prevents excessive re-renders |
| HelpCategoryGrid | N/A (instant render) | "No results found" text + search icon | All categories filtered out |
| FeaturedArticles | N/A | Hidden if no articles (always has 3) | Links are placeholder (`#`) |
| DetailPanel | N/A | Always visible on xl+ | Buttons are placeholder (`console.log`) |

## Responsive Behavior

| Breakpoint | Layout |
|-----------|--------|
| ≥1280px (xl) | Hero + CategoryGrid + FeaturedArticles + DetailPanel |
| ≥768px (md) | Category grid goes 2 columns, no DetailPanel |
| <768px (sm) | Category grid goes 1 column, reduced padding |
