import { Search, SlidersHorizontal } from 'lucide-react'
import { BrandSwitcher, type Brand } from './BrandSwitcher'
import { UserMenu, type User } from './UserMenu'

interface TopBarProps {
  brands: Brand[]
  currentBrand?: Brand
  user: User
  onBrandChange?: (brand: Brand) => void
  onCommandBarOpen?: () => void
  onFilterOpen?: () => void
  onLogout?: () => void
  searchPlaceholder?: string
  showFilterButton?: boolean
}

export function TopBar({
  brands,
  currentBrand,
  user,
  onBrandChange,
  onCommandBarOpen,
  onFilterOpen,
  onLogout,
  searchPlaceholder = 'Search or jump to...',
  showFilterButton = true,
}: TopBarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
      {/* Left: Logo */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <span className="text-sm font-bold text-white">L</span>
          </div>
          <span className="text-lg font-semibold text-slate-900 dark:text-white">
            Locobuzz
          </span>
        </div>

        {/* Brand Switcher */}
        <BrandSwitcher
          brands={brands}
          currentBrand={currentBrand}
          onBrandChange={onBrandChange}
        />
      </div>

      {/* Center: Command Bar Trigger + Filter Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onCommandBarOpen}
          className="flex h-9 w-80 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-700"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">{searchPlaceholder}</span>
          <kbd className="hidden rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs font-medium text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400 sm:inline-block">
            ⌘K
          </kbd>
        </button>

        {showFilterButton && (
          <button
            onClick={onFilterOpen}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-700"
            title="Open filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        )}
      </div>

      {/* Right: User Menu */}
      <UserMenu user={user} onLogout={onLogout} />
    </header>
  )
}

export type { TopBarProps }
