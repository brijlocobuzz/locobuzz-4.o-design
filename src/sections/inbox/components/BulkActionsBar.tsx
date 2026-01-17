import type { BulkActionsBarProps } from '@/../product/sections/inbox/types'

export function BulkActionsBar({
  selectedCount,
  onAssign,
  onClose,
  onAddTags,
  onChangeStatus,
  onChangePriority,
  onMarkRead,
  onClearSelection
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="bg-indigo-50 dark:bg-indigo-950 border-b border-indigo-200 dark:border-indigo-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-medium text-indigo-900 dark:text-indigo-100">
            {selectedCount} ticket{selectedCount !== 1 ? 's' : ''} selected
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAssign?.()}
              className="px-3 py-1.5 rounded bg-white dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-700 text-sm text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-800 transition-colors"
            >
              Assign
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-white dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-700 text-sm text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-800 transition-colors"
            >
              Close
            </button>

            <button
              onClick={() => onAddTags?.([])}
              className="px-3 py-1.5 rounded bg-white dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-700 text-sm text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-800 transition-colors"
            >
              Add Tags
            </button>

            <button
              onClick={() => onChangeStatus?.('open')}
              className="px-3 py-1.5 rounded bg-white dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-700 text-sm text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-800 transition-colors"
            >
              Change Status
            </button>

            <button
              onClick={() => onChangePriority?.('high')}
              className="px-3 py-1.5 rounded bg-white dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-700 text-sm text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-800 transition-colors"
            >
              Set Priority
            </button>

            <button
              onClick={onMarkRead}
              className="px-3 py-1.5 rounded bg-white dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-700 text-sm text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-800 transition-colors"
            >
              Mark as Read
            </button>
          </div>
        </div>

        <button
          onClick={onClearSelection}
          className="text-sm text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors"
        >
          Clear Selection
        </button>
      </div>
    </div>
  )
}
