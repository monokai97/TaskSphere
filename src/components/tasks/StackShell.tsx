'use client'

import { useLists } from '@/hooks/useLists'
import { TaskList } from '@/components/tasks/TaskList'
import { AddTaskBar } from '@/components/tasks/AddTaskBar'

const BUILT_IN_VIEWS = ['my day', 'important', 'planned', 'tasks']

interface StackShellProps {
  listName: string
  additionalGuestId?: string
  emptyState: {
    icon: string
    title: string
    description: string
  }
}

function LoadingSkeleton() {
  return (
    <div className="flex-1 px-4 md:px-12 py-6 space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-16 bg-surface-container-high animate-pulse rounded-xl"
        />
      ))}
    </div>
  )
}

export function StackShell({ listName, additionalGuestId, emptyState }: StackShellProps) {
  const { data: listsData, isLoading } = useLists()

  const list = listsData?.docs?.find(
    (l) => l.name.toLowerCase() === listName.toLowerCase(),
  )
  const listId = list?.id

  const isBuiltIn = BUILT_IN_VIEWS.includes(listName.toLowerCase())
  const viewType = listName.toLowerCase().replace(' ', '-')

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!list && !isBuiltIn) {
    return (
      <div className="flex-1 px-4 md:px-12 py-6 flex items-center justify-center">
        <p className="font-body-md text-on-surface-variant">
          List &lsquo;{listName}&rsquo; not found.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 md:px-12 py-6">
        <TaskList
          listId={listId}
          emptyState={emptyState}
          additionalGuestId={additionalGuestId}
          filterImportant={viewType === 'important'}
          filterHasDueDate={viewType === 'planned' || viewType === 'my-day'}
          filterExcludeDueToday={viewType === 'planned'}
        />
      </div>
      <AddTaskBar listId={listId} listName={listName} />
    </div>
  )
}
