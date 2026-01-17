// =============================================================================
// Data Types
// =============================================================================

export interface AnomalyDetectionConfig {
  deviationPercent: number
  lookbackWindow: '24h' | '7d'
  baselineMethod: 'moving_average' | 'exponential_moving_average'
  direction?: 'above' | 'below' | 'both'
}

export interface SimpleThreshold {
  metric: string
  operator: 'greater_than' | 'less_than' | 'equals'
  value: number
  timeWindow: 'realtime' | '1h' | '24h'
}

export interface VolumetricThreshold {
  metric: string
  operator: 'greater_than' | 'less_than'
  value: number
  timeWindow: '1h' | '24h'
}

export interface AnomalyThreshold {
  metric: string
  anomalyDetection: AnomalyDetectionConfig
}

export type AlertThreshold = SimpleThreshold | VolumetricThreshold | AnomalyThreshold

export interface MentionFilters {
  sentiment?: ('positive' | 'neutral' | 'negative')[]
  channels?: string[]
  brandKeywords?: string[]
  competitorKeywords?: string[]
  keywords?: string[]
  matchType?: 'any' | 'all'
  excludeOwned?: boolean
  minEngagement?: number
  minReach?: number
  includeBrandComparison?: boolean
}

export interface Filters {
  mentionFilters?: MentionFilters
}

export interface AlertConfiguration {
  id: string
  name: string
  module: 'mentions' | 'tickets' | 'agents'
  type: 'simple' | 'volumetric' | 'anomaly'
  description: string
  isActive: boolean
  createdAt: string
  createdBy: string
  lastTriggered: string | null
  triggerCount: number
  thresholds: AlertThreshold
  filters: Filters
  deliveryChannels: ('email' | 'push' | 'whatsapp' | 'slack' | 'teams' | 'gchat')[]
  recipients: string[]
  messageTemplate: string
  suppressionWindow: number
}

export interface QualifyingMention {
  id: string
  content: string
  author: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  reach?: number
}

export interface ViralPost {
  id: string
  content: string
  author: string
  engagement: number
  reach: number
}

export interface QualifyingData {
  metric: string
  currentValue: number
  baselineValue?: number
  deviation?: number
  threshold?: number
  timeWindow: string
  mentionCount?: number
  sampleMentions?: QualifyingMention[]
  viralPost?: ViralPost
  channels?: Record<string, number>
  competitorBreakdown?: Record<string, number>
  topContributors?: Array<{ mentionId: string; reach: number }>
  possibleCause?: string
}

export interface TriggeredAlert {
  id: string
  alertConfigId: string
  alertName: string
  alertType: 'simple' | 'volumetric' | 'anomaly'
  triggeredAt: string
  severity: 'low' | 'medium' | 'high'
  isAcknowledged: boolean
  acknowledgedBy: string | null
  acknowledgedAt: string | null
  triggerCondition: string
  qualifyingData: QualifyingData
  deliveryStatus: 'delivered' | 'partial' | 'failed' | 'pending'
}

export interface DeliveryRecord {
  id: string
  triggeredAlertId: string
  channel: 'email' | 'push' | 'whatsapp' | 'slack' | 'teams' | 'gchat'
  recipientId: string
  sentAt: string
  openedAt: string | null
  status: 'sent' | 'opened' | 'failed'
  failureReason?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar: string
}

export interface PerformanceMetrics {
  alertConfigId: string
  totalTriggers: number
  last30DaysTriggers: number
  acknowledgmentRate: number | null
  avgTimeToAcknowledge: number | null
  openRateByChannel: Record<string, number>
  triggerFrequency: 'none' | 'low' | 'moderate' | 'high' | 'variable'
  noiseLevel: 'none' | 'low' | 'moderate' | 'high'
}

export interface AlertFilters {
  dateRange?: { start: string; end: string }
  alertType?: ('simple' | 'volumetric' | 'anomaly')[]
  module?: ('mentions' | 'tickets' | 'agents')[]
  status?: ('active' | 'inactive')[]
  acknowledged?: boolean
  severity?: ('low' | 'medium' | 'high')[]
}

// =============================================================================
// Component Props
// =============================================================================

export interface AlertsProps {
  /** Configured alert definitions */
  alertConfigurations: AlertConfiguration[]
  /** Recently triggered alert instances */
  triggeredAlerts: TriggeredAlert[]
  /** Delivery records for tracking notification status */
  deliveryRecords: DeliveryRecord[]
  /** Team members who manage and receive alerts */
  users: User[]
  /** Performance statistics for each alert */
  performanceMetrics: PerformanceMetrics[]
  /** Current active tab */
  activeTab?: 'recent' | 'settings'
  /** Current filters applied */
  currentFilters?: AlertFilters

  // Alert Configuration Actions
  /** Called when user wants to create a new alert */
  onCreateAlert?: () => void
  /** Called when user wants to edit an alert configuration */
  onEditAlert?: (alertConfigId: string) => void
  /** Called when user toggles an alert active/inactive */
  onToggleAlert?: (alertConfigId: string, isActive: boolean) => void
  /** Called when user wants to duplicate an alert */
  onDuplicateAlert?: (alertConfigId: string) => void
  /** Called when user wants to delete an alert */
  onDeleteAlert?: (alertConfigId: string) => void
  /** Called when user wants to view performance stats for an alert */
  onViewStats?: (alertConfigId: string) => void

  // Triggered Alert Actions
  /** Called when user wants to view details of a triggered alert */
  onViewAlertDetail?: (triggeredAlertId: string) => void
  /** Called when user acknowledges a triggered alert */
  onAcknowledgeAlert?: (triggeredAlertId: string) => void
  /** Called when user wants to view the source data that triggered the alert */
  onViewSourceData?: (triggeredAlertId: string) => void
  /** Called when user dismisses a triggered alert */
  onDismissAlert?: (triggeredAlertId: string) => void

  // Bulk Actions
  /** Called when user performs bulk activate/deactivate */
  onBulkToggle?: (alertConfigIds: string[], isActive: boolean) => void
  /** Called when user performs bulk delete */
  onBulkDelete?: (alertConfigIds: string[]) => void

  // Navigation & Filtering
  /** Called when user switches between tabs */
  onTabChange?: (tab: 'recent' | 'settings') => void
  /** Called when user applies filters */
  onApplyFilters?: (filters: AlertFilters) => void
  /** Called when user clears all filters */
  onClearFilters?: () => void
  /** Called when user searches alerts */
  onSearch?: (query: string) => void

  // Alert Creation/Edit Callbacks
  /** Called when user saves a new or edited alert configuration */
  onSaveAlert?: (config: Partial<AlertConfiguration>) => void
  /** Called when user cancels alert creation/editing */
  onCancelEdit?: () => void
}
