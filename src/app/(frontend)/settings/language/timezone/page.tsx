'use client'

import { useState, useEffect, useRef } from 'react'
import { useDateTimePrefs, useUpdateDateTimePreferences } from '@/hooks/useDateTimePreferences'

const TIMEZONES = [
  { value: 'madrid', label: '(GMT+01:00) Madrid, Spain' },
  { value: 'eastern', label: '(GMT-05:00) Eastern Time (US & Canada)' },
  { value: 'london', label: '(GMT+00:00) London, Lisbon, Casablanca' },
  { value: 'tokyo', label: '(GMT+09:00) Tokyo, Osaka, Sapporo' },
  { value: 'sydney', label: '(GMT+11:00) Sydney, Melbourne, Canberra' },
  { value: 'dubai', label: '(GMT+04:00) Dubai, Abu Dhabi, Muscat' },
]

const TZ_ABBREV: Record<string, string> = {
  madrid: 'CET',
  eastern: 'EST',
  london: 'GMT',
  tokyo: 'JST',
  sydney: 'AEDT',
  dubai: 'GST',
}

export default function TimeZonePage() {
  const { preferences, isFetched: _isFetched } = useDateTimePrefs()
  const updateDateTime = useUpdateDateTimePreferences()

  const [autoDetect, setAutoDetect] = useState(() => preferences.timezoneAutoDetect)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(() => preferences.timezone)
  const [time, setTime] = useState('')
  const clockRef = useRef<HTMLSpanElement>(null)

  const filtered = TIMEZONES.filter((tz) =>
    tz.label.toLowerCase().includes(search.toLowerCase()),
  )

  useEffect(() => {
    function updateClock() {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      setTime(`${hours}:${minutes}`)
      if (clockRef.current) {
        clockRef.current.style.opacity = '0'
        setTimeout(() => {
          if (clockRef.current) clockRef.current.style.opacity = '1'
        }, 50)
      }
    }
    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-12 py-16">
      <header className="mb-10 max-w-2xl">
        <nav className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-4">
          <span>Settings</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Language &amp; Region</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">Time Zone</span>
        </nav>
        <h1 className="font-display-xl text-display-xl text-on-surface mb-2">
          Time Zone
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Customize your time zone so your reminders and tasks sync correctly
          with your local location.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <div className="flex items-center justify-between p-6 bg-surface-container-lowest border border-border-subtle-light rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">location_on</span>
              </div>
              <div>
                <h3 className="font-headline-md text-on-surface">Auto-detect</h3>
                <p className="text-sm text-on-surface-variant">
                  Sync based on your current location
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={autoDetect}
                onChange={(e) => setAutoDetect(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>

          {!autoDetect && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block font-headline-md text-on-surface px-1">
                Select manually
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search time zones..."
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-border-subtle-light rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md"
                />
              </div>
              <div className="grid gap-2 mt-4">
                {filtered.map((tz) => (
                  <button
                    key={tz.value}
                    type="button"
                    onClick={() => setSelected(tz.value)}
                    className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                      selected === tz.value
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent hover:border-border-subtle-light hover:bg-surface-container-low'
                    }`}
                  >
                    <span
                      className={`font-body-md ${
                        selected === tz.value
                          ? 'text-primary font-medium'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      {tz.label}
                    </span>
                    {selected === tz.value && (
                      <span
                        className="material-symbols-outlined text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {autoDetect && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="p-6 bg-surface-container-low border border-dashed border-outline-variant rounded-2xl">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-on-surface-variant">
                    travel_explore
                  </span>
                  <div>
                    <p className="font-body-md font-semibold text-on-surface mb-1">
                      Location detected: Madrid, Spain
                    </p>
                    <p className="font-label-sm text-on-surface-variant">
                      Your time zone is synced automatically. Disable auto-detect
                      above to choose a different time zone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <p className="text-slate-400 font-label-sm uppercase tracking-widest mb-4">
                Current Local Time
              </p>
              <div className="flex items-baseline gap-4">
                <span
                  ref={clockRef}
                  className="text-6xl font-bold font-display-xl"
                  style={{ transition: 'opacity 0.15s ease-in-out' }}
                >
                  {time}
                </span>
                <span className="text-2xl text-slate-400">
                  {TZ_ABBREV[selected]}
                </span>
              </div>
              <p className="mt-4 text-slate-300 font-body-md">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              type="button"
              className="px-8 h-12 bg-primary text-on-primary rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => updateDateTime.mutate({
                ...preferences,
                timezoneAutoDetect: autoDetect,
                timezone: selected,
              })}
              disabled={updateDateTime.isPending}
            >
              {updateDateTime.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="px-8 h-12 text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-high rounded-xl transition-all"
              onClick={() => {
                setAutoDetect(preferences.timezoneAutoDetect)
                setSelected(preferences.timezone)
              }}
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div>
            <h3 className="font-headline-md text-xs uppercase tracking-widest text-on-surface-variant mb-6">
              Task Preview
            </h3>
            <p className="font-label-sm text-on-surface-variant mb-6 -mt-4">
              This is how your reminders will look with the selected time zone.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container-lowest shadow-xl shadow-gray-200/50 border border-border-subtle-light space-y-6">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container">
                  event
                </span>
              </div>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                  JD
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-secondary-container/50 flex items-center justify-center text-[10px] font-bold text-on-secondary-container">
                  AK
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-headline-md text-on-surface mb-1">
                Sync Meeting
              </h4>
              <p className="text-sm text-on-surface-variant">
                Discuss Q3 objectives with the design team.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">
                schedule
              </span>
              <div>
                <p className="text-sm font-semibold text-primary">
                  Due at 17:00
                </p>
                <p className="text-[10px] text-primary/60 uppercase font-bold tracking-tight">
                  Local Time ({TZ_ABBREV[selected]})
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-dashed border-border-subtle-light bg-surface-container-low/50">
            <div className="flex gap-4 items-start">
              <span className="material-symbols-outlined text-on-surface-variant shrink-0">
                info
              </span>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Changing your time zone will affect all devices synced to your
                account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
