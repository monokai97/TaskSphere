'use client'

import { useState, useReducer, useCallback, useEffect } from 'react'
import type { Task } from '@/payload-types'
import { TaskItem } from '@/components/tasks/TaskItem'
import { BulkActionBar } from '@/components/tasks/BulkActionBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/common/Skeleton'

interface TaskListProps {
  listId?: number
  status?: 'pending' | 'completed'
  filterImportant?: boolean
  filterHasDueDate?: boolean
  filterExcludeDueToday?: boolean
  additionalGuestId?: string
  searchQuery?: string
  emptyState?: {
    icon?: string
    title?: string
    description?: string
  }
}

const DEFAULT_EMPTY = {
  icon: 'task_alt',
  title: 'No tasks yet',
  description: 'Add a task to get started.',
}

type State = {
  data: { docs: Task[] } | null
  isLoading: boolean
  isError: boolean
  error: Error | null
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; data: { docs: Task[] } }
  | { type: 'FETCH_ERROR'; error: Error }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, isError: false, error: null }
    case 'FETCH_SUCCESS':
      return { ...state, data: action.data, isLoading: false }
    case 'FETCH_ERROR':
      return { ...state, error: action.error, isError: true, isLoading: false }
  }
}

export function TaskList({
  listId,
  status,
  filterImportant,
  filterHasDueDate,
  filterExcludeDueToday,
  additionalGuestId,
  searchQuery,
  emptyState,
}: TaskListProps) {
  const [state, dispatch] = useReducer(reducer, {
    data: null,
    isLoading: true,
    isError: false,
    error: null,
  })

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const fetchTasks = useCallback(async () => {
    dispatch({ type: 'FETCH_START' })
    try {
      const params = new URLSearchParams()
      if (listId) params.set('list', String(listId))
      if (status) params.set('status', status)
      if (filterImportant) params.set('important', 'true')
      if (filterHasDueDate) params.set('hasDueDate', 'true')
      if (filterExcludeDueToday) params.set('excludeDueToday', 'true')
      if (additionalGuestId) params.set('additionalGuestId', additionalGuestId)
      if (searchQuery) params.set('search', searchQuery)
      const res = await fetch(`/api/tasks?${params}`)
      if (!res.ok) throw new Error('Failed to fetch tasks')
      const json = await res.json()
      dispatch({ type: 'FETCH_SUCCESS', data: json })
    } catch (err) {
      dispatch({
        type: 'FETCH_ERROR',
        error: err instanceof Error ? err : new Error('Unknown error'),
      })
    }
  }, [listId, status, filterImportant, filterHasDueDate, filterExcludeDueToday, additionalGuestId, searchQuery])

  useEffect(() => {
    fetchTasks()
  }, [listId, status, searchQuery, fetchTasks])

  const refetch = useCallback(() => fetchTasks(), [fetchTasks])

  const handleToggle = useCallback(
    async (id: number, newStatus: Task['status']) => {
      try {
        const res = await fetch(`/api/tasks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
          }),
        })
        if (!res.ok) throw new Error('Failed to toggle task')
        refetch()
      } catch (err) {
        console.error('Toggle task error:', err)
      }
    },
    [refetch],
  )

  const handleToggleImportant = useCallback(
    async (id: number, important: boolean) => {
      try {
        const res = await fetch(`/api/tasks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ important }),
        })
        if (!res.ok) throw new Error('Failed to toggle important')
        refetch()
      } catch (err) {
        console.error('Toggle important error:', err)
      }
    },
    [refetch],
  )

  const handleClick = useCallback((_id: number) => {
    // TODO: open detail panel
  }, [])

  const toggleSelection = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handleBulkComplete = useCallback(async () => {
    const promises = Array.from(selectedIds).map((id) =>
      fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          completedAt: new Date().toISOString(),
        }),
      }),
    )
    await Promise.all(promises)
    clearSelection()
    refetch()
  }, [selectedIds, clearSelection, refetch])

  const handleBulkDelete = useCallback(async () => {
    const promises = Array.from(selectedIds).map((id) =>
      fetch(`/api/tasks/${id}`, { method: 'DELETE' }),
    )
    await Promise.all(promises)
    clearSelection()
    refetch()
  }, [selectedIds, clearSelection, refetch])

  if (state.isLoading && !state.data) {
    return (
      <div className="space-y-3">
        <Skeleton count={5} />
      </div>
    )
  }

  if (state.isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <span className="material-symbols-outlined text-4xl text-error">error</span>
        <p className="font-body-md text-on-surface font-semibold">Something went wrong</p>
        <p className="font-body-md text-on-surface-variant">{state.error?.message}</p>
        <button
          onClick={refetch}
          className="px-6 py-2 bg-primary text-white rounded-xl font-body-md font-semibold hover:bg-primary/90 transition-colors active:scale-[0.98]"
        >
          Try again
        </button>
      </div>
    )
  }

  if (state.data?.docs?.length === 0) {
    return (
      <EmptyState
        icon={emptyState?.icon || DEFAULT_EMPTY.icon}
        title={emptyState?.title || DEFAULT_EMPTY.title}
        description={emptyState?.description || DEFAULT_EMPTY.description}
      />
    )
  }

  if ((state.data?.docs?.length ?? 0) > 0) {
    return (
      <>
        {selectedIds.size > 0 && (
          <BulkActionBar
            selectedCount={selectedIds.size}
            onMarkCompleted={handleBulkComplete}
            onDelete={handleBulkDelete}
            onClearSelection={clearSelection}
          />
        )}
        <div className="space-y-3">
          {state.data!.docs.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              selected={selectedIds.has(task.id)}
              onSelect={toggleSelection}
              onToggle={handleToggle}
              onToggleImportant={handleToggleImportant}
              onClick={handleClick}
            />
          ))}
        </div>
      </>
    )
  }

  return null
}
