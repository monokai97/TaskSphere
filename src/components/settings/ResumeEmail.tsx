'use client'

import { useState } from 'react'
import { useEmailSummaryPreferences, useUpdateEmailSummary } from '@/hooks/useEmailSummary'

export function ResumeEmail() {
  const { preferences, isFetched } = useEmailSummaryPreferences()
  const updateEmailSummary = useUpdateEmailSummary()

  const [dailyBrief, setDailyBrief] = useState(() => preferences.dailyBrief)
  const [weeklyReport, setWeeklyReport] = useState(() => preferences.weeklyReport)
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly' | 'Monthly'>(
    () => preferences.frequency,
  )
  const [contentTypes, setContentTypes] = useState(() => ({ ...preferences.contentTypes }))

  if (!isFetched) return null

  const handleSave = () => {
    updateEmailSummary.mutate({
      dailyBrief,
      weeklyReport,
      frequency,
      contentTypes,
    })
  }

  const handleDiscard = () => {
    setDailyBrief(preferences.dailyBrief)
    setWeeklyReport(preferences.weeklyReport)
    setFrequency(preferences.frequency)
    setContentTypes({ ...preferences.contentTypes })
  }

  return (
    <div className="max-w-4xl mx-auto p-12 py-16">
        <header className="mb-12">
          <div className="flex items-center gap-2 text-on-surface-variant mb-4">
            <span className="hover:text-primary transition-colors text-sm cursor-default">
              Settings
            </span>
            <span className="material-symbols-outlined text-xs">
              chevron_right
            </span>
            <span className="hover:text-primary transition-colors text-sm cursor-default">
              Notifications
            </span>
            <span className="material-symbols-outlined text-xs">
              chevron_right
            </span>
            <span className="text-primary font-medium text-sm">
              Email Summary
            </span>
          </div>
          <h1 className="font-display-xl text-display-xl text-on-surface mb-4">
            Email Summaries
          </h1>
          <p className="text-on-surface-variant font-body-lg max-w-2xl leading-relaxed">
            Manage how and when you receive productivity reports and task
            updates in your inbox.
          </p>
        </header>

        <div className="space-y-8">
          {/* Delivery Address */}
          <section className="bg-surface-container-lowest p-8 rounded-2xl border border-border-subtle-light">
            <h3 className="font-headline-md text-headline-md mb-6">
              Delivery Address
            </h3>
            <div className="flex items-center gap-4 bg-surface-container-low px-4 py-3 rounded-xl border border-border-subtle-light group">
              <span className="material-symbols-outlined text-on-surface-variant">
                alternate_email
              </span>
              <div className="flex-1">
                <span className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">
                  Current Email
                </span>
                <span className="font-body-md text-on-surface">
                  j.doe@etherealfocus.com
                </span>
              </div>
              <button className="text-primary font-medium text-sm hover:underline">
                Change
              </button>
            </div>
          </section>

          {/* Subscription Toggles */}
          <section className="bg-surface-container-lowest p-8 rounded-2xl border border-border-subtle-light space-y-8">
            <div>
              <h3 className="font-headline-md text-headline-md mb-6">
                Subscription Types
              </h3>
              <div className="flex items-start justify-between mb-8 pb-8 border-b border-border-subtle-light">
                <div className="max-w-md">
                  <label
                    className="font-headline-md text-on-surface block mb-1 cursor-pointer"
                    htmlFor="daily-brief"
                  >
                    Daily Briefing
                  </label>
                  <p className="text-on-surface-variant text-sm">
                    Receive a morning digest of your scheduled tasks,
                    meetings, and priority items for the day ahead.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="daily-brief"
                    type="checkbox"
                    className="sr-only peer"
                    checked={dailyBrief}
                    onChange={(e) => setDailyBrief(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest rounded-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
              </div>
              <div className="flex items-start justify-between">
                <div className="max-w-md">
                  <label
                    className="font-headline-md text-on-surface block mb-1 cursor-pointer"
                    htmlFor="weekly-report"
                  >
                    Weekly Productivity Report
                  </label>
                  <p className="text-on-surface-variant text-sm">
                    A comprehensive review of your focus sessions, completed
                    tasks, and efficiency trends from the past week.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="weekly-report"
                    type="checkbox"
                    className="sr-only peer"
                    checked={weeklyReport}
                    onChange={(e) => setWeeklyReport(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest rounded-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
              </div>
            </div>
          </section>

          {/* Frequency */}
          <section className="bg-surface-container-lowest p-8 rounded-2xl border border-border-subtle-light">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="font-headline-md text-headline-md mb-1">
                  Global Frequency
                </h3>
                <p className="text-on-surface-variant text-sm">
                  Control the delivery pacing for general system updates.
                </p>
              </div>
              <div className="inline-flex p-1 bg-surface-container-low rounded-xl border border-border-subtle-light">
                {(['Daily', 'Weekly', 'Monthly'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${
                      frequency === f
                        ? 'bg-white shadow-sm text-primary'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Content Types */}
          <section className="bg-surface-container-lowest p-8 rounded-2xl border border-border-subtle-light">
            <h3 className="font-headline-md text-headline-md mb-6">
              Summary Content
            </h3>
            <p className="text-on-surface-variant text-sm mb-6">
              Select the modules you want included in your email digests.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(
                [
                  {
                    key: 'completedTasks' as const,
                    label: 'Completed tasks',
                    desc: 'Log of achievements from the period.',
                  },
                  {
                    key: 'overdueReminders' as const,
                    label: 'Overdue reminders',
                    desc: 'Alerts for missed deadlines.',
                  },
                  {
                    key: 'upcomingDeadlines' as const,
                    label: 'Upcoming deadlines',
                    desc: 'Lookahead for the next 7 days.',
                  },
                  {
                    key: 'focusStatistics' as const,
                    label: 'Focus statistics',
                    desc: 'Deep-work metrics and time tracking.',
                  },
                ] as const
              ).map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border-subtle-light hover:bg-surface-container-low transition-all cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20"
                    checked={contentTypes[item.key]}
                    onChange={(e) =>
                      setContentTypes((prev) => ({
                        ...prev,
                        [item.key]: e.target.checked,
                      }))
                    }
                  />
                  <div>
                    <span className="block font-medium text-on-surface">
                      {item.label}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {item.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Footer */}
          <div className="pt-8 flex items-center justify-between border-t border-border-subtle-light">
            <button className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">mail</span>
              <span className="font-medium">Send test summary</span>
            </button>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="px-8 py-3 text-on-surface font-medium hover:bg-surface-variant/30 rounded-xl transition-all"
                onClick={handleDiscard}
              >
                Discard
              </button>
              <button
                type="button"
                className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSave}
                disabled={updateEmailSummary.isPending}
              >
                {updateEmailSummary.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Card */}
        <div className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-primary-container/5 to-tertiary-container/5 border border-white/50 flex items-center gap-8">
          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl rotate-3 bg-surface-container-low flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary/30">
              schedule
            </span>
          </div>
          <div>
            <h4 className="font-headline-md text-primary mb-1">
              Weekly Insight is coming
            </h4>
            <p className="text-on-surface-variant text-sm max-w-sm">
              Based on your current settings, your next Weekly Productivity
              Report will be sent this Sunday at 8:00 AM.
            </p>
          </div>
        </div>
    </div>
  )
}
