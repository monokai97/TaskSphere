'use client'

import { useEffect } from 'react'
import { SettingsSidebar } from '@/components/settings/SettingsSidebar'
import { ResumeEmail } from '@/components/settings/ResumeEmail'

interface NotificationsSettingsModalProps {
  open: boolean
  onClose: () => void
}

export function NotificationsSettingsModal({
  open,
  onClose,
}: NotificationsSettingsModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="fixed inset-0 bg-on-background/20"
        style={{
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      <div className="relative ml-0 lg:ml-sidebar-width flex w-full h-full bg-background animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="hidden lg:flex">
          <SettingsSidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <ResumeEmail />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-variant/50 transition-colors text-on-surface-variant hidden lg:flex"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  )
}
