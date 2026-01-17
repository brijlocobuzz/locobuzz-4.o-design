import {
  CheckCircle,
  MessageSquare,
  ArrowUpRight,
  Tag,
  Zap,
  Sparkles,
  Plus,
} from 'lucide-react'
import type { QuickAction, QuickActionVariant } from '@/../product/sections/home/types'
import { BlockWrapper } from './BlockWrapper'

interface QuickActionsProps {
  title: string
  actions: QuickAction[]
  isLocked?: boolean
  onAction?: (actionId: string) => void
  onAddAction?: () => void
  onCustomize?: () => void
}

const variantStyles: Record<QuickActionVariant, string> = {
  default: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
  primary: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900',
  success: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-900',
  warning: 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-900',
  danger: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900',
}

const iconMap: Record<string, React.ReactNode> = {
  'check-circle': <CheckCircle className="h-4 w-4" />,
  'message-square': <MessageSquare className="h-4 w-4" />,
  'arrow-up-right': <ArrowUpRight className="h-4 w-4" />,
  tag: <Tag className="h-4 w-4" />,
  zap: <Zap className="h-4 w-4" />,
  sparkles: <Sparkles className="h-4 w-4" />,
}

export function QuickActions({
  title,
  actions,
  isLocked = false,
  onAction,
  onAddAction,
  onCustomize,
}: QuickActionsProps) {
  return (
    <BlockWrapper title={title} isLocked={isLocked} onCustomize={onCustomize}>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction?.(action.id)}
            className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${variantStyles[action.variant]}`}
          >
            {iconMap[action.icon] || <Zap className="h-4 w-4" />}
            <span>{action.label}</span>
            {action.shortcut && (
              <kbd className="ml-1 hidden rounded bg-black/10 px-1.5 py-0.5 text-xs opacity-60 group-hover:opacity-100 dark:bg-white/10 lg:inline-block">
                {action.shortcut}
              </kbd>
            )}
          </button>
        ))}

        {/* Add Action Button */}
        {!isLocked && onAddAction && (
          <button
            onClick={onAddAction}
            className="flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-200 px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 dark:border-slate-700 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        )}
      </div>
    </BlockWrapper>
  )
}
