# Plan: Settings Integrations - GitHub & GitLab

## 1. Diseño UI (Mapeo de Componentes)
- **Header:** Dos círculos overlapped `-space-x-2` (GitHub dark `#24292e` + GitLab orange `#FC6D26`) + "GitHub & GitLab Integration"
- **Connection Status:** Avatar + "Connected Account" label + "@alexrivera" handle + botón "Disconnect"
- **Sync Preferences (3 toggles):** Card `divide-y` con toggles: "Import Issues as Tasks" (checked), "Sync Pull Request Reviews" (checked), "Update Status on Commit" (unchecked) — cada row `p-6 hover:bg-surface-container-low/30`
- **Repository Mapping:** Search input con icono `search` + lista de repos con icono `book` + toggle por repo + "Refresh List" button
- **Live Preview Panel:** GitHub Issue card (accent bar + GITHUB tag + #402 + title + assignees) + FocusFlow Tip (con código feat/fix-sidebar-402) + Integrations Health (98.2% + progress bar) + footer Version/API
- **Micro-interacciones:** Toggle switch bg color, search focus scale, repo hover border-primary/40

## 2. Actividades Detalladas
1. **Crear directorio:** `src/app/(frontend)/settings/integrations/github/`
2. **Crear page.tsx** con `'use client'` (estado para 3 toggles, 2 repo toggles, search)
3. **Mapeo exacto del HTML:**
   - Header con dos icon boxes circulares: GitHub `bg-[#24292e] text-white` + GitLab `bg-[#FC6D26] text-white`
   - Connection card con avatar + `font-label-sm uppercase tracking-wider` label + `font-headline-md` handle
   - Sync Prefs: `bg-surface-container-lowest border-border-subtle-light rounded-xl divide-y` + toggles `sr-only peer` + `peer-checked:bg-primary`
   - Repository Mapping: Search input con `pl-11 pr-4 py-3 bg-surface-container-lowest border-border-subtle-light rounded-xl focus:ring-2 focus:ring-primary/20` + icono `search` absoluto
   - Repo items: `p-4 bg-surface-container-lowest border-border-subtle-light rounded-xl hover:border-primary/40` + icono `book` + toggle `scale-90`
   - No Save/Cancel footer
   - Grid pattern: `lg:grid-cols-12` con `lg:col-span-7` + `lg:col-span-5`
   - Preview: Issue card con `border-primary/10` + accent bar `w-1 bg-primary` + tag GITHUB + FocusFlow Tip con `bg-primary/10 px-1 rounded text-primary` + Health con progress bar + footer version
4. **Micro-interacciones:** Search focus con `scale-[1.01]`, repo hover border-primary/40

## 3. Estructura Física
```
src/app/(frontend)/settings/integrations/github/
  page.tsx          ← Client component with toggles, repo mapping, search + GitHub issue preview panel
```
