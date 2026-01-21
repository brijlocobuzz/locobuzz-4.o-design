import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Building2 } from 'lucide-react'

export interface Brand {
  id: string
  name: string
  color?: string
}

export interface BrandFilterProps {
  brands?: Brand[]
  selectedBrands: string[]
  onChange: (selectedBrands: string[]) => void
}

const defaultBrands: Brand[] = [
  { id: 'locobuzz', name: 'Locobuzz', color: 'bg-indigo-600' },
  { id: 'acme-corp', name: 'ACME Corp', color: 'bg-blue-600' },
  { id: 'techstart', name: 'TechStart', color: 'bg-purple-600' },
  { id: 'global-retail', name: 'Global Retail', color: 'bg-emerald-600' },
  { id: 'foodie-delights', name: 'Foodie Delights', color: 'bg-orange-600' },
]

export function BrandFilter({
  brands = defaultBrands,
  selectedBrands,
  onChange
}: BrandFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const toggleBrand = (brandId: string) => {
    if (selectedBrands.includes(brandId)) {
      onChange(selectedBrands.filter(id => id !== brandId))
    } else {
      onChange([...selectedBrands, brandId])
    }
  }

  const selectOnly = (brandId: string) => {
    onChange([brandId])
  }

  const selectAll = () => {
    onChange(brands.map(b => b.id))
  }

  const clearAll = () => {
    onChange([])
  }

  const getButtonLabel = () => {
    if (selectedBrands.length === 0) {
      return 'All Brands'
    }
    if (selectedBrands.length === brands.length) {
      return 'All Brands'
    }
    if (selectedBrands.length === 1) {
      const brand = brands.find(b => b.id === selectedBrands[0])
      return brand ? brand.name : '1 Brand'
    }
    return `${selectedBrands.length} Brands`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
      >
        <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-slate-700 dark:text-slate-300">
          {getButtonLabel()}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <div className="font-semibold text-slate-900 dark:text-white">
                Filter by Brand
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={selectAll}
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  Select All
                </button>
                <span className="text-slate-400">•</span>
                <button
                  onClick={clearAll}
                  className="text-slate-600 hover:text-slate-700 dark:text-slate-400"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Brand List */}
            <div className="max-h-80 overflow-y-auto p-2">
              {brands.map((brand) => {
                const isSelected = selectedBrands.includes(brand.id)

                return (
                  <div
                    key={brand.id}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/30'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <button
                      onClick={() => toggleBrand(brand.id)}
                      className="flex flex-1 items-center gap-3"
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded ${brand.color || 'bg-indigo-600'} text-white`}>
                        <Building2 className="h-4 w-4" />
                      </div>
                      <span className="flex-1 text-left text-sm text-slate-700 dark:text-slate-300">
                        {brand.name}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </button>
                    {/* Only button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        selectOnly(brand.id)
                      }}
                      className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-950"
                    >
                      Only
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Footer with count */}
            <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-700">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {selectedBrands.length === 0
                  ? 'No brands selected (showing all)'
                  : `${selectedBrands.length} of ${brands.length} selected`}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
