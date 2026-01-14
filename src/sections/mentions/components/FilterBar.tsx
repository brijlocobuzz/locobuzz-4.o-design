import { LayoutGrid, List, Rows, Filter, Save, Search } from 'lucide-react'
import type { DisplayMode } from '@/../product/sections/mentions/types'

interface FilterBarProps {
  displayMode: DisplayMode
  onDisplayModeChange?: (mode: DisplayMode) => void
  onSaveView?: () => void
}

const displayModes: { mode: DisplayMode; icon: typeof LayoutGrid; label: string }[] = [
  { mode: 'card', icon: LayoutGrid, label: 'Card' },
  { mode: 'table', icon: List, label: 'Table' },
  { mode: 'feed', icon: Rows, label: 'Feed' },
]

export function FilterBar({ displayMode, onDisplayModeChange, onSaveView }: FilterBarProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95">
      <div className="flex items-center justify-between gap-4 p-4">
        {/* Search & Filters */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search mentions..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-indigo-500"
            />
          </div>

          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* View Mode & Save */}
        <div className="flex items-center gap-2">
          {/* Display Mode Toggle */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
            {displayModes.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => onDisplayModeChange?.(mode)}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  displayMode === mode
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
                title={label}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Save View */}
          <button
            onClick={onSaveView}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save View</span>
          </button>
        </div>
      </div>
    </div>
  )
}
