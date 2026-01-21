// Dashboards Section Types

// =============================================================================
// Data Types
// =============================================================================

export type WidgetType =
  | 'kpi_card'
  | 'line_chart'
  | 'bar_chart'
  | 'pie_chart'
  | 'stacked_area_chart'
  | 'grouped_bar_chart'
  | 'horizontal_bar_chart'
  | 'data_grid'
  | 'pivot_table'
  | 'ai_text'

export type SharePermission = 'view' | 'edit'
export type ShareType = 'user' | 'team'
export type TrendDirection = 'up' | 'down' | 'stable'
export type ReportFrequency = 'daily' | 'weekly' | 'monthly'
export type ReportFormat = 'pdf' | 'png' | 'csv'

export interface DashboardShare {
  type: ShareType
  id: string
  permission: SharePermission
}

export interface GlobalFilters {
  timeRange: string
  channels: string[]
  sentiment: string
}

export interface WidgetLayout {
  widgetId: string
  x: number
  y: number
  width: number
  height: number
}

export interface ScheduledReport {
  id: string
  frequency: ReportFrequency
  dayOfWeek?: string
  dayOfMonth?: number
  time: string
  recipients: string[]
  format: ReportFormat
  isActive: boolean
}

export interface Dashboard {
  id: string
  name: string
  description: string
  createdBy: string
  createdAt: string
  updatedAt: string
  lastViewedAt: string
  isDefault: boolean
  sharedWith: DashboardShare[]
  globalFilters: GlobalFilters
  widgetIds: string[]
  layout: WidgetLayout[]
  scheduledReports: ScheduledReport[]
}

export interface WidgetConfig {
  [key: string]: any
}

export interface WidgetData {
  [key: string]: any
}

export interface Widget {
  id: string
  name: string
  description: string
  type: WidgetType
  createdBy: string
  createdAt: string
  updatedAt: string
  config: WidgetConfig
  deepDiveDashboard: string | null
  data: WidgetData
}

export interface WidgetConnection {
  id: string
  fromWidgetId: string
  toWidgetId: string
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

export interface Team {
  id: string
  name: string
  memberIds: string[]
}

// =============================================================================
// Component Props
// =============================================================================

export interface DashboardsProps {
  /** List of all dashboards */
  dashboards: Dashboard[]
  /** Library of available widgets */
  widgets: Widget[]
  /** Connections between widgets (for AI text widgets) */
  widgetConnections: WidgetConnection[]
  /** Users for sharing */
  users: User[]
  /** Teams for sharing */
  teams: Team[]

  // Dashboard management
  /** Called when user creates a new dashboard */
  onCreateDashboard?: () => void
  /** Called when user selects a dashboard to view */
  onSelectDashboard?: (dashboardId: string) => void
  /** Called when user edits dashboard properties */
  onEditDashboard?: (dashboardId: string) => void
  /** Called when user duplicates a dashboard */
  onDuplicateDashboard?: (dashboardId: string) => void
  /** Called when user deletes a dashboard */
  onDeleteDashboard?: (dashboardId: string) => void

  // Widget management
  /** Called when user opens widget builder to create new widget */
  onCreateWidget?: () => void
  /** Called when user adds a widget from library to dashboard */
  onAddWidget?: (dashboardId: string, widgetId: string) => void
  /** Called when user edits a widget */
  onEditWidget?: (widgetId: string) => void
  /** Called when user duplicates a widget */
  onDuplicateWidget?: (widgetId: string) => void
  /** Called when user removes a widget from dashboard */
  onRemoveWidget?: (dashboardId: string, widgetId: string) => void
  /** Called when user deletes a widget from library */
  onDeleteWidget?: (widgetId: string) => void
  /** Called when user refreshes widget data */
  onRefreshWidget?: (widgetId: string) => void

  // Layout management
  /** Called when user drags/resizes widgets on dashboard */
  onUpdateLayout?: (dashboardId: string, layout: WidgetLayout[]) => void

  // Deep dive configuration
  /** Called when user configures deep dive dashboard for a widget */
  onConfigureDeepDive?: (widgetId: string, targetDashboardId: string | null) => void
  /** Called when user clicks a widget to drill down */
  onDrillDown?: (widgetId: string, targetDashboardId: string) => void

  // AI text widget connections
  /** Called when user connects an AI text widget to data widgets */
  onConnectWidgets?: (fromWidgetId: string, toWidgetIds: string[]) => void
  /** Called when user disconnects widgets */
  onDisconnectWidgets?: (connectionId: string) => void
  /** Called when user updates AI prompt for text widget */
  onUpdateAIPrompt?: (widgetId: string, prompt: string) => void
  /** Called when user regenerates AI text */
  onRegenerateAIText?: (widgetId: string) => void

  // Global filters
  /** Called when user changes global filters */
  onApplyGlobalFilters?: (dashboardId: string, filters: GlobalFilters) => void
  /** Called when user resets global filters */
  onResetGlobalFilters?: (dashboardId: string) => void

  // Sharing and permissions
  /** Called when user shares dashboard */
  onShareDashboard?: (dashboardId: string, shares: DashboardShare[]) => void
  /** Called when user generates public link */
  onGeneratePublicLink?: (dashboardId: string) => void
  /** Called when user revokes public link */
  onRevokePublicLink?: (dashboardId: string) => void

  // Export and reporting
  /** Called when user exports dashboard */
  onExportDashboard?: (dashboardId: string, format: ReportFormat) => void
  /** Called when user creates scheduled report */
  onScheduleReport?: (dashboardId: string, report: Omit<ScheduledReport, 'id'>) => void
  /** Called when user updates scheduled report */
  onUpdateScheduledReport?: (dashboardId: string, reportId: string, updates: Partial<ScheduledReport>) => void
  /** Called when user deletes scheduled report */
  onDeleteScheduledReport?: (dashboardId: string, reportId: string) => void

  // Search and filter
  /** Called when user searches dashboards */
  onSearchDashboards?: (query: string) => void
  /** Called when user filters widget library */
  onFilterWidgets?: (type: WidgetType | 'all') => void
}
