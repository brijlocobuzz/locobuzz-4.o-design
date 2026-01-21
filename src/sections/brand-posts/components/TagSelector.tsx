import { useState } from 'react'
import type { Campaign, Theme, Objective } from '@/../product/sections/brand-posts/types'
import { Tag, ChevronDown, X } from 'lucide-react'

interface TagSelectorProps {
  type: 'campaign' | 'theme' | 'objective'
  items: Campaign[] | Theme[] | Objective[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  compact?: boolean
}

export function TagSelector({ type, items, selectedId, onSelect, compact = false }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selected = items.find(item => item.id === selectedId)

  const labels = {
    campaign: 'Campaign',
    theme: 'Theme',
    objective: 'Objective'
  }

  const colors = {
    campaign: 'sky',
    theme: 'indigo',
    objective: 'emerald'
  }

  const color = colors[type]

  if (compact && !selected) {
    return null
  }

  return (
    <div className="relative inline-block">
      {selected ? (
        <div
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-${color}-50 dark:bg-${color}-950 text-${color}-700 dark:text-${color}-300 border border-${color}-200 dark:border-${color}-800 cursor-pointer hover:bg-${color}-100 dark:hover:bg-${color}-900 transition-colors`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Tag className="w-3 h-3" />
          <span>{selected.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelect(null)
            }}
            className={`hover:bg-${color}-200 dark:hover:bg-${color}-800 rounded p-0.5`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <Tag className="w-3 h-3" />
          <span>+ {labels[type]}</span>
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 max-h-64 overflow-auto">
            <div className="p-1">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.id)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    item.id === selectedId
                      ? `bg-${color}-50 dark:bg-${color}-950 text-${color}-700 dark:text-${color}-300`
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="font-medium">{item.name}</div>
                  {'description' in item && item.description && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.description}
                    </div>
                  )}
                </button>
              ))}

              {items.length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  No {type}s available
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
