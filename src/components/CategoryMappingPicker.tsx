import { useState, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface CategoryMapping {
  category: string
  subcategory: string
  subSubcategory: string
}

interface CategoryMappingPickerProps {
  value?: CategoryMapping
  onChange?: (value: CategoryMapping) => void
  disabled?: boolean
}

// Sample category hierarchy - in production this would come from an API
const CATEGORY_HIERARCHY: Record<string, Record<string, string[]>> = {
  'Product': {
    'Features': ['Functionality', 'Performance', 'Usability', 'Design'],
    'Quality': ['Durability', 'Reliability', 'Materials', 'Finish'],
    'Value': ['Pricing', 'Discounts', 'Warranty', 'Support'],
  },
  'Service': {
    'Delivery': ['Speed', 'Accuracy', 'Packaging', 'Tracking'],
    'Support': ['Responsiveness', 'Knowledge', 'Friendliness', 'Resolution'],
    'Installation': ['Ease', 'Quality', 'Time', 'Follow-up'],
  },
  'Experience': {
    'Store': ['Ambiance', 'Cleanliness', 'Layout', 'Accessibility'],
    'Website': ['Navigation', 'Speed', 'Design', 'Mobile Experience'],
    'App': ['Interface', 'Features', 'Stability', 'Updates'],
  },
  'Brand': {
    'Reputation': ['Trust', 'Innovation', 'Sustainability', 'Social Impact'],
    'Communication': ['Advertising', 'Social Media', 'Email', 'Content'],
    'Values': ['Ethics', 'Transparency', 'Community', 'Diversity'],
  },
}

export function CategoryMappingPicker({ value, onChange, disabled }: CategoryMappingPickerProps) {
  const [category, setCategory] = useState(value?.category || '')
  const [subcategory, setSubcategory] = useState(value?.subcategory || '')
  const [subSubcategory, setSubSubcategory] = useState(value?.subSubcategory || '')

  const [categoryOpen, setCategoryOpen] = useState(false)
  const [subcategoryOpen, setSubcategoryOpen] = useState(false)
  const [subSubcategoryOpen, setSubSubcategoryOpen] = useState(false)

  const categories = Object.keys(CATEGORY_HIERARCHY)
  const subcategories = category ? Object.keys(CATEGORY_HIERARCHY[category] || {}) : []
  const subSubcategories = category && subcategory ? CATEGORY_HIERARCHY[category]?.[subcategory] || [] : []

  useEffect(() => {
    if (category && subcategory && subSubcategory) {
      onChange?.({ category, subcategory, subSubcategory })
    }
  }, [category, subcategory, subSubcategory, onChange])

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    setSubcategory('')
    setSubSubcategory('')
    setCategoryOpen(false)
  }

  const handleSubcategoryChange = (newSubcategory: string) => {
    setSubcategory(newSubcategory)
    setSubSubcategory('')
    setSubcategoryOpen(false)
  }

  const handleSubSubcategoryChange = (newSubSubcategory: string) => {
    setSubSubcategory(newSubSubcategory)
    setSubSubcategoryOpen(false)
  }

  return (
    <div className="space-y-3">
      {/* Category */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
          Category
        </label>
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setCategoryOpen(!categoryOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 hover:border-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-slate-600"
          >
            <span className={category ? '' : 'text-slate-400 dark:text-slate-500'}>
              {category || 'Select category'}
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
          {categoryOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setCategoryOpen(false)} />
              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-700"
                  >
                    <span>{cat}</span>
                    {category === cat && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Subcategory */}
      {category && (
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Subcategory
          </label>
          <div className="relative">
            <button
              type="button"
              disabled={disabled || !category}
              onClick={() => !disabled && setSubcategoryOpen(!subcategoryOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 hover:border-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-slate-600"
            >
              <span className={subcategory ? '' : 'text-slate-400 dark:text-slate-500'}>
                {subcategory || 'Select subcategory'}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
            {subcategoryOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSubcategoryOpen(false)} />
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  {subcategories.map((subcat) => (
                    <button
                      key={subcat}
                      type="button"
                      onClick={() => handleSubcategoryChange(subcat)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-700"
                    >
                      <span>{subcat}</span>
                      {subcategory === subcat && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sub-subcategory */}
      {subcategory && (
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Sub-subcategory
          </label>
          <div className="relative">
            <button
              type="button"
              disabled={disabled || !subcategory}
              onClick={() => !disabled && setSubSubcategoryOpen(!subSubcategoryOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 hover:border-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-slate-600"
            >
              <span className={subSubcategory ? '' : 'text-slate-400 dark:text-slate-500'}>
                {subSubcategory || 'Select sub-subcategory'}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
            {subSubcategoryOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSubSubcategoryOpen(false)} />
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  {subSubcategories.map((subSubcat) => (
                    <button
                      key={subSubcat}
                      type="button"
                      onClick={() => handleSubSubcategoryChange(subSubcat)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-700"
                    >
                      <span>{subSubcat}</span>
                      {subSubcategory === subSubcat && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Full path display */}
      {category && subcategory && subSubcategory && (
        <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Full Path</div>
          <div className="mt-1 text-sm text-slate-900 dark:text-white">
            {category} → {subcategory} → {subSubcategory}
          </div>
        </div>
      )}
    </div>
  )
}
