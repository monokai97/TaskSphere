'use client'

import { useState } from 'react'
import { useProfile, useUpsertProfile } from '@/hooks/useProfile'

export default function RolePage() {
  const { data: profile } = useProfile()
  const { mutate: saveProfile, isPending } = useUpsertProfile()
  const [role, setRole] = useState<string | undefined>(undefined)
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved'>('idle')

  const currentRole = role ?? profile?.role ?? 'designer'

  const handleSave = () => {
    setSaving('saving')
    saveProfile(
      { role: currentRole as 'designer' | 'admin' | 'manager' | 'viewer' },
      {
        onSuccess: () => {
          setSaving('saved')
          setTimeout(() => setSaving('idle'), 2000)
        },
        onError: () => setSaving('idle'),
      },
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-12 py-16">
      <header className="mb-12">
        <h1 className="font-display-xl text-display-xl font-bold text-on-surface mb-2">
          Account Role &amp; Plan
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Manage your organizational identity and access controls. Your role determines which
          dashboards and workspace tools are visible to you.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <section className="bg-surface-container-lowest border border-border-subtle-light rounded-2xl p-8 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-headline-md text-headline-md font-bold mb-1">
                Workspace Identity
              </h3>
              <p className="text-sm text-on-surface-variant">
                Current role within the organizational chart.
              </p>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Active Status
            </div>
          </div>
          <div className="flex items-center gap-6 bg-surface-container-low p-6 rounded-xl border border-border-subtle-light">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined">shield_person</span>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-on-surface-variant/70 uppercase tracking-wide mb-1">
                Assigned Role
              </label>
              <div className="relative w-full max-w-xs">
                <select
                  value={currentRole}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-transparent border-none p-0 font-headline-md text-headline-md font-bold focus:ring-0 appearance-none cursor-pointer pr-6"
                >
                  <option value="designer">Product Designer</option>
                  <option value="admin">Workspace Admin</option>
                  <option value="manager">Project Manager</option>
                  <option value="viewer">Guest Contributor</option>
                </select>
                <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                  unfold_more
                </span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">info</span>
            Changing your role may require approval from your Workspace Admin if switching to an
            administrative tier.
          </p>
        </section>

        <section className="relative overflow-hidden bg-primary-container rounded-2xl p-8 text-white shadow-xl shadow-primary/10">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  <span className="text-sm font-bold uppercase tracking-widest">Premium Tier</span>
                </div>
                <h3 className="font-display-xl text-display-xl font-bold">Pro Plan</h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">$19</div>
                <div className="text-xs opacity-70">per user / month</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <span className="material-symbols-outlined mb-2 block">all_inclusive</span>
                <h4 className="font-bold text-sm mb-1">Unlimited Tasks</h4>
                <p className="text-xs opacity-80 leading-relaxed">No caps on project or task creation.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <span className="material-symbols-outlined mb-2 block">monitoring</span>
                <h4 className="font-bold text-sm mb-1">Advanced Analytics</h4>
                <p className="text-xs opacity-80 leading-relaxed">Granular productivity heatmaps and exports.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <span className="material-symbols-outlined mb-2 block">support_agent</span>
                <h4 className="font-bold text-sm mb-1">Priority Support</h4>
                <p className="text-xs opacity-80 leading-relaxed">24/7 dedicated assistance with &lt; 1hr response.</p>
              </div>
            </div>
            <button className="mt-8 w-full py-4 bg-white text-primary font-bold rounded-xl transition-all hover:bg-on-primary-fixed-variant hover:text-white">
              Manage Subscription
            </button>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-60 h-60 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        </section>

        <section className="bg-surface-container-lowest border border-border-subtle-light rounded-2xl p-8 shadow-sm">
          <h3 className="font-headline-md text-headline-md font-bold mb-6">Assigned Workspace</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border-subtle-light rounded-xl hover:bg-surface-container-low transition-colors group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined">corporate_fare</span>
                </div>
                <div>
                  <p className="font-bold">Design Systems HQ</p>
                  <p className="text-xs text-on-surface-variant">Primary workspace (32 members)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary">Active</span>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-border-subtle-light rounded-xl hover:bg-surface-container-low transition-colors group cursor-pointer opacity-70">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-tertiary-container flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">science</span>
                </div>
                <div>
                  <p className="font-bold">Labs &amp; Prototyping</p>
                  <p className="text-xs text-on-surface-variant">Experimental projects (4 members)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-on-surface-variant/50">Switch</span>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-12 pt-8 border-t border-border-subtle-light flex justify-end items-center gap-4">
        <button className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isPending || saving === 'saving'}
          className={`px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all ${
            saving === 'saved'
              ? 'bg-emerald-600 text-white shadow-emerald-600/20'
              : 'bg-primary text-white shadow-primary/20 hover:opacity-90 active:scale-95'
          }`}
        >
          {saving === 'saving' ? 'Saving...' : saving === 'saved' ? 'Saved!' : 'Save Changes'}
        </button>
      </footer>
    </div>
  )
}
