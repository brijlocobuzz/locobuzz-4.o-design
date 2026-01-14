import { CheckCircle, AlertTriangle, XCircle, Loader2, Shield } from 'lucide-react'

type CheckingStatus = 'checking' | 'approved' | 'warning' | 'blocked' | 'error' | 'timeout'

interface AgentIQCheckingIndicatorProps {
  status: CheckingStatus
  elapsedTime?: number
  onKeepWaiting?: () => void
  onSendWithoutCheck?: () => void
  onCancel?: () => void
  onRetry?: () => void
}

export function AgentIQCheckingIndicator({
  status,
  elapsedTime = 0,
  onKeepWaiting,
  onSendWithoutCheck,
  onCancel,
  onRetry,
}: AgentIQCheckingIndicatorProps) {
  const configs = {
    checking: {
      icon: Loader2,
      iconClass: 'h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400',
      bgClass: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900',
      textClass: 'text-indigo-900 dark:text-indigo-100',
      message: 'Quality check in progress...',
    },
    approved: {
      icon: CheckCircle,
      iconClass: 'h-4 w-4 text-green-600 dark:text-green-400',
      bgClass: 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900',
      textClass: 'text-green-900 dark:text-green-100',
      message: 'Quality check passed',
    },
    warning: {
      icon: AlertTriangle,
      iconClass: 'h-4 w-4 text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900',
      textClass: 'text-amber-900 dark:text-amber-100',
      message: 'Response needs attention',
    },
    blocked: {
      icon: XCircle,
      iconClass: 'h-4 w-4 text-red-600 dark:text-red-400',
      bgClass: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900',
      textClass: 'text-red-900 dark:text-red-100',
      message: 'Response cannot be sent',
    },
    error: {
      icon: XCircle,
      iconClass: 'h-4 w-4 text-red-600 dark:text-red-400',
      bgClass: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900',
      textClass: 'text-red-900 dark:text-red-100',
      message: 'Quality check unavailable',
    },
    timeout: {
      icon: AlertTriangle,
      iconClass: 'h-4 w-4 text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900',
      textClass: 'text-amber-900 dark:text-amber-100',
      message: 'Quality check is taking longer than expected',
    },
  }

  const config = configs[status]
  const Icon = config.icon
  const showTimeout = status === 'timeout'
  const showError = status === 'error'

  return (
    <div className={`rounded-lg border p-3 ${config.bgClass}`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Shield className="h-4 w-4 text-slate-400" />
          <Icon className={config.iconClass} />
          <div className="flex-1">
            <div className={`text-sm font-medium ${config.textClass}`}>
              {config.message}
            </div>
            {status === 'checking' && elapsedTime > 0 && (
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {elapsedTime.toFixed(1)}s elapsed
              </div>
            )}
            {status === 'approved' && (
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Empathy: 7/10 • CSAT risk: Low
              </div>
            )}
          </div>
        </div>

        {/* Timeout Actions */}
        {showTimeout && (
          <div className="flex gap-2">
            {onKeepWaiting && (
              <button
                onClick={onKeepWaiting}
                className="rounded px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/50"
              >
                Keep Waiting
              </button>
            )}
            {onSendWithoutCheck && (
              <button
                onClick={onSendWithoutCheck}
                className="rounded px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/50"
              >
                Send Without Check
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="rounded px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            )}
          </div>
        )}

        {/* Error Actions */}
        {showError && (
          <div className="flex gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="rounded px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/50"
              >
                Retry
              </button>
            )}
            {onSendWithoutCheck && (
              <button
                onClick={onSendWithoutCheck}
                className="rounded px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                Send Without Verification
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
