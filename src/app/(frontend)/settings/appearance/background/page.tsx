'use client'

import { useState } from 'react'
import { useBackgroundPreferences, useUpdateBackground } from '@/hooks/useBackground'

type BackgroundMode = 'solid' | 'gradient' | 'texture' | 'image'

export default function BackgroundPage() {
  const { preferences } = useBackgroundPreferences()
  const updateBg = useUpdateBackground()

  const [mode, setMode] = useState<BackgroundMode>(() => preferences.mode)
  const [blur, setBlur] = useState(() => preferences.blur)
  const [opacity, setOpacity] = useState(() => preferences.opacity)

  return (
    <div className="p-12 max-w-4xl mx-auto">
      <header className="mb-12">
        <div className="flex items-center gap-2 text-primary font-label-sm uppercase tracking-widest mb-2">
          <span>Settings</span>
          <span className="text-on-surface-variant mx-0.5">/</span>
          <span className="text-on-surface-variant">Appearance</span>
        </div>
        <h2 className="font-display-xl text-display-xl text-on-surface mb-4">Background</h2>
        <p className="font-body-lg text-on-surface-variant max-w-xl">
          Personalize your workspace with textures, gradients, or solid colors to enhance your focus.
        </p>
      </header>

      <div className="space-y-12">
        <section>
          <h3 className="font-headline-md text-headline-md mb-6">Background Mode</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { key: 'solid' as const, icon: 'rectangle', label: 'Solid' },
              { key: 'gradient' as const, icon: 'gradient', label: 'Gradient' },
              { key: 'texture' as const, icon: 'texture', label: 'Texture' },
              { key: 'image' as const, icon: 'image', label: 'Image' },
            ].map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all group ${
                  mode === key
                    ? 'border-primary bg-primary-container/5'
                    : 'border-transparent hover:border-outline-variant'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-outline-variant flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span
                    className={`material-symbols-outlined ${mode === key ? 'text-primary' : 'text-outline'}`}
                  >
                    {icon}
                  </span>
                </div>
                <span className={`font-label-sm ${mode === key ? 'text-primary font-bold' : 'text-outline'}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-headline-md">Solid Colors</h3>
            <button className="text-primary font-label-sm hover:underline">View all</button>
          </div>
          <div className="grid grid-cols-6 gap-4">
            <div className="aspect-square rounded-full bg-surface-container-lowest border-2 border-primary cursor-pointer ring-4 ring-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'wght' 700" }}>check</span>
            </div>
            <div className="aspect-square rounded-full bg-surface-container-low border border-border-subtle-light cursor-pointer hover:scale-110 transition-transform" />
            <div className="aspect-square rounded-full bg-primary-container/20 border border-border-subtle-light cursor-pointer hover:scale-110 transition-transform" />
            <div className="aspect-square rounded-full bg-secondary-container/20 border border-border-subtle-light cursor-pointer hover:scale-110 transition-transform" />
            <div className="aspect-square rounded-full bg-tertiary-fixed/30 border border-border-subtle-light cursor-pointer hover:scale-110 transition-transform" />
            <div className="aspect-square rounded-full bg-outline-variant/20 border border-border-subtle-light cursor-pointer hover:scale-110 transition-transform" />
          </div>
        </section>

        <section>
          <h3 className="font-headline-md text-headline-md mb-6">Default Gradients</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="group cursor-pointer">
              <div className="h-24 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-border-subtle-light mb-2 group-hover:shadow-lg transition-all" />
              <span className="font-label-sm text-on-surface">Ocean Haze</span>
            </div>
            <div className="group cursor-pointer">
              <div className="h-24 rounded-2xl bg-gradient-to-br from-orange-50 to-rose-100 border border-border-subtle-light mb-2 group-hover:shadow-lg transition-all" />
              <span className="font-label-sm text-on-surface">Sunset Glow</span>
            </div>
            <div className="group cursor-pointer">
              <div className="h-24 rounded-2xl bg-gradient-to-br from-zinc-100 to-slate-300 border border-border-subtle-light mb-2 group-hover:shadow-lg transition-all" />
              <span className="font-label-sm text-on-surface">Midnight Aurora</span>
            </div>
          </div>
        </section>

        <section className="p-8 bg-surface-container-low rounded-3xl">
          <h3 className="font-headline-md text-headline-md mb-8">Opacity &amp; Effects</h3>
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="font-label-sm text-on-surface-variant font-bold">Background Blur</label>
                <span className="font-label-sm text-primary">{blur}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={blur}
                onChange={(e) => setBlur(Number(e.target.value))}
                className="w-full h-1.5 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="font-label-sm text-on-surface-variant font-bold">Layer Opacity</label>
                <span className="font-label-sm text-primary">{opacity}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full h-1.5 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        </section>

        <div className="flex items-center gap-4 pt-8 border-t border-border-subtle-light">
          <button
            type="button"
            className="px-8 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => updateBg.mutate({ mode, blur, opacity })}
            disabled={updateBg.isPending}
          >
            {updateBg.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            className="px-8 py-3 bg-surface-container text-on-surface-variant rounded-xl font-semibold hover:bg-surface-container-high transition-colors"
            onClick={() => {
              setMode(preferences.mode)
              setBlur(preferences.blur)
              setOpacity(preferences.opacity)
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
