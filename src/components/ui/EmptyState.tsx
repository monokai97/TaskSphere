interface EmptyStateProps {
  icon: string
  title: string
  description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center">
      <span className="material-symbols-outlined text-6xl text-on-surface-variant/40">
        {icon}
      </span>
      <h2 className="font-heading-sm text-on-surface">{title}</h2>
      <p className="font-body-md text-on-surface-variant max-w-sm">{description}</p>
    </div>
  )
}
