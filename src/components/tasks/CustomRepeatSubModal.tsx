'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'

const FREQUENCY_UNITS = ['days', 'weeks', 'months', 'years'] as const
type FrequencyUnit = (typeof FREQUENCY_UNITS)[number]

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const
const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

const ORDINALS = [
  { label: 'first', value: 'first' },
  { label: 'second', value: 'second' },
  { label: 'third', value: 'third' },
  { label: 'fourth', value: 'fourth' },
  { label: 'last', value: 'last' },
] as const

const ORDINAL_DAYS = [
  { label: 'Sunday', value: 'sunday' },
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
] as const

interface CustomRepeatConfig {
  repeatType: string
  repeatInterval: number
  repeatDays?: number[]
}

interface CustomRepeatSubModalProps {
  open: boolean
  onClose: () => void
  onSave: (config: CustomRepeatConfig) => void
}

export function CustomRepeatSubModal({
  open,
  onClose,
  onSave,
}: CustomRepeatSubModalProps) {
  const [interval, setInterval] = useState(1)
  const [frequencyUnit, setFrequencyUnit] = useState<FrequencyUnit>('weeks')
  const [selectedDays, setSelectedDays] = useState<Set<number>>(
    () => new Set([1, 3, 5]),
  )
  const [monthOccurrence, setMonthOccurrence] = useState<'day' | 'ordinal'>(
    'day',
  )
  const [monthDay, setMonthDay] = useState(15)
  const [monthOrdinal, setMonthOrdinal] = useState('third')
  const [monthOrdinalDay, setMonthOrdinalDay] = useState('sunday')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const toggleDay = useCallback((index: number) => {
    setSelectedDays((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }, [])

  const handleSave = useCallback(() => {
    let repeatType: string
    switch (frequencyUnit) {
      case 'days':
        repeatType = 'daily'
        break
      case 'weeks':
        repeatType = 'weekly'
        break
      case 'months':
        repeatType = 'monthly'
        break
      case 'years':
        repeatType = 'yearly'
        break
      default:
        repeatType = 'daily'
    }

    onSave({
      repeatType,
      repeatInterval: interval,
      repeatDays:
        frequencyUnit === 'weeks' ? Array.from(selectedDays).sort() : undefined,
    })
  }, [frequencyUnit, interval, selectedDays, onSave])

  const summary = useMemo(() => {
    if (interval < 1) return ''
    const unitLabel =
      interval === 1 ? frequencyUnit.slice(0, -1) : frequencyUnit
    const prefix = `Repeats every ${interval > 1 ? `${interval} ` : ''}${unitLabel}`

    if (frequencyUnit === 'days') {
      return prefix + '.'
    }
    if (frequencyUnit === 'weeks') {
      if (selectedDays.size === 0) return prefix + '.'
      const dayList = Array.from(selectedDays)
        .sort()
        .map((d) => DAY_NAMES[d])
      if (dayList.length === 1) return `${prefix} on ${dayList[0]}.`
      const last = dayList.pop()
      return `${prefix} on ${dayList.join(', ')}, and ${last}.`
    }
    if (frequencyUnit === 'months') {
      if (monthOccurrence === 'day') {
        return `${prefix} on day ${monthDay}.`
      }
      return `${prefix} on the ${monthOrdinal} ${monthOrdinalDay}.`
    }
    if (frequencyUnit === 'years') {
      return prefix + '.'
    }
    return prefix + '.'
  }, [interval, frequencyUnit, selectedDays, monthOccurrence, monthDay, monthOrdinal, monthOrdinalDay])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
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
        className="relative w-full max-w-[440px] rounded-xl shadow-2xl border border-white/50 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="px-6 py-5 border-b border-border-subtle-light flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 -ml-2 rounded-full hover:bg-surface-variant/50 transition-colors text-on-surface-variant"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h3 className="font-headline-md text-headline-md">Custom Repeat</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-variant/50 transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-8 space-y-10 overflow-y-auto max-h-[716px]">
          <div className="space-y-4">
            <label className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary-light">
              Repeat every
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20">
                <input
                  type="number"
                  min={1}
                  value={interval}
                  onChange={(e) =>
                    setInterval(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2.5 font-body-md text-center transition-all"
                  style={{
                    outline: 'none',
                    boxShadow: '0 0 0 2px rgba(0, 74, 198, 0.1)',
                  }}
                />
              </div>
              <div className="flex-1 relative">
                <select
                  value={frequencyUnit}
                  onChange={(e) =>
                    setFrequencyUnit(e.target.value as FrequencyUnit)
                  }
                  className="w-full appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 font-body-md pr-10 cursor-pointer transition-all"
                  style={{
                    outline: 'none',
                    boxShadow: '0 0 0 2px rgba(0, 74, 198, 0.1)',
                  }}
                >
                  {FREQUENCY_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {frequencyUnit === 'weeks' && (
            <div className="space-y-4 transition-all duration-300">
              <label className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary-light">
                Occurs on
              </label>
              <div className="flex justify-between">
                {DAY_LABELS.map((label, i) => {
                  const isSelected = selectedDays.has(i)
                  return (
                    <button
                      key={i}
                      onClick={() => toggleDay(i)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-body-md transition-all duration-200 ${
                        isSelected
                          ? 'bg-primary text-on-primary shadow-md scale-105'
                          : 'border border-outline-variant text-on-surface-variant hover:border-primary/50'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {frequencyUnit === 'months' && (
            <div className="space-y-4 transition-all duration-300">
              <label className="font-label-sm text-label-sm uppercase tracking-wider text-text-secondary-light">
                Occurs on
              </label>
              <div className="space-y-3">
                <label
                  className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors group ${
                    monthOccurrence === 'day'
                      ? 'bg-surface-container-lowest border-primary/30'
                      : 'bg-surface-container-lowest border-outline-variant hover:bg-primary-container/5'
                  }`}
                >
                  <input
                    type="radio"
                    name="month_occurrence"
                    checked={monthOccurrence === 'day'}
                    onChange={() => setMonthOccurrence('day')}
                    className="w-5 h-5 text-primary border-outline-variant focus:ring-primary/20"
                  />
                  <span className="font-body-md text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
                    On day
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={monthDay}
                      onChange={(e) =>
                        setMonthDay(
                          Math.min(31, Math.max(1, parseInt(e.target.value) || 1)),
                        )
                      }
                      className="w-14 bg-surface-container-low border border-outline-variant rounded-lg px-2 py-1 font-body-md text-center transition-all"
                    />
                  </span>
                </label>
                <label
                  className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors group ${
                    monthOccurrence === 'ordinal'
                      ? 'bg-surface-container-lowest border-primary/30'
                      : 'bg-surface-container-lowest border-outline-variant hover:bg-primary-container/5'
                  }`}
                >
                  <input
                    type="radio"
                    name="month_occurrence"
                    checked={monthOccurrence === 'ordinal'}
                    onChange={() => setMonthOccurrence('ordinal')}
                    className="w-5 h-5 text-primary border-outline-variant focus:ring-primary/20"
                  />
                  <span className="font-body-md text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
                    On the
                    <select
                      value={monthOrdinal}
                      onChange={(e) => setMonthOrdinal(e.target.value)}
                      className="bg-transparent border-b border-outline-variant py-0.5 font-body-md cursor-pointer focus:outline-none"
                    >
                      {ORDINALS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={monthOrdinalDay}
                      onChange={(e) => setMonthOrdinalDay(e.target.value)}
                      className="bg-transparent border-b border-outline-variant py-0.5 font-body-md cursor-pointer focus:outline-none"
                    >
                      {ORDINAL_DAYS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </span>
                </label>
              </div>
            </div>
          )}

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-primary text-sm flex items-start gap-2">
              <span
                className="material-symbols-outlined text-[18px] mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                info
              </span>
              <span>{summary}</span>
            </p>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-border-subtle-light flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-outline-variant text-on-surface-variant font-headline-md rounded-xl hover:bg-surface-variant/20 active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-4 bg-primary text-on-primary font-headline-md rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
