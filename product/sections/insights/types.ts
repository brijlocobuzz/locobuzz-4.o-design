// Insights Section Types

// =============================================================================
// Data Types
// =============================================================================

export type InsightType = 'trending_topic' | 'emerging_theme' | 'audience_question' | 'ai_summary'
export type Timeframe = 'today' | 'week' | 'month'
export type TrendDirection = 'up' | 'down' | 'stable'

export interface SentimentBreakdown {
  positive: number
  neutral: number
  negative: number
}

export interface TrendIndicator {
  direction: TrendDirection
  percentage: number
}

export interface Insight {
  id: string
  type: InsightType
  title: string
  summary: string
  mentionCount: number
  sentiment: SentimentBreakdown
  trend: TrendIndicator
  topChannels: string[]
  channelDistribution: Record<string, number>
  sparklineData: number[]
  timeframe: Timeframe
  detectedAt: string
  relatedMentionIds: string[]
  isBookmarked: boolean
  keywords: string[]
}

export interface Mention {
  id: string
  content: string
  authorName: string
  authorHandle: string
  channel: string
  publishedAt: string
  sentiment: 'positive' | 'neutral' | 'negative'
  intent: 'question' | 'complaint' | 'feedback' | 'praise'
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface InsightsProps {
  /** The list of insights to display */
  insights: Insight[]
  /** Source mentions referenced by insights */
  mentions: Mention[]
  /** Users for bookmark/share actions */
  users: User[]

  /** Called when user clicks an insight to view details */
  onViewInsight?: (insightId: string) => void
  /** Called when user bookmarks/unbookmarks an insight */
  onToggleBookmark?: (insightId: string, isBookmarked: boolean) => void
  /** Called when user wants to share an insight */
  onShareInsight?: (insightId: string) => void
  /** Called when user wants to create an alert from an insight */
  onCreateAlert?: (insightId: string) => void
  /** Called when user clicks to view source mentions for an insight */
  onViewMentions?: (mentionIds: string[]) => void
  /** Called when user filters insights by type */
  onFilterByType?: (type: InsightType | 'all') => void
  /** Called when user filters insights by timeframe */
  onFilterByTimeframe?: (timeframe: Timeframe | 'all') => void
  /** Called when user searches insights */
  onSearch?: (query: string) => void
  /** Called when user clears all filters */
  onClearFilters?: () => void
  /** Called when user clicks on a mention to view its details */
  onViewMentionDetail?: (mentionId: string) => void
}
