import type { Dashboard, Widget, WidgetLayout } from '@/../product/sections/dashboards/types'
import { WidgetCard } from './WidgetCard'

interface WidgetGridProps {
  dashboard: Dashboard
  widgets: Widget[]
  onAddWidget?: (widgetId: string) => void
  onEditWidget?: (widgetId: string) => void
  onDuplicateWidget?: (widgetId: string) => void
  onRemoveWidget?: (widgetId: string) => void
  onRefreshWidget?: (widgetId: string) => void
  onUpdateLayout?: (layout: WidgetLayout[]) => void
  onConfigureDeepDive?: (widgetId: string, targetDashboardId: string | null) => void
  onDrillDown?: (widgetId: string, targetDashboardId: string) => void
}

export function WidgetGrid({
  dashboard,
  widgets,
  onAddWidget,
  onEditWidget,
  onDuplicateWidget,
  onRemoveWidget,
  onRefreshWidget,
  onConfigureDeepDive,
  onDrillDown
}: WidgetGridProps) {
  if (widgets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-2xl mx-auto mb-4 flex items-center justify-center opacity-50">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No Widgets Yet</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Add widgets from your library or create new ones to start visualizing your data
          </p>
          <button
            onClick={() => onAddWidget?.('')}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200"
          >
            Add Widget
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Grid Layout - Using CSS Grid with 12 columns */}
      <div className="grid grid-cols-12 gap-4 auto-rows-[120px]">
        {dashboard.layout.map((layoutItem) => {
          const widget = widgets.find(w => w.id === layoutItem.widgetId)
          if (!widget) return null

          return (
            <div
              key={layoutItem.widgetId}
              className="transition-all duration-200"
              style={{
                gridColumn: `span ${layoutItem.width}`,
                gridRow: `span ${layoutItem.height}`
              }}
            >
              <WidgetCard
                widget={widget}
                onEdit={() => onEditWidget?.(widget.id)}
                onDuplicate={() => onDuplicateWidget?.(widget.id)}
                onRemove={() => onRemoveWidget?.(widget.id)}
                onRefresh={() => onRefreshWidget?.(widget.id)}
                onConfigureDeepDive={(targetId) => onConfigureDeepDive?.(widget.id, targetId)}
                onDrillDown={() => widget.deepDiveDashboard && onDrillDown?.(widget.id, widget.deepDiveDashboard)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
