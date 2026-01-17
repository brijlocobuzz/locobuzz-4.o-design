import type { Ticket } from '@/../product/sections/inbox/types'
import { TrendingUp, TrendingDown, MessageSquare } from 'lucide-react'
import type { MessageInsights } from './TicketHeader'
import { BadgeWithTooltip } from './BadgeWithTooltip'
import { getBadgeConfig, getBadgeLabel } from './badgeConfig'

interface TicketCardDetailedProps {
  ticket: Ticket
  isSelected?: boolean
  onClick?: () => void
  onSelect?: (selected: boolean) => void
  showInsights?: boolean
  selectedInsights?: MessageInsights['selectedInsights']
}

export function TicketCardDetailed({ ticket, isSelected, onClick, onSelect, showInsights = true, selectedInsights }: TicketCardDetailedProps) {
  const getSlaStatusColor = () => {
    switch (ticket.sla.firstResponse.status) {
      case 'breached': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950'
      case 'due-soon': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950'
      case 'within-sla': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950'
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900'
    }
  }

  const getSentimentColor = () => {
    switch (ticket.sentiment) {
      case 'negative': return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
      case 'neutral': return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
      case 'positive': return 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
    }
  }

  const getClassificationSentimentColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600 dark:text-green-400'
    if (score > 0.2) return 'text-lime-600 dark:text-lime-400'
    if (score >= -0.2) return 'text-slate-600 dark:text-slate-400'
    if (score > -0.7) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
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

  return (
    <div
      onClick={onClick}
      className={`
        p-6 rounded-lg border cursor-pointer transition-all
        ${isSelected
          ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950 shadow-md'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
        }
      `}
    >
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
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Category</div>
              {ticket.classification.categorizations.map((cat, idx) => {
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
                  </div>
                )
              })}
            </div>
          )}

          {/* Aspect Groups */}
          {selectedInsights?.aspectGroups !== false && ticket.classification.aspectGroups && ticket.classification.aspectGroups.length > 0 && (() => {
            const config = getBadgeConfig('aspectGroups')
            return (
              <div>
                <div className="mb-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">Aspect Groups</div>
                <div className="flex flex-wrap gap-1.5">
                  {ticket.classification.aspectGroups.map((group, idx) => {
                    const groupName = group.name || group.groupName
                    const aspectsList = group.aspects
                      ?.map((a: any) => typeof a === 'string' ? a : a.name)
                      .join(', ') || ''
                    const description = config
                      ? `${config.description}${aspectsList ? `: ${aspectsList}` : ''}`
                      : aspectsList

                    return config ? (
                      <BadgeWithTooltip
                        key={idx}
                        label={getBadgeLabel('aspectGroups')}
                        value={groupName}
                        description={description}
                        icon={config.icon}
                        className="cursor-help rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                      />
                    ) : (
                      <span
                        key={idx}
                        className="cursor-help rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                        title={aspectsList}
                      >
                        {groupName}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* Individual Aspects (ungrouped) */}
          {selectedInsights?.aspects !== false && ticket.classification.ungroupedAspects && ticket.classification.ungroupedAspects.length > 0 && (() => {
            const config = getBadgeConfig('aspects')
            return (
              <div>
                <div className="mb-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">Other Aspects</div>
                <div className="flex flex-wrap gap-1.5">
                  {ticket.classification.ungroupedAspects.map((aspect, idx) => {
                    // Handle both string aspects and object aspects
                    const aspectName = typeof aspect === 'string' ? aspect : aspect.name
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
              className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor()}`}
            />
          ) : (
            <span className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor()}`}>
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
          {ticket.assignedTo ? (
            <span>Assigned to {ticket.assignedTo.name}</span>
          ) : (
            <span className="text-yellow-600 dark:text-yellow-400">Unassigned</span>
          )}
          {ticket.team && <span>• {ticket.team.name}</span>}
        </div>

        {ticket.tags?.length > 0 && (
          <div className="flex gap-1">
            {ticket.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Reason surfaced - configurable */}
      {selectedInsights?.reasonSurfaced !== false && ticket.reasonSurfaced && (
        <div className="mt-3 px-3 py-2 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded text-sm text-indigo-700 dark:text-indigo-300 font-medium">
          🎯 {ticket.reasonSurfaced}
        </div>
      )}
    </div>
  )
}
