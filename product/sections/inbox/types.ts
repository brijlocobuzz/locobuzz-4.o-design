// =============================================================================
// Enums and Union Types
// =============================================================================

export type TicketStatus = 'new' | 'open' | 'pending' | 'resolved'
export type HandoffState = 'waiting-on-internal' | 'waiting-on-customer' | 'pending-approval'
export type Priority = 'low' | 'medium' | 'high'
export type Sentiment = 'Positive' | 'Negative' | 'Neutral' | 'None'
export type Intent = 'Complaint' | 'Request' | 'Query' | 'Feedback' | 'Appreciation' | 'Opportunity' | 'Brand Promotion' | 'Information' | 'Irrelevant'
export type EntityType = 'BRAND' | 'PERSON' | 'LOCATION' | 'PRODUCT' | 'ORGANIZATION'
export type Emotion = 'Anger' | 'Frustration' | 'Disappointment' | 'Distrust' | 'Anxiety' | 'Joy' | 'Gratitude' | 'Trust' | 'Excitement' | 'Curiosity' | 'Confusion' | 'Indifference'
export type EmotionCluster = 'Negative' | 'Positive' | 'Neutral'
export type Platform = 'instagram' | 'facebook' | 'x' | 'linkedin' | 'google' | 'youtube' | 'whatsapp' | 'telegram' | 'messenger' | 'email' | 'voice'
export type InteractionType = 'dm' | 'post' | 'comment' | 'tagged-comment' | 'review' | 'story-mention' | 'collaboration' | 'email' | 'chat-message' | 'whatsapp-message' | 'call'
export type SlaStatus = 'within-sla' | 'due-soon' | 'breached' | 'paused' | 'met'
export type ReplyStatus = 'not-replied' | 'replied' | 'pending-approval'
export type ImpactTier = 'low' | 'medium' | 'high' | 'vip'
export type ConfidenceLevel = 'low' | 'medium' | 'high'
export type UserRole = 'agent' | 'supervisor' | 'admin' | 'quality-analyst'
export type UserStatus = 'online' | 'away' | 'busy' | 'offline'
export type DisplayMode = 'compact' | 'cards' | 'table'
export type SidebarCategory = 'triage' | 'status' | 'assignment' | 'sla' | 'custom'
export type AISuggestionType = 'response' | 'classification' | 'escalation'
export type Tone = 'formal' | 'apologetic' | 'firm' | 'friendly'
export type StatusAction = 'hold' | 'escalate' | 'awaiting'


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

export interface ExtractedEntity {
  type: EntityType
  value: string // The actual entity value extracted from the text
  confidence?: number // 0-1 confidence score
}

export interface Classification {
  // Fixed AI Classifications
  entityType: EntityType
  sentiment: Sentiment
  intent: Intent
  emotion: Emotion
  emotionCluster: EmotionCluster

  // Extracted Entities from text (with actual values)
  extractedEntities?: ExtractedEntity[]

  // AI Upper Categories (dynamic, user-defined)
  upperCategories: string[] // Customer's Intent (AI Upper Categories)

  // Category Mapping (1-3 levels, multiple possible, each with sentiment)
  categorizations: Categorization[]

  // Aspect Analysis
  aspectGroups: AspectGroup[]
  ungroupedAspects: (string | Aspect)[] // Support both legacy string[] and new Aspect[]

  // SignalSense matches
  signalSenseMatches?: SignalSenseMatch[]
}

// =============================================================================
// Core Entity Types (from Global Data Model)
// =============================================================================

export interface Author {
  id: string
  name: string
  username: string
  platform: Platform
  avatarUrl: string
  isVerified: boolean
  followerCount: number
  engagementRate: number
}

export interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  previousInteractions: number
  lastContactDate: string | null
  resolutionRate: number | null
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

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl: string
  status: UserStatus
}

export interface Team {
  id: string
  name: string
  members?: string[]
  supervisor?: string
}

export interface Mention {
  id: string
  content: string
  timestamp: string
  author: Author
  platform: Platform
  hasAttachments: boolean
  attachments?: Attachment[]

  // Variation-specific metadata (conditionally present based on interaction type)
  emailMetadata?: EmailMetadata
  chatMetadata?: ChatMetadata
  callMetadata?: CallMetadata
  transitionedFrom?: ConversationTransition // If this mention is part of a public→DM transition
  parentPostContext?: ParentPostContext // If this mention is from a threaded comment
}

export interface Reply {
  id: string
  content: string
  timestamp: string
  author: User
  isAiGenerated: boolean
  platform: Platform

  // Variation-specific metadata
  chatMetadata?: ChatMetadata // For chat platforms, includes delivery status
  emailMetadata?: Partial<EmailMetadata> // For email replies (subject, to/cc, etc.)
}

// =============================================================================
// Section-Specific Types
// =============================================================================

export interface ImpactScore {
  score: number
  tier: ImpactTier
  factors: {
    followerCount: number
    engagementVelocity: number
    sentimentSeverity: number
    vipStatus: number
  }
}

export interface SlaTimer {
  status: SlaStatus
  dueAt: string
  remainingMinutes: number | null
  breached: boolean
  breachedAt?: string
  breachedBy?: number
  metAt?: string
  pausedReason?: string
}

export interface Sla {
  firstResponse: SlaTimer
  resolution: SlaTimer
}

export interface Ticket {
  id: string
  ticketNumber: string
  status: TicketStatus
  handoffState?: HandoffState
  priority: Priority
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  assignedTo: Pick<User, 'id' | 'name' | 'avatarUrl'> | null
  team: Pick<Team, 'id' | 'name'> | null
  author: Author
  contact: Contact
  impactScore: ImpactScore
  channel: Channel
  page: Page
  interactionType: InteractionType
  interactionTypeLabel: string
  sentiment: Sentiment
  sentimentScore: number
  intent: Intent
  aspects: string[]
  signals: string[]
  messageSnippet: string
  unreadCount: number
  messageCount: {
    total: number
    fromCustomer: number
    fromBrand: number
  }
  replyStatus: ReplyStatus
  lastSeenBy: {
    user: Pick<User, 'id' | 'name'>
    timestamp: string
  } | null
  sla: Sla
  tags: string[]
  hasAttachments: boolean
  reasonSurfaced: string | null
  classification?: Classification

  // Ticket Variation-Specific Fields
  // Email tickets
  emailThreadMetadata?: EmailThreadMetadata // Thread-level info (subject, participants)
  emailThreadSummary?: EmailThreadSummary // For long email threads
  isNoReplySource?: boolean // Flag if ticket originated from no-reply address

  // Public→DM transition tickets
  conversationTransition?: ConversationTransition // Transition metadata
  publicPostContext?: PublicPostContext // Original public post context
  engagementRisk?: EngagementRiskAssessment // Risk level assessment

  // Parent post context tickets (threaded comments)
  parentPostContext?: ParentPostContext // Parent post and thread navigation
  threadNavigator?: ThreadNavigator // Thread breadcrumb and jump actions

  // Chat platform tickets
  isTyping?: boolean // Real-time typing indicator for chat platforms

  // Voice tickets
  callMetadata?: CallMetadata

  // Enhanced ticket card fields (configurable via Insights On)
  brandName?: string                          // Brand name associated with ticket
  locationProfileName?: string                // Location profile name
  facebookLocationName?: string               // GMB/Facebook location name
  language?: string                           // Language of the ticket content (e.g., 'en', 'hi', 'es')
  seenBy?: Array<{                            // Users who have seen this ticket
    user: Pick<User, 'id' | 'name' | 'avatarUrl'>
    timestamp: string
  }>
  mediaPreview?: Array<{                      // Media attachments preview
    type: 'image' | 'video' | 'document'
    thumbnailUrl?: string
    url: string
  }>

  // Maker-Checker workflow fields
  makerCheckerStatus?: {
    isInReview: boolean                       // true if sent for review
    reviewType: 'supervisor' | 'checker' | 'reviewer'
    submittedBy: Pick<User, 'id' | 'name' | 'avatarUrl'>
    submittedAt: string
    reviewDeadline?: string
    notes?: string
    status: 'pending' | 'approved' | 'rejected'
  }
}

export interface ConversationThread {
  mentions: Mention[]
  replies: Reply[]
  internalNotes: InternalNote[]
  draftReply?: DraftReply
}

export interface InternalNote {
  id: string
  content: string
  timestamp: string
  author: User
  mentions: string[]
}

export interface DraftReply {
  id: string
  content: string
  createdAt: string
  status: 'draft' | 'pending-approval'
  approver?: {
    id: string
    name: string
  }
}

export interface Attachment {
  type: 'image' | 'video' | 'pdf' | 'document' | 'audio' | 'voice-note'
  url: string
  description?: string
  size?: number // in bytes
  filename?: string
  thumbnailUrl?: string
  duration?: number // for audio/video, in seconds
}

// =============================================================================
// Ticket Variation Metadata Types
// =============================================================================

// Email-specific types
export type EmailContentType = 'html' | 'plain-text' | 'mixed'
export type MessageViewMode = 'default' | 'simplified' | 'original' | 'print-friendly'
export type ParticipantRole = 'primary-customer' | 'cc-contact' | 'internal-team' | 'system'

export interface EmailMetadata {
  subject: string
  from: {
    name: string
    email: string
  }
  to: Array<{
    name?: string
    email: string
    role?: ParticipantRole
  }>
  cc?: Array<{
    name?: string
    email: string
    role?: ParticipantRole
  }>
  bcc?: Array<{
    name?: string
    email: string
    role?: ParticipantRole
  }>
  inReplyTo?: string // Email thread ID
  contentType: EmailContentType
  isHtml: boolean
  hasQuotedReply: boolean
  hasSignature: boolean
  signatureContent?: string
  isSystemMessage: boolean
  systemMessageType?: 'out-of-office' | 'auto-reply' | 'delivery-notification' | 'bounce' | 'undeliverable'
  isNoReplyAddress: boolean
  alternativeEmail?: string // Suggested alternative if from no-reply

  // Internal vs External distinction
  isInternal: boolean // true = within company domain, false = external (customer)
  companyDomain?: string // e.g., "locobuzz.com" - used to determine internal/external

  // Participant changes (only show when there's a change from previous message)
  participantChanges?: {
    added?: Array<{ name?: string; email: string; type: 'to' | 'cc' }>
    removed?: Array<{ name?: string; email: string; type: 'to' | 'cc' }>
  }

  // HTML content support
  htmlContent?: string // Raw HTML for HTML emails (rendered in iframe or sanitized)
}

// Email thread-level metadata (shown once at the top)
export interface EmailThreadMetadata {
  threadId: string
  subject: string
  companyDomain: string // e.g., "locobuzz.com" for internal/external detection
  originalParticipants: {
    from: { name: string; email: string }
    to: Array<{ name?: string; email: string }>
    cc?: Array<{ name?: string; email: string }>
  }
  totalMessages: number
  hasHtmlMessages: boolean
  hasAttachments: boolean
}

export interface EmailParticipant {
  id: string
  name: string
  email: string
  role: ParticipantRole
  messageCount: number
  lastActivityAt: string
}

export interface EmailThreadSummary {
  totalEmails: number
  durationDays: number
  description: string // AI-generated summary
  participants: EmailParticipant[]
  importantDates: {
    firstContact: string
    lastReply: string
    resolutionDate?: string
  }
  attachmentCount: number
}

// Chat-specific types
export type ChatDeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
export type ChatMessageType = 'text' | 'image' | 'video' | 'voice-note' | 'document' | 'sticker' | 'location'

export interface ChatMetadata {
  deliveryStatus: ChatDeliveryStatus
  readAt?: string
  deliveredAt?: string
  sentAt: string
  isTyping?: boolean
  quickReplies?: string[] // AI-suggested quick responses
  messageType: ChatMessageType
  caption?: string // For media messages
  reactions?: Array<{
    emoji: string
    userId: string
    timestamp: string
  }>
}

// Voice-specific types
export interface CallMetadata {
  duration: number // in seconds
  recordingUrl?: string
  transcript?: Array<{
    startTime: number
    endTime: number
    speaker: 'agent' | 'customer'
    text: string
  }>
  callType: 'inbound' | 'outbound'
  missedCall: boolean
  isVoicemail: boolean
}

// Public-to-DM transition types
export type VisibilityLevel = 'public' | 'private'
export type TransitionInitiator = 'agent' | 'customer' | 'system' | 'workflow'
export type TransitionReason =
  | 'customer-requested-privacy'
  | 'sensitive-information'
  | 'negative-escalation'
  | 'viral-risk-mitigation'
  | 'agent-initiated'
  | 'automated-workflow'

export interface ConversationTransition {
  id: string
  timestamp: string
  from: {
    interactionType: InteractionType
    visibility: VisibilityLevel
    mentionId: string
    platform: Platform
  }
  to: {
    interactionType: InteractionType
    visibility: VisibilityLevel
    mentionId: string
    platform: Platform
  }
  reason: TransitionReason
  reasonText: string // Human-readable explanation
  initiatedBy: TransitionInitiator
  initiatorName?: string // Agent name or "System" or customer name
  publicVisibilityStats?: {
    views: number
    reactions: number
    comments: number
  }
}

export interface PublicPostContext {
  postId: string
  content: string
  timestamp: string
  author: {
    id: string
    name: string
    username: string
    avatarUrl: string
    isVerified: boolean
    followerCount?: number
  }
  platform: Platform
  postType: 'post' | 'story' | 'tweet' | 'update'
  visibility: VisibilityLevel
  engagementMetrics: {
    reactions: {
      total: number
      byType?: Record<string, number> // e.g., { like: 120, love: 45, angry: 12 }
    }
    comments: number
    shares: number
    reach?: number
    impressions?: number
  }
  viralityIndicator: 'normal' | 'high' | 'viral' | 'critical'
  viralityReason?: string // e.g., "2.5x average engagement - trending"
  media?: Array<{
    type: 'image' | 'video' | 'carousel'
    url: string
    thumbnailUrl?: string
    altText?: string
  }>
  platformUrl: string // Link to view on native platform
}

// Parent post context / Thread navigation types
export type ThreadNestingLevel = 0 | 1 | 2 | 3 // 0 = root, 1 = reply, 2 = reply to reply, 3+ = deeply nested

export interface ParentPostContext {
  post: PublicPostContext
  isCollapsed: boolean // UI state for collapsed/expanded
  threadPosition: {
    currentCommentNumber: number
    totalComments: number
    nestingLevel: ThreadNestingLevel
  }
  parentComment?: {
    id: string
    authorUsername: string
    content: string
    contentSnippet: string // First 150 chars
    timestamp: string
    reactions: number
  }
  siblingReplies?: {
    count: number
    platformUrl: string // Link to view siblings on platform
  }
  childReplies?: {
    count: number
    platformUrl: string
  }
}

export interface ThreadNavigator {
  breadcrumb: Array<{
    type: 'post' | 'comment' | 'reply' | 'current'
    label: string // e.g., "Original Post", "@username's comment", "This ticket"
    id?: string
    isClickable: boolean
  }>
  actions: {
    canJumpToParent: boolean
    canViewSiblings: boolean
    canViewChildren: boolean
    canViewFullThread: boolean
    fullThreadUrl?: string
  }
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface EngagementRiskAssessment {
  level: RiskLevel
  reason: string
  shouldEscalate: boolean
  requiresApproval: boolean
  suggestedActions: string[]
}

export interface SidebarView {
  id: string
  category: SidebarCategory
  name: string
  icon: string
  count: number
  color?: string
}

export interface SavedSearch {
  id: string
  name: string
  query: string
  lastUsed: string
}

export interface AISuggestion {
  id: string
  type: AISuggestionType
  confidence: number
  confidenceLabel: ConfidenceLevel
  content: string
  reasoning: string
  source: string
  tone: Tone
  suggestedTags?: string[]
  isWithinKB?: boolean
}

// =============================================================================
// Data Container Type
// =============================================================================

export interface InboxData {
  _meta: {
    models: Record<string, string>
    relationships: string[]
  }
  currentUser: User
  sidebarViews: SidebarView[]
  savedSearches: SavedSearch[]
  tickets: Ticket[]
  conversationThreads: Record<string, ConversationThread>
  aiSuggestions: Record<string, AISuggestion[]>
  users: User[]
  teams: Team[]
}

// =============================================================================
// Component Props
// =============================================================================

export interface InboxProps {
  /** Current logged-in user */
  currentUser: User
  /** Sidebar views and queues */
  sidebarViews: SidebarView[]
  /** List of tickets to display */
  tickets: Ticket[]
  /** Conversation threads keyed by ticket ID */
  conversationThreads: Record<string, ConversationThread>
  /** AI suggestions keyed by ticket ID */
  aiSuggestions: Record<string, AISuggestion[]>
  /** Saved search queries */
  savedSearches: SavedSearch[]
  /** Available users for assignment */
  users: User[]
  /** Available teams */
  teams: Team[]
  /** Current display mode */
  displayMode?: DisplayMode
  /** Currently active sidebar view */
  activeView?: string
  /** Currently opened ticket in slide-in panel */
  openTicketId?: string | null

  // Navigation & View callbacks
  /** Called when user selects a sidebar view */
  onViewChange?: (viewId: string) => void
  /** Called when display mode is changed (compact/cards/table) */
  onDisplayModeChange?: (mode: DisplayMode) => void
  /** Called when user clicks a ticket to open in slide-in panel */
  onTicketOpen?: (ticketId: string) => void
  /** Called when user closes the slide-in panel */
  onTicketClose?: () => void
  /** Called when user pops out to full page mode */
  onPopOut?: (ticketId: string) => void

  // Search & Filter callbacks
  /** Called when user performs a search */
  onSearch?: (query: string) => void
  /** Called when user saves a search */
  onSaveSearch?: (search: Omit<SavedSearch, 'id' | 'lastUsed'>) => void
  /** Called when user loads a saved search */
  onLoadSearch?: (searchId: string) => void

  // Ticket Action callbacks
  /** Called when user sends a public reply */
  onReply?: (ticketId: string, content: string, metadata?: { tone?: Tone; statusAction?: StatusAction; recipients?: { to: string; cc: string[]; bcc: string[] }; taggedUsers?: string[] }) => void
  /** Called when user sends an internal note */
  onInternalNote?: (ticketId: string, content: string, mentions?: string[]) => void
  /** Called when user assigns ticket to agent/team */
  onAssign?: (ticketId: string, userId?: string, teamId?: string) => void
  /** Called when user closes a ticket */
  onClose?: (ticketId: string) => void
  /** Called when user adds tags to ticket */
  onAddTags?: (ticketId: string, tags: string[]) => void
  /** Called when user creates a task from ticket */
  onCreateTask?: (ticketId: string) => void
  /** Called when user escalates ticket */
  onEscalate?: (ticketId: string) => void
  /** Called when user sends ticket to internal team */
  onSendToTeam?: (ticketId: string, teamId: string, message: string) => void
  /** Called when user changes ticket priority */
  onChangePriority?: (ticketId: string, priority: Priority) => void
  /** Called when user changes ticket status */
  onChangeStatus?: (ticketId: string, status: TicketStatus) => void
  /** Called when user sets handoff state */
  onSetHandoffState?: (ticketId: string, state: HandoffState) => void

  // Bulk Action callbacks
  /** Called when user selects/deselects tickets */
  onSelectionChange?: (ticketIds: string[]) => void
  /** Called when bulk assign action is triggered */
  onBulkAssign?: (ticketIds: string[], userId?: string, teamId?: string) => void
  /** Called when bulk close action is triggered */
  onBulkClose?: (ticketIds: string[]) => void
  /** Called when bulk tag action is triggered */
  onBulkTag?: (ticketIds: string[], tags: string[]) => void
  /** Called when bulk status change action is triggered */
  onBulkStatusChange?: (ticketIds: string[], status: TicketStatus) => void
  /** Called when bulk priority change action is triggered */
  onBulkPriorityChange?: (ticketIds: string[], priority: Priority) => void
  /** Called when bulk mark as read action is triggered */
  onBulkMarkRead?: (ticketIds: string[]) => void

  // AI Interaction callbacks
  /** Called when user provides positive feedback on AI suggestion */
  onAIFeedbackPositive?: (suggestionId: string) => void
  /** Called when user provides negative feedback on AI suggestion */
  onAIFeedbackNegative?: (suggestionId: string, reason?: string) => void
  /** Called when user overrides AI-detected sentiment/intent */
  onOverrideAILabel?: (ticketId: string, field: 'sentiment' | 'intent', value: string) => void
  /** Called when user applies an AI suggestion */
  onApplyAISuggestion?: (ticketId: string, suggestionId: string) => void

  // Draft & Approval callbacks
  /** Called when draft is auto-saved */
  onDraftSave?: (ticketId: string, content: string) => void
  /** Called when user submits reply for approval */
  onSubmitForApproval?: (ticketId: string, content: string) => void
  /** Called when supervisor approves a reply */
  onApproveReply?: (ticketId: string, draftId: string) => void
  /** Called when supervisor rejects a reply */
  onRejectReply?: (ticketId: string, draftId: string, feedback: string) => void

  // Table View specific callbacks
  /** Called when user customizes visible columns in table view */
  onColumnsChange?: (columns: string[]) => void
  /** Called when user reorders columns */
  onColumnReorder?: (columnOrder: string[]) => void
  /** Called when user sorts table */
  onSort?: (column: string, direction: 'asc' | 'desc') => void
}

// =============================================================================
// Sub-Component Props
// =============================================================================

export interface SidebarProps {
  views: SidebarView[]
  activeView?: string
  onViewChange?: (viewId: string) => void
}

export interface SearchBarProps {
  savedSearches: SavedSearch[]
  onSearch?: (query: string) => void
  onSaveSearch?: (search: Omit<SavedSearch, 'id' | 'lastUsed'>) => void
  onLoadSearch?: (searchId: string) => void
}

export interface TicketListProps {
  tickets: Ticket[]
  displayMode: DisplayMode
  selectedIds?: string[]
  onTicketClick?: (ticketId: string) => void
  onSelectionChange?: (ticketIds: string[]) => void
}

export interface TicketCardProps {
  ticket: Ticket
  isSelected?: boolean
  onClick?: (ticketId: string) => void
  onSelect?: (ticketId: string, selected: boolean) => void
  /** Whether to show insights like category mapping, classifications, aspects, etc. */
  showInsights?: boolean
}

export interface SlideInPanelProps {
  ticket: Ticket
  conversation: ConversationThread
  aiSuggestions: AISuggestion[]
  users: User[]
  teams: Team[]
  isOpen: boolean
  onClose?: () => void
  onPopOut?: (ticketId: string) => void
  onReply?: (content: string, metadata?: { tone?: Tone; statusAction?: StatusAction; recipients?: { to: string; cc: string[]; bcc: string[] }; taggedUsers?: string[] }) => void
  onInternalNote?: (content: string, mentions?: string[]) => void
  onAssign?: (userId?: string, teamId?: string) => void
  onAddTags?: (tags: string[]) => void
  onCreateTask?: () => void
  onEscalate?: () => void
  onSendToTeam?: (teamId: string, message: string) => void
  onAIFeedbackPositive?: (suggestionId: string) => void
  onAIFeedbackNegative?: (suggestionId: string, reason?: string) => void
  onApplyAISuggestion?: (suggestionId: string) => void
  onDraftSave?: (content: string) => void
  onSubmitForApproval?: (content: string) => void
}

export interface ConversationThreadProps {
  conversation: ConversationThread
}

export interface CustomerContextPanelProps {
  contact: Contact
  impactScore: ImpactScore
  ticketHistory: {
    previousInteractions: number
    lastContactDate: string | null
    resolutionRate: number | null
  }
}

export interface AISuggestionsProps {
  suggestions: AISuggestion[]
  onApply?: (suggestionId: string) => void
  onFeedbackPositive?: (suggestionId: string) => void
  onFeedbackNegative?: (suggestionId: string, reason?: string) => void
}

export interface ReplyComposerProps {
  aiSuggestions?: AISuggestion[]
  onSendReply?: (content: string, statusAction?: StatusAction, taggedUsers?: string[]) => void
  onAddNote?: (content: string) => void
  ticketPlatform?: Platform
  ticketType?: InteractionType
  mentionedUsers?: string[]
  enableAgentIQ?: boolean
  onDraftSave?: (content: string) => void
  onSubmitForApproval?: (content: string) => void
}

export interface EmailReplyComposerProps {
  aiSuggestions?: AISuggestion[]
  defaultTo?: string
  defaultCc?: string[]
  onSendReply?: (content: string, recipients: { to: string; cc: string[]; bcc: string[] }, statusAction?: StatusAction) => void
  onAddNote?: (content: string) => void
  onPopOut?: () => void
  onDraftSave?: (content: string) => void
  onSubmitForApproval?: (content: string) => void
}


export interface BulkActionsBarProps {
  selectedCount: number
  users: User[]
  teams: Team[]
  onAssign?: (userId?: string, teamId?: string) => void
  onClose?: () => void
  onAddTags?: (tags: string[]) => void
  onChangeStatus?: (status: TicketStatus) => void
  onChangePriority?: (priority: Priority) => void
  onMarkRead?: () => void
  onClearSelection?: () => void
}
