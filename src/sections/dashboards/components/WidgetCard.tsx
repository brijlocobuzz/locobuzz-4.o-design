import type { Widget } from '@/../product/sections/dashboards/types'
import { useState } from 'react'

interface WidgetCardProps {
  widget: Widget
  onEdit?: () => void
  onDuplicate?: () => void
  onRemove?: () => void
  onRefresh?: () => void
  onConfigureDeepDive?: (targetDashboardId: string | null) => void
  onDrillDown?: () => void
}

export function WidgetCard({
  widget,
  onEdit,
  onDuplicate,
  onRemove,
  onRefresh,
  onConfigureDeepDive,
  onDrillDown
}: WidgetCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const getWidgetIcon = () => {
    switch (widget.type) {
      case 'kpi_card':
        return '📊'
      case 'line_chart':
        return '📈'
      case 'bar_chart':
      case 'grouped_bar_chart':
      case 'horizontal_bar_chart':
        return '📊'
      case 'pie_chart':
        return '🥧'
      case 'ai_text':
        return '🤖'
      case 'data_grid':
        return '📋'
      default:
        return '📊'
    }
  }

  const renderWidgetContent = () => {
    // Render different content based on widget type
    if (widget.type === 'kpi_card') {
      const data = widget.data as { value: string | number; trend?: number; trendDirection?: string }
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {data.value}
          </div>
          {data.trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              data.trendDirection === 'up' ? 'text-green-600 dark:text-green-400' :
              data.trendDirection === 'down' ? 'text-red-600 dark:text-red-400' :
              'text-slate-600 dark:text-slate-400'
            }`}>
              {data.trendDirection === 'up' ? '↗' : data.trendDirection === 'down' ? '↘' : '→'}
              {Math.abs(data.trend)}%
            </div>
          )}
        </div>
      )
    }

    if (widget.type === 'ai_text') {
      const data = widget.data as { generatedText: string }
      return (
        <div className="h-full overflow-auto p-4">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {data.generatedText}
          </p>
        </div>
      )
    }

    // Placeholder for chart widgets
    return (
      <div className="flex items-center justify-center h-full text-6xl opacity-20">
        {getWidgetIcon()}
      </div>
    )
  }

  return (
    <div
      className="group relative h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
      onClick={() => widget.deepDiveDashboard && onDrillDown?.()}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
            {widget.name}
          </h3>
          {widget.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
              {widget.description}
            </p>
          )}
        </div>

        {/* Action Menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            onBlur={() => setTimeout(() => setShowMenu(false), 200)}
            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
          >
            <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-10">
              <button
                onClick={() => { onEdit?.(); setShowMenu(false) }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Edit Widget
              </button>
              <button
                onClick={() => { onRefresh?.(); setShowMenu(false) }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Refresh Data
              </button>
              <button
                onClick={() => { onDuplicate?.(); setShowMenu(false) }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Duplicate
              </button>
              <button
                onClick={() => { onConfigureDeepDive?.(null); setShowMenu(false) }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Configure Deep Dive
              </button>
              <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
              <button
                onClick={() => { onRemove?.(); setShowMenu(false) }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                Remove from Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-60px)]">
        {renderWidgetContent()}
      </div>

      {/* Deep Dive Indicator */}
      {widget.deepDiveDashboard && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="px-2 py-1 bg-indigo-600 dark:bg-indigo-500 text-white text-xs rounded-md flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Deep Dive
          </div>
        </div>
      )}
    </div>
  )
}
