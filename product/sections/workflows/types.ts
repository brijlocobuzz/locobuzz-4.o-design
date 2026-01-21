// Workflows Section Types

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  team?: string
}

export interface Team {
  id: string
  name: string
  memberIds: string[]
}

// Node Types
export type NodeType = 'trigger' | 'condition' | 'action' | 'delay'

export interface TriggerConfig {
  event: 'new_mention' | 'new_ticket' | 'ticket_updated' | 'sla_breach' | 'mention_updated'
  channels?: string[]
  sources?: string[]
}

export interface ConditionConfig {
  conditionIds: string[]
  logic: 'AND' | 'OR'
}

export interface ActionConfig {
  type: 'route' | 'auto_response' | 'crm_push' | 'notification' | 'moderation' | 'update_ticket'
  routingStrategy?: 'round_robin' | 'skill_based' | 'sticky' | 'team_assignment'
  assigneeType?: 'user' | 'team'
  assigneeId?: string
  responseTemplate?: string
  crmEndpoint?: string
  crmFields?: Record<string, string>
  notificationChannel?: 'slack' | 'email' | 'webhook'
  notificationRecipients?: string[]
  moderationAction?: 'hide' | 'delete' | 'flag'
  ticketUpdates?: Record<string, any>
}

export interface DelayConfig {
  duration: number
  unit: 'minutes' | 'hours' | 'days'
}

export interface WorkflowNode {
  nodeId: string
  workflowId: string
  type: NodeType
  label: string
  config: TriggerConfig | ConditionConfig | ActionConfig | DelayConfig
  position: {
    x: number
    y: number
  }
}

export interface NodeConnection {
  connectionId: string
  workflowId: string
  fromNodeId: string
  toNodeId: string
  path?: 'true' | 'false' // For if-else branching
  label?: string
}

// Condition Types
export interface AttributeFilter {
  attribute: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: any
}

export interface AIClassifier {
  type: 'sentiment' | 'intent' | 'actionability' | 'language'
  operator: 'is' | 'is_not' | 'contains'
  value: string | string[]
  confidence?: number
}

export interface TimeConstraint {
  type: 'business_hours' | 'holiday_exclusion' | 'time_range'
  timezone?: string
  businessHours?: {
    start: string
    end: string
    days: number[]
  }
  excludedHolidays?: string[]
  timeRange?: {
    start: string
    end: string
  }
}

export interface Condition {
  conditionId: string
  name: string
  logic: 'AND' | 'OR'
  filters: AttributeFilter[]
  aiClassifiers?: AIClassifier[]
  timeConstraints?: TimeConstraint[]
}

// Workflow Types
export interface WorkflowTrigger {
  event: string
  channels?: string[]
  sources?: string[]
}

export interface WorkflowAction {
  type: string
  description: string
  config: ActionConfig
}

export interface ExecutionStats {
  totalRuns: number
  successfulRuns: number
  failedRuns: number
  successRate: number
  lastExecutedAt?: string
  averageExecutionTime?: number // in milliseconds
}

export interface Workflow {
  workflowId: string
  name: string
  description: string
  isActive: boolean
  rank: number | null // null for inactive workflows
  trigger: WorkflowTrigger
  actions: WorkflowAction[]
  createdBy: string
  createdAt: string
  updatedAt: string
  currentVersion: number
  executionStats: ExecutionStats
  tags?: string[]
}

// Version History
export interface WorkflowVersion {
  versionId: string
  workflowId: string
  versionNumber: number
  createdBy: string
  createdAt: string
  changes: string
  comment?: string
  snapshot: {
    name: string
    trigger: WorkflowTrigger
    nodeCount: number
    actionCount: number
  }
}

// Execution Logs
export type ExecutionStatus = 'success' | 'partial_success' | 'failed'

export interface ExecutionStepLog {
  nodeId: string
  nodeName: string
  nodeType: NodeType
  result: 'passed' | 'failed' | 'executed' | 'skipped'
  details?: string
  timestamp: string
}

export interface ExecutionLog {
  executionId: string
  workflowId: string
  triggeredAt: string
  completedAt: string
  status: ExecutionStatus
  triggerData: {
    eventType: string
    entityId: string
    entityType: 'mention' | 'ticket'
    channel?: string
    source?: string
  }
  executionPath: ExecutionStepLog[]
  outputs?: {
    assignedTo?: string
    responseGenerated?: boolean
    notificationsSent?: number
    crmUpdated?: boolean
  }
  error?: string
}

// Component Props

// Props for the Workflow List View
export interface WorkflowListProps {
  workflows: Workflow[]
  users: User[]

  // Workflow management callbacks
  onCreateWorkflow?: () => void
  onEditWorkflow?: (workflowId: string) => void
  onDuplicateWorkflow?: (workflowId: string) => void
  onDeleteWorkflow?: (workflowId: string) => void
  onToggleWorkflow?: (workflowId: string, isActive: boolean) => void
  onReorderWorkflows?: (workflowIds: string[]) => void
  onTestWorkflow?: (workflowId: string) => void
  onViewAnalytics?: (workflowId: string) => void
  onViewVersionHistory?: (workflowId: string) => void

  // Filtering and search
  onFilterByStatus?: (status: 'active' | 'inactive' | 'all') => void
  onFilterByTrigger?: (triggerType: string) => void
  onFilterByTag?: (tag: string) => void
  onSearch?: (query: string) => void
  onClearFilters?: () => void
}

// Props for full Workflows section (all views)
export interface WorkflowsProps {
  workflows: Workflow[]
  workflowNodes: WorkflowNode[]
  nodeConnections: NodeConnection[]
  conditions: Condition[]
  workflowVersions: WorkflowVersion[]
  executionLogs: ExecutionLog[]
  users: User[]
  teams: Team[]

  // Workflow management callbacks
  onCreateWorkflow: () => void
  onEditWorkflow: (workflowId: string) => void
  onDuplicateWorkflow: (workflowId: string) => void
  onDeleteWorkflow: (workflowId: string) => void
  onToggleWorkflow: (workflowId: string, isActive: boolean) => void
  onReorderWorkflows: (workflowIds: string[]) => void
  onTestWorkflow: (workflowId: string) => void
  onViewAnalytics: (workflowId: string) => void
  onViewVersionHistory: (workflowId: string) => void
  onRollbackVersion: (versionId: string) => void

  // Canvas builder callbacks
  onAddNode: (workflowId: string, node: Partial<WorkflowNode>) => void
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void
  onDeleteNode: (nodeId: string) => void
  onConnectNodes: (connection: Partial<NodeConnection>) => void
  onDeleteConnection: (connectionId: string) => void
  onUpdateNodePosition: (nodeId: string, position: { x: number; y: number }) => void

  // Condition configuration callbacks
  onCreateCondition: (condition: Partial<Condition>) => void
  onUpdateCondition: (conditionId: string, updates: Partial<Condition>) => void
  onDeleteCondition: (conditionId: string) => void

  // AI-assisted creation callbacks
  onSubmitNaturalLanguagePrompt: (prompt: string) => void
  onAcceptGeneratedWorkflow: () => void
  onRejectGeneratedWorkflow: () => void

  // Test simulation callbacks
  onRunTest: (workflowId: string, testData: any) => void
  onExportTestResults: (executionId: string) => void

  // Filtering and search
  onFilterByStatus: (status: 'active' | 'inactive' | 'all') => void
  onFilterByTrigger: (triggerType: string) => void
  onFilterByTag: (tag: string) => void
  onSearch: (query: string) => void
  onClearFilters: () => void
}
