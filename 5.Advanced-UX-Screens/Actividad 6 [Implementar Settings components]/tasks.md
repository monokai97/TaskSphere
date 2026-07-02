# Act 6: Settings Components — Implementation Tasks

## Task 6.1: SettingsNav

**File:** `src/components/settings/SettingsNav.tsx`

- [ ] Add `'use client'` directive
- [ ] Import `usePathname` from `next/navigation`
- [ ] Import `Link` from `next/link`
- [ ] Define nav items array: `{ href: string, icon: string, label: string }[]`
- [ ] Render `<nav>` with:
  - "Configuración" header (`font-headline-md text-headline-md text-on-surface mb-6`)
  - `<ul>` with `<li>` for each item
  - Active check: `pathname === href`
  - Active styles: `bg-white shadow-sm text-primary font-semibold rounded-lg border-l-4 border-primary`
  - Inactive styles: `text-on-surface-variant hover:bg-surface-variant/40 rounded-md`
  - Each item: icon Material Symbol + label text
- [ ] Add "← Volver a tareas" link → `/`
- [ ] Add responsive: `hidden md:flex` + custom scrollbar

## Task 6.2: ThemeToggle

**File:** `src/components/settings/ThemeToggle.tsx`

- [ ] Add `'use client'` directive
- [ ] Define props interface
- [ ] Define theme options: `{ value: 'light'|'dark'|'system', icon: string, label: string }[]`
- [ ] Render label "TEMA DEL SISTEMA" (`font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider`)
- [ ] Render `grid grid-cols-3 gap-4` with 3 buttons
- [ ] Each button:
  - Icon Material Symbol (FILL variant when `theme === value`)
  - Text label
  - Active: `border-2 border-primary bg-white dark:bg-surface-dark shadow-sm`
  - Inactive: `border border-outline-variant/30 hover:border-outline-variant`
- [ ] On click: `onThemeChange(value)`
- [ ] Handle null/invalid theme: no button active

## Task 6.3: LanguageSelect

**File:** `src/components/settings/LanguageSelect.tsx`

- [ ] Add `'use client'` directive
- [ ] Define props interface
- [ ] Render section label "IDIOMA DE INTERFAZ"
- [ ] Render `<select>` with:
  - `bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3`
  - Custom `appearance-none` + Material Symbol dropdown arrow
  - Options: "English" (en), "Español" (es)
  - `value={locale ?? 'en'}`, `onChange` → `onLocaleChange(e.target.value as 'es'|'en')`
- [ ] Wrap in `relative` container for icon positioning

## Task 6.4: NotificationToggles

**File:** `src/components/settings/NotificationToggles.tsx`

- [ ] Add `'use client'` directive
- [ ] Define props interface
- [ ] Master toggle card:
  - `bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border`
  - Row layout: icon container (48px, bg-primary/10) + title+description + Switch
  - Switch: input[type=checkbox] + custom label (peer-based tailwind classes)
  - `checked={enabled ?? true}` + `onChange` → `onToggle(e.target.checked)`
- [ ] Sub-trigger section:
  - Header: "ACTIVADORES DE NOTIFICACIÓN"
- [ ] 4 trigger items in a bordered list (`divide-y divide-outline-variant/20`):
  - Each: icon (24px Material Symbol) + title + description + Switch
  - Switches are visual-only (not individually persisted — controlled by master)
  - When `enabled === false`, sub-items get `opacity-50` pointer-events-none
- [ ] Custom switch CSS: peer-checked:bg-primary, after:translate animation
- [ ] Sound selector section (placeholder: dropdown, visual only)
- [ ] Alert style section (placeholder: 2 visual cards, visual only)

## Task 6.5: IntegrationCard

**File:** `src/components/settings/IntegrationCard.tsx`

- [ ] Add `'use client'` directive
- [ ] Define props interface
- [ ] Card container:
  - `rounded-xl border border-border-subtle-light hover:border-primary-container/30 hover:shadow-xl transition-all duration-300 p-6`
  - `hover:-translate-y-1` lift effect
- [ ] Top row: icon container + status badge (if connected)
  - Icon: `w-12 h-12 rounded-lg` with img inside
  - Status: green dot + "Conectado" in `bg-green-50 text-green-600 rounded-full px-3 py-1`
- [ ] Content: name (`headline-md`) + description (`text-text-secondary-light mb-6`)
- [ ] Action button:
  - Connected: `w-full py-2.5 rounded-lg border border-border-subtle-light text-on-surface-variant hover:bg-surface-variant`
  - Disconnected: `w-full py-2.5 rounded-lg bg-primary text-white shadow-md hover:bg-primary/90`
- [ ] Dashed variant (suggestion card): `border-dashed` + centered content + "Submit a request" link
- [ ] On action click: `onAction(id, connected ? 'manage' : 'connect')`

## Task 6.6: Component barrel export

**File:** Create or update `src/components/settings/index.ts`

- [ ] Re-export all 5 components: `export { SettingsNav } from './SettingsNav'` etc.

## Task 6.7: Lint & Build

- [ ] Run `pnpm lint` — 0 errors
- [ ] Run `pnpm build` — 0 errors
- [ ] Verify all components render without crashing (manual in browser)

## Estimated Effort

| Task | Files | Est. Time |
|------|-------|-----------|
| 6.1 SettingsNav | 1 new | 30 min |
| 6.2 ThemeToggle | 1 new | 20 min |
| 6.3 LanguageSelect | 1 new | 15 min |
| 6.4 NotificationToggles | 1 new | 40 min |
| 6.5 IntegrationCard | 1 new | 30 min |
| 6.6 Barrel export | 1 new | 5 min |
| 6.7 Lint & Build | — | 10 min |
| **Total** | **6 files** | **~2.5 hours** |
