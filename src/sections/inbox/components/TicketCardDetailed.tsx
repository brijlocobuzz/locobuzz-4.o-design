import type { Ticket, Aspect } from '@/../product/sections/inbox/types'
import { MessageSquare, Tag, MapPin, Globe, User, Eye, Image, Clock, Building2, Hash, Bot } from 'lucide-react'
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

interface TicketCardDetailedProps {
  ticket: Ticket
  isSelected?: boolean
  onClick?: () => void
  onSelect?: (selected: boolean) => void
  showInsights?: boolean
  selectedInsights?: MessageInsights['selectedInsights']
  onApprove?: (ticketId: string) => void
  onReject?: (ticketId: string) => void
}

export function TicketCardDetailed({ ticket, isSelected, onClick, onSelect, showInsights = true, selectedInsights, onApprove, onReject }: TicketCardDetailedProps) {
  const getSlaStatusColor = () => {
    switch (ticket.sla.firstResponse.status) {
      case 'breached': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950'
      case 'due-soon': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950'
      case 'within-sla': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950'
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900'
    }
  }

  const getSentimentColor = (sentimentValue: string) => {
    switch (sentimentValue) {
      case 'negative': return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
      case 'neutral': return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
      case 'positive': return 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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
        p-6 rounded-lg border cursor-pointer transition-all
        ${isSelected
          ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950 shadow-md'
          : isMakerChecker
            ? 'border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20 hover:shadow-md'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
        }
        ${makerCheckerBorderColor}
      `}
    >
      {/* Ticket Info Header Row - NEW */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {/* Brand Name */}
        {selectedInsights?.ticketInfo?.brandName !== false && ticket.brandName && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
            <Building2 className="w-3 h-3" />
            {ticket.brandName}
          </span>
        )}

        {/* Ticket ID */}
        {selectedInsights?.ticketInfo?.ticketId !== false && (
          <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 dark:text-slate-400">
            <Hash className="w-3 h-3" />
            {ticket.ticketNumber}
          </span>
        )}

        {/* Enhanced Time */}
        {selectedInsights?.ticketInfo?.time !== false && (
          <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(ticket.createdAt)}
          </span>
        )}

        {/* Language */}
        {selectedInsights?.ticketInfo?.language !== false && ticket.language && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <Globe className="w-3 h-3" />
            {getLanguageLabel(ticket.language)}
          </span>
        )}

        {/* Maker-Checker Badge */}
        {isMakerChecker && ticket.makerCheckerStatus && (
          <MakerCheckerInlineBadge
            status={ticket.makerCheckerStatus.status}
            reviewType={ticket.makerCheckerStatus.reviewType}
          />
        )}
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation()
            onSelect?.(!isSelected)
          }}
          className="mt-1 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
        />

        {/* Avatar - configurable */}
        {selectedInsights?.essentials?.avatar !== false && (
          <img
            src={ticket.author.avatarUrl}
            alt={ticket.author.name}
            className="w-12 h-12 rounded-full flex-shrink-0"
          />
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {ticket.replyStatus === 'not-replied' && (
              <span className="w-2 h-2 bg-red-500 rounded-full" />
            )}
            {/* Customer name - configurable */}
            {selectedInsights?.essentials?.customerName !== false && (
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {ticket.author.name}
              </span>
            )}
            {ticket.author.isVerified && (
              <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {/* Handle & Followers - configurable */}
            {selectedInsights?.essentials?.handleAndFollowers !== false && (
              <>
                <span className="text-sm text-slate-500 dark:text-slate-400">@{ticket.author.username}</span>
                {ticket.author.followerCount > 0 && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    • {ticket.author.followerCount >= 1000000
                      ? `${(ticket.author.followerCount / 1000000).toFixed(1)}M`
                      : ticket.author.followerCount >= 1000
                        ? `${(ticket.author.followerCount / 1000).toFixed(1)}K`
                        : ticket.author.followerCount} followers
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            {/* Platform & Type - configurable */}
            {selectedInsights?.essentials?.platformAndType !== false && (
              <>
                <span>{getPlatformIcon()} {ticket.interactionTypeLabel}</span>
                <span>•</span>
              </>
            )}
            <span>{ticket.ticketNumber}</span>
            {/* Timestamp - configurable */}
            {selectedInsights?.essentials?.timestamp !== false && (
              <>
                <span>•</span>
                <span>{new Date(ticket.createdAt).toLocaleString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Right side: Message count + SLA */}
        <div className="flex flex-col items-end gap-2">
          {/* Message Count with Hover - configurable */}
          {selectedInsights?.essentials?.messageCount !== false && (() => {
            const config = getBadgeConfig('essentials.messageCount')
            const detailedDescription = `Total: ${ticket.messageCount.total} messages (${ticket.messageCount.fromCustomer} from customer, ${ticket.messageCount.fromBrand} from brand)`

            return config ? (
              <BadgeWithTooltip
                label={getBadgeLabel('essentials.messageCount')}
                value={ticket.messageCount.total.toString()}
                description={detailedDescription}
                icon={config.icon}
                tooltipPosition="bottom"
              >
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm cursor-default">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium">{ticket.messageCount.total}</span>
                </div>
              </BadgeWithTooltip>
            ) : (
              <div className="group relative">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm cursor-default">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium">{ticket.messageCount.total}</span>
                </div>

                {/* Hover Tooltip */}
                <div className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-48 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                      Message Breakdown
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">From Customer</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {ticket.messageCount.fromCustomer}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">From Brand</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {ticket.messageCount.fromBrand}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* SLA Timer - configurable */}
          {selectedInsights?.essentials?.slaStatus !== false && (() => {
            const slaStatus = ticket.sla.firstResponse.status
            const slaText = ticket.sla.firstResponse.remainingMinutes
              ? `${ticket.sla.firstResponse.remainingMinutes}m remaining`
              : 'Breached'
            const config = getBadgeConfig('essentials.slaStatus', slaStatus)
            return config ? (
              <BadgeWithTooltip
                label={getBadgeLabel('essentials.slaStatus')}
                value={slaText}
                description={config.description}
                icon={config.icon}
                tooltipPosition="bottom"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${getSlaStatusColor()}`}
              />
            ) : (
              <div className={`px-3 py-2 rounded-lg text-sm font-medium ${getSlaStatusColor()}`}>
                {slaText}
              </div>
            )
          })()}
        </div>
      </div>

      {/* Message Content - configurable */}
      {selectedInsights?.essentials?.messageSnippet !== false && (
        <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
          {ticket.messageSnippet}
        </p>
      )}

      {/* SignalSense Matches - HIGHEST PRIORITY - configurable */}
      {showInsights && selectedInsights?.signalSense !== false && ticket.classification?.signalSenseMatches && ticket.classification.signalSenseMatches.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <SignalSenseBadge matches={ticket.classification.signalSenseMatches} maxVisible={3} />
        </div>
      )}

      {/* Classifications - shown when insights are on */}
      {showInsights && ticket.classification && (() => {
        // Safe access with fallbacks
        const cls = ticket.classification
        const entityType = cls.entityType || 'N/A'
        const intent = cls.intent || 'N/A'
        const emotion = cls.emotion || 'N/A'
        const emotionCluster = cls.emotionCluster || 'Neutral'
        const sentiment = cls.sentiment || 'Neutral'

        return (
          <div className="mb-4 space-y-2">
            {/* AI Classifications - Independent Toggles */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Sentiment - separate toggle */}
              {selectedInsights?.sentiment !== false && (
                <div>
                  <span className="font-medium text-slate-600 dark:text-slate-400">Sentiment: </span>
                  <span className={
                    sentiment === 'Negative'
                      ? 'text-rose-600 dark:text-rose-400 font-medium'
                      : sentiment === 'Positive'
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : 'text-slate-600 dark:text-slate-400'
                  }>
                    {sentiment}
                  </span>
                </div>
              )}

              {/* Entity - separate toggle */}
              {selectedInsights?.entity !== false && (
                <div>
                  <span className="font-medium text-slate-600 dark:text-slate-400">Entity: </span>
                  <span className="text-slate-800 dark:text-slate-200">{entityType}</span>
                </div>
              )}

              {/* Intent - separate toggle */}
              {selectedInsights?.intent !== false && (
                <div>
                  <span className="font-medium text-slate-600 dark:text-slate-400">Intent: </span>
                  <span className="text-slate-800 dark:text-slate-200">{intent}</span>
                </div>
              )}

              {/* Emotion - separate toggle */}
              {selectedInsights?.emotion !== false && (
                <div>
                  <span className="font-medium text-slate-600 dark:text-slate-400">Emotion: </span>
                  <span className={
                    emotionCluster === 'Negative'
                      ? 'text-rose-600 dark:text-rose-400'
                      : emotionCluster === 'Positive'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-600 dark:text-slate-400'
                  }>
                    {emotion}
                  </span>
                </div>
              )}
            </div>

            {/* AI Upper Categories (Customer's Intent) */}
            {selectedInsights?.category !== false && ticket.classification.upperCategories && ticket.classification.upperCategories.length > 0 && (() => {
              const config = getBadgeConfig('category')
              return (
                <div>
                  <div className="mb-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">Customer's Intent (AI Upper Categories)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ticket.classification.upperCategories.map((category, idx) =>
                      config ? (
                        <BadgeWithTooltip
                          key={idx}
                          label={getBadgeLabel('category')}
                          value={category}
                          description={config.description}
                          icon={config.icon}
                          className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        />
                      ) : (
                        <span
                          key={idx}
                          className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          {category}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )
            })()}

            {/* Categorizations */}
            {selectedInsights?.category !== false && ticket.classification.categorizations && ticket.classification.categorizations.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {ticket.classification.categorizations.length > 1 ? 'Categories' : 'Category'}
                </div>
                {ticket.classification.categorizations.map((cat, idx) => (
                  <div key={idx} className={`rounded-md border px-3 py-2 ${getCategoryColor(cat.sentiment)}`}>
                    <div className="text-sm font-medium">
                      {formatCategorization(cat)}
                    </div>
                    {cat.taggingInfo && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {cat.taggingInfo.type === 'auto' ? (
                          <>Auto-tagged: {cat.taggingInfo.keyword}</>
                        ) : (
                          <>Tagged by: {cat.taggingInfo.taggedBy}</>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Aspect Groups - Using AspectGroupPill */}
            {selectedInsights?.aspectGroups !== false && ticket.classification.aspectGroups && ticket.classification.aspectGroups.length > 0 && (
              <div>
                <div className="mb-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">Aspect Groups</div>
                <div className="flex flex-wrap gap-1.5">
                  {ticket.classification.aspectGroups.map((group, idx) => (
                    <AspectGroupPill key={idx} group={group} showIcon={!!group.icon} />
                  ))}
                </div>
              </div>
            )}

            {/* Individual Aspects (ungrouped) */}
            {selectedInsights?.aspects !== false && ticket.classification.ungroupedAspects && ticket.classification.ungroupedAspects.length > 0 && (() => {
              const config = getBadgeConfig('aspects')
              return (
                <div>
                  <div className="mb-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">Other Aspects</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ticket.classification.ungroupedAspects.map((aspect, idx) => {
                      // Handle both string aspects and object aspects
                      const aspectName = typeof aspect === 'string' ? aspect : (aspect as { name: string }).name
                      return config ? (
                        <BadgeWithTooltip
                          key={`ungrouped-${idx}`}
                          label={getBadgeLabel('aspects')}
                          value={aspectName}
                          description={config.description}
                          icon={config.icon}
                          className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        />
                      ) : (
                        <span
                          key={`ungrouped-${idx}`}
                          className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        >
                          {aspectName}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </div>
        )
      })()}

      {/* Enrichment Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(() => {
          const sentimentConfig = getBadgeConfig('sentiment', ticket.sentiment)
          return sentimentConfig ? (
            <BadgeWithTooltip
              label={getBadgeLabel('sentiment')}
              value={ticket.sentiment}
              description={sentimentConfig.description}
              icon={sentimentConfig.icon}
              className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(ticket.sentiment)}`}
            />
          ) : (
            <span className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(ticket.sentiment)}`}>
              {ticket.sentiment}
            </span>
          )
        })()}
        {(() => {
          const intentConfig = getBadgeConfig('intent')
          return intentConfig ? (
            <BadgeWithTooltip
              label={getBadgeLabel('intent')}
              value={ticket.intent}
              description={intentConfig.description}
              icon={intentConfig.icon}
              className="px-2 py-1 rounded text-xs font-medium bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300"
            />
          ) : (
            <span className="px-2 py-1 rounded text-xs font-medium bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
              {ticket.intent}
            </span>
          )
        })()}
        {ticket.aspects?.map(aspect => {
          const aspectConfig = getBadgeConfig('aspects')
          return aspectConfig ? (
            <BadgeWithTooltip
              key={aspect}
              label={getBadgeLabel('aspects')}
              value={aspect}
              description={aspectConfig.description}
              icon={aspectConfig.icon}
              className="px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            />
          ) : (
            <span key={aspect} className="px-2 py-1 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {aspect}
            </span>
          )
        })}
      </div>

      {/* Signals */}
      {ticket.signals?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {ticket.signals.map(signal => (
            <span key={signal} className="px-2 py-1 rounded text-xs bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
              ⚠️ {signal}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          {/* Assigned To - with avatar */}
          {selectedInsights?.ticketInfo?.assignTo !== false && (
            ticket.assignedTo ? (
              <div className="flex items-center gap-2">
                {ticket.assignedTo.avatarUrl ? (
                  <img
                    src={ticket.assignedTo.avatarUrl}
                    alt={ticket.assignedTo.name}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <User className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  </div>
                )}
                <span>Assigned to {ticket.assignedTo.name}</span>
              </div>
            ) : (
              <span className="text-yellow-600 dark:text-yellow-400">Unassigned</span>
            )
          )}
          {ticket.team && <span>• {ticket.team.name}</span>}

          {/* Location Profile Name */}
          {selectedInsights?.ticketInfo?.locationProfileName !== false && ticket.locationProfileName && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
              <MapPin className="w-3 h-3" />
              {ticket.locationProfileName}
            </span>
          )}

          {/* GMB/Facebook Location */}
          {selectedInsights?.ticketInfo?.facebookLocationName !== false && ticket.facebookLocationName && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              <MapPin className="w-3 h-3" />
              {ticket.facebookLocationName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Media Preview */}
          {selectedInsights?.ticketInfo?.media !== false && ticket.mediaPreview && ticket.mediaPreview.length > 0 && (
            <div className="flex items-center gap-1">
              {ticket.mediaPreview.slice(0, 3).map((media, idx) => (
                <div key={idx} className="relative w-8 h-8 rounded overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {media.thumbnailUrl ? (
                    <img src={media.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </div>
              ))}
              {ticket.mediaPreview.length > 3 && (
                <span className="text-xs text-slate-500 dark:text-slate-400">+{ticket.mediaPreview.length - 3}</span>
              )}
            </div>
          )}

          {/* Ticket Tags */}
          {selectedInsights?.ticketInfo?.ticketTags !== false && ticket.tags?.length > 0 && (
            <div className="flex gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              {ticket.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {tag}
                </span>
              ))}
              {ticket.tags.length > 3 && <span className="text-xs text-slate-500">+{ticket.tags.length - 3}</span>}
            </div>
          )}

          {/* Seen By */}
          {selectedInsights?.ticketInfo?.seenBy !== false && ticket.seenBy && ticket.seenBy.length > 0 && (
            <div className="flex items-center gap-1 group relative">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex -space-x-1.5">
                {ticket.seenBy.slice(0, 3).map((seen, idx) => (
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
                {ticket.seenBy.length > 3 && (
                  <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center ring-1 ring-white dark:ring-slate-900 text-[8px] font-medium text-slate-600 dark:text-slate-300">
                    +{ticket.seenBy.length - 3}
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

      {/* Reason surfaced - configurable */}
      {selectedInsights?.signalSense !== false && ticket.signalSense && (
        <div className="mt-3 px-3 py-2 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded text-sm text-indigo-700 dark:text-indigo-300 font-medium">
          🎯 {ticket.signalSense}
        </div>
      )}
    </div>
  )
}
