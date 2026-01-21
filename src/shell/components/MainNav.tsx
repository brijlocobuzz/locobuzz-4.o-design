import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { NavigationItem } from './AppShell'

interface MainNavProps {
  items: NavigationItem[]
  isCollapsed: boolean
  onToggleCollapse: () => void
  onNavigate?: (href: string) => void
}

export function MainNav({
  items,
  isCollapsed,
  onToggleCollapse,
  onNavigate,
}: MainNavProps) {
  // Separate settings from other items (settings goes at bottom)
  const mainItems = items.filter((item) => item.id !== 'settings')
  const settingsItem = items.find((item) => item.id === 'settings')

  return (
    <nav
      className={`flex flex-col border-r border-slate-200 bg-slate-50 transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 ${
        isCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Collapse Toggle */}
      <div className="flex h-10 items-center justify-end px-2">
        <button
          onClick={onToggleCollapse}
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 space-y-1 px-2">
        {mainItems.map((item) => (
          <NavItem key={item.id} item={item} isCollapsed={isCollapsed} onNavigate={onNavigate} />
        ))}
      </div>

      {/* Settings at Bottom */}
      {settingsItem && (
        <div className="border-t border-slate-200 px-2 py-2 dark:border-slate-800">
          <NavItem item={settingsItem} isCollapsed={isCollapsed} onNavigate={onNavigate} />
        </div>
      )}
    </nav>
  )
}

interface NavItemProps {
  item: NavigationItem
  isCollapsed: boolean
  onNavigate?: (href: string) => void
}

function NavItem({ item, isCollapsed, onNavigate }: NavItemProps) {
  const handleClick = () => {
    onNavigate?.(item.href)
  }

  return (
    <button
      onClick={handleClick}
      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        item.isActive
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
      } ${isCollapsed ? 'justify-center' : ''}`}
      title={isCollapsed ? item.label : undefined}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center ${
          item.isActive
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200'
        }`}
      >
        {item.icon}
      </span>
      {!isCollapsed && <span>{item.label}</span>}
    </button>
  )
}

export type { MainNavProps }
