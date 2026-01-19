import type { Ticket } from '@/../product/sections/inbox/types'
import { MessageSquare } from 'lucide-react'
import type { MessageInsights } from './TicketHeader'
import { BadgeWithTooltip } from './BadgeWithTooltip'
import { getBadgeConfig, getBadgeLabel } from './badgeConfig'

interface TicketCardCompactProps {
  ticket: Ticket
  isSelected?: boolean
  onClick?: () => void
  onSelect?: (selected: boolean) => void
  showInsights?: boolean
  selectedInsights?: MessageInsights['selectedInsights']
}

export function TicketCardCompact({ ticket, isSelected, onClick, onSelect, showInsights = true, selectedInsights }: TicketCardCompactProps) {
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

  return (
    <div
      onClick={onClick}
      className={`
        relative flex items-center gap-4 px-4 py-3 border-b border-slate-200 dark:border-slate-800
        hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors
        ${isSelected ? 'bg-indigo-50 dark:bg-indigo-950' : 'bg-white dark:bg-slate-950'}
      `}
    >
      {/* Selection checkbox */}
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
          className="w-10 h-10 rounded-full flex-shrink-0"
        />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
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

        {/* Message snippet - configurable */}
        {selectedInsights?.essentials?.messageSnippet !== false && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
              {ticket.messageSnippet}
            </span>
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

            {/* Entity - separate toggle */}
            {selectedInsights?.entity !== false && (() => {
              const config = getBadgeConfig('entity')
              return config ? (
                <BadgeWithTooltip
                  label={getBadgeLabel('entity')}
                  value={entityType}
                  description={config.description}
                  icon={config.icon}
                  className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                />
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {entityType}
                </span>
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

            {/* Categorizations with Sentiment */}
            {selectedInsights?.category !== false && categorizations.length > 0 && (() => {
              const config = getBadgeConfig('category')
              return (
                <>
                  {categorizations.slice(0, 1).map((cat, idx) => {
                    const parts = [cat.category, cat.subcategory, cat.subSubcategory].filter(Boolean)
                    const catValue = parts.join(' → ')
                    return config ? (
                      <BadgeWithTooltip
                        key={idx}
                        label={getBadgeLabel('category')}
                        value={catValue}
                        description={`${config.description} with ${cat.sentiment} sentiment`}
                        icon={config.icon}
                        className={`px-2 py-0.5 rounded text-xs font-medium ${getSentimentColor(cat.sentiment)}`}
                      />
                    ) : (
                      <span
                        key={idx}
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSentimentColor(cat.sentiment)}`}
                        title={catValue}
                      >
                        {catValue}
                      </span>
                    )
                  })}
                  {categorizations.length > 1 && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      +{categorizations.length - 1}
                    </span>
                  )}
                </>
              )
            })()}

            {/* Aspect Groups with Hover */}
            {selectedInsights?.aspectGroups !== false && aspectGroups.length > 0 && (() => {
              const config = getBadgeConfig('aspectGroups')
              return (
                <>
                  {aspectGroups.slice(0, 2).map((group, groupIdx) => {
                    const groupName = group.name
                    const aspectsList = group.aspects
                      ?.join(', ') || ''
                    const description = config
                      ? `${config.description}${aspectsList ? `: ${aspectsList}` : ''}`
                      : aspectsList

                    return config ? (
                      <BadgeWithTooltip
                        key={groupIdx}
                        label={getBadgeLabel('aspectGroups')}
                        value={groupName}
                        description={description}
                        icon={config.icon}
                        className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                      />
                    ) : (
                      <span
                        key={groupIdx}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                        title={aspectsList}
                      >
                        {groupName}
                      </span>
                    )
                  })}
                  {aspectGroups.length > 2 && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      +{aspectGroups.length - 2}
                    </span>
                  )}
                </>
              )
            })()}

            {/* Ungrouped Aspects */}
            {selectedInsights?.aspects !== false && ungroupedAspects.length > 0 && (() => {
              const config = getBadgeConfig('aspects')
              return (
                <>
                  {ungroupedAspects.slice(0, 2).map((aspect, idx) => {
                    return config ? (
                      <BadgeWithTooltip
                        key={idx}
                        label={getBadgeLabel('aspects')}
                        value={aspect}
                        description={config.description}
                        icon={config.icon}
                        className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      />
                    ) : (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      >
                        {aspect}
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
        {selectedInsights?.reasonSurfaced !== false && ticket.reasonSurfaced && (() => {
          const config = getBadgeConfig('reasonSurfaced')
          return config ? (
            <BadgeWithTooltip
              label={getBadgeLabel('reasonSurfaced')}
              value={ticket.reasonSurfaced}
              description={config.description}
              icon={config.icon}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-medium"
            />
          ) : (
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              {ticket.reasonSurfaced}
            </div>
          )
        })()}
      </div>

      {/* Right side: Badges and SLA */}
      <div className="flex items-center gap-2 flex-shrink-0">
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
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="font-medium">{ticket.messageCount.total}</span>
              </div>
            </BadgeWithTooltip>
          ) : (
            <div className="group relative">
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="font-medium">{ticket.messageCount.total}</span>
              </div>

              {/* Hover Tooltip */}
              <div className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-44 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Message Breakdown
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300">From Customer</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {ticket.messageCount.fromCustomer}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
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

        {/* Priority badge - configurable */}
        {selectedInsights?.essentials?.priorityBadge !== false && (() => {
          const config = getBadgeConfig('essentials.priorityBadge', ticket.priority)
          return config ? (
            <BadgeWithTooltip
              label={getBadgeLabel('essentials.priorityBadge')}
              value={ticket.priority.toUpperCase()}
              description={config.description}
              icon={config.icon}
              className={`px-2 py-1 rounded text-xs font-medium uppercase ${getPriorityColor()}`}
            />
          ) : (
            <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getPriorityColor()}`}>
              {ticket.priority}
            </span>
          )
        })()}

        {/* SLA countdown - configurable */}
        {selectedInsights?.essentials?.slaStatus !== false && (() => {
          const slaStatus = ticket.sla.firstResponse.status
          const config = getBadgeConfig('essentials.slaStatus', slaStatus)
          return config ? (
            <BadgeWithTooltip
              label={getBadgeLabel('essentials.slaStatus')}
              value={formatSlaTime()}
              description={config.description}
              icon={config.icon}
              className={`px-3 py-1 rounded text-xs font-medium ${getSlaStatusColor()}`}
            />
          ) : (
            <div className={`px-3 py-1 rounded text-xs font-medium ${getSlaStatusColor()}`}>
              {formatSlaTime()}
            </div>
          )
        })()}

        {/* Unread count - configurable */}
        {selectedInsights?.essentials?.unreadCount !== false && ticket.unreadCount > 0 && (() => {
          const config = getBadgeConfig('essentials.unreadCount')
          return config ? (
            <BadgeWithTooltip
              label={getBadgeLabel('essentials.unreadCount')}
              value={ticket.unreadCount.toString()}
              description={config.description}
              icon={config.icon}
              className="w-6 h-6 flex items-center justify-center bg-indigo-600 text-white text-xs font-bold rounded-full"
            />
          ) : (
            <span className="w-6 h-6 flex items-center justify-center bg-indigo-600 text-white text-xs font-bold rounded-full">
              {ticket.unreadCount}
            </span>
          )
        })()}
      </div>
    </div>
  )
}
