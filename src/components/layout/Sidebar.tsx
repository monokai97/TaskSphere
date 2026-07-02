'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ListNav } from '@/components/lists/ListNav'
import { AddListModal } from '@/components/lists/AddListModal'

const NAV_ITEMS = [
  { href: '/my-day', label: 'My Day', icon: 'sunny' },
  { href: '/important', label: 'Important', icon: 'star' },
  { href: '/planned', label: 'Planned', icon: 'calendar_month' },
  { href: '/tasks', label: 'Tasks', icon: 'task_alt' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [addListOpen, setAddListOpen] = useState(false)

  return (
    <aside className="fixed left-0 top-0 h-full w-sidebar-width bg-white/80 border-r border-border-subtle-light glass-sidebar z-50 flex flex-col py-8">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>blur_on</span>
          </div>
          <div>
            <h1 className="font-display-xl text-headline-md font-bold text-primary">Ethereal Focus</h1>
            <p className="font-body-md text-label-sm text-on-surface-variant">Stay productive</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                isActive
                  ? 'bg-primary-container/10 text-primary font-semibold border-l-4 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-variant/50'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="font-body-md">{item.label}</span>
            </Link>
          )
        })}

        <div className="pt-8 px-0">
          <ListNav />
        </div>

        <div className="pt-4 px-0">
          <button
            onClick={() => setAddListOpen(true)}
            className="w-full py-2.5 px-4 bg-primary text-white rounded-xl font-body-md font-semibold flex items-center justify-center gap-2 hover:bg-surface-tint transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">add</span>
            New List
          </button>
        </div>
      </nav>

      <div className="px-4 mt-auto">
        <Link
          href="/settings/notifications"
          className={`flex items-center gap-3 px-4 py-3 transition-all rounded-lg ${
            pathname.startsWith('/settings')
              ? 'bg-primary-container/10 text-primary font-semibold border-l-4 border-primary'
              : 'text-on-surface-variant hover:bg-surface-variant/50'
          }`}
          style={
            pathname.startsWith('/settings')
              ? undefined
              : { borderLeft: '4px solid transparent' }
          }
        >
          <span
            className="material-symbols-outlined"
            style={
              pathname.startsWith('/settings')
                ? { fontVariationSettings: "'FILL' 1" }
                : undefined
            }
          >
            settings
          </span>
          <span className="font-body-md">Settings</span>
        </Link>
        <Link
          href="/help"
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-variant/50 transition-all rounded-lg"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="font-body-md">Help</span>
        </Link>
        <div className="mt-6 flex items-center gap-3 px-4 py-4 border-t border-border-subtle-light">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant">person</span>
          </div>
          <div>
            <p className="font-body-md font-semibold text-on-surface">Guest</p>
            <p className="font-label-sm text-text-secondary-light">Pro Plan</p>
          </div>
        </div>
      </div>
      <AddListModal key="add-list-modal" open={addListOpen} onClose={() => setAddListOpen(false)} />
    </aside>
  )
}
