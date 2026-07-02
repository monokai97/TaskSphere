'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLists } from '@/hooks/useLists'

export function ListNav() {
  const pathname = usePathname()
  const { data, isLoading, error } = useLists()

  if (error) return null

  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-label-sm text-on-surface-variant px-3 py-2 uppercase tracking-wider">
        Lists
      </span>

      {isLoading ? (
        <>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 rounded-xl bg-surface-container-high animate-pulse mx-3"
            />
          ))}
        </>
      ) : data?.docs?.length === 0 ? (
        <p className="font-body-md text-on-surface-variant px-3 py-2">No lists yet</p>
      ) : (
        data?.docs?.map((list) => {
          const href = `/lists/${list.id}`
          const isActive = pathname === href
          return (
            <Link
              key={list.id}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                isActive
                  ? 'bg-primary-container/10 text-primary border-l-4 border-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-variant/50 border-l-4 border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{list.icon || 'list'}</span>
              <span className="font-body-md truncate flex-1">{list.name}</span>
            </Link>
          )
        })
      )}
    </div>
  )
}
