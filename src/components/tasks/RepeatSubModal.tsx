'use client'

import { useEffect, useState } from 'react'
import { CustomRepeatSubModal } from './CustomRepeatSubModal'

const REPEAT_OPTIONS = [
  { label: 'Daily', value: 'daily', icon: 'calendar_today' },
  { label: 'Weekdays', value: 'weekdays', icon: 'work' },
  { label: 'Weekly', value: 'weekly', icon: 'event_repeat' },
  { label: 'Monthly', value: 'monthly', icon: 'calendar_month' },
  { label: 'Yearly', value: 'yearly', icon: 'history' },
] as const

interface RepeatSelection {
  type: string
  interval?: number
}

interface RepeatSubModalProps {
  open: boolean
  onClose: () => void
  onSelect: (selection: RepeatSelection) => void
}

export function RepeatSubModal({ open, onClose, onSelect }: RepeatSubModalProps) {
  const [showCustom, setShowCustom] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        if (showCustom) {
          setShowCustom(false)
        } else {
          onClose()
        }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose, showCustom])

  useEffect(() => {
    if (!open) setShowCustom(false)
  }, [open])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div
          className="fixed inset-0 bg-on-background/10"
          style={{
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        />
        <div
          className="relative w-full max-w-[320px] rounded-xl shadow-2xl border border-white/50 overflow-hidden animate-in fade-in zoom-in duration-200"
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-on-surface-variant/10">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Repeat
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-on-surface-variant/10 transition-colors text-on-surface-variant flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>
          </div>

          <div className="py-2 px-1">
            {REPEAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSelect({ type: opt.value })}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-primary-container/5 hover:text-primary transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-full bg-surface-variant/50 flex items-center justify-center group-hover:bg-primary/10">
                  <span className="material-symbols-outlined text-[18px]">
                    {opt.icon}
                  </span>
                </div>
                <span className="font-medium">{opt.label}</span>
              </button>
            ))}

            <div className="mx-4 my-2 h-px bg-on-surface-variant/10" />

            <button
              onClick={() => setShowCustom(true)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-primary hover:bg-primary/5 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    settings_suggest
                  </span>
                </div>
                <span className="font-semibold">Custom...</span>
              </div>
              <span className="material-symbols-outlined text-[18px] text-primary/40 group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </button>
          </div>

          <div className="px-5 py-3 bg-surface-container-low/50 flex items-center justify-center">
            <p className="text-label-sm font-label-sm text-on-surface-variant/60 uppercase tracking-widest">
              Recurrence Patterns
            </p>
          </div>
        </div>
      </div>

      <CustomRepeatSubModal
        open={showCustom}
        onClose={() => setShowCustom(false)}
        onSave={(config) => {
          onSelect({ type: config.repeatType, interval: config.repeatInterval })
          setShowCustom(false)
          onClose()
        }}
      />
    </>
  )
}
