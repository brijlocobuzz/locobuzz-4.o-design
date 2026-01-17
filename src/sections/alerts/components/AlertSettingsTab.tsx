import { useState } from 'react'
import type {
  AlertConfiguration,
  PerformanceMetrics,
  User
} from '@/../product/sections/alerts/types'
import {
  Search,
  Filter,
  Edit,
  Copy,
  Trash2,
  BarChart3,
  MoreHorizontal,
  Power,
  PowerOff,
  Download,
  Tag
} from 'lucide-react'

interface AlertSettingsTabProps {
  alertConfigurations: AlertConfiguration[]
  performanceMetrics: PerformanceMetrics[]
  users: User[]
  onEdit?: (alertConfigId: string) => void
  onToggle?: (alertConfigId: string, isActive: boolean) => void
  onDuplicate?: (alertConfigId: string) => void
  onDelete?: (alertConfigId: string) => void
  onViewStats?: (alertConfigId: string) => void
  onBulkToggle?: (alertConfigIds: string[], isActive: boolean) => void
  onBulkDelete?: (alertConfigIds: string[]) => void
  onApplyFilters?: (filters: any) => void
}

export function AlertSettingsTab({
  alertConfigurations,
  performanceMetrics,
  users,
  onEdit,
  onToggle,
  onDuplicate,
  onDelete,
  onViewStats,
  onBulkToggle,
  onBulkDelete,
  onApplyFilters
}: AlertSettingsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  // Filter configurations
  const filteredConfigs = alertConfigurations.filter(config => {
    // Search filter
    if (searchQuery && !config.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !config.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Type filter
    if (selectedType.length > 0 && !selectedType.includes(config.type)) {
      return false
    }

    // Status filter
    if (selectedStatus.length > 0) {
      const status = config.isActive ? 'active' : 'inactive'
      if (!selectedStatus.includes(status)) {
        return false
      }
    }

    return true
  })

  const toggleSelection = (alertId: string) => {
    const newSelected = new Set(selectedAlerts)
    if (newSelected.has(alertId)) {
      newSelected.delete(alertId)
    } else {
      newSelected.add(alertId)
    }
    setSelectedAlerts(newSelected)
  }

  const toggleAll = () => {
    if (selectedAlerts.size === filteredConfigs.length) {
      setSelectedAlerts(new Set())
    } else {
      setSelectedAlerts(new Set(filteredConfigs.map(c => c.id)))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const typeStyles = {
    simple: { color: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300', label: 'Simple' },
    volumetric: { color: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300', label: 'Volumetric' },
    anomaly: { color: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300', label: 'Anomaly' }
  }

  const hasSelected = selectedAlerts.size > 0
  const hasFilters = searchQuery || selectedType.length > 0 || selectedStatus.length > 0

  return (
    <div className="h-full flex flex-col">
      {/* Header with Search & Filters */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search alert configurations..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg border font-medium transition-all flex items-center gap-2 ${
              showFilters || hasFilters
                ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasFilters && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-4">
            {/* Type Filters */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Alert Type
              </label>
              <div className="flex flex-wrap gap-2">
                {['simple', 'volumetric', 'anomaly'].map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      const newTypes = selectedType.includes(type)
                        ? selectedType.filter(t => t !== type)
                        : [...selectedType, type]
                      setSelectedType(newTypes)
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedType.includes(type)
                        ? typeStyles[type as keyof typeof typeStyles].color + ' border-2 border-current'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {typeStyles[type as keyof typeof typeStyles].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filters */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Status
              </label>
              <div className="flex gap-2">
                {['active', 'inactive'].map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      const newStatus = selectedStatus.includes(status)
                        ? selectedStatus.filter(s => s !== status)
                        : [...selectedStatus, status]
                      setSelectedStatus(newStatus)
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedStatus.includes(status)
                        ? status === 'active'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-2 border-slate-500'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {hasSelected && (
        <div className="px-6 py-3 bg-indigo-50 dark:bg-indigo-950 border-b border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
              {selectedAlerts.size} alert{selectedAlerts.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onBulkToggle?.(Array.from(selectedAlerts), true)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-lg text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors flex items-center gap-2"
              >
                <Power className="w-4 h-4" />
                Activate
              </button>
              <button
                onClick={() => onBulkToggle?.(Array.from(selectedAlerts), false)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-lg text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors flex items-center gap-2"
              >
                <PowerOff className="w-4 h-4" />
                Deactivate
              </button>
              <button
                onClick={() => onBulkDelete?.(Array.from(selectedAlerts))}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-700 rounded-lg text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedAlerts.size === filteredConfigs.length && filteredConfigs.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Alert Name
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Type
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Created
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Last Triggered
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Triggers
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-950 divide-y divide-slate-200 dark:divide-slate-800">
            {filteredConfigs.map(config => {
              const typeStyle = typeStyles[config.type]
              const isSelected = selectedAlerts.has(config.id)
              const metrics = performanceMetrics.find(m => m.alertConfigId === config.id)

              return (
                <tr
                  key={config.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${
                    isSelected ? 'bg-indigo-50 dark:bg-indigo-950' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(config.id)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <div className="font-medium text-slate-900 dark:text-white truncate">
                        {config.name}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {config.description}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${typeStyle.color}`}>
                      {typeStyle.label}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(config.createdAt)}
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {config.lastTriggered ? formatDate(config.lastTriggered) : '—'}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {config.triggerCount}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onToggle?.(config.id, !config.isActive)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        config.isActive
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {config.isActive ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                      {config.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onViewStats?.(config.id)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        title="View Stats"
                      >
                        <BarChart3 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      </button>
                      <button
                        onClick={() => onEdit?.(config.id)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      </button>
                      <button
                        onClick={() => onDuplicate?.(config.id)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      </button>
                      <button
                        onClick={() => onDelete?.(config.id)}
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredConfigs.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                {hasFilters ? 'No alerts match your filters' : 'No alert configurations'}
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                {hasFilters ? 'Try adjusting your filters' : 'Create your first alert to get started'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
