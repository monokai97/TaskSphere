'use client'

import { useState, useCallback, useRef } from 'react'
import { DueDatePickerSubModal } from './DueDatePickerSubModal'
import { RemindMeSubModal } from './RemindMeSubModal'
import { RepeatSubModal } from './RepeatSubModal'

interface AddTaskBarProps {
  listId?: number
  listName?: string
  onTaskCreated?: () => void
}

type AddTaskBarState = 'collapsed' | 'focused' | 'submitting' | 'error'

export function AddTaskBar({ listId, listName, onTaskCreated }: AddTaskBarProps) {
  const [inputValue, setInputValue] = useState('')
  const [state, setState] = useState<AddTaskBarState>('collapsed')
  const [error, setError] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState<string | null>(null)
  const [dueDatePickerOpen, setDueDatePickerOpen] = useState(false)
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number | null>(null)
  const [remindOpen, setRemindOpen] = useState(false)
  const [repeatType, setRepeatType] = useState<string | null>(null)
  const [repeatInterval, setRepeatInterval] = useState<number>(1)
  const [repeatOpen, setRepeatOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const createTask = useCallback(
    async (title: string) => {
      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            ...(listId ? { list: listId } : {}),
            ...(dueDate ? { dueDate } : {}),
            ...(reminderMinutesBefore ? { reminderMinutesBefore } : {}),
            ...(repeatType ? { repeatType, repeatInterval } : {}),
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          const message =
            err.error?.fieldErrors?.title?.[0] ||
            err.error?.formErrors?.[0] ||
            'Failed to create task'
          throw new Error(message)
        }
        setInputValue('')
        setDueDate(null)
        setReminderMinutesBefore(null)
        setRepeatType(null)
        setRepeatInterval(1)
        setError(null)
        setState('collapsed')
        inputRef.current?.blur()
        onTaskCreated?.()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        setState('error')
      }
    },
    [listId, dueDate, reminderMinutesBefore, repeatType, repeatInterval, onTaskCreated],
  )

  const handleSubmit = useCallback(() => {
    const trimmed = inputValue.trim()
    if (trimmed.length < 3) {
      setError('Title must be at least 3 characters')
      setState('error')
      return
    }
    setState('submitting')
    createTask(trimmed)
  }, [inputValue, createTask])

  const handleFocus = useCallback(() => {
    setState('focused')
  }, [])

  const handleBlur = useCallback(() => {
    if (!inputValue.trim()) {
      setState('collapsed')
      setError(null)
    }
  }, [inputValue])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
      if (state === 'error') {
        setError(null)
        setState('focused')
      }
    },
    [state],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      } else if (e.key === 'Escape') {
        setInputValue('')
        setError(null)
        setState('collapsed')
        inputRef.current?.blur()
      }
    },
    [handleSubmit],
  )

  const isCollapsed = state === 'collapsed'
  const isSubmitting = state === 'submitting'
  const isError = state === 'error'

  const containerBorder = isError
    ? 'border-error/50'
    : state === 'focused'
      ? 'border-primary/20'
      : 'border-border-subtle-light'

  const containerRing = state === 'focused' ? 'ring-2 ring-primary/10' : ''
  const hoverScale = isCollapsed ? 'hover:scale-[1.01]' : ''

  return (
    <div className="fixed bottom-8 lg:bottom-8 max-lg:bottom-20 left-0 lg:left-sidebar-width right-0 flex justify-center pointer-events-none px-4 md:px-6 lg:px-12 z-50">
      <div
        className={`w-full max-w-4xl pointer-events-auto bg-white/95 border ${containerBorder} ${containerRing} shadow-2xl rounded-2xl p-2 flex items-center gap-2 backdrop-blur-md transition-all duration-300 ${hoverScale}`}
      >
        <div className="p-2">
          {isSubmitting ? (
            <span className="material-symbols-outlined text-primary animate-spin">
              progress_activity
            </span>
          ) : (
            <span className="material-symbols-outlined text-primary">add</span>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={
            isSubmitting
              ? 'Creating...'
              : `Add a task to '${listName || 'Tasks'}'...`
          }
          disabled={isSubmitting}
          className="flex-1 bg-transparent border-none focus:ring-0 text-body-lg font-task-item outline-none disabled:opacity-50"
        />

        {state === 'focused' && (
          <div className="flex items-center gap-1 pr-2">
            <button
              type="button"
              className={`p-2 rounded-lg transition-colors ${
                dueDate
                  ? 'text-primary bg-primary/10'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
              title="Set due date"
              tabIndex={-1}
              onMouseDown={(e) => {
                e.preventDefault()
                setDueDatePickerOpen(true)
              }}
            >
              <span className="material-symbols-outlined">calendar_month</span>
            </button>
            <button
              type="button"
              className={`p-2 rounded-lg transition-colors ${
                reminderMinutesBefore
                  ? 'text-primary bg-primary/10'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
              title="Set reminder"
              tabIndex={-1}
              onMouseDown={(e) => {
                e.preventDefault()
                setRemindOpen(true)
              }}
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button
              type="button"
              className={`p-2 rounded-lg transition-colors ${
                repeatType
                  ? 'text-primary bg-primary/10'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
              title="Repeat"
              tabIndex={-1}
              onMouseDown={(e) => {
                e.preventDefault()
                setRepeatOpen(true)
              }}
            >
              <span className="material-symbols-outlined">repeat</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <p
          className="text-label-sm text-error px-2 mt-1 w-full max-w-4xl pointer-events-auto"
          role="alert"
        >
          {error}
        </p>
      )}

      <DueDatePickerSubModal
        open={dueDatePickerOpen}
        onClose={() => setDueDatePickerOpen(false)}
        onSelect={(dateIso) => {
          setDueDate(dateIso)
          setDueDatePickerOpen(false)
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

      <RepeatSubModal
        open={repeatOpen}
        onClose={() => setRepeatOpen(false)}
        onSelect={(selection) => {
          setRepeatType(selection.type)
          if (selection.interval) setRepeatInterval(selection.interval)
          setRepeatOpen(false)
        }}
      />
    </div>
  )
}
