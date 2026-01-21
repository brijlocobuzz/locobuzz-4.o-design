import { TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react'
import type { Kpi, TrendDirection } from '@/../product/sections/home/types'
import { BlockWrapper } from './BlockWrapper'

interface KpiCardRowProps {
  title: string
  kpis: Kpi[]
  isLocked?: boolean
  onAddKpi?: () => void
  onCustomize?: () => void
}

const trendIcons: Record<TrendDirection, React.ReactNode> = {
  up: <TrendingUp className="h-3.5 w-3.5" />,
  down: <TrendingDown className="h-3.5 w-3.5" />,
  flat: <Minus className="h-3.5 w-3.5" />,
}

function getTrendColor(trend: TrendDirection, isPositive: boolean): string {
  if (trend === 'flat') return 'text-slate-500 dark:text-slate-400'
  // For metrics where "up" is good (like CSAT) vs "down" is good (like handle time)
  const isGood = (trend === 'up' && isPositive) || (trend === 'down' && !isPositive)
  return isGood
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-red-600 dark:text-red-400'
}

function isPositiveMetric(label: string): boolean {
  const negativeMetrics = ['handle time', 'response time', 'wait time', 'open tickets']
  return !negativeMetrics.some((m) => label.toLowerCase().includes(m))
}

export function KpiCardRow({
  title,
  kpis,
  isLocked = false,
  onAddKpi,
  onCustomize,
}: KpiCardRowProps) {
  return (
    <BlockWrapper title={title} isLocked={isLocked} onCustomize={onCustomize}>
      <div className="flex gap-4">
        {kpis.map((kpi) => {
          const isPositive = isPositiveMetric(kpi.label)
          const trendColor = getTrendColor(kpi.trend, isPositive)
          const isOnTarget = kpi.target !== null &&
            ((isPositive && kpi.value >= kpi.target) || (!isPositive && kpi.value <= kpi.target))

          return (
            <div
              key={kpi.id}
              className="flex flex-1 flex-col rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/50"
            >
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {kpi.label}
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {kpi.value}
                </span>
                {kpi.unit && (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {kpi.unit}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className={`flex items-center gap-1 ${trendColor}`}>
                  {trendIcons[kpi.trend]}
                  <span className="text-xs font-medium">
                    {kpi.trendValue > 0 ? '+' : ''}
                    {kpi.trendValue}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {kpi.trendPeriod}
                  </span>
                </div>
                {kpi.target !== null && (
                  <div
                    className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                      isOnTarget
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                    }`}
                  >
                    Target: {kpi.target}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Add KPI Button */}
        {!isLocked && onAddKpi && (
          <button
            onClick={onAddKpi}
            className="flex min-w-[100px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 p-4 text-slate-400 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 dark:border-slate-700 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs font-medium">Add KPI</span>
          </button>
        )}
      </div>
    </BlockWrapper>
  )
}
