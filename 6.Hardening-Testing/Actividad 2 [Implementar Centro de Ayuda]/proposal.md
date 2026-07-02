# Act 2: Centro de Ayuda — Proposal

## Problem Statement

The sidebar already links to `/help` but the route returns 404. Users have no in-app resource to learn how to use the application. There is no help content, search functionality, or documentation available without leaving the app.

## Proposed Solution

Create a static Help Center page with:

| Layer | Files | Purpose |
|-------|-------|---------|
| **Page** | `src/app/(frontend)/help/page.tsx` | Help layout with hero + grid + detail sidebar |
| **Data** | `src/lib/help-content.ts` | Hardcoded help categories and articles |
| **Component** | `src/components/help/HelpSearch.tsx` | Hero search input with live frontend filtering |
| **Component** | `src/components/help/HelpCategoryGrid.tsx` | 2×3 grid of category cards |

## No PayloadCMS Dependencies

This activity has **zero PayloadCMS impact**. All content is static, hardcoded in `src/lib/help-content.ts`. No collections, hooks, API routes, or access control changes are needed. The search is pure client-side (array filter).

## UI Reference

The HTML prototype at `ui-resources/16.Centro de ayuda/16.Centro de ayuda.html` shows a 3-column layout with:
- Hero section with search input (rounded-full, icon prefix)
- 4 category cards in 2×2 grid (expanded to 6 categories per phase spec)
- Featured articles list
- Detail panel with support card + system status + resource links

## Dependencies

- **Existing**: Sidebar already has `/help` link (no changes needed)
- **Existing**: DetailPanel component (can be reused for the right contextual sidebar)
- **None on other Phase 6 activities**

## Non-Goals

- No CMS-managed content — all hardcoded for MVP
- No article detail pages — clicking a card or article shows a toast "Coming soon" for MVP
- No analytics tracking on help page
- No internationalization of help content (static ES/EN would be post-MVP)
