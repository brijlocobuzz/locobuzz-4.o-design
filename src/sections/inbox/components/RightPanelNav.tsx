import { User, FileText, Ticket, Link2, Clock, FolderTree } from 'lucide-react'

export type RightPanelView =
  | 'customer'
  | 'personal-details'
  | 'ticket-info'
  | 'crm-integration'
  | 'timeline'
  | 'classification'

interface RightPanelNavProps {
  activeView: RightPanelView
  onViewChange: (view: RightPanelView) => void
  crmConnected?: boolean
}

const navItems = [
  {
    id: 'customer' as RightPanelView,
    icon: User,
    label: 'Customer Info',
    tooltip: 'Customer Information',
  },
  {
    id: 'classification' as RightPanelView,
    icon: FolderTree,
    label: 'Classification',
    tooltip: 'AI Classification & Entities',
  },
  {
    id: 'personal-details' as RightPanelView,
    icon: FileText,
    label: 'Personal Details',
    tooltip: 'Personal Details (CRM)',
  },
  {
    id: 'ticket-info' as RightPanelView,
    icon: Ticket,
    label: 'Ticket Info',
    tooltip: 'Ticket Information',
  },
  {
    id: 'crm-integration' as RightPanelView,
    icon: Link2,
    label: 'CRM',
    tooltip: 'CRM Integration',
  },
  {
    id: 'timeline' as RightPanelView,
    icon: Clock,
    label: 'Timeline',
    tooltip: 'Ticket Timeline',
  },
]

export function RightPanelNav({ activeView, onViewChange, crmConnected }: RightPanelNavProps) {
  return (
    <div className="flex w-16 flex-col border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-1 flex-col items-center gap-2 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          const showIndicator = item.id === 'crm-integration' && crmConnected

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={item.tooltip}
              className={`group relative flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              {showIndicator && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-900" />
              )}

              {/* Tooltip */}
              <div className="pointer-events-none absolute right-full mr-2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-slate-700">
                {item.tooltip}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
