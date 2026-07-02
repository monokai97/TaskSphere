'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RepeatSubModal } from './RepeatSubModal'
import { RemindMeSubModal } from './RemindMeSubModal'
import { DueDatePickerSubModal } from './DueDatePickerSubModal'
import { CreateCategorySubModal } from './CreateCategorySubModal'

const QUICK_DATES = [
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
] as const

const CATEGORY_PRESETS = [
  { name: 'Work', color: '#004ac6' },
  { name: 'Personal', color: '#735c00' },
  { name: 'Urgent', color: '#ba1a1a' },
  { name: 'Shopping', color: '#666d7f' },
] as const

interface Subtask {
  title: string
}

interface AddTaskModalProps {
  open: boolean
  onClose: () => void
}

export function AddTaskModal({ open, onClose }: AddTaskModalProps) {
  const [title, setTitle] = useState('')
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [subtaskInput, setSubtaskInput] = useState('')
  const [dueDate, setDueDate] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [customCategories, setCustomCategories] = useState<
    { name: string; icon: string; color: string }[]
  >([])
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [repeatType, setRepeatType] = useState<string | null>(null)
  const [repeatInterval, setRepeatInterval] = useState<number>(1)
  const [repeatOpen, setRepeatOpen] = useState(false)
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number | null>(null)
  const [remindOpen, setRemindOpen] = useState(false)
  const [dueDatePickerOpen, setDueDatePickerOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (open) {
      setTimeout(() => titleRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleAddSubtask = useCallback(() => {
    const trimmed = subtaskInput.trim()
    if (trimmed) {
      setSubtasks((prev) => [...prev, { title: trimmed }])
      setSubtaskInput('')
    }
  }, [subtaskInput])

  const handleRemoveSubtask = useCallback((index: number) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubtaskKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleAddSubtask()
      }
    },
    [handleAddSubtask],
  )

  const getDueDateValue = useCallback((due: string) => {
    if (due === 'today') {
      return new Date().toISOString()
    }
    if (due === 'tomorrow') {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow.toISOString()
    }
    return due
  }, [])

  const resetForm = useCallback(() => {
    setTitle('')
    setSubtasks([])
    setSubtaskInput('')
    setDueDate(null)
    setSelectedCategory(null)
    setNotes('')
    setRepeatType(null)
    setRepeatInterval(1)
    setDueDatePickerOpen(false)
    setIsSubmitting(false)
  }, [])

  const handleSubmit = useCallback(async () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle || isSubmitting) return

    setIsSubmitting(true)
    try {
      const body: Record<string, unknown> = {
        title: trimmedTitle,
        description: notes.trim() || undefined,
        subtasks: subtasks.length > 0 ? subtasks : undefined,
        ...(dueDate ? { dueDate: getDueDateValue(dueDate) } : {}),
        ...(repeatType ? { repeatType, repeatInterval } : {}),
      }

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        const message =
          err.error?.fieldErrors?.title?.[0] ||
          err.error?.formErrors?.[0] ||
          'Failed to create task'
        throw new Error(message)
      }

      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      resetForm()
      onClose()
    } catch {
      setIsSubmitting(false)
    }
  }, [title, notes, subtasks, dueDate, getDueDateValue, repeatType, repeatInterval, isSubmitting, queryClient, onClose, resetForm])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/30"
      style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 pb-2">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSubmit() }}
            className="w-full bg-transparent border-none p-0 font-display-xl text-display-xl text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0"
            placeholder="What needs to be done?"
          />
        </div>

        <div className="px-6 py-4 max-h-[716px] overflow-y-auto space-y-8">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">account_tree</span>
                Sub-steps
              </h3>
            </div>
            <div className="space-y-2">
              {subtasks.map((st, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg group transition-all hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-outline-variant">radio_button_unchecked</span>
                  <span className="flex-grow text-task-item text-on-surface">{st.title}</span>
                  <button
                    onClick={() => handleRemoveSubtask(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-outline hover:text-error"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg group transition-all hover:bg-surface-container">
                <span className="material-symbols-outlined text-outline-variant">radio_button_unchecked</span>
                <input
                  type="text"
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={handleSubtaskKeyDown}
                  className="flex-grow bg-transparent border-none p-0 text-task-item focus:ring-0"
                  placeholder="Add a step..."
                />
              </div>
            </div>
            <button
              onClick={handleAddSubtask}
              className="text-primary font-label-sm text-label-sm flex items-center gap-1 mt-2 hover:underline"
            >
              <span className="material-symbols-outlined">add</span>
              Add step
            </button>
          </section>

          <section className="space-y-3">
            <h3 className="font-headline-md text-headline-md flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">event</span>
              Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-label-sm font-label-sm text-on-surface-variant">Due Date</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_DATES.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDueDate(dueDate === d.value ? null : d.value)}
                      className={`px-3 py-1.5 rounded-full border text-label-sm font-label-sm transition-colors active:scale-95 ${
                        dueDate === d.value
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-outline-variant hover:bg-surface-container'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setDueDatePickerOpen(true)}
                    className={`px-3 py-1.5 rounded-full border text-label-sm font-label-sm transition-colors active:scale-95 flex items-center gap-1 ${
                      dueDate && !['today', 'tomorrow'].includes(dueDate)
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-outline-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined !text-[16px]">calendar_today</span>
                    {dueDate && !['today', 'tomorrow'].includes(dueDate)
                      ? new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Pick Date'}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-label-sm font-label-sm text-on-surface-variant">Preferences</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setRemindOpen(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-label-sm transition-colors ${
                      reminderMinutesBefore
                        ? 'bg-primary/10 text-primary border border-primary/30'
                        : 'bg-surface-container-high hover:bg-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined !text-[18px]">notifications</span>
                    {reminderMinutesBefore ? 'Reminder set' : 'Remind me'}
                  </button>
                  <button
                    onClick={() => setRepeatOpen(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-sm font-label-sm transition-colors ${
                      repeatType
                        ? 'bg-primary/10 text-primary border border-primary/30'
                        : 'bg-surface-container-high hover:bg-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined !text-[18px]">repeat</span>
                    {repeatType ? repeatType.charAt(0).toUpperCase() + repeatType.slice(1) : 'Repeat'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-headline-md text-headline-md flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">label</span>
              Category
            </h3>
            <div className="flex flex-wrap gap-2">
              {[...CATEGORY_PRESETS, ...customCategories].map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-label-sm text-label-sm transition-all ${
                    selectedCategory === cat.name
                      ? 'bg-primary/10 border-2 border-primary text-primary shadow-sm'
                      : 'border border-outline-variant hover:border-outline text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </button>
              ))}
              <button
                onClick={() => setCreateCategoryOpen(true)}
                className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-dashed border-outline-variant text-outline hover:text-primary hover:border-primary transition-all"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </section>

          <section className="space-y-3 pb-4">
            <h3 className="font-headline-md text-headline-md flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">notes</span>
              Notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[120px] bg-surface-container-low border border-border-subtle-light rounded-xl p-4 font-body-md text-body-md focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all resize-none placeholder:text-outline-variant"
              placeholder="Add more details or links here..."
            />
          </section>
        </div>

        <div className="p-6 border-t border-surface-container-highest flex items-center justify-between bg-surface-container-lowest">
          <div className="flex items-center gap-2 text-outline-variant">
            <span className="material-symbols-outlined">visibility</span>
            <span className="text-label-sm font-label-sm">Only visible to you</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-high transition-colors active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || isSubmitting}
              className={`px-8 py-2.5 rounded-xl font-label-sm text-label-sm font-bold transition-all duration-200 ${
                title.trim() && !isSubmitting
                  ? 'bg-primary-container text-on-primary-container shadow-lg shadow-primary-container/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-primary-container/50 text-on-primary-container/50 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </div>
      </div>

      <RepeatSubModal
        open={repeatOpen}
        onClose={() => setRepeatOpen(false)}
        onSelect={(selection) => {
          setRepeatType(selection.type)
          if (selection.interval) setRepeatInterval(selection.interval)
          setRepeatOpen(false)
        }}
      />

      <RemindMeSubModal
        open={remindOpen}
        onClose={() => setRemindOpen(false)}
        onSelect={(minutes) => {
          setReminderMinutesBefore(minutes)
          setRemindOpen(false)
        }}
      />

      <DueDatePickerSubModal
        open={dueDatePickerOpen}
        onClose={() => setDueDatePickerOpen(false)}
        onSelect={(dateIso) => {
          setDueDate(dateIso)
          setDueDatePickerOpen(false)
        }}
      />

      <CreateCategorySubModal
        open={createCategoryOpen}
        onClose={() => setCreateCategoryOpen(false)}
        onCreate={(category) => {
          setCustomCategories((prev) => [...prev, category])
          setSelectedCategory(category.name)
          setCreateCategoryOpen(false)
        }}
      />
    </div>
  )
}
