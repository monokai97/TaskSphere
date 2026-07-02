'use client'

import { useState } from 'react'
import { useSlackIntegration, useUpdateSlack } from '@/hooks/useSlack'

export default function SlackPage() {
  const { preferences, isFetched: _isFetched } = useSlackIntegration()
  const updateSlack = useUpdateSlack()

  const [syncStatus, setSyncStatus] = useState(() => preferences.syncStatus)
  const [taskNotifications, setTaskNotifications] = useState(() => preferences.taskNotifications)
  const [channel, setChannel] = useState(() => preferences.channel)

  return (
    <div className="p-12 py-16">
      <header className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center border border-border-subtle-light">
          <span className="material-symbols-outlined text-primary text-[28px]">forum</span>
        </div>
        <div>
          <h1 className="font-display-xl text-display-xl text-on-surface">Slack Integration</h1>
          <p className="text-on-surface-variant">Control how FocusFlow interacts with your Slack workspace.</p>
        </div>
      </header>

      <div className="flex gap-10">
        <div className="flex-1 min-w-0 max-w-4xl space-y-10">
          <section className="mb-10">
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-border-subtle-light flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface">Connected to Workspace: Ethereal Team</h3>
                  <p className="text-sm text-on-surface-variant">Last synced 2 minutes ago</p>
                </div>
              </div>
              <button className="px-4 py-2 border border-error text-error rounded-lg font-medium hover:bg-error-container transition-colors active:scale-[0.98] shrink-0">
                Disconnect
              </button>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-border-subtle-light pb-4">
              <h4 className="font-semibold text-lg text-on-surface">Sync Preferences</h4>
            </div>

            <div className="flex items-start justify-between group">
              <div className="max-w-[80%]">
                <label className="block font-medium text-on-surface mb-1">Sync Status</label>
                <p className="text-sm text-on-surface-variant">
                  Automatically update your Slack status to &apos;In Focus&apos; and turn on Do Not Disturb when a Focus Session starts.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer mt-1 shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={syncStatus}
                  onChange={(e) => setSyncStatus(e.target.checked)}
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            <div className="flex items-start justify-between group">
              <div className="max-w-[80%]">
                <label className="block font-medium text-on-surface mb-1">Task Notifications</label>
                <p className="text-sm text-on-surface-variant">
                  Send a celebration message to your selected Slack channel whenever you complete a task in FocusFlow.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer mt-1 shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={taskNotifications}
                  onChange={(e) => setTaskNotifications(e.target.checked)}
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            <div className="pt-2">
              <label className="block font-medium text-on-surface mb-2">Channel Mapping</label>
              <div className="relative max-w-sm">
                <select
                  className="w-full bg-surface-container-lowest border border-border-subtle-light rounded-xl px-4 py-2.5 appearance-none focus:ring-2 focus:ring-primary-container focus:outline-none text-on-surface cursor-pointer"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                >
                  <option>#general</option>
                  <option>#daily-updates</option>
                  <option>#focus-flow-log</option>
                  <option>#team-output</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                  expand_more
                </span>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <div className="bg-surface-container-low rounded-xl p-6 border border-dashed border-outline-variant">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-surface-container-lowest rounded-lg shadow-sm border border-border-subtle-light">
                  <span className="material-symbols-outlined text-primary">terminal</span>
                </div>
                <h4 className="font-semibold text-on-surface">Slash Commands</h4>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Use <code className="bg-surface-container-lowest px-1.5 py-0.5 rounded border border-border-subtle-light font-mono text-primary">/focus [Task Name]</code> directly in any Slack channel or DM to create a new task in your FocusFlow inbox without leaving your conversation.
              </p>
            </div>
          </section>

          <div className="flex items-center gap-4 pt-8 border-t border-border-subtle-light mt-8">
            <button
              type="button"
              className="px-8 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => updateSlack.mutate({
                syncStatus,
                taskNotifications,
                channel,
              })}
              disabled={updateSlack.isPending}
            >
              {updateSlack.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="px-8 py-3 bg-surface-container text-on-surface-variant rounded-xl font-semibold hover:bg-surface-container-high transition-colors"
              onClick={() => {
                setSyncStatus(preferences.syncStatus)
                setTaskNotifications(preferences.taskNotifications)
                setChannel(preferences.channel)
              }}
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="w-detail-panel-width shrink-0">
          <div className="glass-panel rounded-2xl border border-border-subtle-light overflow-hidden sticky top-24">
            <div className="p-8 border-b border-border-subtle-light">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-sm">visibility</span>
                <h3 className="text-label-sm uppercase tracking-widest text-outline font-bold">Live Preview</h3>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-on-surface-variant px-1">Slack Profile Status</p>
                <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xl shadow-primary/5 border border-border-subtle-light flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-xl">person</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-on-surface">Alex Rivera</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        bolt
                      </span>
                      <p className="text-xs text-on-surface-variant font-medium">In Deep Work</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-on-surface-variant px-1">Channel Notification</p>
                <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xl shadow-primary/5 border border-border-subtle-light">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">forum</span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">FocusFlow App</span>
                    <span className="text-[10px] text-outline">12:45 PM</span>
                  </div>
                  <p className="text-sm text-on-surface leading-snug">
                    <span className="text-green-600 font-bold">✅ Task Completed:</span>
                    <br />
                    Finalize Quarterly Report
                  </p>
                  <div className="mt-3 flex gap-2 items-center">
                    <div className="h-1.5 flex-1 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full w-4/5 bg-primary rounded-full" />
                    </div>
                    <span className="text-[9px] font-bold text-primary">80% of daily goal</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary-container/10 border border-primary-container/20 rounded-xl p-4">
                <p className="text-xs text-on-primary-fixed-variant leading-relaxed italic">
                  &quot;Your Slack teammates will see your focus status, automatically silencing non-urgent interruptions while you do your best work.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
