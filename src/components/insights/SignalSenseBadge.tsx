import { Bell, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { SignalSenseMatch } from '@/../product/sections/inbox/types'

interface SignalSenseBadgeProps {
  matches: SignalSenseMatch[]
  maxVisible?: number
}

export function SignalSenseBadge({ matches, maxVisible = 2 }: SignalSenseBadgeProps) {
  const [showAll, setShowAll] = useState(false)

  if (!matches || matches.length === 0) return null

  const visibleMatches = showAll ? matches : matches.slice(0, maxVisible)
  const hiddenCount = matches.length - maxVisible

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`
  }

  const formatMatchTime = (matchedAt: string) => {
    const date = new Date(matchedAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {visibleMatches.map((match) => (
        <div key={match.signalId} className="group relative">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
            <Bell className="w-3 h-3" />
            {match.signalName}
          </span>

          {/* Hover Tooltip */}
          <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-48 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  SignalSense Match
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Signal</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {match.signalName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Confidence</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    {formatConfidence(match.confidence)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Matched</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {formatMatchTime(match.matchedAt)}
                  </span>
                </div>
              </div>
              {/* Arrow */}
              <div className="absolute -top-1.5 left-4 h-3 w-3 rotate-45 border-l border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      ))}

      {/* Show more indicator */}
      {!showAll && hiddenCount > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowAll(true)
          }}
          className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
        >
          +{hiddenCount} more
          <ChevronDown className="w-3 h-3" />
        </button>
      )}

      {/* Collapse button when expanded */}
      {showAll && hiddenCount > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowAll(false)
          }}
          className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
        >
          Show less
        </button>
      )}
    </div>
  )
}

export default SignalSenseBadge
