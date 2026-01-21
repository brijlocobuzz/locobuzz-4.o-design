// =============================================================================
// Enums and Union Types
// =============================================================================

export type Sentiment = 'Positive' | 'Negative' | 'Neutral' | 'None'
export type Intent = 'Complaint' | 'Request' | 'Query' | 'Feedback' | 'Appreciation' | 'Opportunity' | 'Brand Promotion' | 'Information' | 'Irrelevant'
export type EntityType = 'BRAND' | 'PERSON' | 'LOCATION' | 'PRODUCT' | 'ORGANIZATION'
export type Emotion = 'Anger' | 'Frustration' | 'Disappointment' | 'Distrust' | 'Anxiety' | 'Joy' | 'Gratitude' | 'Trust' | 'Excitement' | 'Curiosity' | 'Confusion' | 'Indifference'
export type EmotionCluster = 'Negative' | 'Positive' | 'Neutral'
export type Platform = 'instagram' | 'facebook' | 'x' | 'linkedin' | 'youtube' | 'reddit' | 'google' | 'trustpilot' | 'web' | 'podcast'
export type TrendDirection = 'up' | 'down' | 'stable'
export type DisplayMode = 'card' | 'table' | 'feed'
export type SortOrder = 'asc' | 'desc'
export type UserRole = 'supervisor' | 'agent'

// =============================================================================
// Core Entity Types (from Global Data Model)
// =============================================================================

export interface Author {
  id: string
  name: string
  username: string
  platform: Platform
  avatarUrl: string
  influenceScore: number
  followerCount: number
  isVerified: boolean
}

export interface Contact {
  id: string
  name: string
  email: string | null
}

export interface Channel {
  id: string
  name: string
  platform: Platform
}

export interface Page {
  id: string
  name: string
  handle: string
}

export interface LocationProfile {
  id: string
  name: string
}

export interface ProductProfile {
  id: string
  name: string
}

export interface EngagementMetrics {
  likes: number
  comments: number
  shares: number
  reach: number
}

export interface Categorization {
  category: string
  subcategory?: string
  subSubcategory?: string
  sentiment: Sentiment // Always associated with a sentiment
  taggingInfo?: {
    type: 'auto' | 'manual'
    keyword?: string // if auto-tagged, the keyword that triggered it
    taggedBy?: string // if manual, user who tagged
    taggedAt?: string // timestamp
  }
}

export interface Aspect {
  name: string
  entityName: string
  entityType: string // e.g., "Person", "Product", "Location"
  sentiment: Sentiment
  opinion: string // extracted opinion text
}

export interface AspectGroup {
  name: string
  icon?: string // emoji or icon identifier configured by business user
  aspects: (string | Aspect)[] // Support both legacy string[] and new Aspect[]
}

export interface SignalSenseMatch {
  signalId: string
  signalName: string
  confidence: number // 0-1
  matchedAt: string
}

export interface MediaItem {
  id: string
  type: 'image' | 'video' | 'document'
  url: string
  thumbnailUrl?: string
  fileName?: string // for attachments
  fileSize?: number // bytes
  mimeType?: string
}

export interface Mention {
  id: string
  content: string
  contentSnippet: string
  author: Author
  contact: Contact
  channel: Channel
  page: Page

  // Fixed AI Classifications
  entityType: EntityType
  sentiment: Sentiment
  sentimentScore: number
  intent: Intent
  emotion: Emotion
  emotionCluster: EmotionCluster

  // AI Upper Categories (dynamic, user-defined)
  upperCategories: string[] // Customer's Intent (AI Upper Categories) - e.g., ["Service Issue", "Technical"]

  // Category Mapping (1-3 levels, multiple possible, each with sentiment)
  categorizations: Categorization[]

  // Aspect Analysis
  aspectGroups: AspectGroup[] // Grouped aspects
  ungroupedAspects: string[] // Aspects without a group

  // Metadata
  priorityScore: number
  timestamp: string
  engagementMetrics: EngagementMetrics
  locationProfile: LocationProfile | null
  productProfiles: ProductProfile[]
  isRead: boolean
  isImportant: boolean
  tags: string[]
  avenue: string
  subAvenue: string

  // SignalSense matches
  signalSenseMatches?: SignalSenseMatch[]

  // Media attachments
  media?: MediaItem[]

  // Email-specific content (for email mentions)
  emailContent?: {
    htmlBody: string
    simplifiedText: string
    attachments: MediaItem[]
  }
}

// =============================================================================
// Section-Specific Types
// =============================================================================

export interface SubAvenue {
  id: string
  name: string
  platform: Platform
  mentionCount: number
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  latestMentions: number
}

export interface AvenueKpi {
  id: string
  name: string
  icon: string
  mentionCount: {
    today: number
    last7Days: number
    last30Days: number
  }
  sentimentDistribution: {
    positive: number
    neutral: number
    negative: number
  }
  shareOfVoice: number
  trend: TrendDirection
  trendPercentage: number
  subAvenues: SubAvenue[]
}

export interface TopAuthor {
  id: string
  name: string
  username: string
  platform: Platform
  avatarUrl: string
  influenceScore: number
  followerCount: number
  isVerified: boolean
  mentionCount: number
  reachTotal: number
}

export interface TrendingKeyword {
  id: string
  keyword: string
  mentionCount: number
  trend: TrendDirection
  trendPercentage: number
  sentiment: Sentiment
}

export interface SavedView {
  id: string
  name: string
  displayMode: DisplayMode
  filters: {
    sentiment?: Sentiment[]
    priorityScore?: { min?: number; max?: number }
    isRead?: boolean
    influenceScore?: { min?: number; max?: number }
    isVerified?: boolean
    timeRange?: string
  }
  visibleColumns: string[]
  sortBy: string
  sortOrder: SortOrder
  isDefault: boolean
}

// =============================================================================
// Data Container Type
// =============================================================================

export interface MentionsData {
  _meta: {
    models: Record<string, string>
    relationships: string[]
  }
  avenueKpis: AvenueKpi[]
  mentions: Mention[]
  topAuthors: TopAuthor[]
  trendingKeywords: TrendingKeyword[]
  savedViews: SavedView[]
}

// =============================================================================
// Component Props
// =============================================================================

export interface MentionsProps {
  /** User role - determines if right panel is shown */
  userRole?: UserRole
  /** Avenue KPI cards data */
  avenueKpis: AvenueKpi[]
  /** List of mentions to display */
  mentions: Mention[]
  /** Top authors for the right rail */
  topAuthors: TopAuthor[]
  /** Trending keywords for the right rail */
  trendingKeywords: TrendingKeyword[]
  /** Saved view configurations */
  savedViews: SavedView[]
  /** Current display mode */
  displayMode?: DisplayMode
  /** Currently active saved view */
  activeView?: SavedView | null
  /** Called when an avenue KPI card is clicked to filter mentions */
  onAvenueClick?: (avenueId: string) => void
  /** Called when a sub-avenue is clicked within an expanded KPI card */
  onSubAvenueClick?: (subAvenueId: string) => void
  /** Called when display mode is changed (card/table/feed) */
  onDisplayModeChange?: (mode: DisplayMode) => void
  /** Called when a mention is clicked to view details */
  onMentionClick?: (mentionId: string) => void
  /** Called when user wants to reply to a mention */
  onReply?: (mentionId: string) => void
  /** Called when user wants to assign a mention to someone */
  onAssign?: (mentionId: string) => void
  /** Called when user wants to add tags to a mention */
  onTag?: (mentionId: string) => void
  /** Called when user wants to add classifications to a mention */
  onClassify?: (mentionId: string) => void
  /** Called when user marks a mention as read/unread */
  onMarkRead?: (mentionId: string, isRead: boolean) => void
  /** Called when user marks a mention as important */
  onMarkImportant?: (mentionId: string, isImportant: boolean) => void
  /** Called when user applies filters */
  onFilterChange?: (filters: SavedView['filters']) => void
  /** Called when user saves current view configuration */
  onSaveView?: (view: Omit<SavedView, 'id'>) => void
  /** Called when user loads a saved view */
  onLoadView?: (viewId: string) => void
  /** Called when user wants to open a mention in its native platform */
  onOpenInPlatform?: (mentionId: string) => void
  /** Called when user hovers over a mention for quick preview */
  onMentionHover?: (mentionId: string | null) => void
  /** Called when bulk actions are performed on selected mentions */
  onBulkAction?: (mentionIds: string[], action: 'assign' | 'tag' | 'classify' | 'markRead' | 'markImportant') => void
  /** Called when user customizes visible columns in table view */
  onColumnsChange?: (columns: string[]) => void
  /** Called when user clicks on a trending keyword to filter */
  onKeywordClick?: (keyword: string) => void
  /** Called when user clicks on a top author to filter */
  onAuthorClick?: (authorId: string) => void
}

// =============================================================================
// Sub-Component Props
// =============================================================================

export interface AvenueKpiCardProps {
  /** Avenue KPI data */
  avenue: AvenueKpi
  /** Whether this avenue is currently expanded */
  isExpanded?: boolean
  /** Called when the card is clicked */
  onClick?: (avenueId: string) => void
  /** Called when a sub-avenue is clicked */
  onSubAvenueClick?: (subAvenueId: string) => void
}

export interface MentionCardProps {
  /** Mention data to display */
  mention: Mention
  /** Whether the card is selected (for bulk actions) */
  isSelected?: boolean
  /** Called when the card is clicked */
  onClick?: (mentionId: string) => void
  /** Called when hovering over the card */
  onHover?: (mentionId: string | null) => void
  /** Called when reply action is triggered */
  onReply?: (mentionId: string) => void
  /** Called when assign action is triggered */
  onAssign?: (mentionId: string) => void
  /** Called when tag action is triggered */
  onTag?: (mentionId: string) => void
  /** Called when mark read action is triggered */
  onMarkRead?: (mentionId: string, isRead: boolean) => void
  /** Called when mark important action is triggered */
  onMarkImportant?: (mentionId: string, isImportant: boolean) => void
  /** Called when open in platform action is triggered */
  onOpenInPlatform?: (mentionId: string) => void
  /** Whether to show insights like category mapping, classifications, etc. */
  showInsights?: boolean
}

export interface MentionTableProps {
  /** Mentions to display in the table */
  mentions: Mention[]
  /** Visible column keys */
  visibleColumns: string[]
  /** Sort configuration */
  sortBy: string
  sortOrder: SortOrder
  /** Selected mention IDs for bulk actions */
  selectedIds?: string[]
  /** Called when a mention row is clicked */
  onMentionClick?: (mentionId: string) => void
  /** Called when columns are reordered or toggled */
  onColumnsChange?: (columns: string[]) => void
  /** Called when sort changes */
  onSortChange?: (sortBy: string, sortOrder: SortOrder) => void
  /** Called when selection changes */
  onSelectionChange?: (mentionIds: string[]) => void
  /** Inline action callbacks */
  onReply?: (mentionId: string) => void
  onAssign?: (mentionId: string) => void
  onTag?: (mentionId: string) => void
}

export interface MentionFeedProps {
  /** Mentions to display in the feed */
  mentions: Mention[]
  /** Called when a mention is clicked */
  onMentionClick?: (mentionId: string) => void
  /** Inline action callbacks */
  onReply?: (mentionId: string) => void
  onLike?: (mentionId: string) => void
  onMarkRead?: (mentionId: string, isRead: boolean) => void
  onAnnotate?: (mentionId: string) => void
}

export interface FilterBarProps {
  /** Current filter values */
  filters: SavedView['filters']
  /** Available saved views */
  savedViews: SavedView[]
  /** Currently active view */
  activeView?: SavedView | null
  /** Called when filters change */
  onFilterChange?: (filters: SavedView['filters']) => void
  /** Called when user saves current filter configuration */
  onSaveView?: (view: Omit<SavedView, 'id'>) => void
  /** Called when user loads a saved view */
  onLoadView?: (viewId: string) => void
}

export interface RightRailProps {
  /** Top authors to display */
  topAuthors: TopAuthor[]
  /** Trending keywords to display */
  trendingKeywords: TrendingKeyword[]
  /** Top mentions (optional) */
  topMentions?: Mention[]
  /** Called when an author is clicked */
  onAuthorClick?: (authorId: string) => void
  /** Called when a keyword is clicked */
  onKeywordClick?: (keyword: string) => void
  /** Called when a top mention is clicked */
  onMentionClick?: (mentionId: string) => void
}
