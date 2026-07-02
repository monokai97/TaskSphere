# Design: Implementar MobileNav

## Visual Mapping

| Elemento Stitch | Componente React | Token/Clase |
|---|---|---|
| Bottom nav (4 tabs) | `<MobileNav />` | `fixed bottom-0 w-full h-16 lg:hidden` |
| My Day tab (icono sunny) | `<Link href="/my-day">` | icono `sunny`, label "My Day" |
| Important tab (icono star) | `<Link href="/important">` | icono `star`, label "Important" |
| Planned tab (calendar) | `<Link href="/planned">` | icono `calendar_month`, label "Planned" |
| Tasks tab (task_alt) | `<Link href="/tasks">` | icono `task_alt`, label "Tasks" |
| Tab activo | `pathname === href` | `text-primary` (icono + label) |
| Tab inactivo | `pathname !== href` | `text-on-surface-variant` |

## Diagrama Mobile

```text
┌──────────────────────────────────────────────────┐
│                                                    │
│                   WORKSPACE                        │
│                                                    │
│                                                    │
│                                                    │
├──────────────────────────────────────────────────┤
│   🧭 MobileNav (fixed bottom-0, z-50)             │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐        │
│  │ sunny│  │ star │  │ cal… │  │ task │        │
│  │My Day│  │Import│  │Planned│  │ Tasks│        │
│  └──────┘  └──────┘  └──────┘  └──────┘        │
└──────────────────────────────────────────────────┘
```

## Integración en Layout

El MobileNav se renderiza dentro del layout raíz, después del flex container de 3 columnas:

```tsx
<div className="flex min-h-screen">
  <Sidebar />
  <main>...</main>
  <DetailPanel />
</div>
<MobileNav />  {/* Fuera del flex, fixed bottom */}
```

## Código Esperado

```tsx
// src/components/layout/MobileNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/my-day', label: 'My Day', icon: 'sunny' },
  { href: '/important', label: 'Important', icon: 'star' },
  { href: '/planned', label: 'Planned', icon: 'calendar_month' },
  { href: '/tasks', label: 'Tasks', icon: 'task_alt' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 w-full h-16 z-50 lg:hidden bg-surface/80 backdrop-blur-md border-t border-subtle-light dark:border-subtle-dark">
      <div className="flex items-center justify-around h-full px-4 pb-safe">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 flex-1 py-1"
            >
              <span
                className={`material-symbols-outlined text-xl ${
                  isActive ? 'text-primary' : 'text-on-surface-variant'
                }`}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span
                className={`font-label-sm text-[10px] ${
                  isActive ? 'text-primary font-semibold' : 'text-on-surface-variant'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```
