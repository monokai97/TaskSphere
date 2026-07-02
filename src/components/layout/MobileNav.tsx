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
    <nav className="fixed bottom-0 left-0 w-full h-16 z-50 lg:hidden bg-surface/80 backdrop-blur-md border-t border-border-subtle-light">
      <div className="flex items-center justify-around h-full px-4 pb-[env(safe-area-inset-bottom)]">
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
