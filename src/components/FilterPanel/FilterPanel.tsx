import { useState, useRef, useEffect } from 'react'
import {
  X,
  Plus,
  ChevronDown,
  ChevronRight,
  Save,
  Trash2,
  Check,
  Search,
} from 'lucide-react'

// Types
export interface FilterCondition {
  id: string
  field: string
  operator: string
  value: string | string[]
}

export interface FilterGroup {
  id: string
  logic: 'AND' | 'OR'
  conditions: (FilterCondition | FilterGroup)[]
}

export interface SelectOption {
  value: string
  label: string
  icon?: string
}

export interface FilterFamily {
  id: string
  name: string
  attributes: {
    id: string
    name: string
    type: 'text' | 'select' | 'multiselect' | 'date' | 'number'
    operators: string[]
    options?: SelectOption[]
  }[]
}

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  teams: SelectOption[]
  channels: SelectOption[]
  filterFamilies: FilterFamily[]
  activeFilters?: FilterGroup
  filterTags?: string[]
  onApplyFilters?: (filters: FilterGroup) => void
  onSaveFilter?: (name: string, filters: FilterGroup) => void
  onTagAdd?: (tag: string) => void
  onTagRemove?: (tag: string) => void
  onTeamChange?: (teams: string[]) => void
  onChannelChange?: (channels: string[]) => void
  selectedTeams?: string[]
  selectedChannels?: string[]
}

// Multi-select dropdown with "Only" feature
function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: SelectOption[]
  selected: string[]
  onChange: (values: string[]) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleOnly = (value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([value])
  }

  const selectedLabels = options
    .filter(o => selected.includes(o.value))
    .map(o => o.label)
    .join(', ')

  return (
    <div ref={ref} className="relative">
      <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <span className={selected.length > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
          {selected.length > 0
            ? selectedLabels.length > 30
              ? `${selected.length} selected`
              : selectedLabels
            : `Select ${label.toLowerCase()}...`}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {options.map(option => (
            <div
              key={option.value}
              onClick={() => handleToggle(option.value)}
              className="group flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    selected.includes(option.value)
                      ? 'border-indigo-500 bg-indigo-500 text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {selected.includes(option.value) && <Check className="h-3 w-3" />}
                </div>
                {option.icon && <span className="text-sm">{option.icon}</span>}
                <span className="text-sm text-slate-700 dark:text-slate-300">{option.label}</span>
              </div>

              {/* "Only" button on hover */}
              <button
                onClick={(e) => handleOnly(option.value, e)}
                className="hidden rounded px-2 py-0.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 group-hover:block dark:text-indigo-400 dark:hover:bg-indigo-950"
              >
                Only
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Query builder component
function QueryBuilder({
  filterFamilies,
  group,
  onChange,
  isRoot = true,
}: {
  filterFamilies: FilterFamily[]
  group: FilterGroup
  onChange: (group: FilterGroup) => void
  isRoot?: boolean
}) {
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null)
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null)

  const addCondition = () => {
    if (!selectedFamily || !selectedAttribute) return

    const family = filterFamilies.find(f => f.id === selectedFamily)
    const attribute = family?.attributes.find(a => a.id === selectedAttribute)
    if (!attribute) return

    const newCondition: FilterCondition = {
      id: `cond-${Date.now()}`,
      field: `${selectedFamily}.${selectedAttribute}`,
      operator: attribute.operators[0] || 'equals',
      value: '',
    }

    onChange({
      ...group,
      conditions: [...group.conditions, newCondition],
    })

    setSelectedFamily(null)
    setSelectedAttribute(null)
  }

  const addGroup = () => {
    const newGroup: FilterGroup = {
      id: `group-${Date.now()}`,
      logic: 'AND',
      conditions: [],
    }
    onChange({
      ...group,
      conditions: [...group.conditions, newGroup],
    })
  }

  const removeCondition = (id: string) => {
    onChange({
      ...group,
      conditions: group.conditions.filter(c => c.id !== id),
    })
  }

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    onChange({
      ...group,
      conditions: group.conditions.map(c =>
        c.id === id ? { ...c, ...updates } : c
      ) as (FilterCondition | FilterGroup)[],
    })
  }

  const toggleLogic = () => {
    onChange({
      ...group,
      logic: group.logic === 'AND' ? 'OR' : 'AND',
    })
  }

  const currentFamily = filterFamilies.find(f => f.id === selectedFamily)

  return (
    <div className={`space-y-3 ${!isRoot ? 'ml-4 border-l-2 border-slate-200 pl-4 dark:border-slate-700' : ''}`}>
      {/* Logic toggle */}
      {group.conditions.length > 1 && (
        <button
          onClick={toggleLogic}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          {group.logic}
        </button>
      )}

      {/* Conditions */}
      {group.conditions.map((condition) => {
        if ('logic' in condition) {
          // It's a nested group
          return (
            <div key={condition.id} className="relative">
              <button
                onClick={() => removeCondition(condition.id)}
                className="absolute -left-2 top-0 rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200 dark:bg-red-950 dark:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
              <QueryBuilder
                filterFamilies={filterFamilies}
                group={condition}
                onChange={(updated) => {
                  onChange({
                    ...group,
                    conditions: group.conditions.map(c =>
                      c.id === condition.id ? updated : c
                    ) as (FilterCondition | FilterGroup)[],
                  })
                }}
                isRoot={false}
              />
            </div>
          )
        }

        // It's a condition
        const [familyId, attrId] = condition.field.split('.')
        const family = filterFamilies.find(f => f.id === familyId)
        const attribute = family?.attributes.find(a => a.id === attrId)

        return (
          <div
            key={condition.id}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800"
          >
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {family?.name} → {attribute?.name}
            </span>

            <select
              value={condition.operator}
              onChange={(e) => updateCondition(condition.id, { operator: e.target.value })}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-700"
            >
              {attribute?.operators.map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>

            {attribute?.type === 'select' || attribute?.type === 'multiselect' ? (
              <select
                value={Array.isArray(condition.value) ? condition.value[0] : condition.value}
                onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                className="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-700"
              >
                <option value="">Select...</option>
                {attribute.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                type={attribute?.type === 'number' ? 'number' : 'text'}
                value={Array.isArray(condition.value) ? condition.value.join(', ') : condition.value}
                onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                placeholder="Enter value..."
                className="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-700"
              />
            )}

            <button
              onClick={() => removeCondition(condition.id)}
              className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-red-600 dark:hover:bg-slate-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}

      {/* Add condition/group */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2">
          <select
            value={selectedFamily || ''}
            onChange={(e) => {
              setSelectedFamily(e.target.value || null)
              setSelectedAttribute(null)
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="">Select field...</option>
            {filterFamilies.map(family => (
              <option key={family.id} value={family.id}>{family.name}</option>
            ))}
          </select>

          {selectedFamily && (
            <>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <select
                value={selectedAttribute || ''}
                onChange={(e) => setSelectedAttribute(e.target.value || null)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="">Select attribute...</option>
                {currentFamily?.attributes.map(attr => (
                  <option key={attr.id} value={attr.id}>{attr.name}</option>
                ))}
              </select>
            </>
          )}

          {selectedFamily && selectedAttribute && (
            <button
              onClick={addCondition}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          onClick={addGroup}
          className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-medium text-slate-500 hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-600 dark:hover:border-indigo-500"
        >
          + Group
        </button>
      </div>
    </div>
  )
}

export function FilterPanel({
  isOpen,
  onClose,
  teams,
  channels,
  filterFamilies,
  activeFilters,
  filterTags = [],
  onApplyFilters,
  onSaveFilter,
  onTagAdd,
  onTagRemove,
  onTeamChange,
  onChannelChange,
  selectedTeams = [],
  selectedChannels = [],
}: FilterPanelProps) {
  const [tagInput, setTagInput] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [filterName, setFilterName] = useState('')
  const [filters, setFilters] = useState<FilterGroup>(
    activeFilters || { id: 'root', logic: 'AND', conditions: [] }
  )

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      onTagAdd?.(tagInput.trim())
      setTagInput('')
    }
  }

  const handleSave = () => {
    if (filterName.trim()) {
      onSaveFilter?.(filterName.trim(), filters)
      setShowSaveDialog(false)
      setFilterName('')
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed bottom-0 right-0 top-0 z-50 flex w-[480px] flex-col bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Filters</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Quick Filter Tags */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Quick Filter
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type and press Enter to add filter tag..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            {filterTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {filterTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  >
                    {tag}
                    <button
                      onClick={() => onTagRemove?.(tag)}
                      className="rounded-full p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Team Selector */}
          <div className="mb-4">
            <MultiSelectDropdown
              label="Team"
              options={teams}
              selected={selectedTeams}
              onChange={(values) => onTeamChange?.(values)}
            />
          </div>

          {/* Channel Selector */}
          <div className="mb-6">
            <MultiSelectDropdown
              label="Channel"
              options={channels}
              selected={selectedChannels}
              onChange={(values) => onChannelChange?.(values)}
            />
          </div>

          {/* Divider */}
          <div className="mb-6 border-t border-slate-200 dark:border-slate-700" />

          {/* Query Builder */}
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Advanced Filters
            </label>
            <QueryBuilder
              filterFamilies={filterFamilies}
              group={filters}
              onChange={setFilters}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <button
            onClick={() => {
              setFilters({ id: 'root', logic: 'AND', conditions: [] })
              onTeamChange?.([])
              onChannelChange?.([])
            }}
            className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Clear All
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
            <button
              onClick={() => onApplyFilters?.(filters)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-80 rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800">
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                Save Filter
              </h3>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Enter filter name..."
                className="mb-4 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
