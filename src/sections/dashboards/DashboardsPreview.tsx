import data from '@/../product/sections/dashboards/data.json'
import { DashboardView } from './components/DashboardView'
import type { DashboardsProps } from '@/../product/sections/dashboards/types'

export default function DashboardsPreview() {
  const dashboardsData = data as unknown as DashboardsProps

  return (
    <DashboardView
      dashboards={dashboardsData.dashboards}
      widgets={dashboardsData.widgets}
      widgetConnections={dashboardsData.widgetConnections}
      users={dashboardsData.users}
      teams={dashboardsData.teams}
      onCreateDashboard={() => console.log('Create dashboard')}
      onSelectDashboard={(id) => console.log('Select dashboard:', id)}
      onEditDashboard={(id) => console.log('Edit dashboard:', id)}
      onDuplicateDashboard={(id) => console.log('Duplicate dashboard:', id)}
      onDeleteDashboard={(id) => console.log('Delete dashboard:', id)}
      onCreateWidget={() => console.log('Create widget')}
      onAddWidget={(dashboardId, widgetId) => console.log('Add widget:', dashboardId, widgetId)}
      onEditWidget={(id) => console.log('Edit widget:', id)}
      onDuplicateWidget={(id) => console.log('Duplicate widget:', id)}
      onRemoveWidget={(dashboardId, widgetId) => console.log('Remove widget:', dashboardId, widgetId)}
      onDeleteWidget={(id) => console.log('Delete widget:', id)}
      onRefreshWidget={(id) => console.log('Refresh widget:', id)}
      onUpdateLayout={(dashboardId, layout) => console.log('Update layout:', dashboardId, layout)}
      onConfigureDeepDive={(widgetId, targetId) => console.log('Configure deep dive:', widgetId, targetId)}
      onDrillDown={(widgetId, targetId) => console.log('Drill down:', widgetId, targetId)}
      onConnectWidgets={(fromId, toIds) => console.log('Connect widgets:', fromId, toIds)}
      onDisconnectWidgets={(connectionId) => console.log('Disconnect widgets:', connectionId)}
      onUpdateAIPrompt={(widgetId, prompt) => console.log('Update AI prompt:', widgetId, prompt)}
      onRegenerateAIText={(widgetId) => console.log('Regenerate AI text:', widgetId)}
      onApplyGlobalFilters={(dashboardId, filters) => console.log('Apply filters:', dashboardId, filters)}
      onResetGlobalFilters={(dashboardId) => console.log('Reset filters:', dashboardId)}
      onShareDashboard={(dashboardId, shares) => console.log('Share dashboard:', dashboardId, shares)}
      onGeneratePublicLink={(dashboardId) => console.log('Generate public link:', dashboardId)}
      onRevokePublicLink={(dashboardId) => console.log('Revoke public link:', dashboardId)}
      onExportDashboard={(dashboardId, format) => console.log('Export dashboard:', dashboardId, format)}
      onScheduleReport={(dashboardId, report) => console.log('Schedule report:', dashboardId, report)}
      onUpdateScheduledReport={(dashboardId, reportId, updates) => console.log('Update scheduled report:', dashboardId, reportId, updates)}
      onDeleteScheduledReport={(dashboardId, reportId) => console.log('Delete scheduled report:', dashboardId, reportId)}
      onSearchDashboards={(query) => console.log('Search dashboards:', query)}
      onFilterWidgets={(type) => console.log('Filter widgets:', type)}
    />
  )
}
