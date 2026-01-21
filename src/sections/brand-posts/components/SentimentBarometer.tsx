import type { CommentSummary } from '@/../product/sections/brand-posts/types'
import { MessageCircle, TrendingUp } from 'lucide-react'

interface SentimentBarometerProps {
  summary: CommentSummary
  compact?: boolean
}

export function SentimentBarometer({ summary, compact = false }: SentimentBarometerProps) {
  const { sentimentBreakdown, totalComments, analyzedComments, sentimentSpike, needsReplyCount } = summary

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-600 dark:text-slate-400">{totalComments}</span>
        {sentimentSpike && (
          <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
            <TrendingUp className="w-3 h-3" />
            Alert
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {totalComments} {totalComments === 1 ? 'Comment' : 'Comments'}
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {analyzedComments}/{totalComments} analyzed
        </span>
      </div>

      {/* Sentiment Bar */}
      <div className="space-y-2">
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          {sentimentBreakdown.positivePercent > 0 && (
            <div
              className="bg-emerald-500 dark:bg-emerald-400 transition-all"
              style={{ width: `${sentimentBreakdown.positivePercent}%` }}
            />
          )}
          {sentimentBreakdown.neutralPercent > 0 && (
            <div
              className="bg-slate-300 dark:bg-slate-600 transition-all"
              style={{ width: `${sentimentBreakdown.neutralPercent}%` }}
            />
          )}
          {sentimentBreakdown.negativePercent > 0 && (
            <div
              className="bg-red-500 dark:bg-red-400 transition-all"
              style={{ width: `${sentimentBreakdown.negativePercent}%` }}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <span className="text-slate-600 dark:text-slate-400">
              {sentimentBreakdown.positivePercent}% Positive
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span className="text-slate-600 dark:text-slate-400">
              {sentimentBreakdown.neutralPercent}% Neutral
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400" />
            <span className="text-slate-600 dark:text-slate-400">
              {sentimentBreakdown.negativePercent}% Negative
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(sentimentSpike || needsReplyCount > 0) && (
        <div className="space-y-1.5">
          {sentimentSpike && (
            <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-red-900 dark:text-red-100">
                  {sentimentSpike.type === 'negative' ? 'Negative' : 'Positive'} Spike {sentimentSpike.change}
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                  {sentimentSpike.description}
                </p>
              </div>
            </div>
          )}

          {needsReplyCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
              <span className="font-medium">{needsReplyCount} comments need reply</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
