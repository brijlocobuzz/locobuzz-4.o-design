import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useState } from 'react'
import type { AvenueKpiCardProps, TrendDirection } from '@/../product/sections/mentions/types'

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

export function AvenueKpiCard({ avenue, isExpanded = false, onClick, onSubAvenueClick }: AvenueKpiCardProps) {
  const [expanded, setExpanded] = useState(isExpanded)
  const TrendIcon = trendIcons[avenue.trend]

  const handleClick = () => {
    setExpanded(!expanded)
    onClick?.(avenue.id)
  }

  return (
    <div className="group rounded-lg border border-slate-200 bg-white transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-600">
      {/* Card Header */}
      <button
        onClick={handleClick}
        className="w-full p-5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                {avenue.name}
              </h3>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                {avenue.shareOfVoice}%
              </span>
            </div>

            {/* Metrics Row */}
            <div className="mt-3 flex items-baseline gap-4">
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {avenue.mentionCount.today.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Today</div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <div className="font-medium">{avenue.mentionCount.last7Days.toLocaleString()}</div>
                <div className="text-xs">7 days</div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <div className="font-medium">{avenue.mentionCount.last30Days.toLocaleString()}</div>
                <div className="text-xs">30 days</div>
              </div>
            </div>

            {/* Sentiment Bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${avenue.sentimentDistribution.positive}%` }}
                />
                <div
                  className="bg-slate-400 transition-all"
                  style={{ width: `${avenue.sentimentDistribution.neutral}%` }}
                />
                <div
                  className="bg-rose-500 transition-all"
                  style={{ width: `${avenue.sentimentDistribution.negative}%` }}
                />
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {avenue.sentimentDistribution.positive}% Positive
                </span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  {avenue.sentimentDistribution.neutral}% Neutral
                </span>
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  {avenue.sentimentDistribution.negative}% Negative
                </span>
              </div>
            </div>
          </div>

          {/* Trend Badge & Expand Icon */}
          <div className="flex flex-col items-end gap-2">
            <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${trendColors[avenue.trend]}`}>
              <TrendIcon className="h-3 w-3" />
              {avenue.trendPercentage > 0 ? '+' : ''}
              {avenue.trendPercentage}%
            </div>
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-slate-400 transition-transform" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400 transition-transform" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Sub-Avenues */}
      {expanded && (
        <div className="animate-in fade-in slide-in-from-top-2 border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="grid gap-2">
            {avenue.subAvenues.map((subAvenue) => (
              <button
                key={subAvenue.id}
                onClick={() => onSubAvenueClick?.(subAvenue.id)}
                className="group/sub flex items-center justify-between rounded-md border border-slate-200 bg-white p-3 text-left transition-all hover:border-indigo-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-600"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {subAvenue.platform.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">{subAvenue.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {subAvenue.mentionCount} mentions
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Mini Sentiment */}
                  <div className="flex gap-1">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-8 w-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="w-full rounded-full bg-emerald-500 transition-all"
                          style={{ height: `${subAvenue.sentiment.positive}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500">{subAvenue.sentiment.positive}%</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-8 w-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="w-full rounded-full bg-slate-400 transition-all"
                          style={{ height: `${subAvenue.sentiment.neutral}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500">{subAvenue.sentiment.neutral}%</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="h-8 w-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="w-full rounded-full bg-rose-500 transition-all"
                          style={{ height: `${subAvenue.sentiment.negative}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500">{subAvenue.sentiment.negative}%</span>
                    </div>
                  </div>

                  <div className="text-xs font-medium text-indigo-600 opacity-0 transition-opacity group-hover/sub:opacity-100 dark:text-indigo-400">
                    View →
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
