import { useState } from 'react'
import type {
  TriggeredAlert,
  AlertConfiguration,
  DeliveryRecord,
  User
} from '@/../product/sections/alerts/types'
import { AlertCard } from './AlertCard'
import { Search, Filter, X } from 'lucide-react'

interface RecentAlertsTabProps {
  triggeredAlerts: TriggeredAlert[]
  alertConfigurations: AlertConfiguration[]
  deliveryRecords: DeliveryRecord[]
  users: User[]
  onViewDetail?: (triggeredAlertId: string) => void
  onAcknowledge?: (triggeredAlertId: string) => void
  onViewSource?: (triggeredAlertId: string) => void
  onDismiss?: (triggeredAlertId: string) => void
  onApplyFilters?: (filters: any) => void
  onClearFilters?: () => void
  onSearch?: (query: string) => void
}

export function RecentAlertsTab({
  triggeredAlerts,
  alertConfigurations,
  deliveryRecords,
  users,
  onViewDetail,
  onAcknowledge,
  onViewSource,
  onDismiss,
  onApplyFilters,
  onClearFilters,
  onSearch
}: RecentAlertsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSeverity, setSelectedSeverity] = useState<string[]>([])
  const [selectedType, setSelectedType] = useState<string[]>([])
  const [showAcknowledged, setShowAcknowledged] = useState(true)

  // Filter alerts
  const filteredAlerts = triggeredAlerts.filter(alert => {
    // Search filter
    if (searchQuery && !alert.alertName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !alert.triggerCondition.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Severity filter
    if (selectedSeverity.length > 0 && !selectedSeverity.includes(alert.severity)) {
      return false
    }

    // Type filter
    if (selectedType.length > 0 && !selectedType.includes(alert.alertType)) {
      return false
    }

    // Acknowledged filter
    if (!showAcknowledged && alert.isAcknowledged) {
      return false
    }

    return true
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  const toggleSeverityFilter = (severity: string) => {
    const newSeverity = selectedSeverity.includes(severity)
      ? selectedSeverity.filter(s => s !== severity)
      : [...selectedSeverity, severity]
    setSelectedSeverity(newSeverity)
  }

  const toggleTypeFilter = (type: string) => {
    const newType = selectedType.includes(type)
      ? selectedType.filter(t => t !== type)
      : [...selectedType, type]
    setSelectedType(newType)
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedSeverity([])
    setSelectedType([])
    setShowAcknowledged(true)
    onClearFilters?.()
  }

  const hasActiveFilters = searchQuery || selectedSeverity.length > 0 || selectedType.length > 0 || !showAcknowledged

  return (
    <div className="h-full flex flex-col">
      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search alerts..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg border font-medium transition-all flex items-center gap-2 ${
              showFilters || hasActiveFilters
                ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-4">
            {/* Severity Filters */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Severity
              </label>
              <div className="flex flex-wrap gap-2">
                {['high', 'medium', 'low'].map(severity => (
                  <button
                    key={severity}
                    onClick={() => toggleSeverityFilter(severity)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedSeverity.includes(severity)
                        ? severity === 'high'
                          ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-2 border-red-500'
                          : severity === 'medium'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-2 border-amber-500'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-2 border-slate-500'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filters */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Alert Type
              </label>
              <div className="flex flex-wrap gap-2">
                {['simple', 'volumetric', 'anomaly'].map(type => (
                  <button
                    key={type}
                    onClick={() => toggleTypeFilter(type)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedType.includes(type)
                        ? type === 'simple'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-2 border-blue-500'
                          : type === 'volumetric'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-2 border-purple-500'
                          : 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-2 border-orange-500'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    {type === 'anomaly' ? 'Smart/Anomaly' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Acknowledgment Filter */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAcknowledged}
                  onChange={(e) => setShowAcknowledged(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Show acknowledged alerts
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Alerts Feed */}
      <div className="flex-1 overflow-auto p-6">
        {filteredAlerts.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-3">
            {filteredAlerts.map(alert => {
              const config = alertConfigurations.find(c => c.id === alert.alertConfigId)
              const alertDeliveries = deliveryRecords.filter(d => d.triggeredAlertId === alert.id)

              return (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  config={config}
                  deliveries={alertDeliveries}
                  users={users}
                  onViewDetail={() => onViewDetail?.(alert.id)}
                  onAcknowledge={() => onAcknowledge?.(alert.id)}
                  onViewSource={() => onViewSource?.(alert.id)}
                  onDismiss={() => onDismiss?.(alert.id)}
                />
              )
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                {hasActiveFilters ? 'No alerts match your filters' : 'No recent alerts'}
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                {hasActiveFilters ? 'Try adjusting your filters' : 'Alerts will appear here when triggered'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
