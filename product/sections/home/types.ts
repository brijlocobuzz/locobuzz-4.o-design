// =============================================================================
// Core User Types
// =============================================================================

export type UserRole = 'agent' | 'marketer' | 'analyst' | 'admin' | 'team-lead'

export type UserStatus = 'online' | 'away' | 'offline' | 'busy'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl: string | null
  teamId: string
  teamName?: string
  status?: UserStatus
}

// =============================================================================
// Top Strip Types
// =============================================================================

export interface WorkTodaySummary {
  open: number
  due: number
  overdue: number
}

export interface SlaRiskSummary {
  breachingIn30: number
  breachingIn60: number
  breachingIn120: number
}

export type ActionPriority = 'critical' | 'high' | 'medium' | 'low'

export interface NextBestAction {
  id: string
  ticketId: string
  action: string
  reason: string
  priority: ActionPriority
}

export interface TopStripAgent {
  myWorkToday: WorkTodaySummary
  slaRisk: SlaRiskSummary
  nextBestActions: NextBestAction[]
}

export type TrendDirection = 'up' | 'down' | 'flat'

export interface MetricWithTrend {
  value: number
  delta: number
  trend: TrendDirection
  unit?: string
}

export interface TopContentItem {
  id: string
  title: string
  engagement: number
  reason: string
}

export interface TopStripMarketer {
  performancePulse: {
    reach: MetricWithTrend
    impressions: MetricWithTrend
    engagement: MetricWithTrend
  }
  alertCount: number
  topContent: TopContentItem[]
}

// =============================================================================
// Ticket Types
// =============================================================================

export type TicketStatus = 'open' | 'awaiting-response' | 'pending-close' | 'resolved' | 'escalated' | 'closed'

export type TicketPriority = 'critical' | 'high' | 'medium' | 'low'

export type SlaStatus = 'on-track' | 'at-risk' | 'breached' | 'met'

export type Sentiment = 'positive' | 'neutral' | 'negative'

export interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  channel: string
  contactName: string
  contactHandle: string
  assignedTo: string
  createdAt: string
  updatedAt: string
  slaDeadline: string
  slaStatus: SlaStatus
  mentionCount: number
  sentiment: Sentiment
  lastMessage: string
  isVip?: boolean
}

// =============================================================================
// Task Types
// =============================================================================

export type TaskType = 'follow-up' | 'survey' | 'approval' | 'escalation' | 'content' | 'review'

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled'

export interface Task {
  id: string
  title: string
  type: TaskType
  status: TaskStatus
  priority: ActionPriority
  dueDate: string
  assignedTo: string
  createdAt: string
  completedAt?: string
  associatedTicketId?: string
  associatedTicketNumber?: string
  associatedPostId?: string
  requestedBy?: string
}

// =============================================================================
// Alert Types
// =============================================================================

export type AlertType = 'sla-breach' | 'mention-spike' | 'sentiment-drop' | 'vip-mention' | 'system' | 'anomaly'

export type AlertSeverity = 'critical' | 'high' | 'warning' | 'info'

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  createdAt: string
  isRead: boolean
  isActionable: boolean
  actionLabel?: string
  ticketId?: string
  contactId?: string
  articleId?: string
}

// =============================================================================
// KPI Types
// =============================================================================

export type KpiCategory = 'productivity' | 'performance' | 'quality' | 'workload' | 'efficiency'

export interface Kpi {
  id: string
  label: string
  value: number
  target: number | null
  unit: string | null
  trend: TrendDirection
  trendValue: number
  trendPeriod: string
  category: KpiCategory
}

// =============================================================================
// Knowledge Article Types
// =============================================================================

export interface KnowledgeArticle {
  id: string
  title: string
  summary: string
  category: string
  tags: string[]
  isNew: boolean
  isFeatured: boolean
  publishedAt: string
  author: string
  readTime: string
}

// =============================================================================
// Quick Action Types
// =============================================================================

export type QuickActionVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger'

export interface QuickAction {
  id: string
  label: string
  icon: string
  action: string
  variant: QuickActionVariant
  shortcut?: string
}

// =============================================================================
// Post Types
// =============================================================================

export type PostStatus = 'draft' | 'pending-approval' | 'scheduled' | 'published' | 'failed'

export interface PostEngagement {
  likes: number
  comments: number
  shares: number
  reach: number
}

export interface Post {
  id: string
  title: string
  content: string
  channel: string
  status: PostStatus
  publishedAt?: string
  scheduledFor?: string
  engagement: PostEngagement | null
  sentiment: Sentiment | null
}

// =============================================================================
// Block Types
// =============================================================================

export type BlockType =
  | 'object-list'
  | 'kpi-card-row'
  | 'trend-sparkline'
  | 'alert-feed'
  | 'tasks'
  | 'quick-actions'
  | 'pinned-views'
  | 'ai-insight'
  | 'knowledge-articles'

export interface BlockPosition {
  x: number
  y: number
  w: number
  h: number
}

export interface BlockConfig {
  objectType?: string
  filter?: Record<string, unknown>
  columns?: string[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  kpiIds?: string[]
  actionIds?: string[]
  maxItems?: number
  showNew?: boolean
  showFeatured?: boolean
}

export interface Block {
  id: string
  type: BlockType
  title: string
  position: BlockPosition
  isLocked: boolean
  config: BlockConfig
}

// =============================================================================
// Home Data Types
// =============================================================================

export interface HomeData {
  currentUser: User
  topStripAgent: TopStripAgent
  topStripMarketer: TopStripMarketer
  tickets: Ticket[]
  tasks: Task[]
  alerts: Alert[]
  kpis: Kpi[]
  knowledgeArticles: KnowledgeArticle[]
  quickActions: QuickAction[]
  posts: Post[]
  blocks: Block[]
  users: User[]
}

// =============================================================================
// Component Props
// =============================================================================

export interface HomeProps {
  /** The complete home data including all blocks and entities */
  data: HomeData

  /** Called when user clicks on a ticket to view details */
  onViewTicket?: (ticketId: string) => void

  /** Called when user clicks on a task to view or complete it */
  onViewTask?: (taskId: string) => void

  /** Called when user completes a task */
  onCompleteTask?: (taskId: string) => void

  /** Called when user clicks on an alert to take action */
  onAlertAction?: (alertId: string) => void

  /** Called when user dismisses/marks an alert as read */
  onDismissAlert?: (alertId: string) => void

  /** Called when user clicks on a knowledge article */
  onViewArticle?: (articleId: string) => void

  /** Called when user executes a quick action */
  onQuickAction?: (actionId: string, context?: { ticketId?: string }) => void

  /** Called when user clicks on a post */
  onViewPost?: (postId: string) => void

  /** Called when user resizes a block */
  onResizeBlock?: (blockId: string, newPosition: BlockPosition) => void

  /** Called when user reorders blocks */
  onReorderBlocks?: (blockIds: string[]) => void

  /** Called when user adds a new block */
  onAddBlock?: (blockType: BlockType) => void

  /** Called when user removes a block */
  onRemoveBlock?: (blockId: string) => void

  /** Called when user opens block customizer */
  onCustomizeBlock?: (blockId: string) => void

  /** Called when user updates block configuration */
  onUpdateBlockConfig?: (blockId: string, config: BlockConfig) => void

  /** Called when user clicks a next best action */
  onNextBestAction?: (actionId: string) => void

  /** Called when user wants to navigate to a section */
  onNavigate?: (section: string) => void
}

// =============================================================================
// Block-Specific Props
// =============================================================================

export interface KpiCardRowProps {
  kpis: Kpi[]
  onAddKpi?: () => void
  onRemoveKpi?: (kpiId: string) => void
  onCustomize?: () => void
}

export interface ObjectListProps {
  items: Ticket[] | Post[]
  columns: string[]
  onRowClick?: (id: string) => void
  onAddColumn?: () => void
  onRemoveColumn?: (column: string) => void
  onFilterChange?: (filter: Record<string, unknown>) => void
  onCustomize?: () => void
}

export interface TaskListProps {
  tasks: Task[]
  onViewTask?: (taskId: string) => void
  onCompleteTask?: (taskId: string) => void
  onFilterChange?: (filter: Record<string, unknown>) => void
  onCustomize?: () => void
}

export interface AlertFeedProps {
  alerts: Alert[]
  onAlertAction?: (alertId: string) => void
  onDismiss?: (alertId: string) => void
  onFilterChange?: (filter: Record<string, unknown>) => void
  onCustomize?: () => void
}

export interface QuickActionsProps {
  actions: QuickAction[]
  onAction?: (actionId: string) => void
  onAddAction?: () => void
  onRemoveAction?: (actionId: string) => void
  onReorder?: (actionIds: string[]) => void
  onCustomize?: () => void
}

export interface KnowledgeArticlesProps {
  articles: KnowledgeArticle[]
  onViewArticle?: (articleId: string) => void
  onFilterChange?: (filter: Record<string, unknown>) => void
  onCustomize?: () => void
}

export interface TopStripAgentProps {
  data: TopStripAgent
  onWorkTodayClick?: (filter: 'open' | 'due' | 'overdue') => void
  onSlaRiskClick?: () => void
  onNextBestActionClick?: (actionId: string) => void
}

export interface TopStripMarketerProps {
  data: TopStripMarketer
  onMetricClick?: (metric: 'reach' | 'impressions' | 'engagement') => void
  onAlertsClick?: () => void
  onTopContentClick?: (postId: string) => void
}
