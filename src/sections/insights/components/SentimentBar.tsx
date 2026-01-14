import type { SentimentBreakdown } from '@/../product/sections/insights/types'

interface SentimentBarProps {
  sentiment: SentimentBreakdown
}

export function SentimentBar({ sentiment }: SentimentBarProps) {
  const total = sentiment.positive + sentiment.neutral + sentiment.negative

  if (total === 0) return null

  const positiveWidth = (sentiment.positive / total) * 100
  const neutralWidth = (sentiment.neutral / total) * 100
  const negativeWidth = (sentiment.negative / total) * 100

  return (
    <div className="space-y-2">
      <div className="flex h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
        {sentiment.positive > 0 && (
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${positiveWidth}%` }}
          />
        )}
        {sentiment.neutral > 0 && (
          <div
            className="bg-gradient-to-r from-slate-400 to-slate-500 transition-all duration-300"
            style={{ width: `${neutralWidth}%` }}
          />
        )}
        {sentiment.negative > 0 && (
          <div
            className="bg-gradient-to-r from-red-500 to-rose-500 transition-all duration-300"
            style={{ width: `${negativeWidth}%` }}
          />
        )}
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-slate-600 dark:text-slate-400">{sentiment.positive}%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-slate-400"></div>
          <span className="text-slate-600 dark:text-slate-400">{sentiment.neutral}%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-slate-600 dark:text-slate-400">{sentiment.negative}%</span>
        </div>
      </div>
    </div>
  )
}
