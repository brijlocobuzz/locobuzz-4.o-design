import type { DashboardsProps, Widget } from '@/../product/sections/dashboards/types'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardHeader } from './DashboardHeader'
import { GlobalFilterBar } from './GlobalFilterBar'
import { WidgetGrid } from './WidgetGrid'
import { useState } from 'react'

export function DashboardView({
  dashboards,
  widgets,
  onCreateDashboard,
  onSelectDashboard,
  onEditDashboard,
  onDuplicateDashboard,
  onDeleteDashboard,
  onAddWidget,
  onEditWidget,
  onDuplicateWidget,
  onRemoveWidget,
  onRefreshWidget,
  onUpdateLayout,
  onConfigureDeepDive,
  onDrillDown,
  onApplyGlobalFilters,
  onResetGlobalFilters,
  onShareDashboard,
  onExportDashboard,
  onScheduleReport,
  onSearchDashboards,
}: DashboardsProps) {
  // Find last viewed dashboard (default dashboard or first one)
  const defaultDashboard = dashboards.find(d => d.isDefault) || dashboards[0]
  const [selectedDashboardId, setSelectedDashboardId] = useState(defaultDashboard?.id || null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const selectedDashboard = dashboards.find(d => d.id === selectedDashboardId)

  if (!selectedDashboard) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No Dashboards Yet</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Get started by creating your first dashboard</p>
          <button
            onClick={onCreateDashboard}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200"
          >
            Create Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Get widgets for selected dashboard
  const dashboardWidgets = selectedDashboard.widgetIds
    .map(widgetId => widgets.find(w => w.id === widgetId))
    .filter((w): w is Widget => w !== undefined)

  const handleSelectDashboard = (dashboardId: string) => {
    setSelectedDashboardId(dashboardId)
    onSelectDashboard?.(dashboardId)
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar
        dashboards={dashboards}
        selectedDashboardId={selectedDashboardId}
        isCollapsed={isSidebarCollapsed}
        onSelectDashboard={handleSelectDashboard}
        onCreateDashboard={onCreateDashboard}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onSearchDashboards={onSearchDashboards}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard Header */}
        <DashboardHeader
          dashboard={selectedDashboard}
          onEditDashboard={() => onEditDashboard?.(selectedDashboard.id)}
          onDuplicateDashboard={() => onDuplicateDashboard?.(selectedDashboard.id)}
          onDeleteDashboard={() => onDeleteDashboard?.(selectedDashboard.id)}
          onShareDashboard={(shares) => onShareDashboard?.(selectedDashboard.id, shares)}
          onExportDashboard={(format) => onExportDashboard?.(selectedDashboard.id, format)}
          onScheduleReport={(report) => onScheduleReport?.(selectedDashboard.id, report)}
        />

        {/* Global Filters */}
        <GlobalFilterBar
          filters={selectedDashboard.globalFilters}
          onApplyFilters={(filters) => onApplyGlobalFilters?.(selectedDashboard.id, filters)}
          onResetFilters={() => onResetGlobalFilters?.(selectedDashboard.id)}
        />

        {/* Widget Grid */}
        <div className="flex-1 overflow-auto">
          <WidgetGrid
            dashboard={selectedDashboard}
            widgets={dashboardWidgets}
            onAddWidget={(widgetId) => onAddWidget?.(selectedDashboard.id, widgetId)}
            onEditWidget={onEditWidget}
            onDuplicateWidget={onDuplicateWidget}
            onRemoveWidget={(widgetId) => onRemoveWidget?.(selectedDashboard.id, widgetId)}
            onRefreshWidget={onRefreshWidget}
            onUpdateLayout={(layout) => onUpdateLayout?.(selectedDashboard.id, layout)}
            onConfigureDeepDive={onConfigureDeepDive}
            onDrillDown={onDrillDown}
          />
        </div>
      </div>
    </div>
  )
}
