import data from '@/../product/sections/alerts/data.json'
import { AlertsHub } from './components/AlertsHub'
import type { AlertConfiguration, TriggeredAlert, DeliveryRecord, PerformanceMetrics } from '@/../product/sections/alerts/types'

export default function AlertsPreview() {
  return (
    <AlertsHub
      alertConfigurations={data.alertConfigurations as AlertConfiguration[]}
      triggeredAlerts={data.triggeredAlerts as TriggeredAlert[]}
      deliveryRecords={data.deliveryRecords as DeliveryRecord[]}
      users={data.users}
      performanceMetrics={data.performanceMetrics as PerformanceMetrics[]}
      activeTab="recent"
      onCreateAlert={() => console.log('Create alert')}
      onEditAlert={(id) => console.log('Edit alert:', id)}
      onToggleAlert={(id, isActive) => console.log('Toggle alert:', id, isActive)}
      onDuplicateAlert={(id) => console.log('Duplicate alert:', id)}
      onDeleteAlert={(id) => console.log('Delete alert:', id)}
      onViewStats={(id) => console.log('View stats:', id)}
      onViewAlertDetail={(id) => console.log('View alert detail:', id)}
      onAcknowledgeAlert={(id) => console.log('Acknowledge alert:', id)}
      onViewSourceData={(id) => console.log('View source data:', id)}
      onDismissAlert={(id) => console.log('Dismiss alert:', id)}
      onBulkToggle={(ids, isActive) => console.log('Bulk toggle:', ids, isActive)}
      onBulkDelete={(ids) => console.log('Bulk delete:', ids)}
      onTabChange={(tab) => console.log('Tab change:', tab)}
      onApplyFilters={(filters) => console.log('Apply filters:', filters)}
      onClearFilters={() => console.log('Clear filters')}
      onSearch={(query) => console.log('Search:', query)}
      onSaveAlert={(config) => console.log('Save alert:', config)}
      onCancelEdit={() => console.log('Cancel edit')}
    />
  )
}
