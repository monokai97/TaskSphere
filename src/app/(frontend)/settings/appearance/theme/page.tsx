'use client'

import { useState } from 'react'
import { useThemePreferences, useUpdateTheme } from '@/hooks/useTheme'

const THEMES = ['light', 'dark', 'system'] as const
const ACCENTS = [
  { color: '#2563eb', label: 'Blue' },
  { color: '#9333ea', label: 'Purple' },
  { color: '#059669', label: 'Emerald' },
  { color: '#e11d48', label: 'Rose' },
  { color: '#d97706', label: 'Amber' },
  { color: '#475569', label: 'Slate' },
] as const
const DENSITIES = ['Compact', 'Comfortable', 'Spacious'] as const

export default function ThemePage() {
  const { theme: serverTheme, accent: serverAccent, density: serverDensity } = useThemePreferences()
  const updateTheme = useUpdateTheme()

  const [theme, setTheme] = useState(() => serverTheme)
  const [accent, setAccent] = useState(() => serverAccent)
  const [density, setDensity] = useState(() => serverDensity)

  return (
    <div className="p-12 max-w-4xl mx-auto">
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-2">
          <span>Settings</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>Appearance</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-bold">Theme</span>
        </nav>
        <h1 className="text-display-xl font-display-xl text-on-background">Appearance &amp; Themes</h1>
        <p className="text-body-lg text-on-surface-variant mt-2">
          Customize how FocusFlow looks and feels on your device.
        </p>
      </header>

      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-headline-md font-headline-md text-on-surface">Interface Theme</h3>
          <span className="text-label-sm text-primary font-bold px-3 py-1 bg-primary/10 rounded-full">
            3 Options
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setTheme('light')}
            className="group relative flex flex-col text-left focus:outline-none"
          >
            <div
              className={`w-full aspect-[4/3] rounded-xl bg-white border-2 overflow-hidden p-3 transition-transform group-hover:scale-[1.02] active:scale-[0.98] ${
                theme === 'light' ? 'border-primary shadow-lg' : 'border-transparent hover:border-slate-200'
              }`}
            >
              <div className="w-full h-full bg-slate-50 rounded-lg border border-slate-100 flex gap-2 p-2">
                <div className="w-12 h-full bg-white border-r border-slate-100" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 w-2/3 bg-slate-200 rounded" />
                  <div className="h-8 w-full bg-white border border-slate-100 rounded-lg shadow-sm" />
                  <div className="h-8 w-full bg-white border border-slate-100 rounded-lg shadow-sm" />
                </div>
              </div>
              {theme === 'light' && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>
              )}
            </div>
            <span className="mt-4 font-bold text-on-surface">Light Mode</span>
            <span className="text-label-sm text-on-surface-variant">Optimized for daytime focus.</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className="group relative flex flex-col text-left focus:outline-none"
          >
            <div
              className={`w-full aspect-[4/3] rounded-xl bg-zinc-900 border-2 overflow-hidden p-3 transition-transform group-hover:scale-[1.02] active:scale-[0.98] ${
                theme === 'dark' ? 'border-primary shadow-lg' : 'border-transparent hover:border-zinc-700'
              }`}
            >
              <div className="w-full h-full bg-zinc-800 rounded-lg border border-zinc-700 flex gap-2 p-2">
                <div className="w-12 h-full bg-zinc-900 border-r border-zinc-700" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 w-2/3 bg-zinc-700 rounded" />
                  <div className="h-8 w-full bg-zinc-900 border border-zinc-700 rounded-lg" />
                  <div className="h-8 w-full bg-zinc-900 border border-zinc-700 rounded-lg" />
                </div>
              </div>
            </div>
            <span className="mt-4 font-bold text-on-surface">Dark Mode</span>
            <span className="text-label-sm text-on-surface-variant">Easy on the eyes in low light.</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className="group relative flex flex-col text-left focus:outline-none"
          >
            <div
              className={`w-full aspect-[4/3] rounded-xl bg-slate-200 border-2 overflow-hidden p-3 transition-transform group-hover:scale-[1.02] active:scale-[0.98] ${
                theme === 'system' ? 'border-primary shadow-lg' : 'border-transparent hover:border-slate-300'
              }`}
            >
              <div className="w-full h-full flex rounded-lg overflow-hidden border border-slate-300">
                <div className="w-1/2 h-full bg-white p-2 flex flex-col gap-2">
                  <div className="h-3 w-2/3 bg-slate-100 rounded" />
                  <div className="h-8 w-full bg-slate-50 border border-slate-100 rounded-lg" />
                </div>
                <div className="w-1/2 h-full bg-zinc-900 p-2 flex flex-col gap-2">
                  <div className="h-3 w-2/3 bg-zinc-800 rounded" />
                  <div className="h-8 w-full bg-zinc-800 border border-zinc-700 rounded-lg" />
                </div>
              </div>
            </div>
            <span className="mt-4 font-bold text-on-surface">System Sync</span>
            <span className="text-label-sm text-on-surface-variant">Match your OS settings automatically.</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-12">
          <section>
            <h3 className="text-headline-md font-headline-md text-on-surface mb-2">Accent Color</h3>
            <p className="text-body-md text-on-surface-variant mb-6">
              Choose a primary color for buttons and active states.
            </p>
            <div className="flex flex-wrap gap-4">
              {ACCENTS.map(({ color, label }) => (
                <button
                  key={color}
                  onClick={() => setAccent(color)}
                  className="w-12 h-12 rounded-full transition-transform hover:scale-110 active:scale-95 flex items-center justify-center text-white"
                  style={{
                    backgroundColor: color,
                    boxShadow: accent === color ? '0 0 0 2px white, 0 0 0 4px #2563eb' : undefined,
                  }}
                  title={label}
                >
                  {accent === color && (
                    <span className="material-symbols-outlined text-[20px]">check</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-headline-md font-headline-md text-on-surface mb-2">Interface Density</h3>
            <p className="text-body-md text-on-surface-variant mb-6">
              Adjust the spacing between items in your lists.
            </p>
            <div className="flex bg-surface-container-high p-1 rounded-xl w-full max-w-sm">
              {DENSITIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDensity(d)}
                  className={`flex-1 py-2 text-label-sm font-bold rounded-lg transition-colors ${
                    density === d
                      ? 'bg-white shadow-sm text-primary'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-surface-container rounded-3xl p-8 border border-border-subtle-light shadow-sm sticky top-12">
            <h4 className="text-label-sm font-bold text-on-surface-variant tracking-widest mb-6">
              LIVE PREVIEW
            </h4>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all duration-300">
                <div
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer"
                  style={{ borderColor: `${accent}4D` }}
                />
                <div className="flex-1">
                  <p className="text-task-item font-task-item text-on-surface">Update brand identity assets</p>
                  <p className="text-[12px] text-on-surface-variant">Due Tomorrow • Design</p>
                </div>
                <span className="material-symbols-outlined text-[20px]" style={{ color: accent }}>star</span>
              </div>
              <div
                className="bg-white p-4 rounded-xl shadow-md flex items-center gap-4 scale-[1.02] transition-all duration-300"
                style={{ borderColor: accent }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: accent }}
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>
                <div className="flex-1">
                  <p className="text-task-item font-task-item text-on-surface line-through opacity-50">
                    Morning meditation session
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="px-2 py-0.5 text-[10px] rounded font-bold uppercase tracking-wider"
                      style={{ backgroundColor: `${accent}1A`, color: accent }}
                    >
                      Health
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-200">
                <div
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{ backgroundColor: `${accent}0D`, color: accent }}
                >
                  <span className="material-symbols-outlined">info</span>
                  <p className="text-label-sm italic">
                    Showing &apos;{ACCENTS.find((a) => a.color === accent)?.label}&apos; accent with &apos;{density}&apos; density
                    in &apos;{theme === 'system' ? 'System Sync' : theme === 'light' ? 'Light Mode' : 'Dark Mode'}&apos;.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              className="px-6 py-2 text-label-sm font-bold text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all"
              onClick={() => {
                setTheme('system')
                setAccent('#2563eb')
                setDensity('Comfortable')
              }}
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              className="px-8 py-2 bg-primary text-white text-label-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => updateTheme.mutate({ theme, accent, density })}
              disabled={updateTheme.isPending}
            >
              {updateTheme.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
