import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
} from 'lucide-react'
import type { TopStripAgentProps, ActionPriority } from '@/../product/sections/home/types'

const priorityStyles: Record<ActionPriority, string> = {
  critical: 'bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-900',
  high: 'bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-900',
  medium: 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700',
  low: 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700',
}

const priorityTextStyles: Record<ActionPriority, string> = {
  critical: 'text-red-700 dark:text-red-400',
  high: 'text-amber-700 dark:text-amber-400',
  medium: 'text-slate-700 dark:text-slate-300',
  low: 'text-slate-600 dark:text-slate-400',
}

export function TopStripAgent({
  data,
  onWorkTodayClick,
  onSlaRiskClick,
  onNextBestActionClick,
}: TopStripAgentProps) {
  const { myWorkToday, slaRisk, nextBestActions } = data
  const totalSlaRisk = slaRisk.breachingIn30 + slaRisk.breachingIn60 + slaRisk.breachingIn120

  return (
    <div className="flex items-stretch gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      {/* My Work Today */}
      <div className="flex flex-1 items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
          <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            My Work Today
          </p>
          <div className="mt-1 flex items-center gap-3">
            <button
              onClick={() => onWorkTodayClick?.('open')}
              className="group flex items-center gap-1.5 text-sm transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <span className="font-semibold text-slate-900 dark:text-white">
                {myWorkToday.open}
              </span>
              <span className="text-slate-500 dark:text-slate-400">Open</span>
            </button>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <button
              onClick={() => onWorkTodayClick?.('due')}
              className="group flex items-center gap-1.5 text-sm transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {myWorkToday.due}
              </span>
              <span className="text-slate-500 dark:text-slate-400">Due</span>
            </button>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <button
              onClick={() => onWorkTodayClick?.('overdue')}
              className="group flex items-center gap-1.5 text-sm transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <span className="font-semibold text-red-600 dark:text-red-400">
                {myWorkToday.overdue}
              </span>
              <span className="text-slate-500 dark:text-slate-400">Overdue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px bg-slate-200 dark:bg-slate-700" />

      {/* SLA Risk */}
      <button
        onClick={onSlaRiskClick}
        className="flex flex-1 items-center gap-4 rounded-lg px-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            totalSlaRisk > 0
              ? 'bg-amber-100 dark:bg-amber-900/50'
              : 'bg-emerald-100 dark:bg-emerald-900/50'
          }`}
        >
          {totalSlaRisk > 0 ? (
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          )}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            SLA Risk
          </p>
          {totalSlaRisk > 0 ? (
            <div className="mt-1 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-red-500" />
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {slaRisk.breachingIn30}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  &lt;30m
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {slaRisk.breachingIn60}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  &lt;1h
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {slaRisk.breachingIn120}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  &lt;2h
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              All clear
            </p>
          )}
        </div>
      </button>

      {/* Divider */}
      <div className="w-px bg-slate-200 dark:bg-slate-700" />

      {/* Next Best Actions */}
      <div className="flex flex-[2] flex-col gap-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-indigo-500" />
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Next Best Actions
          </p>
        </div>
        <div className="flex gap-2">
          {nextBestActions.slice(0, 3).map((action) => (
            <button
              key={action.id}
              onClick={() => onNextBestActionClick?.(action.id)}
              className={`flex flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all hover:shadow-sm ${priorityStyles[action.priority]}`}
            >
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-medium ${priorityTextStyles[action.priority]}`}
                >
                  {action.action}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {action.reason}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
