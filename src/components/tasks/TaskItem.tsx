'use client'

import { memo, useCallback } from 'react'
import type { Task } from '@/payload-types'
import { TaskCheckbox } from '@/components/tasks/TaskCheckbox'

interface TaskItemProps {
  task: Task
  onToggle: (id: number, status: Task['status']) => void
  onToggleImportant: (id: number, important: boolean) => void
  onClick?: (id: number) => void
  selected?: boolean
  onSelect?: (id: number) => void
}

function formatDueDate(date: string): string {
  const due = new Date(date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (due.toDateString() === today.toDateString()) return 'Today'
  if (due.toDateString() === tomorrow.toDateString()) return 'Tomorrow'

  return due.toLocaleDateString('es', { month: 'short', day: 'numeric' })
}

export const TaskItem = memo(function TaskItem({
  task,
  onToggle,
  onToggleImportant,
  onClick,
  selected,
  onSelect,
}: TaskItemProps) {
  const handleToggle = useCallback(() => {
    onToggle(task.id, task.status === 'pending' ? 'completed' : 'pending')
  }, [task.id, task.status, onToggle])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (onSelect && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        onSelect(task.id)
        return
      }
      onClick?.(task.id)
    },
    [task.id, onClick, onSelect],
  )

  const handleToggleImportant = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onToggleImportant(task.id, !task.important)
    },
    [task.id, task.important, onToggleImportant],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick?.(task.id)
      }
    },
    [task.id, onClick],
  )

  const listName = typeof task.list === 'object' ? task.list?.name : null
  const listIcon = typeof task.list === 'object' ? task.list?.icon : 'list'
  const isCompleted = task.status === 'completed'

  return (
    <div
      role="listitem"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={[
        'group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer',
        'bg-surface-container-lowest',
        isCompleted ? 'opacity-50 grayscale-[0.2]' : '',
        selected
          ? 'border-primary/20 bg-primary-fixed/10 shadow-sm'
          : 'border-transparent hover:border-outline-variant hover:shadow-sm',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <TaskCheckbox checked={isCompleted} onToggle={handleToggle} />

      <div className="flex-1 min-w-0">
        <p
          className={
            'font-task-item text-body-md truncate ' +
            (isCompleted ? 'line-through text-on-surface/50' : 'text-on-surface')
          }
        >
          {task.title}
        </p>

        {(task.dueDate || listName) && (
          <div className="flex items-center gap-3 mt-1">
            {task.dueDate && (
              <span className="font-label-sm text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  calendar_today
                </span>
                {formatDueDate(task.dueDate)}
              </span>
            )}
            {listName && (
              <span className="font-label-sm text-text-secondary-light flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  {listIcon || 'list'}
                </span>
                {listName}
              </span>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleToggleImportant}
        aria-label={task.important ? 'Quitar importante' : 'Marcar importante'}
        className={
          'transition-colors shrink-0 ' +
          (task.important
            ? 'text-secondary'
            : 'text-outline-variant group-hover:text-outline')
        }
      >
        <span
          className="material-symbols-outlined text-[20px]"
          style={
            task.important
              ? { fontVariationSettings: "'FILL' 1" }
              : undefined
          }
        >
          star
        </span>
      </button>

      <span className="material-symbols-outlined text-[20px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0">
        drag_indicator
      </span>
    </div>
  )
})
