import { TrendingUp, TrendingDown, Minus, Check, Hash } from 'lucide-react'
import type { RightRailProps, TrendDirection } from '@/../product/sections/mentions/types'

const trendIcons: Record<TrendDirection, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
}

const trendColors: Record<TrendDirection, string> = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-rose-600 dark:text-rose-400',
  stable: 'text-slate-500 dark:text-slate-400',
}

export function RightRail({
  topAuthors,
  trendingKeywords,
  onAuthorClick,
  onKeywordClick,
}: RightRailProps) {
  return (
    <div className="w-80 space-y-6 border-l border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
      {/* Top Authors */}
      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          Top Authors
        </h3>
        <div className="space-y-3">
          {topAuthors.slice(0, 5).map((author) => (
            <button
              key={author.id}
              onClick={() => onAuthorClick?.(author.id)}
              className="group w-full text-left"
            >
              <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white dark:hover:bg-slate-700">
                <img
                  src={author.avatarUrl}
                  alt={author.name}
                  className="h-10 w-10 rounded-full ring-2 ring-white dark:ring-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {author.name}
                    </span>
                    {author.isVerified && (
                      <Check className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span>{author.mentionCount} mentions</span>
                    <span>·</span>
                    <span>{(author.reachTotal / 1000).toFixed(0)}K reach</span>
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {author.influenceScore.toFixed(1)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Trending Keywords */}
      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          Trending Keywords
        </h3>
        <div className="space-y-2">
          {trendingKeywords.map((keyword) => {
            const TrendIcon = trendIcons[keyword.trend]
            return (
              <button
                key={keyword.id}
                onClick={() => onKeywordClick?.(keyword.keyword)}
                className="group w-full rounded-lg p-3 text-left transition-colors hover:bg-white dark:hover:bg-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900 dark:text-white">
                      {keyword.keyword}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${trendColors[keyword.trend]}`}>
                    <TrendIcon className="h-3 w-3" />
                    {keyword.trendPercentage > 0 ? '+' : ''}
                    {keyword.trendPercentage}%
                  </div>
                </div>
                <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  {keyword.mentionCount} mentions
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-sky-50 p-4 dark:from-indigo-950/30 dark:to-sky-950/30">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-indigo-900 dark:text-indigo-300">
          Activity Summary
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-700 dark:text-slate-400">Total Mentions</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {topAuthors.reduce((sum, a) => sum + a.mentionCount, 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-700 dark:text-slate-400">Total Reach</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {(topAuthors.reduce((sum, a) => sum + a.reachTotal, 0) / 1000000).toFixed(2)}M
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-700 dark:text-slate-400">Avg Influence</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {(topAuthors.reduce((sum, a) => sum + a.influenceScore, 0) / topAuthors.length).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
