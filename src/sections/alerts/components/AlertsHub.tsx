import { useState } from 'react'
import type { AlertsProps } from '@/../product/sections/alerts/types'
import { RecentAlertsTab } from './RecentAlertsTab'
import { AlertSettingsTab } from './AlertSettingsTab'
import { Bell, Settings, Plus } from 'lucide-react'

// Design tokens: indigo (primary), sky (secondary), slate (neutral)
// Typography: Inter

export function AlertsHub({
  alertConfigurations,
  triggeredAlerts,
  deliveryRecords,
  users,
  performanceMetrics,
  activeTab = 'recent',
  currentFilters,
  onCreateAlert,
  onEditAlert,
  onToggleAlert,
  onDuplicateAlert,
  onDeleteAlert,
  onViewStats,
  onViewAlertDetail,
  onAcknowledgeAlert,
  onViewSourceData,
  onDismissAlert,
  onBulkToggle,
  onBulkDelete,
  onTabChange,
  onApplyFilters,
  onClearFilters,
  onSearch,
  onSaveAlert,
  onCancelEdit
}: AlertsProps) {
  const [currentTab, setCurrentTab] = useState<'recent' | 'settings'>(activeTab)
  const [searchQuery, setSearchQuery] = useState('')

  const handleTabChange = (tab: 'recent' | 'settings') => {
    setCurrentTab(tab)
    onTabChange?.(tab)
  }

  // Count unacknowledged alerts
  const unacknowledgedCount = triggeredAlerts.filter(a => !a.isAcknowledged).length

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Alerts</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Monitor metrics, detect anomalies, and manage notifications
            </p>
          </div>

          <button
            onClick={onCreateAlert}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Alert
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => handleTabChange('recent')}
            className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              currentTab === 'recent'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            Recent Alerts
            {unacknowledgedCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                {unacknowledgedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('settings')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              currentTab === 'settings'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            Alert Settings
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {alertConfigurations.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {currentTab === 'recent' && (
          <RecentAlertsTab
            triggeredAlerts={triggeredAlerts}
            alertConfigurations={alertConfigurations}
            deliveryRecords={deliveryRecords}
            users={users}
            onViewDetail={onViewAlertDetail}
            onAcknowledge={onAcknowledgeAlert}
            onViewSource={onViewSourceData}
            onDismiss={onDismissAlert}
            onApplyFilters={onApplyFilters}
            onClearFilters={onClearFilters}
            onSearch={onSearch}
          />
        )}

        {currentTab === 'settings' && (
          <AlertSettingsTab
            alertConfigurations={alertConfigurations}
            performanceMetrics={performanceMetrics}
            users={users}
            onEdit={onEditAlert}
            onToggle={onToggleAlert}
            onDuplicate={onDuplicateAlert}
            onDelete={onDeleteAlert}
            onViewStats={onViewStats}
            onBulkToggle={onBulkToggle}
            onBulkDelete={onBulkDelete}
            onApplyFilters={onApplyFilters}
          />
        )}
      </div>
    </div>
  )
}
