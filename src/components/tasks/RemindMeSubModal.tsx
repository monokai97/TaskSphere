'use client'

import { useEffect, useState } from 'react'
import { DateTimePickerSubModal } from './DateTimePickerSubModal'

const REMINDER_OPTIONS = [
  {
    label: 'Later Today',
    description: '4:00 PM',
    icon: 'schedule' as const,
    minutes: 30,
  },
  {
    label: 'Tomorrow',
    description: '9:00 AM',
    icon: 'wb_twilight' as const,
    minutes: 1440,
  },
  {
    label: 'Next Week',
    description: 'Mon, 9:00 AM',
    icon: 'next_week' as const,
    minutes: 10080,
  },
] as const

interface RemindMeSubModalProps {
  open: boolean
  onClose: () => void
  onSelect: (minutes: number) => void
}

export function RemindMeSubModal({
  open,
  onClose,
  onSelect,
}: RemindMeSubModalProps) {
  const [dateTimePickerOpen, setDateTimePickerOpen] = useState(false)

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
      className="fixed inset-0 z-[65] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="fixed inset-0 bg-on-surface/20"
        style={{
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />
      <div className="relative w-80 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-4 py-3 border-b border-surface-container-highest flex items-center justify-between">
          <h4 className="font-headline-md text-body-md font-bold text-on-surface">
            Remind Me
          </h4>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined !text-[20px]">
              close
            </span>
          </button>
        </div>

        <div className="p-2">
          {REMINDER_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                onSelect(opt.minutes)
                onClose()
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-surface-container-low transition-colors group"
            >
              <div className="flex flex-col items-start">
                <span className="text-task-item font-medium text-on-surface">
                  {opt.label}
                </span>
                <span className="text-label-sm text-on-surface-variant/60">
                  {opt.description}
                </span>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">
                {opt.icon}
              </span>
            </button>
          ))}
        </div>

        <div className="p-2 border-t border-surface-container-highest">
          <button
            onClick={() => setDateTimePickerOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary hover:bg-primary/5 transition-colors font-label-sm"
          >
            <span className="material-symbols-outlined !text-[20px]">
              calendar_month
            </span>
            Pick a Date & Time
          </button>
        </div>
      </div>

      <DateTimePickerSubModal
        open={dateTimePickerOpen}
        onClose={() => setDateTimePickerOpen(false)}
        onSelect={(minutes) => {
          onSelect(minutes)
          setDateTimePickerOpen(false)
        }}
      />
    </div>
  )
}
