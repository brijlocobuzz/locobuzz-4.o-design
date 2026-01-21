import type { Workflow, User } from '@/../product/sections/workflows/types'
import { useState } from 'react'

interface WorkflowRowProps {
  workflow: Workflow
  users: User[]
  isActive: boolean
  isDragging: boolean
  isDropTarget: boolean
  onDragStart?: () => void
  onDragOver?: (e: React.DragEvent) => void
  onDragEnd?: () => void
  onEdit?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  onToggle?: (isActive: boolean) => void
  onTest?: () => void
  onViewAnalytics?: () => void
  onViewVersionHistory?: () => void
}

export function WorkflowRow({
  workflow,
  users,
  isActive,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragOver,
  onDragEnd,
  onEdit,
  onDuplicate,
  onDelete,
  onToggle,
  onTest,
  onViewAnalytics,
  onViewVersionHistory
}: WorkflowRowProps) {
  const [showMenu, setShowMenu] = useState(false)

  const creator = users.find(u => u.id === workflow.createdBy)
  const successRate = workflow.executionStats?.successRate ?? 0

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div
      draggable={isActive}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={`group transition-all duration-200 ${isDragging ? 'opacity-40 scale-95' : ''
        } ${isDropTarget ? 'bg-indigo-50 dark:bg-indigo-950/30 scale-[1.02]' : ''
        }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        {/* Rank + Drag Handle */}
        <div className="lg:col-span-1 flex items-center gap-3">
          {isActive && workflow.rank !== null ? (
            <>
              <div
                className="shrink-0 cursor-move"
                title="Drag to reorder"
              >
                <svg className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>
              <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {workflow.rank}
              </div>
            </>
          ) : (
            <div className="shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"></div>
            </div>
          )}
        </div>

        {/* Workflow Info */}
        <div className="lg:col-span-4 flex flex-col gap-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {workflow.name}
                </h3>
                {workflow.tags && workflow.tags.length > 0 && (
                  <span className="shrink-0 px-2 py-0.5 bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-xs rounded-full">
                    {workflow.tags[0]}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {workflow.description}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500"></span>
                  v{workflow.currentVersion}
                </span>
                {creator && (
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500"></span>
                    {creator.name}
                  </span>
                )}
              </div>
            </div>

            {/* Status Toggle */}
            <button
              onClick={() => onToggle?.(!workflow.isActive)}
              className={`shrink-0 relative w-11 h-6 rounded-full transition-all duration-200 ${workflow.isActive
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-slate-300 dark:bg-slate-700'
                }`}
              title={workflow.isActive ? 'Active' : 'Inactive'}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${workflow.isActive ? 'translate-x-6' : 'translate-x-1'
                }`} />
            </button>
          </div>
        </div>

        {/* Trigger */}
        <div className="lg:col-span-2 flex items-center">
          <div className="text-sm">
            <div className="text-slate-700 dark:text-slate-300 font-medium capitalize">
              {workflow.trigger.event.replace(/_/g, ' ')}
            </div>
            {workflow.trigger.channels && workflow.trigger.channels.length > 0 && (
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5 capitalize">
                {workflow.trigger.channels.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Performance */}
        <div className="lg:col-span-2 flex items-center">
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className={`text-sm font-semibold ${successRate >= 90 ? 'text-green-600 dark:text-green-400' :
                  successRate >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                }`}>
                {successRate}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-500">
                success
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              {(workflow.executionStats?.totalRuns ?? 0).toLocaleString()} total runs
            </div>
          </div>
        </div>

        {/* Last Run */}
        <div className="lg:col-span-2 flex items-center">
          <div className="text-sm">
            {workflow.executionStats?.lastExecutedAt ? (
              <>
                <div className="text-slate-700 dark:text-slate-300 font-medium">
                  {formatDate(workflow.executionStats.lastExecutedAt)}
                </div>
                {workflow.executionStats?.averageExecutionTime && (
                  <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                    ~{workflow.executionStats.averageExecutionTime}ms avg
                  </div>
                )}
              </>
            ) : (
              <div className="text-slate-500 dark:text-slate-500 italic">
                Never run
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="lg:col-span-1 flex items-center justify-end">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              onBlur={() => setTimeout(() => setShowMenu(false), 200)}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="More actions"
            >
              <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-10">
                <button
                  onClick={() => { onEdit?.(); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => { onTest?.(); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Test Workflow
                </button>
                <button
                  onClick={() => { onDuplicate?.(); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => { onViewAnalytics?.(); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  View Analytics
                </button>
                <button
                  onClick={() => { onViewVersionHistory?.(); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Version History
                </button>
                <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                <button
                  onClick={() => { onDelete?.(); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
