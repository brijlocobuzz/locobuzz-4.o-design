import type { Dashboard, DashboardShare, ScheduledReport, ReportFormat } from '@/../product/sections/dashboards/types'
import { useState } from 'react'

interface DashboardHeaderProps {
  dashboard: Dashboard
  onEditDashboard?: () => void
  onDuplicateDashboard?: () => void
  onDeleteDashboard?: () => void
  onShareDashboard?: (shares: DashboardShare[]) => void
  onGeneratePublicLink?: () => void
  onExportDashboard?: (format: ReportFormat) => void
  onScheduleReport?: (report: Omit<ScheduledReport, 'id'>) => void
}

export function DashboardHeader({
  dashboard,
  onEditDashboard,
  onDuplicateDashboard,
  onDeleteDashboard,
  onShareDashboard,
  onExportDashboard,
  onScheduleReport,
}: DashboardHeaderProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1 truncate">
            {dashboard.name}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {dashboard.description}
          </p>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {/* Share Button */}
          <button
            onClick={() => onShareDashboard?.(dashboard.sharedWith)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>

          {/* Export Button */}
          <button
            onClick={() => onExportDashboard?.('pdf')}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>

          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              onBlur={() => setTimeout(() => setShowMenu(false), 200)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-10">
                <button
                  onClick={() => { onEditDashboard?.(); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Edit Dashboard
                </button>
                <button
                  onClick={() => { onDuplicateDashboard?.(); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => { onScheduleReport?.({ frequency: 'weekly', time: '09:00', recipients: [], format: 'pdf', isActive: true }); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Schedule Report
                </button>
                <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                <button
                  onClick={() => { onDeleteDashboard?.(); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
