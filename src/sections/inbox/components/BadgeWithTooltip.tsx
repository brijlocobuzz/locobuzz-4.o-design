import { ReactNode } from 'react'

export interface BadgeWithTooltipProps {
  label: string // "Sentiment", "Priority", etc.
  value: string // "Positive", "High", etc.
  description: string // Helpful explanation
  icon?: ReactNode // Emoji or Lucide icon component
  className?: string // Tailwind classes for badge styling
  tooltipPosition?: 'top' | 'bottom'
  children?: ReactNode // Badge content (overrides icon + value if provided)
}

export function BadgeWithTooltip({
  label,
  value,
  description,
  icon,
  className = '',
  tooltipPosition = 'top',
  children,
}: BadgeWithTooltipProps) {
  const tooltipPositionClasses =
    tooltipPosition === 'top'
      ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
      : 'top-full left-1/2 -translate-x-1/2 mt-2'

  return (
    <div className="group/badge relative inline-flex">
      {/* Badge Content */}
      <span className={`inline-flex items-center gap-1 ${className}`}>
        {children || (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{value}</span>
          </>
        )}
      </span>

      {/* Tooltip */}
      <div
        className={`pointer-events-none absolute z-50 ${tooltipPositionClasses} w-max max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg opacity-0 transition-opacity duration-200 group-hover/badge:opacity-100 dark:border-slate-700 dark:bg-slate-800`}
      >
        {/* Tooltip Arrow */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 ${
            tooltipPosition === 'top'
              ? 'top-full -mt-px border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white dark:border-t-slate-800'
              : 'bottom-full -mb-px border-b-8 border-l-8 border-r-8 border-b-white border-l-transparent border-r-transparent dark:border-b-slate-800'
          }`}
        />

        {/* Tooltip Content */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            {icon && <span className="text-base">{icon}</span>}
            <span>{label}</span>
          </div>
          <div className="font-medium text-slate-700 dark:text-slate-300">{value}</div>
          <div className="border-t border-slate-200 pt-1 dark:border-slate-700" />
          <div className="text-xs text-slate-600 dark:text-slate-400">{description}</div>
        </div>
      </div>
    </div>
  )
}
