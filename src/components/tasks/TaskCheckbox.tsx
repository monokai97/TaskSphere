'use client'

interface TaskCheckboxProps {
  checked: boolean
  onToggle: () => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function TaskCheckbox({
  checked,
  onToggle,
  disabled = false,
  size = 'md',
}: TaskCheckboxProps) {
  const sizeClasses = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'
  const iconSize = size === 'sm' ? 'text-[14px]' : 'text-[18px]'

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) onToggle()
      }}
      disabled={disabled}
      className={[
        'flex items-center justify-center transition-all duration-200 shrink-0 rounded-full',
        sizeClasses,
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        checked
          ? 'bg-primary'
          : 'border-2 border-outline hover:border-primary hover:bg-primary/5',
      ].join(' ')}
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? 'Mark as pending' : 'Mark as completed'}
    >
      {checked && (
        <span
          className={`material-symbols-outlined text-white ${iconSize}`}
          style={{ fontVariationSettings: "'wght' 700" }}
        >
          check
        </span>
      )}
    </button>
  )
}
