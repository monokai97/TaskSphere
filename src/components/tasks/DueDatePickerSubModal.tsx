'use client'

import { useState, useEffect, useMemo } from 'react'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

interface DueDatePickerSubModalProps {
  open: boolean
  onClose: () => void
  onSelect: (dateIso: string) => void
}

export function DueDatePickerSubModal({
  open,
  onClose,
  onSelect,
}: DueDatePickerSubModalProps) {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())
  const [hour, setHour] = useState('09')
  const [minute, setMinute] = useState('30')
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const daysInMonth = useMemo(
    () => new Date(year, month + 1, 0).getDate(),
    [year, month],
  )

  const firstDayOfWeek = useMemo(
    () => new Date(year, month, 1).getDay(),
    [year, month],
  )

  const monthName = useMemo(
    () =>
      new Date(year, month).toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    [year, month],
  )

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  const handleSave = () => {
    let hours = parseInt(hour, 10)
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
    const mins = parseInt(minute, 10) || 0

    const selectedDate = new Date(year, month, selectedDay, hours, mins)
    onSelect(selectedDate.toISOString())
    onClose()
  }

  if (!open) return null

  const today = new Date()

  const days = []
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} />)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isSelected = d === selectedDay
    const isPast =
      new Date(year, month, d) <
      new Date(today.getFullYear(), today.getMonth(), today.getDate())
    days.push(
      <button
        key={d}
        disabled={isPast}
        onClick={() => setSelectedDay(d)}
        className={`py-2 rounded-lg transition-colors font-body-md text-body-md ${
          isSelected
            ? 'bg-primary text-white shadow-lg shadow-primary/20'
            : isPast
              ? 'text-on-surface-variant/30 cursor-not-allowed'
              : 'text-on-surface hover:bg-surface-container-low'
        }`}
      >
        {d}
      </button>,
    )
  }

  return (
    <div
      key={String(open)}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
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
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-xl shadow-2xl border border-surface-container-highest overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-highest">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Pick a Date & Time
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              close
            </span>
          </button>
        </div>

        <div className="p-6 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="font-body-lg text-body-lg font-semibold text-on-surface">
                {monthName}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
                >
                  <span className="material-symbols-outlined">
                    chevron_left
                  </span>
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
                >
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 text-center">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="font-label-sm text-label-sm text-on-surface-variant/60 py-2"
                >
                  {d}
                </div>
              ))}
              {days}
            </div>
          </section>

          <section className="border-t border-surface-container-highest pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-surface-container p-1 rounded-xl">
                <div className="flex items-center gap-1 px-3 py-2 bg-surface-container-lowest rounded-lg shadow-sm border border-surface-container-highest">
                  <input
                    className="w-10 text-center bg-transparent border-none focus:ring-0 font-headline-md text-headline-md text-primary p-0"
                    type="text"
                    value={hour}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 2)
                      setHour(val)
                    }}
                  />
                  <span className="text-on-surface-variant font-bold">:</span>
                  <input
                    className="w-10 text-center bg-transparent border-none focus:ring-0 font-headline-md text-headline-md text-primary p-0"
                    type="text"
                    value={minute}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 2)
                      setMinute(val)
                    }}
                  />
                </div>
                <div className="flex bg-surface-container-low rounded-lg p-1">
                  <button
                    onClick={() => setPeriod('AM')}
                    className={`px-4 py-1.5 rounded-md font-label-sm text-label-sm transition-all ${
                      period === 'AM'
                        ? 'bg-surface-container-lowest shadow-sm text-primary font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    onClick={() => setPeriod('PM')}
                    className={`px-4 py-1.5 rounded-md font-label-sm text-label-sm transition-all ${
                      period === 'PM'
                        ? 'bg-surface-container-lowest shadow-sm text-primary font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <span className="font-label-sm text-label-sm text-on-surface-variant/60 block">
                  Local Time
                </span>
                <span className="font-body-md text-body-md text-on-surface-variant">
                  GMT-4
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="px-6 py-4 bg-surface-container-low/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-body-md text-body-md text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-2.5 rounded-xl font-body-md text-body-md bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95"
          >
            Set Due Date
          </button>
        </div>
      </div>
    </div>
  )
}
