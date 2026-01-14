// ================================================================
// Core Types
// ================================================================

export type UserRole = 'admin' | 'team-lead' | 'agent' | 'marketer' | 'analyst'

export type PageScope = 'workspace' | 'brand'

export type SetupStatus = 'not-started' | 'partial' | 'complete'

export type ChannelStatus = 'connected' | 'disconnected' | 'error'

export type TokenHealthStatus = 'healthy' | 'warning' | 'expired'

export type IntegrationStatus = 'connected' | 'error' | 'disconnected'

export type UserStatus = 'active' | 'inactive'

export type QueryStatus = 'active' | 'paused' | 'archived'

export type KnowledgeBaseStatus = 'active' | 'inactive'

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'multi-select'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string | null
}

export interface Brand {
  id: string
  name: string
  logoUrl?: string | null
}

// ================================================================
// Navigation Types
// ================================================================

export interface NavigationPage {
  id: string
  label: string
  icon: string
  scope: PageScope
  requiredRoles: UserRole[]
}

export interface Navigation {
  activePage: string
  pages: NavigationPage[]
}

// ================================================================
// Setup Checklist Types
// ================================================================

export interface ChecklistCategory {
  id: string
  name: string
  status: SetupStatus
  completedAt: string | null
  deepLink: string
  details?: string
}

export interface BrandChecklist {
  id: string
  name: string
  completionPercentage: number
  lastUpdated: string
  categories: ChecklistCategory[]
}

export interface FixNextRecommendation {
  categoryId: string
  title: string
  reason: string
  deepLink: string
  priority: 'high' | 'medium' | 'low'
}

export interface SetupChecklist {
  selectedBrandId: string
  brands: BrandChecklist[]
  fixNext: FixNextRecommendation
}

// ================================================================
// Workspace & Access Types
// ================================================================

export interface WorkspaceUser extends User {
  status: UserStatus
  brandAccess: string[] // 'all' or brand IDs
  teams: string[]
  joinedAt: string
  lastLogin: string
}

export interface Permission {
  manageSetupCenter: boolean
  manageTaxonomy: boolean
  manageAI: boolean
  manageIntegrations: boolean
  manageWorkflows: boolean
  manageInboxAdmin: boolean
  createManualTicket: boolean
  publishPosts: boolean
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission
}

export interface TeamPermissions {
  canAccessInbox: boolean
  canAccessMentions: boolean
  canPublishPosts: boolean
}

export interface Team {
  id: string
  name: string
  description: string
  leadId: string
  memberIds: string[]
  calendarId: string
  permissions: TeamPermissions
}

export interface WorkingHours {
  start: string
  end: string
}

export interface Holiday {
  date: string
  name: string
}

export interface Calendar {
  id: string
  name: string
  type: 'workspace' | 'team'
  workingHours: {
    monday: WorkingHours | null
    tuesday: WorkingHours | null
    wednesday: WorkingHours | null
    thursday: WorkingHours | null
    friday: WorkingHours | null
    saturday: WorkingHours | null
    sunday: WorkingHours | null
  }
  holidays: Holiday[]
}

export interface SsoConfig {
  enabled: boolean
  provider: string | null
  domain: string
  enforceSso: boolean
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: string
  target: string
  module: string
  details: string
}

export interface WorkspaceAccess {
  users: WorkspaceUser[]
  roles: Role[]
  teams: Team[]
  calendars: Calendar[]
  sso: SsoConfig
  auditLog: AuditLogEntry[]
}

// ================================================================
// Brands & Channels Types
// ================================================================

export interface BrandProfile {
  id: string
  name: string
  description: string
  industry: string
  website: string
  timezone: string
  languages: string[]
  status: 'active' | 'archived'
  createdAt: string
}

export interface Page {
  id: string
  name: string
  pageId: string
  followers: number
  location: string | null
}

export interface TokenHealth {
  expiresAt: string
  daysUntilExpiry: number
  status: TokenHealthStatus
  alertRecipients: string[]
}

export interface Channel {
  id: string
  brandId: string
  platform: string
  platformName: string
  type: 'owned' | 'public' | 'messaging' | 'review' | 'email'
  status: ChannelStatus
  connectedAt: string
  lastSyncAt: string
  syncFrequency: string
  ingestionEnabled: boolean
  publishingEnabled: boolean
  messagingWindowEnabled: boolean
  errorMessage?: string
  pages: Page[]
  tokenHealth: TokenHealth
}

export interface LocationProfile {
  id: string
  brandId: string
  name: string
  address: string
  codes: {
    city: string
    state: string
    country: string
  }
  gmb: {
    connected: boolean
    placeId: string
  }
  surveyUrl: string
  qrCodeUrl: string
  mappedPages: string[]
}

export interface BrandsChannels {
  selectedBrandId: string
  brands: BrandProfile[]
  channels: Channel[]
  locations: LocationProfile[]
}

// ================================================================
// Data Scope Types
// ================================================================

export interface ListeningQuery {
  id: string
  brandId: string
  name: string
  type: 'keyword' | 'advanced'
  includeKeywords: string[]
  excludeKeywords: string[]
  languages: string[]
  geoFilters: string[]
  sources: string[]
  status: QueryStatus
  createdBy: string
  createdAt: string
  lastModifiedAt: string
  version: number
}

export interface Competitor {
  id: string
  name: string
  keywords: string[]
  socialHandles: {
    twitter?: string
    linkedin?: string
    facebook?: string
    instagram?: string
  }
}

export interface CompetitorSet {
  id: string
  brandId: string
  name: string
  competitors: Competitor[]
  createdAt: string
}

export interface LogicalGroup {
  id: string
  name: string
  brandIds: string[]
  createdAt: string
}

export interface DataScope {
  selectedBrandId: string
  listeningQueries: ListeningQuery[]
  competitorSets: CompetitorSet[]
  logicalGroups: LogicalGroup[]
}

// ================================================================
// Taxonomy & Data Model Types
// ================================================================

export interface CategoryChild {
  id: string
  name: string
  level: number
  keywords: string[]
  matchType: 'contains' | 'exact' | 'regex'
  autoTagEnabled: boolean
}

export interface Category {
  id: string
  brandId: string
  name: string
  level: number
  parentId: string | null
  keywords: string[]
  matchType: 'contains' | 'exact' | 'regex'
  autoTagEnabled: boolean
  children: CategoryChild[]
}

export interface Aspect {
  id: string
  name: string
}

export interface AspectGroup {
  id: string
  brandId: string
  name: string
  aspects: Aspect[]
  exclusivityRule: 'single-group' | 'multi-group'
}

export interface FieldValidation {
  regex?: string
  message?: string
  min?: number
  max?: number
}

export interface AutoExtraction {
  enabled: boolean
  regex: string
}

export interface CustomField {
  id: string
  objectType: 'author' | 'ticket' | 'post' | 'location' | 'campaign'
  name: string
  fieldType: FieldType
  options: string[] | null
  required: boolean
  validation: FieldValidation | null
  autoExtraction: AutoExtraction | null
  requiredByStatus?: string[]
}

export interface TaxonomyDataModel {
  selectedBrandId: string
  categories: Category[]
  aspectGroups: AspectGroup[]
  customFields: {
    author: CustomField[]
    ticket: CustomField[]
    post: CustomField[]
  }
}

// ================================================================
// AI Studio Types
// ================================================================

export interface AIFeatureConfig {
  confidenceThreshold?: number
  channelRestrictions?: string[]
  toneOptions?: string[]
  maxLength?: number
  tags?: string[]
  interventionTypes?: string[]
}

export interface AIFeature {
  id: string
  name: string
  description: string
  enabled: boolean
  prerequisites: {
    knowledgeBase?: boolean
    guidelines?: boolean
  }
  config: AIFeatureConfig
}

export interface KnowledgeBaseSource {
  id: string
  name: string
  type: 'document' | 'url' | 'text'
  status: KnowledgeBaseStatus
  url?: string
  addedAt: string
  version: number
  lastUpdated: string
}

export interface AIGuidelines {
  tone: string
  dos: string[]
  donts: string[]
  compliance: string[]
}

export interface FeedbackStats {
  totalFeedback: number
  correctTags: number
  incorrectTags: number
  helpfulSuggestions: number
  unhelpfulSuggestions: number
}

export interface AIStudio {
  selectedBrandId: string
  features: AIFeature[]
  knowledgeBase: KnowledgeBaseSource[]
  guidelines: AIGuidelines
  feedbackStats: FeedbackStats
}

// ================================================================
// Integrations & Email Routing Types
// ================================================================

export interface FieldMapping {
  locobuzzField: string
  externalField: string
  dedupeKey: boolean
}

export interface Integration {
  id: string
  platform: string
  platformName: string
  status: IntegrationStatus
  connectedAt: string
  lastSyncAt: string
  errorMessage?: string
  config: Record<string, any>
  health: 'healthy' | 'error'
  fieldMappings?: FieldMapping[]
}

export interface EscalationRecipient {
  id: string
  type: 'individual' | 'group'
  email: string
  name: string
}

export interface EscalationReminder {
  level: number
  recipients: string[]
  delayMinutes: number
  stopConditions: string[]
}

export interface EmailWhitelist {
  domains: string[]
  emails: string[]
}

export interface EmailDenylist {
  domains: string[]
  emails: string[]
}

export interface EmailRouting {
  escalationRecipients: EscalationRecipient[]
  sendToGroups: boolean
  whitelist: EmailWhitelist
  denylist: EmailDenylist
  escalationReminders: EscalationReminder[]
}

export interface IntegrationLog {
  id: string
  timestamp: string
  integration: string
  type: 'sync' | 'auth' | 'error'
  status: 'success' | 'error'
  message: string
}

export interface Integrations {
  connections: Integration[]
  emailRouting: EmailRouting
  logs: IntegrationLog[]
}

// ================================================================
// Usage & Limits Types
// ================================================================

export interface Plan {
  name: string
  tier: 'free' | 'pro' | 'enterprise'
  price: number
  currency: string
  billingCycle: 'monthly' | 'annual'
  nextBillingDate: string
}

export interface Quota {
  type: 'mentions' | 'profiles' | 'users' | 'credits'
  label: string
  limit: number
  used: number
  percentage: number
  unit: string
  resetDate?: string
}

export interface BrandConsumption {
  brandId: string
  brandName: string
  mentions: number
  credits: number
}

export interface ModuleConsumption {
  module: string
  credits: number
}

export interface Consumption {
  byBrand: BrandConsumption[]
  byModule: ModuleConsumption[]
}

export interface ThresholdAlerts {
  enabled: boolean
  thresholds: number[]
  recipients: string[]
}

export interface RequestMoreItem {
  id: string
  type: 'mentions' | 'profiles' | 'credits' | 'premium-modules'
  requestedQuantity: number
  currentQuantity: number
  brands: string[]
  justification: string
  urgency: 'low' | 'medium' | 'high'
  contact: string
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: string
}

export interface RequestMore {
  availableRequests: string[]
  pendingRequests: RequestMoreItem[]
}

export interface UsageLimits {
  plan: Plan
  quotas: Quota[]
  consumption: Consumption
  thresholdAlerts: ThresholdAlerts
  requestMore: RequestMore
}

// ================================================================
// Main Data Type
// ================================================================

export interface SetupCenterData {
  _meta: {
    models: Record<string, string>
  }
  currentUser: User
  navigation: Navigation
  setupChecklist: SetupChecklist
  workspaceAccess: WorkspaceAccess
  brandsChannels: BrandsChannels
  dataScope: DataScope
  taxonomyDataModel: TaxonomyDataModel
  aiStudio: AIStudio
  integrations: Integrations
  usageLimits: UsageLimits
}

// ================================================================
// Component Props Types
// ================================================================

export interface SetupCenterProps {
  data: SetupCenterData
  activePage: string
  onNavigate?: (pageId: string) => void
  onBrandChange?: (brandId: string) => void
}

export interface SetupChecklistProps {
  checklist: SetupChecklist
  onSelectBrand?: (brandId: string) => void
  onNavigateToSection?: (deepLink: string) => void
  onExportSummary?: () => void
}

export interface WorkspaceAccessProps {
  data: WorkspaceAccess
  onInviteUser?: () => void
  onEditUser?: (userId: string) => void
  onCreateTeam?: () => void
  onEditRole?: (roleId: string) => void
  onConfigureSSO?: () => void
  onExportAudit?: () => void
}

export interface BrandsChannelsProps {
  data: BrandsChannels
  onSelectBrand?: (brandId: string) => void
  onCreateBrand?: () => void
  onConnectChannel?: () => void
  onConfigureChannel?: (channelId: string) => void
  onManageLocation?: (locationId: string) => void
  onBulkImportLocations?: () => void
}

export interface DataScopeProps {
  data: DataScope
  onSelectBrand?: (brandId: string) => void
  onCreateQuery?: () => void
  onTestQuery?: (queryId: string) => void
  onEditQuery?: (queryId: string) => void
  onCreateCompetitorSet?: () => void
  onCreateLogicalGroup?: () => void
}

export interface TaxonomyDataModelProps {
  data: TaxonomyDataModel
  onSelectBrand?: (brandId: string) => void
  onCreateCategory?: () => void
  onTestCategoryRule?: (categoryId: string, sampleText: string) => void
  onCreateAspectGroup?: () => void
  onCreateCustomField?: (objectType: string) => void
  onImportSchema?: () => void
  onExportSchema?: () => void
}

export interface AIStudioProps {
  data: AIStudio
  onSelectBrand?: (brandId: string) => void
  onToggleFeature?: (featureId: string, enabled: boolean) => void
  onAddKnowledgeBase?: () => void
  onEditGuidelines?: () => void
  onConfigureThresholds?: (featureId: string) => void
}

export interface IntegrationsProps {
  data: Integrations
  onConnectIntegration?: (platform: string) => void
  onConfigureIntegration?: (integrationId: string) => void
  onMapFields?: (integrationId: string) => void
  onConfigureEmailRouting?: () => void
  onExportLogs?: () => void
}

export interface UsageLimitsProps {
  data: UsageLimits
  onSetThresholdAlert?: () => void
  onRequestMore?: (type: string) => void
  onViewBreakdown?: (type: 'brand' | 'module') => void
}
