'use client'

export function DetailPanel({
  children,
  open = false,
  onClose,
  className = '',
}: {
  children?: React.ReactNode
  open?: boolean
  onClose?: () => void
  className?: string
}) {
  return (
    <aside
      className={`w-detail-panel-width h-screen sticky top-0 overflow-y-auto glass-panel flex-col border-l border-subtle-light dark:border-subtle-dark ${
        open ? 'flex' : 'hidden'
      } lg:flex ${className}`}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-surface-container transition-colors lg:hidden"
          aria-label="Cerrar panel"
        >
          <span className="material-symbols-outlined text-on-surface-variant">close</span>
        </button>
      )}
      {children}
    </aside>
  )
}
