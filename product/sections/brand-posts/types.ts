// =============================================================================
// Data Types
// =============================================================================

export interface EditHistoryEntry {
  editedAt: string
  editedBy: string
  changes: string
}

export interface ApprovalWorkflow {
  state: 'draft' | 'in_review' | 'approved' | 'scheduled' | 'published' | 'failed'
  submittedAt: string | null
  submittedBy: string | null
  reviewedAt: string | null
  reviewedBy: string | null
  notes: string
}

export interface Post {
  id: string
  content: string
  mediaUrl: string | null
  mediaType: 'image' | 'video' | null
  postType: 'text' | 'image' | 'video' | 'carousel' | 'reel' | 'story'
  pageId: string
  status: 'draft' | 'in_review' | 'approved' | 'scheduled' | 'published' | 'failed'
  publishedAt: string | null
  scheduledFor: string | null
  createdBy: string
  approvedBy: string | null
  productProfileIds: string[]
  locationProfileId: string | null
  campaignId: string | null
  themeId: string | null
  objectiveId: string | null
  isBoosted: boolean
  hashtags: string[]
  language: string
  editHistory: EditHistoryEntry[]
  draftStatus?: 'draft' | 'in_review' | 'approved'
  approvalWorkflow?: ApprovalWorkflow
  failureReason?: string
}

export interface Page {
  id: string
  name: string
  handle: string | null
  channel: 'Instagram' | 'Facebook' | 'Twitter' | 'LinkedIn' | 'Google Business'
  channelId: string
  url: string
  isActive: boolean
}

export interface ProductProfile {
  id: string
  name: string
  description: string
  category: string
}

export interface LocationProfile {
  id: string
  name: string
  address: string
  city: string
  state: string
  country: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar: string
}

export interface Campaign {
  id: string
  name: string
  startDate: string
  endDate: string
}

export interface Theme {
  id: string
  name: string
  description: string
}

export interface Objective {
  id: string
  name: string
  description: string
}

export interface Benchmark {
  vsLast30Posts: string
  vsChannelMedian: string
}

export interface PostMetrics {
  postId: string
  impressions: number
  reach: number
  engagements: number
  engagementRate: number
  clicks: number
  clickRate: number
  videoViews: number | null
  videoWatchTime: number | null
  saves: number
  shares: number
  comments: number
  likes: number
  followerChange: number
  profileVisits: number
  benchmark: Benchmark
  insights: string[]
}

export interface Comment {
  id: string
  postId: string
  authorName: string
  authorHandle: string
  authorAvatar: string
  content: string
  sentiment: 'positive' | 'neutral' | 'negative'
  sentimentScore: number
  createdAt: string
  isReplied: boolean
  needsReply: boolean
  isModerated: boolean
  moderationAction: string | null
}

export interface SentimentBreakdown {
  positive: number
  neutral: number
  negative: number
  positivePercent: number
  neutralPercent: number
  negativePercent: number
}

export interface SentimentSpike {
  type: 'positive' | 'negative'
  change: string
  description: string
}

export interface CommentSummary {
  postId: string
  totalComments: number
  analyzedComments: number
  sentimentBreakdown: SentimentBreakdown
  unrepliedCount: number
  needsReplyCount: number
  sentimentSpike: SentimentSpike | null
  lastAnalyzed: string
}

export interface SavedView {
  id: string
  name: string
  filters: {
    channels?: string[]
    postTypes?: string[]
    dateRange?: { start: string; end: string }
    campaigns?: string[]
    themes?: string[]
    objectives?: string[]
    hasUnansweredComments?: boolean
    sentimentThreshold?: number
  }
  sortBy?: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface BrandPostsProps {
  /** The list of posts to display */
  posts: Post[]
  /** Available social media pages */
  pages: Page[]
  /** Product profiles that can be associated with posts */
  productProfiles: ProductProfile[]
  /** Location profiles that can be associated with posts */
  locationProfiles: LocationProfile[]
  /** Team members for assignment and approval */
  users: User[]
  /** Available campaigns for tagging */
  campaigns: Campaign[]
  /** Content themes for organization */
  themes: Theme[]
  /** Business objectives for tracking */
  objectives: Objective[]
  /** Performance metrics for each post */
  metrics: PostMetrics[]
  /** Comments on posts */
  comments: Comment[]
  /** Comment summaries with sentiment analysis */
  commentSummaries: CommentSummary[]
  /** Saved filter views */
  savedViews?: SavedView[]
  /** Current view mode */
  viewMode?: 'published' | 'scheduled' | 'needs-attention'
  /** Current display mode */
  displayMode?: 'feed' | 'grid' | 'table'
  /** Currently selected channel filter */
  selectedChannel?: string | null

  // Post actions
  /** Called when user wants to view a post's details */
  onViewPost?: (id: string) => void
  /** Called when user wants to edit a post */
  onEditPost?: (id: string) => void
  /** Called when user wants to reschedule a post */
  onReschedulePost?: (id: string) => void
  /** Called when user wants to duplicate a post */
  onDuplicatePost?: (id: string) => void
  /** Called when user wants to delete a post */
  onDeletePost?: (id: string) => void
  /** Called when user wants to create a new post */
  onCreatePost?: () => void

  // Tagging actions
  /** Called when user tags a post with a campaign */
  onTagCampaign?: (postId: string, campaignId: string | null) => void
  /** Called when user tags a post with a theme */
  onTagTheme?: (postId: string, themeId: string | null) => void
  /** Called when user tags a post with an objective */
  onTagObjective?: (postId: string, objectiveId: string | null) => void
  /** Called when user associates a post with product profiles */
  onTagProducts?: (postId: string, productIds: string[]) => void
  /** Called when user associates a post with a location */
  onTagLocation?: (postId: string, locationId: string | null) => void

  // Comment actions
  /** Called when user wants to reply to a comment */
  onReplyToComment?: (commentId: string) => void
  /** Called when user wants to moderate a comment (hide, delete, etc.) */
  onModerateComment?: (commentId: string, action: 'hide' | 'delete' | 'restrict' | 'report' | 'pin') => void
  /** Called when user assigns a comment thread to someone */
  onAssignComment?: (commentId: string, userId: string) => void

  // Approval workflow actions
  /** Called when user submits a post for approval */
  onSubmitForApproval?: (postId: string) => void
  /** Called when user approves a post */
  onApprovePost?: (postId: string, notes?: string) => void
  /** Called when user rejects a post */
  onRejectPost?: (postId: string, notes: string) => void

  // Bulk actions
  /** Called when user performs bulk tagging */
  onBulkTag?: (postIds: string[], tags: { campaignId?: string; themeId?: string; objectiveId?: string }) => void
  /** Called when user performs bulk reschedule */
  onBulkReschedule?: (postIds: string[], newDate: string) => void
  /** Called when user performs bulk duplicate */
  onBulkDuplicate?: (postIds: string[]) => void
  /** Called when user performs bulk ownership change */
  onBulkChangeOwner?: (postIds: string[], userId: string) => void
  /** Called when user exports posts */
  onExport?: (postIds: string[], format: 'csv' | 'json') => void

  // View and filter actions
  /** Called when user switches view mode */
  onViewModeChange?: (mode: 'published' | 'scheduled' | 'needs-attention') => void
  /** Called when user switches display mode */
  onDisplayModeChange?: (mode: 'feed' | 'grid' | 'table') => void
  /** Called when user filters by channel */
  onChannelFilter?: (channelId: string | null) => void
  /** Called when user applies advanced filters */
  onApplyFilters?: (filters: SavedView['filters']) => void
  /** Called when user saves a custom view */
  onSaveView?: (view: SavedView) => void
  /** Called when user selects a saved view */
  onSelectSavedView?: (viewId: string) => void

  // Calendar integration
  /** Called when user wants to navigate to content calendar */
  onOpenCalendar?: (filters?: { channel?: string; campaign?: string; dateRange?: { start: string; end: string } }) => void
}
