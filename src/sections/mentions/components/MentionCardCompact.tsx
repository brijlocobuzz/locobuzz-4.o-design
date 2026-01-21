import {
  Heart,
  MessageCircle,
  Eye,
  Star,
  ExternalLink,
  Image,
  PlayCircle,
  Bot,
  Check,
  Globe,
  Clock,
} from 'lucide-react'
import type { Mention, Sentiment, Aspect } from '@/../product/sections/mentions/types'
import { SignalSenseBadge } from '@/components/insights/SignalSenseBadge'
import { AspectGroupPill } from '@/components/insights/AspectGroupPill'
import type { MentionInsights } from './Mentions'

const platformColors: Record<string, string> = {
  instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
  facebook: 'bg-blue-600',
  x: 'bg-slate-900 dark:bg-slate-200',
  linkedin: 'bg-blue-700',
  youtube: 'bg-red-600',
  reddit: 'bg-orange-600',
  google: 'bg-blue-500',
  trustpilot: 'bg-emerald-600',
  web: 'bg-slate-600',
  podcast: 'bg-purple-600',
}

// Helper to check if an aspect is detailed
function isDetailedAspect(aspect: string | Aspect): aspect is Aspect {
  return typeof aspect === 'object' && 'name' in aspect && 'sentiment' in aspect
}

interface MentionCardCompactProps {
  mention: Mention
  isSelected?: boolean
  onClick?: (mentionId: string) => void
  onHover?: (mentionId: string | null) => void
  onMarkImportant?: (mentionId: string, important: boolean) => void
  onOpenInPlatform?: (mentionId: string) => void
  showInsights?: boolean
  selectedInsights?: MentionInsights['selectedInsights']
}

export function MentionCardCompact({
  mention,
  isSelected = false,
  onClick,
  onHover,
  onMarkImportant,
  onOpenInPlatform,
  showInsights = true,
  selectedInsights,
}: MentionCardCompactProps) {
  const platformColor = platformColors[mention.author.platform] || 'bg-slate-500'

  const getSentimentColor = (sent: string) => {
    const normalized = sent?.toLowerCase()
    switch (normalized) {
      case 'negative':
        return 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
      case 'positive':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
    }
  }

  const getEmotionColor = (cluster: string) => {
    switch (cluster) {
      case 'Negative':
        return 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
      case 'Positive':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
    }
  }

  const getCategoryColor = (sentiment: string) => {
    const normalized = sentiment?.toLowerCase()
    switch (normalized) {
      case 'negative':
        return 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
      case 'positive':
        return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const formatCategorization = (cat: { category?: string; subcategory?: string; subSubcategory?: string }) => {
    const parts: string[] = []
    if (cat.category) {
      if (cat.subcategory || cat.subSubcategory) {
        // Abbreviate parent categories
        const words = cat.category.split(' ')
        parts.push(words.length > 1 ? words.map(w => w[0].toUpperCase()).join('') : cat.category.slice(0, 4))
      } else {
        parts.push(cat.category)
      }
    }
    if (cat.subcategory) {
      if (cat.subSubcategory) {
        const words = cat.subcategory.split(' ')
        parts.push(words.length > 1 ? words.map(w => w[0].toUpperCase()).join('') : cat.subcategory.slice(0, 4))
      } else {
        parts.push(cat.subcategory)
      }
    }
    if (cat.subSubcategory) {
      parts.push(cat.subSubcategory)
    }
    return parts.join(' > ')
  }

  return (
    <div
      onClick={() => onClick?.(mention.id)}
      onMouseEnter={() => onHover?.(mention.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`
        relative flex items-start gap-4 px-4 py-3 border-b border-slate-200 dark:border-slate-800
        hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors
        ${isSelected ? 'bg-indigo-50 dark:bg-indigo-950' : 'bg-white dark:bg-slate-950'}
        ${!mention.isRead ? 'border-l-4 border-l-indigo-500' : ''}
      `}
    >
      {/* Left side: Avatar */}
      <div className="flex flex-col items-center gap-2 pt-1">
        <img
          src={mention.author.avatarUrl}
          alt={mention.author.name}
          className="w-10 h-10 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-slate-800"
        />
        {/* Platform indicator */}
        <div className={`flex h-5 w-5 items-center justify-center rounded ${platformColor} text-[8px] font-bold text-white`}>
          {mention.author.platform.slice(0, 2).toUpperCase()}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Author Row */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {mention.author.name}
          </span>
          {mention.author.isVerified && (
            <Check className="w-3.5 h-3.5 text-blue-500" />
          )}
          <span className="text-sm text-slate-500 dark:text-slate-400">
            @{mention.author.username}
          </span>
          {mention.author.followerCount > 0 && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ({mention.author.followerCount >= 1000000
                ? `${(mention.author.followerCount / 1000000).toFixed(1)}M`
                : mention.author.followerCount >= 1000
                  ? `${(mention.author.followerCount / 1000).toFixed(0)}K`
                  : mention.author.followerCount} followers)
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(mention.timestamp)}
          </span>
        </div>

        {/* Message snippet */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {mention.content}
          </span>
        </div>

        {/* SignalSense Matches - HIGHEST PRIORITY */}
        {showInsights && selectedInsights?.signalSense !== false && mention.signalSenseMatches && mention.signalSenseMatches.length > 0 && (
          <div className="mb-1.5">
            <SignalSenseBadge matches={mention.signalSenseMatches} maxVisible={2} />
          </div>
        )}

        {/* Classifications - inline row */}
        {showInsights && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Sentiment */}
            {selectedInsights?.sentiment !== false && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSentimentColor(mention.sentiment)}`}>
                {mention.sentiment} ({(mention.sentimentScore * 100).toFixed(0)}%)
              </span>
            )}

            {/* Entity Type */}
            {selectedInsights?.entity !== false && mention.entityType && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Bot className="w-3 h-3" />
                {mention.entityType}
              </span>
            )}

            {/* Intent */}
            {selectedInsights?.intent !== false && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300">
                {mention.intent}
              </span>
            )}

            {/* Emotion */}
            {selectedInsights?.emotion !== false && mention.emotion && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getEmotionColor(mention.emotionCluster || 'Neutral')}`}>
                {mention.emotion}
              </span>
            )}

            {/* Upper Categories (Customer's Intent) */}
            {selectedInsights?.category !== false && mention.upperCategories && mention.upperCategories.length > 0 && (
              <>
                {mention.upperCategories.slice(0, 2).map((category, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                  >
                    {category}
                  </span>
                ))}
                {mention.upperCategories.length > 2 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    +{mention.upperCategories.length - 2}
                  </span>
                )}
              </>
            )}

            {/* Categorizations with Sentiment */}
            {selectedInsights?.category !== false && mention.categorizations && mention.categorizations.length > 0 && (
              <>
                {mention.categorizations.slice(0, 2).map((cat, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getCategoryColor(cat.sentiment || 'Neutral')}`}
                  >
                    {formatCategorization(cat)}
                  </span>
                ))}
                {mention.categorizations.length > 2 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    +{mention.categorizations.length - 2}
                  </span>
                )}
              </>
            )}

            {/* Aspect Groups */}
            {selectedInsights?.aspectGroups !== false && mention.aspectGroups && mention.aspectGroups.length > 0 && (
              <>
                {mention.aspectGroups.slice(0, 2).map((group, idx) => (
                  <AspectGroupPill key={idx} group={group} showIcon={!!group.icon} />
                ))}
                {mention.aspectGroups.length > 2 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    +{mention.aspectGroups.length - 2}
                  </span>
                )}
              </>
            )}

            {/* Ungrouped Aspects */}
            {selectedInsights?.aspects !== false && mention.ungroupedAspects && mention.ungroupedAspects.length > 0 && (
              <>
                {mention.ungroupedAspects.slice(0, 2).map((aspect, idx) => {
                  const aspectName = isDetailedAspect(aspect) ? aspect.name : aspect
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      {aspectName}
                    </span>
                  )
                })}
                {mention.ungroupedAspects.length > 2 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    +{mention.ungroupedAspects.length - 2}
                  </span>
                )}
              </>
            )}

            {/* Tags */}
            {selectedInsights?.mentionInfo?.tags !== false && mention.tags && mention.tags.length > 0 && (
              <>
                {mention.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                  >
                    {tag}
                  </span>
                ))}
                {mention.tags.length > 2 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    +{mention.tags.length - 2}
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right side: Engagement, Media, Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Media Preview */}
        {selectedInsights?.mentionInfo?.media !== false && mention.media && mention.media.length > 0 && (
          <div className="flex items-center gap-1">
            {mention.media.slice(0, 2).map((media, idx) => (
              <div
                key={media.id || idx}
                className="relative w-8 h-8 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700"
              >
                {media.thumbnailUrl ? (
                  <img src={media.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {media.type === 'image' && <Image className="w-4 h-4 text-slate-400" />}
                    {media.type === 'video' && <PlayCircle className="w-4 h-4 text-slate-400" />}
                  </div>
                )}
                {media.type === 'video' && media.thumbnailUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="text-white text-[8px]">▶</span>
                  </div>
                )}
              </div>
            ))}
            {mention.media.length > 2 && (
              <span className="text-xs text-slate-500 dark:text-slate-400">+{mention.media.length - 2}</span>
            )}
          </div>
        )}

        {/* Engagement Metrics */}
        {selectedInsights?.mentionInfo?.engagement !== false && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {mention.engagementMetrics.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {mention.engagementMetrics.comments}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {(mention.engagementMetrics.reach / 1000).toFixed(1)}K
            </span>
          </div>
        )}

        {/* Important Star */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onMarkImportant?.(mention.id, !mention.isImportant)
          }}
          className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${mention.isImportant ? 'text-amber-500' : 'text-slate-400'}`}
        >
          <Star className="h-4 w-4" fill={mention.isImportant ? 'currentColor' : 'none'} />
        </button>

        {/* External Link */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onOpenInPlatform?.(mention.id)
          }}
          className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
