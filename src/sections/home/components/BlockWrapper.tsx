import { Settings, Lock, GripVertical } from 'lucide-react'

interface BlockWrapperProps {
  title: string
  isLocked?: boolean
  children: React.ReactNode
  onCustomize?: () => void
  className?: string
}

export function BlockWrapper({
  title,
  isLocked = false,
  children,
  onCustomize,
  className = '',
}: BlockWrapperProps) {
  return (
    <div
      className={`group flex h-full flex-col rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 cursor-grab text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          {isLocked && (
            <div className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">
              <Lock className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Locked
              </span>
            </div>
          )}
        </div>
        {!isLocked && onCustomize && (
          <button
            onClick={onCustomize}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            title="Customize block"
          >
            <Settings className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  )
}
