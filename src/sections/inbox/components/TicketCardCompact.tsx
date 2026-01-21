import type { Ticket, Aspect, ExtractedEntity } from '@/../product/sections/inbox/types'
import { MessageSquare, Tag, MapPin, Globe, User, Eye, Image, Clock, Building2, Hash, Bot, Package, Users } from 'lucide-react'
import type { MessageInsights } from './TicketHeader'
import { BadgeWithTooltip } from './BadgeWithTooltip'
import { getBadgeConfig, getBadgeLabel } from './badgeConfig'
import { MakerCheckerInlineBadge, MakerCheckerActions } from './MakerCheckerBadge'
import { SignalSenseBadge } from '@/components/insights/SignalSenseBadge'
import { AspectGroupPill } from '@/components/insights/AspectGroupPill'
import { formatCategorization, getCategoryColor } from '../utils/categoryFormatters'

// Helper to check if an aspect is detailed
function isDetailedAspect(aspect: string | Aspect): aspect is Aspect {
  return typeof aspect === 'object' && 'name' in aspect && 'sentiment' in aspect
}

// Helper to get aspect name regardless of type
function getAspectName(aspect: string | Aspect): string {
  return isDetailedAspect(aspect) ? aspect.name : aspect
}

// Helper to get entity icon based on type
function getEntityIcon(entityType: string) {
  switch (entityType) {
    case 'LOCATION':
      return MapPin
    case 'BRAND':
      return Building2
    case 'PERSON':
      return User
    case 'PRODUCT':
      return Package
    case 'ORGANIZATION':
      return Users
    default:
      return Tag
  }
}

// Helper to get entity icon color based on type
function getEntityColor(entityType: string) {
  switch (entityType) {
    case 'LOCATION':
      return 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300'
    case 'BRAND':
      return 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
    case 'PERSON':
      return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
    case 'PRODUCT':
      return 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
    case 'ORGANIZATION':
      return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
  }
}

interface TicketCardCompactProps {
  ticket: Ticket
  isSelected?: boolean
  onClick?: () => void
  onSelect?: (selected: boolean) => void
  showInsights?: boolean
  selectedInsights?: MessageInsights['selectedInsights']
  onApprove?: (ticketId: string) => void
  onReject?: (ticketId: string) => void
}

export function TicketCardCompact({ ticket, isSelected, onClick, onSelect, showInsights = true, selectedInsights, onApprove, onReject }: TicketCardCompactProps) {
  const getSlaStatusColor = () => {
    switch (ticket.sla.firstResponse.status) {
      case 'breached': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950'
      case 'due-soon': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950'
      case 'within-sla': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950'
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900'
    }
  }

  const getPriorityColor = () => {
    switch (ticket.priority) {
      case 'high': return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
      case 'low': return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
    }
  }

  const getPlatformIcon = () => {
    const icons: Record<string, string> = {
      instagram: '📷',
      facebook: '👥',
      x: '🐦',
      linkedin: '💼',
      google: '⭐',
      youtube: '▶️'
    }
    return icons[ticket.channel.platform] || '💬'
  }

  const formatSlaTime = () => {
    const { status, remainingMinutes, breachedBy } = ticket.sla.firstResponse
    if (status === 'breached' && breachedBy) {
      const hours = Math.floor(breachedBy / 60)
      return hours > 0 ? `Breached ${hours}h ago` : `Breached ${breachedBy}m ago`
    }
    if (remainingMinutes) {
      const hours = Math.floor(remainingMinutes / 60)
      return hours > 0 ? `Due in ${hours}h ${remainingMinutes % 60}m` : `Due in ${remainingMinutes}m`
    }
    return 'Within SLA'
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

  const getLanguageLabel = (code?: string) => {
    if (!code) return null
    const languages: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      pt: 'Portuguese',
      ar: 'Arabic',
      zh: 'Chinese',
      ja: 'Japanese',
      ko: 'Korean',
    }
    return languages[code.toLowerCase()] || code.toUpperCase()
  }

  const isMakerChecker = ticket.makerCheckerStatus?.isInReview
  const makerCheckerBorderColor = isMakerChecker
    ? ticket.makerCheckerStatus?.status === 'pending'
      ? 'border-l-4 border-l-amber-400 dark:border-l-amber-500'
      : ticket.makerCheckerStatus?.status === 'approved'
        ? 'border-l-4 border-l-emerald-400 dark:border-l-emerald-500'
        : 'border-l-4 border-l-rose-400 dark:border-l-rose-500'
    : ''

  return (
    <div
      onClick={onClick}
      className={`
        relative flex items-start gap-3 px-4 py-2 border-b border-slate-200 dark:border-slate-800
        hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors
        ${isSelected ? 'bg-indigo-50 dark:bg-indigo-950' : isMakerChecker ? 'bg-amber-50/30 dark:bg-amber-950/20' : 'bg-white dark:bg-slate-950'}
        ${makerCheckerBorderColor}
      `}
    >
      {/* Selection checkbox + Avatar */}
      <div className="flex items-center gap-2 pt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation()
            onSelect?.(!isSelected)
          }}
          className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
        />

        {/* Author avatar - configurable */}
        {selectedInsights?.essentials?.avatar !== false && (
          <img
            src={ticket.author.avatarUrl}
            alt={ticket.author.name}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* First Row: Author info + Right badges */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          {/* Left: Author and ticket info */}
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
          {/* Reply needed indicator */}
          {ticket.replyStatus === 'not-replied' && (
            <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
          )}

          {/* Author name - configurable */}
          {selectedInsights?.essentials?.customerName !== false && (
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {ticket.author.name}
            </span>
          )}

          {ticket.author.isVerified && (
            <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}

          {/* Handle + Followers - configurable */}
          {selectedInsights?.essentials?.handleAndFollowers !== false && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              @{ticket.author.username}
              {ticket.author.followerCount > 0 && (
                <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
                  ({ticket.author.followerCount >= 1000000
                    ? `${(ticket.author.followerCount / 1000000).toFixed(1)}M`
                    : ticket.author.followerCount >= 1000
                      ? `${(ticket.author.followerCount / 1000).toFixed(0)}K`
                      : ticket.author.followerCount})
                </span>
              )}
            </span>
          )}

          {/* Platform + Interaction type - configurable */}
          {selectedInsights?.essentials?.platformAndType !== false && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {getPlatformIcon()} {ticket.interactionTypeLabel}
            </span>
          )}

          {/* Timestamp - configurable */}
          {selectedInsights?.essentials?.timestamp !== false && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {new Date(ticket.createdAt).toLocaleDateString()}
            </span>
          )}
          </div>

          {/* Right: Key badges on same row */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Brand Badge */}
            {selectedInsights?.ticketInfo?.brandName !== false && ticket.brandName && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                <Building2 className="w-3 h-3" />
                {ticket.brandName}
              </span>
            )}

            {/* Location Profile Badge */}
            {selectedInsights?.ticketInfo?.locationProfileName !== false && ticket.locationProfileName && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
                <MapPin className="w-3 h-3" />
                {ticket.locationProfileName}
              </span>
            )}

            {/* Message Count */}
            {selectedInsights?.essentials?.messageCount !== false && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">
                <MessageSquare className="w-3 h-3" />
                <span className="font-medium">{ticket.messageCount.total}</span>
              </div>
            )}

            {/* Priority badge */}
            {selectedInsights?.essentials?.priorityBadge !== false && (
              <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${getPriorityColor()}`}>
                {ticket.priority}
              </span>
            )}

            {/* SLA countdown */}
            {selectedInsights?.essentials?.slaStatus !== false && (
              <div className={`px-2 py-0.5 rounded text-xs font-medium ${getSlaStatusColor()}`}>
                {formatSlaTime()}
              </div>
            )}

            {/* Tags */}
            {selectedInsights?.ticketInfo?.ticketTags !== false && ticket.tags && ticket.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                {ticket.tags.slice(0, 2).map((tag, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {tag}
                  </span>
                ))}
                {ticket.tags.length > 2 && (
                  <span className="text-xs text-slate-500">+{ticket.tags.length - 2}</span>
                )}
              </div>
            )}

            {/* Unread count */}
            {selectedInsights?.essentials?.unreadCount !== false && ticket.unreadCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center bg-indigo-600 text-white text-xs font-bold rounded-full">
                {ticket.unreadCount}
              </span>
            )}

            {/* Media Preview */}
            {selectedInsights?.ticketInfo?.media !== false && ticket.mediaPreview && ticket.mediaPreview.length > 0 && (
              <div className="flex items-center gap-0.5">
                {ticket.mediaPreview.slice(0, 2).map((media, idx) => (
                  <div key={idx} className="relative w-6 h-6 rounded overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {media.thumbnailUrl ? (
                      <img src={media.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-3 h-3 text-slate-400" />
                      </div>
                    )}
                    {media.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="text-white text-[8px]">▶</span>
                      </div>
                    )}
                  </div>
                ))}
                {ticket.mediaPreview.length > 2 && (
                  <span className="text-xs text-slate-500">+{ticket.mediaPreview.length - 2}</span>
                )}
              </div>
            )}

            {/* GMB/Facebook Location */}
            {selectedInsights?.ticketInfo?.facebookLocationName !== false && ticket.facebookLocationName && !ticket.locationProfileName && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                <MapPin className="w-3 h-3" />
                {ticket.facebookLocationName}
              </span>
            )}

            {/* Assigned Avatar */}
            {selectedInsights?.ticketInfo?.assignTo !== false && ticket.assignedTo && (
              <img
                src={ticket.assignedTo.avatarUrl}
                alt={ticket.assignedTo.name}
                title={`Assigned to: ${ticket.assignedTo.name}`}
                className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900"
              />
            )}

            {/* Seen By */}
            {selectedInsights?.ticketInfo?.seenBy !== false && ticket.seenBy && ticket.seenBy.length > 0 && (
              <div className="flex items-center gap-0.5">
                <Eye className="w-3 h-3 text-slate-400" />
                <div className="flex -space-x-1">
                  {ticket.seenBy.slice(0, 2).map((seen, idx) => (
                    seen.user.avatarUrl ? (
                      <img
                        key={idx}
                        src={seen.user.avatarUrl}
                        alt={seen.user.name}
                        className="w-5 h-5 rounded-full ring-1 ring-white dark:ring-slate-900"
                      />
                    ) : (
                      <div
                        key={idx}
                        className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center ring-1 ring-white dark:ring-slate-900 text-[8px] font-medium"
                      >
                        {seen.user.name.charAt(0).toUpperCase()}
                      </div>
                    )
                  ))}
                  {ticket.seenBy.length > 2 && (
                    <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center ring-1 ring-white dark:ring-slate-900 text-[8px] font-medium">
                      +{ticket.seenBy.length - 2}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Maker-Checker Actions */}
            {isMakerChecker && ticket.makerCheckerStatus?.status === 'pending' && (
              <MakerCheckerActions
                onApprove={() => onApprove?.(ticket.id)}
                onReject={() => onReject?.(ticket.id)}
                compact
              />
            )}
          </div>
        </div>

        {/* Message snippet - configurable */}
        {selectedInsights?.essentials?.messageSnippet !== false && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
              {ticket.messageSnippet}
            </span>
          </div>
        )}

        {/* SignalSense Matches - HIGHEST PRIORITY (shown before other classifications) - configurable */}
        {showInsights && selectedInsights?.signalSense !== false && ticket.classification?.signalSenseMatches && ticket.classification.signalSenseMatches.length > 0 && (
          <div className="mb-1">
            <SignalSenseBadge matches={ticket.classification.signalSenseMatches} maxVisible={2} />
          </div>
        )}

        {/* Classification - shown when insights are on */}
        {showInsights && ticket.classification && (() => {
          const cls = ticket.classification
          const entityType = cls.entityType || 'N/A'
          const intent = cls.intent || 'N/A'
          const emotion = cls.emotion || 'N/A'
          const emotionCluster = cls.emotionCluster || 'Neutral'
          const sentiment = cls.sentiment || 'Neutral'
          const upperCategories = cls.upperCategories || []
          const categorizations = cls.categorizations || []
          const aspectGroups = cls.aspectGroups || []
          const ungroupedAspects = cls.ungroupedAspects || []

          const getSentimentColor = (sent: string) => {
            switch (sent) {
              case 'Negative':
                return 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
              case 'Positive':
                return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              default:
                return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }
          }

          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Sentiment - separate toggle */}
              {selectedInsights?.sentiment !== false && (() => {
                const config = getBadgeConfig('sentiment', sentiment)
                return config ? (
                  <BadgeWithTooltip
                    label={getBadgeLabel('sentiment')}
                    value={sentiment}
                    description={config.description}
                    icon={config.icon}
                    className={`px-2 py-0.5 rounded text-xs font-medium ${getSentimentColor(sentiment)}`}
                  />
                ) : (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSentimentColor(sentiment)}`}>
                    {sentiment}
                  </span>
                )
              })()}

              {/* Extracted Entities - show with type-based icons (exclude BRAND/LOCATION if shown in header) */}
              {selectedInsights?.entity !== false && cls.extractedEntities && cls.extractedEntities.length > 0 && (() => {
                // Filter out BRAND if brandName is shown, LOCATION if locationProfileName is shown
                const filteredEntities = cls.extractedEntities.filter(entity => {
                  if (entity.type === 'BRAND' && ticket.brandName) return false
                  if (entity.type === 'LOCATION' && ticket.locationProfileName) return false
                  return true
                })
                if (filteredEntities.length === 0) return null
                return (
                  <>
                    {filteredEntities.slice(0, 3).map((entity, idx) => {
                      const EntityIcon = getEntityIcon(entity.type)
                      const colorClass = getEntityColor(entity.type)
                      return (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}
                          title={`${entity.type}: ${entity.value}`}
                        >
                          <EntityIcon className="w-3 h-3" />
                          {entity.value}
                        </span>
                      )
                    })}
                    {filteredEntities.length > 3 && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        +{filteredEntities.length - 3}
                      </span>
                    )}
                  </>
                )
              })()}

              {/* Emotion - separate toggle */}
              {selectedInsights?.emotion !== false && (() => {
                const config = getBadgeConfig('emotion')
                const emotionColorClass = emotionCluster === 'Negative'
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  : emotionCluster === 'Positive'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                return config ? (
                  <BadgeWithTooltip
                    label={getBadgeLabel('emotion')}
                    value={emotion}
                    description={config.description}
                    icon={config.icon}
                    className={`px-2 py-0.5 rounded text-xs font-medium ${emotionColorClass}`}
                  />
                ) : (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${emotionColorClass}`}>
                    {emotion}
                  </span>
                )
              })()}

              {/* Intent - separate toggle */}
              {selectedInsights?.intent !== false && (() => {
                const config = getBadgeConfig('intent')
                return config ? (
                  <BadgeWithTooltip
                    label={getBadgeLabel('intent')}
                    value={intent}
                    description={config.description}
                    icon={config.icon}
                    className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  />
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {intent}
                  </span>
                )
              })()}

              {/* AI Upper Categories (Customer's Intent) */}
              {selectedInsights?.category !== false && upperCategories.length > 0 && (() => {
                const config = getBadgeConfig('category')
                return (
                  <>
                    {upperCategories.slice(0, 2).map((category, idx) =>
                      config ? (
                        <BadgeWithTooltip
                          key={idx}
                          label={getBadgeLabel('category')}
                          value={category}
                          description={config.description}
                          icon={config.icon}
                          className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                        />
                      ) : (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                        >
                          {category}
                        </span>
                      )
                    )}
                    {upperCategories.length > 2 && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        +{upperCategories.length - 2}
                      </span>
                    )}
                  </>
                )
              })()}

              {/* Categorizations with Sentiment - Show all categories */}
              {selectedInsights?.category !== false && categorizations.length > 0 && (() => {
                const config = getBadgeConfig('category')
                return (
                  <>
                    {categorizations.map((cat, idx) => {
                      const catValue = formatCategorization(cat)
                      return config ? (
                        <BadgeWithTooltip
                          key={idx}
                          label={getBadgeLabel('category')}
                          value={catValue}
                          description={`${config.description} with ${cat.sentiment} sentiment`}
                          icon={config.icon}
                          className={`px-2 py-0.5 rounded text-xs font-medium border ${getCategoryColor(cat.sentiment)}`}
                        />
                      ) : (
                        <span
                          key={idx}
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getCategoryColor(cat.sentiment)}`}
                          title={catValue}
                        >
                          {catValue}
                        </span>
                      )
                    })}
                  </>
                )
              })()}

              {/* Aspect Groups with Hover - Using AspectGroupPill */}
              {selectedInsights?.aspectGroups !== false && aspectGroups.length > 0 && (
                <>
                  {aspectGroups.slice(0, 2).map((group, groupIdx) => (
                    <AspectGroupPill key={groupIdx} group={group} showIcon={!!group.icon} />
                  ))}
                  {aspectGroups.length > 2 && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      +{aspectGroups.length - 2}
                    </span>
                  )}
                </>
              )}

              {/* Ungrouped Aspects */}
              {selectedInsights?.aspects !== false && ungroupedAspects.length > 0 && (() => {
                const config = getBadgeConfig('aspects')
                return (
                  <>
                    {ungroupedAspects.slice(0, 2).map((aspect, idx) => {
                      // Handle both string aspects and object aspects
                      const aspectName = typeof aspect === 'string' ? aspect : (aspect as { name: string }).name
                      return config ? (
                        <BadgeWithTooltip
                          key={idx}
                          label={getBadgeLabel('aspects')}
                          value={aspectName}
                          description={config.description}
                          icon={config.icon}
                          className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        />
                      ) : (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        >
                          {aspectName}
                        </span>
                      )
                    })}
                    {ungroupedAspects.length > 2 && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        +{ungroupedAspects.length - 2}
                      </span>
                    )}
                  </>
                )
              })()}
            </div>
          )
        })()}

        {/* Reason surfaced (if present) - configurable */}
        {selectedInsights?.signalSense !== false && ticket.signalSense && (() => {
          const config = getBadgeConfig('signalSense')
          return config ? (
            <BadgeWithTooltip
              label={getBadgeLabel('signalSense')}
              value={ticket.signalSense}
              description={config.description}
              icon={config.icon}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-medium"
            />
          ) : (
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              {ticket.signalSense}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
