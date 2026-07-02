'use client'

import { useState, useEffect } from 'react'

const ICON_OPTIONS = [
  'category',
  'rocket_launch',
  'auto_awesome',
  'work',
  'fitness_center',
  'more_horiz',
] as const

const COLOR_OPTIONS = [
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#a1a1aa',
  '#18181b',
] as const

interface CreateCategorySubModalProps {
  open: boolean
  onClose: () => void
  onCreate: (category: { name: string; icon: string; color: string }) => void
}

export function CreateCategorySubModal({
  open,
  onClose,
  onCreate,
}: CreateCategorySubModalProps) {
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<(typeof ICON_OPTIONS)[number]>(ICON_OPTIONS[0])
  const [selectedColor, setSelectedColor] = useState<(typeof COLOR_OPTIONS)[number]>(COLOR_OPTIONS[0])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleCreate = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onCreate({ name: trimmed, icon: selectedIcon, color: selectedColor })
    onClose()
  }

  if (!open) return null

  return (
    <div
      key={String(open)}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="fixed inset-0 bg-on-surface/20"
        style={{
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/30 overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-6 py-5 border-b border-surface-container-highest flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            New Category
          </h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label
              className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider"
              htmlFor="category-name"
            >
              Category Name
            </label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
              }}
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-body-md font-body-md"
              placeholder="e.g. Deep Work, Personal, Fitness"
            />
          </div>

          <div className="space-y-3">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Select Icon
            </label>
            <div className="grid grid-cols-6 gap-3">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={`h-10 w-10 flex items-center justify-center rounded-lg transition-all ${
                    selectedIcon === icon
                      ? 'bg-primary-container/10 text-primary border border-primary/20'
                      : 'hover:bg-surface-variant text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Category Color
            </label>
            <div className="grid grid-cols-8 gap-3">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`h-8 w-8 rounded-full transition-all duration-200 ${
                    selectedColor === color
                      ? 'ring-2 ring-white ring-4 ring-offset-2 ring-offset-transparent'
                      : ''
                  }`}
                  style={{
                    backgroundColor: color,
                    boxShadow:
                      selectedColor === color
                        ? `0 0 0 2px white, 0 0 0 4px ${color}`
                        : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-5 bg-surface-container-low border-t border-surface-container-highest flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-body-md text-on-surface-variant hover:bg-surface-variant transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className={`px-6 py-2.5 rounded-lg font-headline-md shadow-lg transition-all ${
              name.trim()
                ? 'bg-primary text-white shadow-primary/20 hover:bg-primary-container hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-primary/50 text-white/50 cursor-not-allowed'
            }`}
          >
            Create Category
          </button>
        </div>
      </div>
    </div>
  )
}
