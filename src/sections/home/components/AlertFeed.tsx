import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Star,
  Info,
  X,
  ArrowRight,
} from 'lucide-react'
import type { Alert, AlertType, AlertSeverity } from '@/../product/sections/home/types'
import { BlockWrapper } from './BlockWrapper'

interface AlertFeedProps {
  title: string
  alerts: Alert[]
  isLocked?: boolean
  onAlertAction?: (alertId: string) => void
  onDismiss?: (alertId: string) => void
  onCustomize?: () => void
}

const severityStyles: Record<AlertSeverity, { bg: string; border: string; icon: string }> = {
  critical: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    icon: 'text-red-600 dark:text-red-400',
  },
  high: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-900',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-900',
    icon: 'text-yellow-600 dark:text-yellow-400',
  },
  info: {
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    border: 'border-sky-200 dark:border-sky-900',
    icon: 'text-sky-600 dark:text-sky-400',
  },
}

const typeIcons: Record<AlertType, React.ReactNode> = {
  'sla-breach': <AlertTriangle className="h-4 w-4" />,
  'mention-spike': <TrendingUp className="h-4 w-4" />,
  'sentiment-drop': <TrendingDown className="h-4 w-4" />,
  'vip-mention': <Star className="h-4 w-4" />,
  system: <Info className="h-4 w-4" />,
  anomaly: <AlertTriangle className="h-4 w-4" />,
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return date.toLocaleDateString()
}

export function AlertFeed({
  title,
  alerts,
  isLocked = false,
  onAlertAction,
  onDismiss,
  onCustomize,
}: AlertFeedProps) {
  const unreadAlerts = alerts.filter((a) => !a.isRead)
  const readAlerts = alerts.filter((a) => a.isRead)

  return (
    <BlockWrapper title={title} isLocked={isLocked} onCustomize={onCustomize}>
      <div className="space-y-2">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <Info className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              No alerts
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Everything is running smoothly
            </p>
          </div>
        ) : (
          <>
            {/* Unread Alerts */}
            {unreadAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`relative rounded-lg border p-3 ${severityStyles[alert.severity].bg} ${severityStyles[alert.severity].border}`}
              >
                {/* Dismiss Button */}
                {!isLocked && onDismiss && (
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded text-slate-400 transition-colors hover:bg-white/50 hover:text-slate-600 dark:hover:bg-slate-800/50"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${severityStyles[alert.severity].icon}`}>
                    {typeIcons[alert.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {alert.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                      {alert.message}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatTimeAgo(alert.createdAt)}
                      </span>
                      {alert.isActionable && alert.actionLabel && (
                        <button
                          onClick={() => onAlertAction?.(alert.id)}
                          className="flex items-center gap-1 text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          {alert.actionLabel}
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Read Alerts (dimmed) */}
            {readAlerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 opacity-60 dark:border-slate-800 dark:bg-slate-800/30"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-slate-400">
                    {typeIcons[alert.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {alert.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {alert.message}
                    </p>
                    <span className="mt-1 inline-block text-xs text-slate-400">
                      {formatTimeAgo(alert.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </BlockWrapper>
  )
}
