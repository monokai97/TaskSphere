'use client'

import { useState } from 'react'
import { useOutlookCalendarIntegration, useUpdateOutlookCalendar } from '@/hooks/useOutlookCalendar'

export default function OutlookCalendarPage() {
  const { preferences, isFetched: _isFetched } = useOutlookCalendarIntegration()
  const updateOutlookCalendar = useUpdateOutlookCalendar()

  const [importEvents, setImportEvents] = useState(() => preferences.importEvents)
  const [syncCompleted, setSyncCompleted] = useState(() => preferences.syncCompleted)
  const [primaryCalendar, setPrimaryCalendar] = useState(() => preferences.primaryCalendar)
  const [syncFrequency, setSyncFrequency] = useState(() => preferences.syncFrequency)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, label: string) => {
    if (e.target.name === 'primaryCalendar') setPrimaryCalendar(e.target.value)
    if (e.target.name === 'syncFrequency') setSyncFrequency(e.target.value)
    showToast(`${label} updated successfully`)
  }

  return (
    <div className="p-12 py-16">
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-4">
          <span>Settings</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Integrations</span>
        </nav>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl">calendar_today</span>
          </div>
          <h1 className="font-display-xl text-display-xl text-on-surface">Outlook Calendar</h1>
        </div>
      </header>

      <div className="flex gap-10">
        <div className="flex-1 min-w-0 max-w-4xl space-y-10">
          <section className="bg-surface-container-lowest border border-border-subtle-light rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
                <div>
                  <p className="font-headline-md text-headline-md text-on-surface">Connected as rivera.work@outlook.com</p>
                  <p className="text-sm text-on-surface-variant">Last synced: 2 minutes ago</p>
                </div>
              </div>
              <button className="px-5 py-2.5 rounded-lg border border-error/20 text-error font-semibold hover:bg-error/5 transition-all active:scale-95 text-sm shrink-0">
                Disconnect
              </button>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="font-headline-md text-headline-md text-on-surface border-b border-border-subtle-light pb-4">
              Sync Preferences
            </h3>

            <div className="flex items-start justify-between group py-2">
              <div className="space-y-1">
                <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                  Import events as tasks
                </p>
                <p className="text-sm text-on-surface-variant max-w-md">
                  Automatically show Outlook events in your &apos;My Day&apos; view to keep your schedule centralized.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer mt-1 shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={importEvents}
                  onChange={(e) => setImportEvents(e.target.checked)}
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            <div className="flex items-start justify-between group py-2">
              <div className="space-y-1">
                <p className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                  Sync completed tasks
                </p>
                <p className="text-sm text-on-surface-variant max-w-md">
                  When you check off a task in FocusFlow, it will be marked as complete in your Outlook task list.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer mt-1 shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={syncCompleted}
                  onChange={(e) => setSyncCompleted(e.target.checked)}
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          </section>

          <section className="space-y-6 pt-4">
            <h3 className="font-headline-md text-headline-md text-on-surface border-b border-border-subtle-light pb-4">
              Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">
                  Primary Calendar
                </label>
                <div className="relative">
                  <select
                    name="primaryCalendar"
                    className="w-full bg-surface-container-lowest border border-border-subtle-light rounded-lg px-4 py-3 appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer text-on-surface"
                    value={primaryCalendar}
                    onChange={(e) => handleSelectChange(e, 'Primary Calendar')}
                  >
                    <option>Work</option>
                    <option>Personal</option>
                    <option>Project Alpha</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                    expand_more
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">
                  Sync Frequency
                </label>
                <div className="relative">
                  <select
                    name="syncFrequency"
                    className="w-full bg-surface-container-lowest border border-border-subtle-light rounded-lg px-4 py-3 appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer text-on-surface"
                    value={syncFrequency}
                    onChange={(e) => handleSelectChange(e, 'Sync Frequency')}
                  >
                    <option>Real-time (Push)</option>
                    <option>Every 15 mins</option>
                    <option>Manual</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-4 pt-8 border-t border-border-subtle-light mt-8">
            <button
              type="button"
              className="px-8 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => updateOutlookCalendar.mutate({
                importEvents,
                syncCompleted,
                primaryCalendar,
                syncFrequency,
              })}
              disabled={updateOutlookCalendar.isPending}
            >
              {updateOutlookCalendar.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="px-8 py-3 bg-surface-container text-on-surface-variant rounded-xl font-semibold hover:bg-surface-container-high transition-colors"
              onClick={() => {
                setImportEvents(preferences.importEvents)
                setSyncCompleted(preferences.syncCompleted)
                setPrimaryCalendar(preferences.primaryCalendar)
                setSyncFrequency(preferences.syncFrequency)
              }}
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="w-detail-panel-width shrink-0">
          <div className="glass-panel rounded-2xl border border-border-subtle-light overflow-hidden sticky top-24">
            <div className="p-8 border-b border-border-subtle-light">
              <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">visibility</span>
                Live Preview
              </h3>
              <p className="text-sm text-on-surface-variant mt-1">
                How integrated events will appear
              </p>
            </div>

            <div className="p-8">
              <div className="bg-surface-container-lowest border border-border-subtle-light rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between text-[11px] font-bold text-on-surface-variant/50 uppercase tracking-tighter">
                  <span>Upcoming Today</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Live Syncing
                  </span>
                </div>

                <div className="group cursor-default">
                  <div className="flex items-center gap-4 p-4 border border-border-subtle-light rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all hover:-translate-y-0.5">
                    <div className="w-5 h-5 rounded-full border-2 border-primary/30 flex items-center justify-center shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-primary/20 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-semibold text-on-surface">Project Sync Meeting</span>
                        <div className="px-1.5 py-0.5 bg-blue-100 rounded flex items-center shrink-0">
                          <span className="material-symbols-outlined text-[14px]" style={{ color: '#0078d4' }}>calendar_today</span>
                        </div>
                      </div>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        10:00 AM - 11:00 AM
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 bg-primary/5 border border-primary/10 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-[20px]">lightbulb</span>
                    <span className="font-semibold text-sm">FocusFlow Tip</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Use <strong>Outlook Categories</strong> to automatically group imported events into your FocusFlow
                    lists. For example, a &quot;Deep Work&quot; category in Outlook will sync directly to your
                    high-priority list here.
                  </p>
                </div>
              </div>

              <div className="relative h-48 w-full mt-8 rounded-2xl overflow-hidden opacity-40">
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface px-6 py-3 rounded-full shadow-2xl text-sm font-semibold flex items-center gap-3 animate-bounce z-50">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          {toast}
        </div>
      )}
    </div>
  )
}
