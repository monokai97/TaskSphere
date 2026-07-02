'use client'

import { useEffect, useState } from 'react'
import { useZapierIntegration, useUpdateZapier } from '@/hooks/useZapier'

export default function ZapierPage() {
  const { preferences, isFetched: _isFetched } = useZapierIntegration()
  const updateZapier = useUpdateZapier()

  const [newTaskWebhook, setNewTaskWebhook] = useState(() => preferences.newTaskWebhook)
  const [taskCompletedWebhook, setTaskCompletedWebhook] = useState(() => preferences.taskCompletedWebhook)
  const [showTask, setShowTask] = useState(false)

  useEffect(() => {
    const initialTimeout = setTimeout(() => setShowTask(false), 3500)
    const interval = setInterval(() => {
      setShowTask(true)
      setTimeout(() => setShowTask(false), 3500)
    }, 5000)
    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="p-12 py-16">
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex -space-x-3">
            <div className="w-12 h-12 rounded-xl bg-surface-container-lowest shadow-sm border border-border-subtle-light flex items-center justify-center z-10">
              <span className="material-symbols-outlined text-[#FF6600]" style={{ fontVariationSettings: "'FILL' 1" }}>
                bolt
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-surface-container-lowest shadow-sm border border-border-subtle-light flex items-center justify-center">
              <span className="material-symbols-outlined text-[#4a90e2]" style={{ fontVariationSettings: "'FILL' 1" }}>
                join_inner
              </span>
            </div>
          </div>
        </div>
        <h1 className="font-display-xl text-display-xl text-on-surface mb-2">Zapier &amp; Make Automation</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Connect FocusFlow with 5,000+ apps to automate your repetitive workflows.
        </p>
      </header>

      <div className="flex gap-10">
        <div className="flex-1 min-w-0 max-w-4xl space-y-10">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-border-subtle-light shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">key</span>
                <h3 className="font-headline-md text-headline-md">API Access</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Active
              </span>
            </div>
            <p className="text-on-surface-variant text-body-md mb-6">
              Use your API key to authenticate FocusFlow in external automation platforms.
            </p>
            <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-xl border border-border-subtle-light">
              <div
                className="flex-1 font-mono text-sm tracking-widest text-on-surface-variant overflow-hidden whitespace-nowrap"
                style={{
                  maskImage: 'linear-gradient(to right, black 40%, transparent 90%)',
                  WebkitMaskImage: 'linear-gradient(to right, black 40%, transparent 90%)',
                }}
              >
                ff_live_5829104x_j92k3ll009s88172vva888
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  className="p-2 hover:bg-surface-container-highest rounded-lg transition-colors text-on-surface-variant"
                  title="Copy Key"
                >
                  <span className="material-symbols-outlined text-lg">content_copy</span>
                </button>
                <button
                  className="p-2 hover:bg-surface-container-highest rounded-lg transition-colors text-on-surface-variant"
                  title="Regenerate"
                >
                  <span className="material-symbols-outlined text-lg">refresh</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <span className="material-symbols-outlined text-primary">webhook</span>
              <h3 className="font-headline-md text-headline-md">Live Webhooks</h3>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-border-subtle-light divide-y divide-border-subtle-light">
              <div className="flex items-center justify-between p-5 hover:bg-surface-container-lowest transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">add_task</span>
                  </div>
                  <div>
                    <p className="font-medium text-on-surface">New Task Created</p>
                    <p className="text-xs text-on-surface-variant">Triggers whenever a task is added to any list.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={newTaskWebhook}
                    onChange={(e) => setNewTaskWebhook(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
              <div className="flex items-center justify-between p-5 hover:bg-surface-container-lowest transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">task_alt</span>
                  </div>
                  <div>
                    <p className="font-medium text-on-surface">Task Completed</p>
                    <p className="text-xs text-on-surface-variant">Triggers when a task is checked off as done.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={taskCompletedWebhook}
                    onChange={(e) => setTaskCompletedWebhook(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <span className="material-symbols-outlined text-primary">grid_view</span>
              <h3 className="font-headline-md text-headline-md">Quick Start Templates</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="group bg-surface-container-lowest p-6 rounded-2xl border border-border-subtle-light hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-[#4A154B] flex items-center justify-center text-white ring-2 ring-surface-container-lowest">
                      <span className="text-[10px] font-bold">#</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white ring-2 ring-surface-container-lowest">
                      <span className="material-symbols-outlined text-sm">blur_on</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
                <p className="font-medium text-on-surface mb-2">Add Slack saved messages to FocusFlow</p>
                <p className="text-xs text-on-surface-variant">
                  Auto-sync your important Slack communications directly into your daily task list.
                </p>
              </div>
              <div className="group bg-surface-container-lowest p-6 rounded-2xl border border-border-subtle-light hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-[#EA4335] flex items-center justify-center text-white ring-2 ring-surface-container-lowest">
                      <span className="material-symbols-outlined text-xs">mail</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white ring-2 ring-surface-container-lowest">
                      <span className="material-symbols-outlined text-sm">blur_on</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
                <p className="font-medium text-on-surface mb-2">Create FocusFlow tasks from new Gmail emails</p>
                <p className="text-xs text-on-surface-variant">
                  Turn starred or labeled emails into actionable tasks without leaving your inbox.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-8 border-t border-border-subtle-light mt-8">
            <button
              type="button"
              className="px-8 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => updateZapier.mutate({
                newTaskWebhook,
                taskCompletedWebhook,
              })}
              disabled={updateZapier.isPending}
            >
              {updateZapier.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="px-8 py-3 bg-surface-container text-on-surface-variant rounded-xl font-semibold hover:bg-surface-container-high transition-colors"
              onClick={() => {
                setNewTaskWebhook(preferences.newTaskWebhook)
                setTaskCompletedWebhook(preferences.taskCompletedWebhook)
              }}
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="w-detail-panel-width shrink-0">
          <div className="glass-panel rounded-2xl border border-border-subtle-light overflow-hidden sticky top-24">
            <div className="p-8 border-b border-border-subtle-light">
              <h4 className="text-label-sm font-bold uppercase tracking-widest text-on-surface-variant/60">
                Live Automation Preview
              </h4>
            </div>

            <div className="p-8 space-y-6">
              <div className="relative bg-surface-container-low rounded-2xl p-6 border border-border-subtle-light overflow-hidden min-h-[320px] flex flex-col items-center justify-center">
                <div className="absolute inset-0 grid grid-cols-8 gap-4 p-4 opacity-10 pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex justify-center">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                    </div>
                  ))}
                </div>
                <div className="relative z-10 w-full">
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className="flex flex-col items-center"
                      style={{ animation: 'bounceSlow 3s ease-in-out infinite' }}
                    >
                      <div className="w-12 h-12 rounded-xl bg-surface-container-lowest shadow-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">mail</span>
                      </div>
                      <span className="text-[10px] mt-2 font-bold text-on-surface-variant">Gmail</span>
                    </div>

                    <div className="flex justify-center relative h-12 w-full">
                      <div className="w-[1px] h-full bg-gradient-to-b from-primary/20 to-primary" />
                      <div className="absolute top-1/2 -translate-y-1/2 bg-primary rounded-full p-1 animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                        <span className="material-symbols-outlined text-xs text-white">bolt</span>
                      </div>
                    </div>

                    <div
                      className={`w-full bg-surface-container-lowest rounded-xl p-4 shadow-xl border border-primary/20 transition-all duration-700 ${
                        showTask
                          ? 'opacity-100 translate-y-0 scale-105'
                          : 'opacity-0 translate-y-4 scale-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-primary/30 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-on-surface">Review client feedback</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-[9px] font-bold text-primary uppercase">
                              via Zapier
                            </span>
                            <span className="text-[9px] text-on-surface-variant/60">Just now</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    lightbulb
                  </span>
                  <h5 className="font-headline-md text-[16px]">Pro Tip</h5>
                </div>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  Use <strong className="text-primary font-semibold">Make</strong> for complex multi-step workflows like
                  syncing project deadlines with your CRM or generating automated weekly reports from completed tasks.
                </p>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-border-subtle-light">
                <h5 className="text-label-sm font-bold uppercase tracking-widest text-on-surface-variant/60 mb-4">
                  Documentation
                </h5>
                <ul className="space-y-3">
                  <li>
                    <a className="flex items-center justify-between text-sm text-on-surface hover:text-primary transition-colors group cursor-pointer">
                      <span>Integration Guide</span>
                      <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        open_in_new
                      </span>
                    </a>
                  </li>
                  <li>
                    <a className="flex items-center justify-between text-sm text-on-surface hover:text-primary transition-colors group cursor-pointer">
                      <span>Webhook Endpoints</span>
                      <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        open_in_new
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
