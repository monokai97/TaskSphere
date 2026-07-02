interface SkeletonProps {
  className?: string
  count?: number
}

export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`h-16 bg-surface-container-high animate-pulse rounded-xl ${className}`}
        />
      ))}
    </>
  )
}
