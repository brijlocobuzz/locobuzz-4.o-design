import type { WorkflowListProps } from '@/../product/sections/workflows/types'
import { WorkflowRow } from './WorkflowRow'
import { useState } from 'react'

export function WorkflowList({
  workflows,
  users,
  onCreateWorkflow,
  onEditWorkflow,
  onDuplicateWorkflow,
  onDeleteWorkflow,
  onToggleWorkflow,
  onReorderWorkflows,
  onTestWorkflow,
  onViewAnalytics,
  onViewVersionHistory,
  onFilterByStatus,
  onSearch,
  onClearFilters
}: WorkflowListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [draggedWorkflowId, setDraggedWorkflowId] = useState<string | null>(null)
  const [dropTargetRank, setDropTargetRank] = useState<number | null>(null)

  // Filter workflows
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && workflow.isActive) ||
      (statusFilter === 'inactive' && !workflow.isActive)
    return matchesSearch && matchesStatus
  })

  // Separate active and inactive workflows
  const activeWorkflows = filteredWorkflows
    .filter(w => w.isActive && w.rank !== null)
    .sort((a, b) => (a.rank || 0) - (b.rank || 0))

  const inactiveWorkflows = filteredWorkflows.filter(w => !w.isActive)

  const handleDragStart = (workflowId: string) => {
    setDraggedWorkflowId(workflowId)
  }

  const handleDragOver = (e: React.DragEvent, rank: number) => {
    e.preventDefault()
    setDropTargetRank(rank)
  }

  const handleDragEnd = () => {
    if (draggedWorkflowId && dropTargetRank !== null) {
      // Get all workflow IDs in new order
      const reorderedIds = [...activeWorkflows]
        .filter(w => w.workflowId !== draggedWorkflowId)

      reorderedIds.splice(dropTargetRank - 1, 0,
        activeWorkflows.find(w => w.workflowId === draggedWorkflowId)!)

      onReorderWorkflows?.(reorderedIds.map(w => w.workflowId))
    }
    setDraggedWorkflowId(null)
    setDropTargetRank(null)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  const handleStatusFilterChange = (status: 'all' | 'active' | 'inactive') => {
    setStatusFilter(status)
    onFilterByStatus?.(status)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    onClearFilters?.()
  }

  const hasFilters = searchQuery !== '' || statusFilter !== 'all'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-sky-50/40 dark:from-slate-950 dark:via-indigo-950/20 dark:to-sky-950/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-900 to-sky-700 dark:from-indigo-100 dark:to-sky-200 bg-clip-text text-transparent mb-2">
                Workflows
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl">
                Automate your social media management with intelligent workflows. Build custom automation rules using AI-assisted creation or the visual canvas builder.
              </p>
            </div>
            <button
              onClick={onCreateWorkflow}
              className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200 hover:scale-105"
            >
              + Create Workflow
            </button>
          </div>

          {/* Info Callout */}
          <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-5 h-5 rounded-full bg-sky-500 dark:bg-sky-400 flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-white dark:text-sky-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 text-sm text-sky-900 dark:text-sky-100">
                <span className="font-semibold">Execution priority:</span> Only the highest-ranked workflow that matches will execute for each event. Active workflows can be reordered via drag and drop.
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search workflows..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-shadow"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleStatusFilterChange('all')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${statusFilter === 'all'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilterChange('active')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${statusFilter === 'active'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
              >
                Active
              </button>
              <button
                onClick={() => handleStatusFilterChange('inactive')}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${statusFilter === 'inactive'
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
              >
                Inactive
              </button>
            </div>

            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Active Workflows Table */}
        {activeWorkflows.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-sky-500 rounded-full"></span>
              Active Workflows
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({activeWorkflows.length})</span>
            </h2>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Table Header */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Workflow</div>
                <div className="col-span-2">Trigger</div>
                <div className="col-span-2">Performance</div>
                <div className="col-span-2">Last Run</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* Workflow Rows */}
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {activeWorkflows.map((workflow) => (
                  <WorkflowRow
                    key={workflow.workflowId}
                    workflow={workflow}
                    users={users}
                    isActive={workflow.isActive}
                    isDragging={draggedWorkflowId === workflow.workflowId}
                    isDropTarget={dropTargetRank === workflow.rank}
                    onDragStart={() => handleDragStart(workflow.workflowId)}
                    onDragOver={(e) => handleDragOver(e, workflow.rank!)}
                    onDragEnd={handleDragEnd}
                    onEdit={() => onEditWorkflow?.(workflow.workflowId)}
                    onDuplicate={() => onDuplicateWorkflow?.(workflow.workflowId)}
                    onDelete={() => onDeleteWorkflow?.(workflow.workflowId)}
                    onToggle={(isActive) => onToggleWorkflow?.(workflow.workflowId, isActive)}
                    onTest={() => onTestWorkflow?.(workflow.workflowId)}
                    onViewAnalytics={() => onViewAnalytics?.(workflow.workflowId)}
                    onViewVersionHistory={() => onViewVersionHistory?.(workflow.workflowId)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Inactive Workflows */}
        {inactiveWorkflows.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-slate-400 dark:bg-slate-600 rounded-full"></span>
              Inactive Workflows
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({inactiveWorkflows.length})</span>
            </h2>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden opacity-75">
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {inactiveWorkflows.map((workflow) => (
                  <WorkflowRow
                    key={workflow.workflowId}
                    workflow={workflow}
                    users={users}
                    isActive={false}
                    isDragging={false}
                    isDropTarget={false}
                    onEdit={() => onEditWorkflow?.(workflow.workflowId)}
                    onDuplicate={() => onDuplicateWorkflow?.(workflow.workflowId)}
                    onDelete={() => onDeleteWorkflow?.(workflow.workflowId)}
                    onToggle={(isActive) => onToggleWorkflow?.(workflow.workflowId, isActive)}
                    onTest={() => onTestWorkflow?.(workflow.workflowId)}
                    onViewAnalytics={() => onViewAnalytics?.(workflow.workflowId)}
                    onViewVersionHistory={() => onViewVersionHistory?.(workflow.workflowId)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredWorkflows.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-2xl mx-auto mb-4 flex items-center justify-center opacity-50">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {hasFilters ? 'No workflows found' : 'No workflows yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {hasFilters
                ? 'Try adjusting your filters or search query.'
                : 'Get started by creating your first automation workflow. Use AI-assisted creation or the visual canvas builder.'}
            </p>
            {!hasFilters && (
              <button
                onClick={onCreateWorkflow}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200 hover:scale-105"
              >
                Create Your First Workflow
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
