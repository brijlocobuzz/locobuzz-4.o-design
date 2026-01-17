import {
  CheckCircle2,
  Circle,
  Clock,
  ArrowUpRight,
  FileText,
  MessageSquare,
  Star,
  RefreshCw,
} from 'lucide-react'
import type { Task, TaskType, ActionPriority } from '@/../product/sections/home/types'
import { BlockWrapper } from './BlockWrapper'

interface TaskListProps {
  title: string
  tasks: Task[]
  isLocked?: boolean
  onViewTask?: (taskId: string) => void
  onCompleteTask?: (taskId: string) => void
  onCustomize?: () => void
}

const typeIcons: Record<TaskType, React.ReactNode> = {
  'follow-up': <RefreshCw className="h-3.5 w-3.5" />,
  survey: <Star className="h-3.5 w-3.5" />,
  approval: <CheckCircle2 className="h-3.5 w-3.5" />,
  escalation: <ArrowUpRight className="h-3.5 w-3.5" />,
  content: <FileText className="h-3.5 w-3.5" />,
  review: <MessageSquare className="h-3.5 w-3.5" />,
}

const priorityDot: Record<ActionPriority, string> = {
  critical: 'bg-red-500',
  high: 'bg-amber-500',
  medium: 'bg-sky-500',
  low: 'bg-slate-400',
}

function formatDueDate(dateString: string): { text: string; isOverdue: boolean; isSoon: boolean } {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffHours = diffMs / 3600000

  if (diffHours < 0) {
    return { text: 'Overdue', isOverdue: true, isSoon: false }
  }
  if (diffHours < 2) {
    return { text: `${Math.round(diffHours * 60)}m left`, isOverdue: false, isSoon: true }
  }
  if (diffHours < 24) {
    return { text: `${Math.round(diffHours)}h left`, isOverdue: false, isSoon: diffHours < 4 }
  }
  return {
    text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    isOverdue: false,
    isSoon: false,
  }
}

export function TaskList({
  title,
  tasks,
  isLocked = false,
  onViewTask,
  onCompleteTask,
  onCustomize,
}: TaskListProps) {
  const pendingTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled')

  return (
    <BlockWrapper title={title} isLocked={isLocked} onCustomize={onCustomize}>
      <div className="space-y-1">
        {pendingTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              All tasks complete
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Great work!
            </p>
          </div>
        ) : (
          pendingTasks.map((task) => {
            const due = formatDueDate(task.dueDate)
            return (
              <div
                key={task.id}
                className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                {/* Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onCompleteTask?.(task.id)
                  }}
                  className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-slate-300 text-slate-300 transition-colors hover:border-indigo-500 hover:text-indigo-500 dark:border-slate-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
                >
                  <Circle className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                </button>

                {/* Content */}
                <button
                  onClick={() => onViewTask?.(task.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${priorityDot[task.priority]}`} />
                    <span className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {typeIcons[task.type]}
                      {task.type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-900 dark:text-white">
                    {task.title}
                  </p>
                  {task.associatedTicketNumber && (
                    <p className="mt-0.5 font-mono text-xs text-slate-400">
                      {task.associatedTicketNumber}
                    </p>
                  )}
                  {task.requestedBy && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Requested by {task.requestedBy}
                    </p>
                  )}
                </button>

                {/* Due Date */}
                <div
                  className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${due.isOverdue
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                      : due.isSoon
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                >
                  <Clock className="h-3 w-3" />
                  {due.text}
                </div>
              </div>
            )
          })
        )}
      </div>
    </BlockWrapper>
  )
}
