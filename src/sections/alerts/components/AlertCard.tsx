import type {
  TriggeredAlert,
  AlertConfiguration,
  DeliveryRecord,
  User
} from '@/../product/sections/alerts/types'
import {
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Eye,
  ExternalLink,
  Mail,
  Smartphone,
  MessageSquare,
  X,
  Clock
} from 'lucide-react'

interface AlertCardProps {
  alert: TriggeredAlert
  config?: AlertConfiguration
  deliveries: DeliveryRecord[]
  users: User[]
  onViewDetail?: () => void
  onAcknowledge?: () => void
  onViewSource?: () => void
  onDismiss?: () => void
}

const channelIcons = {
  email: Mail,
  push: Smartphone,
  slack: MessageSquare,
  whatsapp: MessageSquare,
  teams: MessageSquare,
  gchat: MessageSquare
}

export function AlertCard({
  alert,
  config,
  deliveries,
  users,
  onViewDetail,
  onAcknowledge,
  onViewSource,
  onDismiss
}: AlertCardProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMins = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMins / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMins < 1) return 'Just now'
    if (diffInMins < 60) return `${diffInMins}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${diffInDays}d ago`
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const acknowledgedBy = alert.acknowledgedBy ? users.find(u => u.id === alert.acknowledgedBy) : null

  // Delivery status summary
  const deliveredCount = deliveries.filter(d => d.status === 'sent' || d.status === 'opened').length
  const openedCount = deliveries.filter(d => d.status === 'opened').length
  const failedCount = deliveries.filter(d => d.status === 'failed').length

  const severityStyles = {
    high: {
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      badge: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
      icon: 'text-red-600 dark:text-red-400'
    },
    medium: {
      bg: 'bg-amber-50 dark:bg-amber-950',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      badge: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
      icon: 'text-amber-600 dark:text-amber-400'
    },
    low: {
      bg: 'bg-slate-50 dark:bg-slate-900',
      border: 'border-slate-200 dark:border-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
      icon: 'text-slate-600 dark:text-slate-400'
    }
  }

  const typeStyles = {
    simple: { color: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300', label: 'Simple' },
    volumetric: { color: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300', label: 'Volumetric' },
    anomaly: { color: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300', label: 'Anomaly' }
  }

  const styles = severityStyles[alert.severity]
  const typeStyle = typeStyles[alert.alertType]

  return (
    <div
      className={`relative border rounded-lg overflow-hidden transition-all hover:shadow-md ${
        alert.isAcknowledged
          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-75'
          : `${styles.bg} ${styles.border}`
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Icon */}
            <div className={`mt-0.5 ${alert.isAcknowledged ? 'text-slate-400' : styles.icon}`}>
              {alert.alertType === 'anomaly' ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3
                  className={`font-semibold cursor-pointer hover:underline ${
                    alert.isAcknowledged ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'
                  }`}
                  onClick={onViewDetail}
                >
                  {alert.alertName}
                </h3>

                {/* Type Badge */}
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${typeStyle.color}`}>
                  {typeStyle.label}
                </span>

                {/* Severity Badge */}
                {!alert.isAcknowledged && (
                  <span className={`px-2 py-0.5 rounded-md text-xs font-semibold uppercase ${styles.badge}`}>
                    {alert.severity}
                  </span>
                )}
              </div>

              {/* Trigger Condition */}
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                {alert.triggerCondition}
              </p>

              {/* Time */}
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimeAgo(alert.triggeredAt)}</span>
                  <span className="text-slate-400">•</span>
                  <span>{formatDateTime(alert.triggeredAt)}</span>
                </div>

                {/* Delivery Status */}
                {deliveries.length > 0 && (
                  <>
                    <span className="text-slate-400">•</span>
                    <div className="flex items-center gap-2">
                      {openedCount > 0 && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <Eye className="w-3.5 h-3.5" />
                          {openedCount} opened
                        </span>
                      )}
                      {failedCount > 0 && (
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                          {failedCount} failed
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {!alert.isAcknowledged && (
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Qualifying Data */}
        {alert.qualifyingData && (
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Current Value</div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {alert.qualifyingData.currentValue}
                  {alert.qualifyingData.metric.includes('percentage') && '%'}
                </div>
              </div>

              {alert.qualifyingData.baselineValue !== undefined && (
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Baseline</div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {alert.qualifyingData.baselineValue}
                    {alert.qualifyingData.metric.includes('percentage') && '%'}
                  </div>
                </div>
              )}

              {alert.qualifyingData.deviation !== undefined && (
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Deviation</div>
                  <div className={`font-semibold ${styles.text}`}>
                    {alert.qualifyingData.deviation > 0 ? '+' : ''}
                    {alert.qualifyingData.deviation}%
                  </div>
                </div>
              )}

              {alert.qualifyingData.threshold !== undefined && (
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Threshold</div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {alert.qualifyingData.threshold}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delivery Channels */}
        {deliveries.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Delivery Status
            </div>
            <div className="flex flex-wrap gap-2">
              {deliveries.map(delivery => {
                const Icon = channelIcons[delivery.channel] || Mail
                return (
                  <div
                    key={delivery.id}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${
                      delivery.status === 'opened'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : delivery.status === 'failed'
                        ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                    title={delivery.failureReason}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="capitalize">{delivery.channel}</span>
                    {delivery.status === 'opened' && <Eye className="w-3 h-3" />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Acknowledged Status */}
        {alert.isAcknowledged && acknowledgedBy && (
          <div className="mb-4 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
            <CheckCircle className="w-4 h-4" />
            <span>
              Acknowledged by {acknowledgedBy.name} {formatTimeAgo(alert.acknowledgedAt!)}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!alert.isAcknowledged && (
            <button
              onClick={onAcknowledge}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Acknowledge
            </button>
          )}

          <button
            onClick={onViewSource}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            View Source Data
          </button>

          <button
            onClick={onViewDetail}
            className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}
