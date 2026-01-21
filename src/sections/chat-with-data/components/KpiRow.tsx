import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { KpiRowProps, TrendDirection } from '@/../product/sections/chat-with-data/types'

const trendIcons: Record<TrendDirection, React.ComponentType<{ className?: string }>> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
}

const trendColors: Record<TrendDirection, string> = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-600 dark:text-red-400',
  neutral: 'text-slate-400 dark:text-slate-500',
}

export function KpiRow({ kpis }: KpiRowProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {kpis.map((kpi, index) => {
        const TrendIcon = kpi.trend ? trendIcons[kpi.trend] : null
        const trendColor = kpi.trend ? trendColors[kpi.trend] : ''

        return (
          <div
            key={index}
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {kpi.label}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                {kpi.value}
              </p>
              {TrendIcon && kpi.trendValue && (
                <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
                  <TrendIcon className="h-4 w-4" />
                  <span>{kpi.trendValue}</span>
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{kpi.subtitle}</p>
          </div>
        )
      })}
    </div>
  )
}
