import {
  ClipboardCheck,
  Users,
  Radio,
  Search,
  FolderTree,
  Sparkles,
  Plug,
  BarChart3,
} from 'lucide-react'
import type { Navigation, UserRole } from '@/../product/sections/settings/types'

const iconMap = {
  ClipboardCheck,
  Users,
  Radio,
  Search,
  FolderTree,
  Sparkles,
  Plug,
  BarChart3,
}

interface SetupNavProps {
  navigation: Navigation
  currentUserRole: UserRole
  onNavigate?: (pageId: string) => void
}

export function SetupNav({ navigation, currentUserRole, onNavigate }: SetupNavProps) {
  const visiblePages = navigation.pages.filter((page) =>
    page.requiredRoles.includes(currentUserRole)
  )

  return (
    <nav className="flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Setup Center
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {visiblePages.map((page) => {
          const Icon = iconMap[page.icon as keyof typeof iconMap]
          const isActive = navigation.activePage === page.id

          return (
            <button
              key={page.id}
              onClick={() => onNavigate?.(page.id)}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-100'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {Icon && (
                <Icon
                  className={`h-5 w-5 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                  }`}
                />
              )}
              <span className="text-sm font-medium">{page.label}</span>
              {page.scope === 'brand' && (
                <span className="ml-auto text-xs text-slate-400">Brand</span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
