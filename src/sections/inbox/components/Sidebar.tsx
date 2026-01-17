import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { SidebarProps } from '@/../product/sections/inbox/types'

export function Sidebar({ views, activeView, onViewChange }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'assigned-me': true,
    'my-team': true,
    'unassigned': true,
  })

  // Group views by category
  const statusViews = views.filter(v => v.category === 'status')
  const slaViews = views.filter(v => v.category === 'sla')
  const customViews = views.filter(v => v.category === 'custom')

  // Assignment views
  const assignedToMe = views.find(v => v.id === 'view-assigned-me')
  const myTeam = views.find(v => v.id === 'view-my-team')
  const unassigned = views.find(v => v.id === 'view-unassigned')

  const getColorClass = (color?: string) => {
    switch (color) {
      case 'red': return 'text-red-600 dark:text-red-400'
      case 'yellow': return 'text-yellow-600 dark:text-yellow-400'
      case 'orange': return 'text-orange-600 dark:text-orange-400'
      default: return 'text-slate-600 dark:text-slate-400'
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const renderAssignmentSection = (
    sectionId: string,
    view: typeof assignedToMe,
    label: string
  ) => {
    if (!view) return null
    const isExpanded = expandedSections[sectionId]

    return (
      <div className="mb-6">
        {/* Assignment Header - More Prominent */}
        <button
          onClick={() => toggleSection(sectionId)}
          className={`
            w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-semibold transition-colors
            ${activeView === view.id
              ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
              : 'text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900'
            }
          `}
        >
          <span className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
            {label}
          </span>
          {view.count > 0 && (
            <span className={`
              text-xs px-2 py-0.5 rounded-full font-medium
              ${activeView === view.id
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }
            `}>
              {view.count}
            </span>
          )}
        </button>

        {/* Nested Status & SLA Views */}
        {isExpanded && (
          <div className="mt-2">
            {/* Status Group with Vertical Label */}
            {statusViews.length > 0 && (
              <div className="relative">
                {/* Vertical "Status" Label */}
                <div className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap origin-center -rotate-90">
                    Status
                  </span>
                </div>

                {/* Status Items */}
                <div className="ml-6 space-y-0.5">
                  {statusViews.map(statusView => (
                    <button
                      key={statusView.id}
                      onClick={() => onViewChange?.(statusView.id)}
                      className={`
                        w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors
                        ${activeView === statusView.id
                          ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }
                      `}
                    >
                      <span className="flex items-center gap-2">
                        <span className={statusView.color ? getColorClass(statusView.color) : ''}>●</span>
                        {statusView.name}
                      </span>
                      {statusView.count > 0 && (
                        <span className={`
                          text-xs px-1.5 py-0.5 rounded-full
                          ${activeView === statusView.id
                            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }
                        `}>
                          {statusView.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SLA & Priority Group with Vertical Label */}
            {slaViews.length > 0 && (
              <div className="relative mt-2">
                {/* Vertical "SLA & Priority" Label */}
                <div className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap origin-center -rotate-90">
                    SLA
                  </span>
                </div>

                {/* SLA Items */}
                <div className="ml-6 space-y-0.5">
                  {slaViews.map(slaView => (
                    <button
                      key={slaView.id}
                      onClick={() => onViewChange?.(slaView.id)}
                      className={`
                        w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors
                        ${activeView === slaView.id
                          ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }
                      `}
                    >
                      <span className="flex items-center gap-2">
                        <span className={slaView.color ? getColorClass(slaView.color) : ''}>●</span>
                        {slaView.name}
                      </span>
                      {slaView.count > 0 && (
                        <span className={`
                          text-xs px-1.5 py-0.5 rounded-full
                          ${activeView === slaView.id
                            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }
                        `}>
                          {slaView.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-shrink-0 overflow-y-auto">
      <div className="p-4">
        {/* Assigned to Me */}
        {renderAssignmentSection('assigned-me', assignedToMe, 'Assigned to Me')}

        {/* My Team */}
        {renderAssignmentSection('my-team', myTeam, 'My Team')}

        {/* Unassigned */}
        {renderAssignmentSection('unassigned', unassigned, 'Unassigned')}

        {/* Custom Queues */}
        {customViews.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-3">
              Custom Queues
            </h3>
            <div className="space-y-1">
              {customViews.map(view => (
                <button
                  key={view.id}
                  onClick={() => onViewChange?.(view.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
                    ${activeView === view.id
                      ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    <span className={view.color ? getColorClass(view.color) : ''}>●</span>
                    {view.name}
                  </span>
                  {view.count > 0 && (
                    <span className={`
                      text-xs px-2 py-0.5 rounded-full
                      ${activeView === view.id
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }
                    `}>
                      {view.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
