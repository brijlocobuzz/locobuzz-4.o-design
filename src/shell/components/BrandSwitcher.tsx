import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'

export interface Brand {
  id: string
  name: string
  logoUrl?: string
}

interface BrandSwitcherProps {
  brands: Brand[]
  currentBrand?: Brand
  onBrandChange?: (brand: Brand) => void
}

export function BrandSwitcher({
  brands,
  currentBrand,
  onBrandChange,
}: BrandSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (brand: Brand) => {
    onBrandChange?.(brand)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        {currentBrand?.logoUrl ? (
          <img
            src={currentBrand.logoUrl}
            alt={currentBrand.name}
            className="h-5 w-5 rounded object-cover"
          />
        ) : (
          <div className="flex h-5 w-5 items-center justify-center rounded bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-300">
            {currentBrand?.name?.[0] || 'B'}
          </div>
        )}
        <span className="max-w-32 truncate">
          {currentBrand?.name || 'Select Brand'}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-500" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {/* Search */}
          <div className="border-b border-slate-200 p-2 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-sm text-slate-900 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400"
              />
            </div>
          </div>

          {/* Brand List */}
          <div className="max-h-64 overflow-y-auto py-1">
            {filteredBrands.length === 0 ? (
              <p className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
                No brands found
              </p>
            ) : (
              filteredBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => handleSelect(brand)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="h-6 w-6 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-300">
                      {brand.name[0]}
                    </div>
                  )}
                  <span className="flex-1 text-left text-slate-900 dark:text-white">
                    {brand.name}
                  </span>
                  {currentBrand?.id === brand.id && (
                    <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export type { BrandSwitcherProps }
