'use client'

interface BulkActionBarProps {
  selectedCount: number
  onMarkCompleted: () => void
  onDelete: () => void
  onClearSelection: () => void
  onSetDueDate?: () => void
  onMoveToList?: () => void
}

export function BulkActionBar({
  selectedCount,
  onMarkCompleted,
  onDelete,
  onClearSelection,
  onSetDueDate,
  onMoveToList,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-md px-4 md:px-12 py-4 border-b border-primary/10 shadow-sm animate-slide-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={onClearSelection}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-variant transition-colors"
            aria-label="Clear selection"
          >
            <span className="material-symbols-outlined text-primary">close</span>
          </button>
          <span className="font-headline-md text-primary font-bold">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onMarkCompleted}
            className="flex items-center gap-2 px-4 py-2 text-on-surface-variant hover:bg-surface-variant transition-all rounded-lg font-label-sm"
          >
            <span className="material-symbols-outlined text-primary">check_circle</span>
            <span className="hidden md:inline">Mark as completed</span>
          </button>

          <button
            onClick={onSetDueDate}
            className="flex items-center gap-2 px-4 py-2 text-on-surface-variant hover:bg-surface-variant transition-all rounded-lg font-label-sm"
          >
            <span className="material-symbols-outlined text-primary">event_upcoming</span>
            <span className="hidden md:inline">Set due date</span>
          </button>

          <button
            onClick={onMoveToList}
            className="flex items-center gap-2 px-4 py-2 text-on-surface-variant hover:bg-surface-variant transition-all rounded-lg font-label-sm"
          >
            <span className="material-symbols-outlined text-primary">drive_file_move</span>
            <span className="hidden md:inline">Move to...</span>
          </button>

          <div className="w-[1px] h-6 bg-outline-variant mx-2" />

          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 text-error hover:bg-error-container/20 transition-all rounded-lg font-label-sm"
          >
            <span className="material-symbols-outlined">delete</span>
            <span className="hidden md:inline">Delete</span>
          </button>
        </div>
      </div>
    </header>
  )
}
