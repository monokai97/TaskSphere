'use client'

import { useState } from 'react'
import { useGitHubIntegration, useUpdateGitHub } from '@/hooks/useGitHub'

export default function GitHubPage() {
  const { preferences } = useGitHubIntegration()
  const updateGitHub = useUpdateGitHub()

  const [importIssues, setImportIssues] = useState(() => preferences.importIssues)
  const [syncPRReviews, setSyncPRReviews] = useState(() => preferences.syncPRReviews)
  const [updateOnCommit, setUpdateOnCommit] = useState(() => preferences.updateOnCommit)
  const [mobileCore, setMobileCore] = useState(true)
  const [personalBlog, setPersonalBlog] = useState(false)
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <div className="p-12 py-16">
      <nav className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant mb-6">
        <span className="hover:text-primary transition-colors cursor-default">Settings</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="hover:text-primary transition-colors cursor-default">Integrations</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-semibold">GitHub &amp; GitLab</span>
      </nav>

      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            <div className="w-12 h-12 rounded-full bg-[#24292e] border-2 border-surface flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-[20px]">code</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#FC6D26] border-2 border-surface flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-[20px]">merge_type</span>
            </div>
          </div>
          <div>
            <h1 className="font-display-xl text-display-xl text-on-surface leading-tight">
              GitHub &amp; GitLab Integration
            </h1>
            <p className="text-body-md text-on-surface-variant">
              Manage your development workflow within your task manager.
            </p>
          </div>
        </div>
      </header>

      <div className="flex gap-10">
        <div className="flex-1 min-w-0 max-w-4xl space-y-10">
          <section className="bg-surface-container-lowest rounded-xl p-6 border border-border-subtle-light shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-2xl">person</span>
              </div>
              <div>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                  Connected Account
                </p>
                <h3 className="font-headline-md text-headline-md text-on-surface">@alexrivera</h3>
              </div>
            </div>
            <button className="px-6 py-2.5 border border-error text-error font-label-sm text-label-sm rounded-xl hover:bg-error/5 transition-colors shrink-0">
              Disconnect
            </button>
          </section>

          <section className="mb-12">
            <h4 className="font-headline-md text-headline-md mb-6 px-1">Sync Preferences</h4>
            <div className="bg-surface-container-lowest rounded-xl border border-border-subtle-light overflow-hidden divide-y divide-border-subtle-light">
              <label className="flex items-center justify-between p-6 hover:bg-surface-container-low/30 transition-colors cursor-pointer group">
                <div className="pr-4">
                  <p className="font-body-md text-body-md font-semibold text-on-surface">Import Issues as Tasks</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant mt-0.5">
                    Automatically create FocusFlow tasks for assigned issues across selected repos.
                  </p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={importIssues}
                    onChange={(e) => setImportIssues(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </div>
              </label>
              <label className="flex items-center justify-between p-6 hover:bg-surface-container-low/30 transition-colors cursor-pointer">
                <div className="pr-4">
                  <p className="font-body-md text-body-md font-semibold text-on-surface">Sync Pull Request Reviews</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant mt-0.5">
                    Get notified and create ephemeral tasks when a PR requires your attention.
                  </p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={syncPRReviews}
                    onChange={(e) => setSyncPRReviews(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </div>
              </label>
              <label className="flex items-center justify-between p-6 hover:bg-surface-container-low/30 transition-colors cursor-pointer">
                <div className="pr-4">
                  <p className="font-body-md text-body-md font-semibold text-on-surface">Update Status on Commit</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant mt-0.5">
                    Automatically mark tasks as complete when a linked commit is pushed.
                  </p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={updateOnCommit}
                    onChange={(e) => setUpdateOnCommit(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </div>
              </label>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6 px-1">
              <h4 className="font-headline-md text-headline-md">Repository Mapping</h4>
              <button className="text-primary font-label-sm text-label-sm flex items-center gap-1 hover:underline">
                <span className="material-symbols-outlined text-[18px]">sync</span>
                Refresh List
              </button>
            </div>
            <div
              className={`relative mb-4 transition-transform duration-200 ${searchFocused ? 'scale-[1.01]' : ''}`}
            >
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/60">
                search
              </span>
              <input
                type="text"
                className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest border border-border-subtle-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/40"
                placeholder="Search repositories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 bg-surface-container-lowest border border-border-subtle-light rounded-xl hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">book</span>
                  <div>
                    <p className="font-body-md text-body-md font-semibold text-on-surface">focus-flow/mobile-core</p>
                    <p className="text-label-sm font-label-sm text-on-surface-variant">Last synced 2m ago</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer scale-90 shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={mobileCore}
                    onChange={(e) => setMobileCore(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-container-lowest border border-border-subtle-light rounded-xl hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">book</span>
                  <div>
                    <p className="font-body-md text-body-md font-semibold text-on-surface">alexrivera/personal-blog</p>
                    <p className="text-label-sm font-label-sm text-on-surface-variant">Disconnected</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer scale-90 shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={personalBlog}
                    onChange={(e) => setPersonalBlog(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-4 pt-8 border-t border-border-subtle-light mt-8">
            <button
              type="button"
              className="px-8 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => updateGitHub.mutate({
                importIssues,
                syncPRReviews,
                updateOnCommit,
              })}
              disabled={updateGitHub.isPending}
            >
              {updateGitHub.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="px-8 py-3 bg-surface-container text-on-surface-variant rounded-xl font-semibold hover:bg-surface-container-high transition-colors"
              onClick={() => {
                setImportIssues(preferences.importIssues)
                setSyncPRReviews(preferences.syncPRReviews)
                setUpdateOnCommit(preferences.updateOnCommit)
              }}
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="w-detail-panel-width shrink-0">
          <div className="glass-panel rounded-2xl border border-border-subtle-light overflow-hidden sticky top-24">
            <div className="p-8 border-b border-border-subtle-light">
              <h4 className="text-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-widest">
                Live Preview
              </h4>
            </div>

            <div className="p-8 space-y-8">
              <div className="bg-surface-container-lowest rounded-xl shadow-xl p-5 border border-primary/10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-surface-container-highest text-on-surface px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">code</span>
                      GITHUB
                    </div>
                    <span className="text-label-sm font-label-sm text-on-surface-variant/60">#402</span>
                  </div>
                  <span className="text-on-surface-variant/40 hover:text-primary transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  </span>
                </div>
                <h5 className="text-[15px] font-semibold text-on-surface mb-4 leading-snug">
                  Fix: Layout reflow issues on Safari mobile during sidebar collapse animation
                </h5>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1">
                    {[...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border-2 border-surface-container-lowest overflow-hidden bg-surface-container-highest"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-label-sm text-on-surface-variant">Assigned to you</span>
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                <div className="flex items-center gap-2 text-primary mb-3">
                  <span className="material-symbols-outlined text-[20px]">lightbulb</span>
                  <h6 className="text-label-sm font-bold uppercase tracking-wider">FocusFlow Tip</h6>
                </div>
                <p className="text-body-md text-on-surface-variant mb-4 leading-relaxed">
                  Automate your workflow by including the task ID in your branch names. Pushing{' '}
                  <span className="bg-primary/10 px-1 rounded text-primary font-mono text-sm">feat/fix-sidebar-402</span>
                  {' '}will automatically link your progress and move the task to &apos;In Review&apos;.
                </p>
                <button className="text-primary font-semibold text-label-sm hover:underline">
                  Learn more about triggers &rarr;
                </button>
              </div>

              <div className="bg-surface-container-lowest border border-border-subtle-light rounded-xl p-6">
                <p className="text-label-sm text-label-sm text-on-surface-variant mb-4 uppercase">
                  Integrations Health
                </p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-bold text-on-surface">98.2%</span>
                  <span className="text-green-600 text-label-sm font-bold pb-1 flex items-center">
                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span> 2.1%
                  </span>
                </div>
                <p className="text-label-sm text-on-surface-variant/70">
                  Successful sync operations over the last 30 days.
                </p>
                <div className="mt-6 flex gap-1 h-2 w-full rounded-full overflow-hidden bg-surface-container">
                  <div className="h-full bg-primary w-[98%]" />
                  <div className="h-full bg-surface-variant w-[2%]" />
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-border-subtle-light flex items-center justify-between text-on-surface-variant/50 text-[11px]">
              <span>Version 2.4.1</span>
              <span>API Stable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
