import { Lock, ArrowRight, Eye } from 'lucide-react'

interface TransitionBadgeProps {
  transition: any
}

export function TransitionBadge({ transition }: TransitionBadgeProps) {
  if (!transition) return null

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="my-6">
      {/* Horizontal line with centered badge */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
        </div>

        <div className="relative flex justify-center">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 rounded-full shadow-sm">
            <div className="flex items-center gap-2 text-white">
              <Lock className="h-4 w-4" />
              <ArrowRight className="h-4 w-4" />
              <span className="text-sm font-medium">Conversation moved to Direct Message</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transition metadata */}
      <div className="mt-3 text-center">
        <div className="text-xs text-slate-600 dark:text-slate-400">
          <span>
            by <span className="font-medium">{transition.initiatorName}</span>
          </span>
          {' • '}
          <span>{formatTime(transition.timestamp)}</span>
          {' • '}
          <span className="capitalize">{transition.reasonText}</span>
        </div>

        {/* Public visibility stats */}
        {transition.publicVisibilityStats && (
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{transition.publicVisibilityStats.views.toLocaleString()} views</span>
            </div>
            <div>
              {transition.publicVisibilityStats.reactions} reactions
            </div>
            <div>
              {transition.publicVisibilityStats.comments} comments
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
