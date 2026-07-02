'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AddTaskModal } from '@/components/tasks/AddTaskModal'
import { NotificationsSettingsModal } from './NotificationsSettingsModal'

interface TopBarProps {
  title?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate'
  focus?: boolean
}

export function TopBar({ title }: TopBarProps) {
  const router = useRouter()
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background/50 backdrop-blur-sm flex justify-between items-center px-4 md:px-12 py-4">
        <div className="flex items-center gap-4 flex-1">
          <button className="md:hidden p-2 text-on-surface-variant">
            <span className="material-symbols-outlined">menu</span>
          </button>
          {title && (
            <h1 className="font-heading-md text-on-surface hidden md:block">{title}</h1>
          )}
          <div className="relative w-full max-w-md hidden md:block">
            <input
              className="w-full bg-surface-container-low border border-border-subtle-light rounded-full py-2 pl-4 pr-4 focus:ring-2 focus:ring-primary/20 outline-none text-body-md placeholder:text-on-surface-variant/50"
              placeholder="Search tasks..."
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const q = searchValue.trim()
                  if (q) {
                    router.push(`/search?q=${encodeURIComponent(q)}`)
                  }
                }
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAddTaskOpen(true)}
            className="hidden md:flex items-center px-4 py-2 bg-primary text-white rounded-full font-label-sm text-label-sm shadow-sm hover:bg-primary/90 transition-colors"
          >
            Add Task
          </button>
        <button
          onClick={() => setNotificationsOpen(true)}
          className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors relative"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
        </button>
        <button
          onClick={() => router.push('/settings/notifications')}
          className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/20 ml-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="User avatar"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeSTdSTDaYJRHlH3nRMbGKcHaThKdZ-hPoKKSuIosfaBsHWv6GRduehcLRlVh3kAyTQdhQyOZhqaKlR1K01Oh1iZDAUiuqMws94FWDUhuRrH-L0cJuqgKfU2bc34naWY9k8sODOPDBZfY_D_3p32CBR16OVRndWYpSg79KQWQykUJkA608v0VX2akwl0y1qTrGI6hNHYT6ChYw4HqR2Z7vVOMwHWRTc2VJVN5AzSeFJjYyF_W8Q9PMcazbBf62Tb7PVT-iSB5rvjCy"
          />
        </div>
      </div>
    </header>
      <AddTaskModal key="add-task-modal" open={addTaskOpen} onClose={() => setAddTaskOpen(false)} />
      <NotificationsSettingsModal
        key="notifications-settings-modal"
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </>
  )
}
