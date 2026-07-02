'use client'

import { useEffect, useState } from 'react'
import { useICalIntegration, useUpdateICal } from '@/hooks/useICal'

export default function ICalPage() {
  const { preferences, isFetched: _isFetched } = useICalIntegration()
  const updateICal = useUpdateICal()

  const [url, setUrl] = useState(() => preferences.url)
  const [importEvents, setImportEvents] = useState(() => preferences.importEvents)
  const [autoRefresh, setAutoRefresh] = useState(() => preferences.autoRefresh)
  const [syncFrequency, setSyncFrequency] = useState(() => preferences.syncFrequency)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`p-12 py-16 transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'}`}
    >
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-4">
          <span>Settings</span>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span>Integrations</span>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span className="text-on-surface font-semibold">iCal</span>
        </nav>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[32px]">calendar_today</span>
          </div>
          <div>
            <h1 className="font-display-xl text-display-xl text-on-surface">iCal Integration</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Connect any external calendar that provides a public or private .ics URL.
            </p>
          </div>
        </div>
      </header>

      <div className="flex gap-10">
        <div className="flex-1 min-w-0 max-w-4xl space-y-10">
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all">
            <label className="block font-label-sm text-label-sm text-on-surface font-bold uppercase tracking-wider mb-4" htmlFor="ical-url">
              Calendar URL
            </label>
            <div className="flex gap-3">
              <input
                id="ical-url"
                type="text"
                className="flex-1 bg-surface-container-low border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-container text-on-surface font-body-md outline-none"
                placeholder="https://p01-calendar.icloud.com/published/2/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button className="bg-primary hover:bg-primary-container text-white px-8 py-3 rounded-lg font-semibold transition-all active:scale-[0.97] shrink-0">
                Connect
              </button>
            </div>
            <div className="mt-6 flex gap-4 p-4 rounded-lg bg-surface-container-low/50">
              <span className="material-symbols-outlined text-outline text-[20px] shrink-0 mt-0.5">info</span>
              <div className="text-label-sm text-on-surface-variant leading-relaxed">
                <p className="font-bold text-on-surface mb-1">How to find your URL:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <span className="font-medium">Apple Calendar:</span> Right-click your calendar &rarr; Public Calendar &rarr; Copy Link.
                  </li>
                  <li>
                    <span className="font-medium">Other Services:</span> Look for &quot;Publish Calendar&quot; or &quot;Secret address in iCal format&quot; settings.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-headline-md text-headline-md text-on-surface">Synchronization Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-5 bg-surface-container-lowest border border-outline-variant rounded-xl">
                <div className="pr-4">
                  <p className="font-body-md font-semibold text-on-surface">Import events as tasks</p>
                  <p className="text-[12px] text-on-surface-variant mt-0.5">Automatically create FocusFlow tasks for new events.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={importEvents}
                    onChange={(e) => setImportEvents(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
              <div className="flex items-center justify-between p-5 bg-surface-container-lowest border border-outline-variant rounded-xl">
                <div className="pr-4">
                  <p className="font-body-md font-semibold text-on-surface">Auto-refresh calendar</p>
                  <p className="text-[12px] text-on-surface-variant mt-0.5">Keep your task list in sync with background updates.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
            </div>

            <div className="p-5 bg-surface-container-lowest border border-outline-variant rounded-xl max-w-md">
              <label className="block font-label-sm text-label-sm text-on-surface font-bold uppercase mb-3">
                Sync Frequency
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:ring-2 focus:ring-primary-container outline-none pr-10 cursor-pointer"
                  value={syncFrequency}
                  onChange={(e) => setSyncFrequency(e.target.value)}
                >
                  <option>Every 15 minutes</option>
                  <option>Every hour</option>
                  <option>Daily</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-8 border-t border-border-subtle-light mt-8">
            <button
              type="button"
              className="px-8 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => updateICal.mutate({
                url,
                importEvents,
                autoRefresh,
                syncFrequency,
              })}
              disabled={updateICal.isPending}
            >
              {updateICal.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="px-8 py-3 bg-surface-container text-on-surface-variant rounded-xl font-semibold hover:bg-surface-container-high transition-colors"
              onClick={() => {
                setUrl(preferences.url)
                setImportEvents(preferences.importEvents)
                setAutoRefresh(preferences.autoRefresh)
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
              <p className="text-label-sm text-on-surface-variant font-medium mt-1">
                How it will appear in your list:
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm group hover:border-primary/40 transition-all hover:-translate-y-0.5">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-outline-variant mt-1 group-hover:border-primary transition-colors shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[15px] font-semibold text-on-surface">External Sync Meeting</h4>
                      <span className="material-symbols-outlined text-[16px] text-primary shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                        link
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-[14px] text-outline">schedule</span>
                      <span className="text-[12px] text-on-surface-variant">2:00 PM - 3:00 PM</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] rounded-full font-bold uppercase tracking-tight">
                        iCal Source
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary-container p-6 rounded-2xl text-white relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-[120px]">lightbulb</span>
                </div>
                <h4 className="font-headline-md text-headline-md mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  FocusFlow Tip
                </h4>
                <p className="text-on-primary-container leading-relaxed text-sm">
                  By centralizing your external calendars, you reduce context switching by 40%. Manage your meetings
                  and deep-work sessions in one unified, zen interface.
                </p>
                <button className="mt-6 text-white font-bold text-label-sm flex items-center gap-2 hover:underline">
                  Learn about Unified Workflow
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>

              <div className="h-48 rounded-2xl bg-surface-container border border-dashed border-outline-variant flex items-center justify-center p-8 text-center">
                <div className="space-y-2">
                  <span className="material-symbols-outlined text-outline/40 text-[48px]">sync_alt</span>
                  <p className="text-label-sm text-outline font-medium">Safe &amp; Secure End-to-End Encryption</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
