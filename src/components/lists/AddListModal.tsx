'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const ICONS = [
  'list', 'shopping_cart', 'work', 'fitness_center',
  'school', 'home', 'favorite', 'flight',
  'palette', 'restaurant', 'savings', 'more_horiz',
]

const COLORS = [
  { value: '#004ac6', label: 'primary' },
  { value: '#735c00', label: 'secondary' },
  { value: '#666d7f', label: 'tertiary' },
  { value: '#1e3a5f', label: 'blue-dark' },
  { value: '#9a7d0a', label: 'gold' },
]

interface AddListModalProps {
  open: boolean
  onClose: () => void
}

export function AddListModal({ open, onClose }: AddListModalProps) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('list')
  const [color, setColor] = useState('#004ac6')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const isValid = name.trim().length > 0

  const handleSubmit = useCallback(async () => {
    if (!isValid || isSubmitting) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), icon, color }),
      })
      if (!res.ok) throw new Error('Failed to create list')
      queryClient.invalidateQueries({ queryKey: ['lists'] })
      onClose()
    } catch {
      setIsSubmitting(false)
    }
  }, [name, icon, color, isValid, isSubmitting, queryClient, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/30"
      style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden border border-outline-variant/20">
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-headline-md text-on-surface">Nueva lista</h3>
            <button
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="relative mb-8">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
              className="w-full text-display-xl-mobile font-display-xl-mobile text-on-surface bg-transparent border-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 px-0 pb-2 placeholder-on-surface-variant/40"
              placeholder="Sin título"
            />
          </div>

          <div className="mb-8">
            <label className="font-label-sm text-label-sm text-on-surface-variant mb-4 block uppercase tracking-wider">
              Elegir icono
            </label>
            <div className="grid grid-cols-6 gap-2">
              {ICONS.map((icn) => (
                <button
                  key={icn}
                  type="button"
                  onClick={() => setIcon(icn)}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-center ${
                    icon === icn
                      ? 'text-primary bg-primary-container/10 border-primary'
                      : 'text-on-surface-variant border-outline-variant/10 hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined">{icn}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="font-label-sm text-label-sm text-on-surface-variant mb-4 block uppercase tracking-wider">
              Color de la lista
            </label>
            <div className="flex items-center gap-3">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c.value ? 'ring-offset-4 ring-2 ring-primary scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-surface-container-low flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-on-surface-variant font-semibold hover:bg-surface-container-highest transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className={`px-6 py-2.5 rounded-xl bg-primary text-on-primary font-semibold transition-all active:scale-95 ${
              isValid && !isSubmitting
                ? 'hover:bg-primary-container shadow-lg'
                : 'opacity-40 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Creando...' : 'Crear lista'}
          </button>
        </div>
      </div>
    </div>
  )
}
