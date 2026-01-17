import data from '@/../product/sections/workflows/data.json'
import { WorkflowList } from './components/WorkflowList'
import type { WorkflowsProps } from '@/../product/sections/workflows/types'

export default function WorkflowListPreview() {
  const workflowsData = data as unknown as WorkflowsProps
  return (
    <WorkflowList
      workflows={workflowsData.workflows}
      users={workflowsData.users}
      onCreateWorkflow={() => console.log('Create workflow')}
      onEditWorkflow={(id) => console.log('Edit workflow:', id)}
      onDuplicateWorkflow={(id) => console.log('Duplicate workflow:', id)}
      onDeleteWorkflow={(id) => console.log('Delete workflow:', id)}
      onToggleWorkflow={(id, isActive) => console.log('Toggle workflow:', id, isActive)}
      onReorderWorkflows={(ids) => console.log('Reorder workflows:', ids)}
      onTestWorkflow={(id) => console.log('Test workflow:', id)}
      onViewAnalytics={(id) => console.log('View analytics:', id)}
      onViewVersionHistory={(id) => console.log('View version history:', id)}
      onFilterByStatus={(status) => console.log('Filter by status:', status)}
      onFilterByTrigger={(trigger) => console.log('Filter by trigger:', trigger)}
      onFilterByTag={(tag) => console.log('Filter by tag:', tag)}
      onSearch={(query) => console.log('Search:', query)}
      onClearFilters={() => console.log('Clear filters')}
    />
  )
}
