import {
  Heart,
  MessageCircle,
  Eye,
  Star,
  Check,
  UserPlus,
  Tag,
  ExternalLink,
  Image,
  PlayCircle,
  FileText,
  Bot,
} from 'lucide-react'
import type { MentionCardProps, Sentiment, EmotionCluster, Aspect } from '@/../product/sections/mentions/types'
import { SignalSenseBadge } from '@/components/insights/SignalSenseBadge'
import { AspectGroupPill } from '@/components/insights/AspectGroupPill'
import type { MentionInsights } from './Mentions'

const sentimentColors: Record<Sentiment, { bg: string; text: string; border: string }> = {
  Positive: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  Neutral: {
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
  },
  Negative: {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
  },
  None: {
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
  },
}

const emotionClusterColors: Record<EmotionCluster, string> = {
  Negative: 'text-rose-600 dark:text-rose-400',
  Positive: 'text-emerald-600 dark:text-emerald-400',
  Neutral: 'text-slate-600 dark:text-slate-400',
}

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

// Helper to get aspect name regardless of type
function getAspectName(aspect: string | Aspect): string {
  return isDetailedAspect(aspect) ? aspect.name : aspect
}

// Helper to get aspect sentiment color
function getAspectSentimentColor(aspect: string | Aspect): string {
  if (isDetailedAspect(aspect)) {
    switch (aspect.sentiment) {
      case 'Positive':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
      case 'Negative':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
      default:
        return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
    }
  }
  return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
}

export function MentionCard({
  mention,
  isSelected = false,
  onClick,
  onHover,
  onReply,
  onAssign,
  onTag,
  onMarkRead,
  onMarkImportant,
  onOpenInPlatform,
  showInsights = true,
  selectedInsights,
}: MentionCardProps & { selectedInsights?: MentionInsights['selectedInsights'] }) {
  const sentiment = sentimentColors[mention.sentiment] || sentimentColors['Neutral']
  const platformColor = platformColors[mention.author.platform] || 'bg-slate-500'

  return (
    <div
      onClick={() => onClick?.(mention.id)}
      onMouseEnter={() => onHover?.(mention.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group relative cursor-pointer rounded-lg border ${sentiment.border} ${sentiment.bg} p-4 transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''
        } ${!mention.isRead ? 'shadow-sm' : 'opacity-75'}`}
    >
      {/* Unread indicator */}
      {!mention.isRead && (
        <div className="absolute -left-1 top-4 h-3 w-1 rounded-r-full bg-indigo-500" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <img
            src={mention.author.avatarUrl}
            alt={mention.author.name}
            className="h-10 w-10 rounded-full ring-2 ring-white dark:ring-slate-800"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900 dark:text-white">{mention.author.name}</span>
              {mention.author.isVerified && (
                <Check className="h-3.5 w-3.5 text-blue-500" />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span>{mention.author.username}</span>
              <span>·</span>
              <span>{new Date(mention.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Actions (visible on hover) */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMarkImportant?.(mention.id, !mention.isImportant)
            }}
            className={`rounded p-1.5 hover:bg-white/50 dark:hover:bg-slate-800/50 ${mention.isImportant ? 'text-amber-500' : 'text-slate-400'
              }`}
          >
            <Star className="h-4 w-4" fill={mention.isImportant ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpenInPlatform?.(mention.id)
            }}
            className="rounded p-1.5 text-slate-400 hover:bg-white/50 hover:text-slate-600 dark:hover:bg-slate-800/50"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {mention.content}
      </p>

      {/* Media Preview - configurable */}
      {selectedInsights?.mentionInfo?.media !== false && mention.media && mention.media.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          {mention.media.slice(0, 4).map((media, idx) => (
            <div
              key={media.id || idx}
              className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700"
            >
              {media.thumbnailUrl ? (
                <img src={media.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {media.type === 'image' && <Image className="w-5 h-5 text-slate-400" />}
                  {media.type === 'video' && <PlayCircle className="w-5 h-5 text-slate-400" />}
                  {media.type === 'document' && <FileText className="w-5 h-5 text-slate-400" />}
                </div>
              )}
              {media.type === 'video' && media.thumbnailUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          ))}
          {mention.media.length > 4 && (
            <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700">
              +{mention.media.length - 4}
            </div>
          )}
        </div>
      )}

      {/* Classifications - shown when insights are on */}
      {showInsights && (
        <div className="mt-3 space-y-2.5">
          {/* SignalSense Matches - HIGHEST PRIORITY - configurable */}
          {selectedInsights?.signalSense !== false && mention.signalSenseMatches && mention.signalSenseMatches.length > 0 && (
            <div className="pb-2 border-b border-amber-200 dark:border-amber-800/50">
              <SignalSenseBadge matches={mention.signalSenseMatches} maxVisible={2} />
            </div>
          )}

          {/* AI Classifications - configurable */}
          {(selectedInsights?.entity !== false || selectedInsights?.intent !== false || selectedInsights?.emotion !== false) && (
            <div className="flex flex-wrap items-center gap-2">
              {selectedInsights?.entity !== false && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <Bot className="w-3 h-3" />
                  {mention.entityType}
                </span>
              )}
              {selectedInsights?.intent !== false && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300">
                  {mention.intent}
                </span>
              )}
              {selectedInsights?.emotion !== false && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  mention.emotionCluster === 'Negative'
                    ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                    : mention.emotionCluster === 'Positive'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {mention.emotion}
                </span>
              )}
            </div>
          )}

          {/* AI Upper Categories - part of category config */}
          {selectedInsights?.category !== false && mention.upperCategories && mention.upperCategories.length > 0 && (
            <div>
              <div className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">Customer's Intent</div>
              <div className="flex flex-wrap gap-1.5">
                {mention.upperCategories.map((category, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Categorizations with Tagging Info - configurable */}
          {selectedInsights?.category !== false && mention.categorizations && mention.categorizations.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Category Mapping</div>
              {mention.categorizations.map((cat, idx) => {
                const sentimentBg = cat.sentiment === 'Negative'
                  ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800'
                  : cat.sentiment === 'Positive'
                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800'
                    : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                const sentimentText = cat.sentiment === 'Negative'
                  ? 'text-rose-700 dark:text-rose-300'
                  : cat.sentiment === 'Positive'
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-slate-700 dark:text-slate-300'

                return (
                  <div key={idx} className={`rounded-md border px-3 py-2 ${sentimentBg}`}>
                    <div className={`text-sm ${sentimentText}`}>
                      {cat.category}
                      {cat.subcategory && ` → ${cat.subcategory}`}
                      {cat.subSubcategory && ` → ${cat.subSubcategory}`}
                    </div>
                    {/* Tagging Info Indicator */}
                    {cat.taggingInfo && (
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                        {cat.taggingInfo.type === 'auto' ? (
                          <>
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-200/50 dark:bg-slate-700/50">
                              <Bot className="w-2.5 h-2.5" />
                              Auto
                            </span>
                            {cat.taggingInfo.keyword && (
                              <span>Keyword: "{cat.taggingInfo.keyword}"</span>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-100/50 dark:bg-indigo-900/30">
                              Manual
                            </span>
                            {cat.taggingInfo.taggedBy && (
                              <span>by {cat.taggingInfo.taggedBy}</span>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Aspect Groups - Using new AspectGroupPill - configurable */}
          {selectedInsights?.aspectGroups !== false && mention.aspectGroups && mention.aspectGroups.length > 0 && (
            <div>
              <div className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">Aspect Groups</div>
              <div className="flex flex-wrap gap-1.5">
                {mention.aspectGroups.map((group, idx) => (
                  <AspectGroupPill key={idx} group={group} showIcon={true} />
                ))}
              </div>
            </div>
          )}

          {/* Ungrouped Aspects with sentiment coloring - configurable */}
          {selectedInsights?.aspects !== false && mention.ungroupedAspects && mention.ungroupedAspects.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {mention.ungroupedAspects.map((aspect, idx) => {
                const aspectName = getAspectName(aspect)
                const colorClass = getAspectSentimentColor(aspect)

                return (
                  <div key={idx} className="group relative">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${colorClass}`}>
                      {aspectName}
                    </span>
                    {/* Tooltip for detailed aspects */}
                    {isDetailedAspect(aspect) && (
                      <div className="pointer-events-none absolute left-0 top-full z-50 mt-1 w-48 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="rounded-md border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800 text-xs">
                          <div className="font-medium text-slate-900 dark:text-white mb-1">{aspect.name}</div>
                          <div className="text-slate-500 dark:text-slate-400 mb-1">
                            {aspect.entityType}: {aspect.entityName}
                          </div>
                          {aspect.opinion && (
                            <div className="text-slate-600 dark:text-slate-300 italic">"{aspect.opinion}"</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tags - configurable */}
      {selectedInsights?.mentionInfo?.tags !== false && mention.tags && mention.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {mention.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            >
              ⚠ {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
        {/* Platform & Sentiment - configurable */}
        <div className="flex items-center gap-2">
          <div className={`flex h-6 w-6 items-center justify-center rounded ${platformColor} text-[10px] font-bold text-white`}>
            {mention.author.platform.slice(0, 2).toUpperCase()}
          </div>
          {selectedInsights?.sentiment !== false && (
            <div className={`rounded-full px-2 py-0.5 text-xs font-medium ${sentiment.text} ${sentiment.bg}`}>
              {mention.sentiment} ({(mention.sentimentScore * 100).toFixed(0)}%)
            </div>
          )}
          {selectedInsights?.intent !== false && (
            <div className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
              {mention.intent}
            </div>
          )}
        </div>

        {/* Engagement Metrics - configurable */}
        {selectedInsights?.mentionInfo?.engagement !== false && (
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
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
      </div>

      {/* Quick Actions Bar (visible on hover) */}
      <div className="mt-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onReply?.(mention.id)
          }}
          className="flex-1 rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
        >
          Reply
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAssign?.(mention.id)
          }}
          className="rounded bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
        >
          <UserPlus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTag?.(mention.id)
          }}
          className="rounded bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
        >
          <Tag className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onMarkRead?.(mention.id, !mention.isRead)
          }}
          className="rounded bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
