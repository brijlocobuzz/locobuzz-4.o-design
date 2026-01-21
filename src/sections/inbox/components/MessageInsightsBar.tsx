import { Smile, Meh, Frown, Info, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { MessageInsights } from './TicketHeader'

interface MessageInsightsBarProps {
  message: any
  messageInsights?: MessageInsights
  className?: string
}

export function MessageInsightsBar({ message, messageInsights, className = '' }: MessageInsightsBarProps) {
  const [showAllPills, setShowAllPills] = useState(false)
  const [showAspectsOverlay, setShowAspectsOverlay] = useState(false)

  // Don't render if insights are off or message has no insights
  if (!messageInsights?.showInsights || !message.insights) {
    return null
  }

  // Helper to get sentiment display with BACKGROUND COLOR
  const getSentimentDisplay = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return {
          icon: Smile,
          bg: 'bg-green-500 dark:bg-green-600',
          text: 'text-white',
          label: 'Positive',
        }
      case 'negative':
        return {
          icon: Frown,
          bg: 'bg-red-500 dark:bg-red-600',
          text: 'text-white',
          label: 'Negative',
        }
      case 'neutral':
      default:
        return {
          icon: Meh,
          bg: 'bg-amber-400 dark:bg-amber-500',
          text: 'text-white',
          label: 'Neutral',
        }
    }
  }

  // Build array of all pills to show
  const pills: Array<{ id: string; content: ReactNode; bgClass?: string }> = []

  // Sentiment pill
  if (messageInsights.selectedInsights.sentiment && message.insights.sentiment) {
    const sentimentDisplay = getSentimentDisplay(message.insights.sentiment)
    const SentimentIcon = sentimentDisplay.icon
    pills.push({
      id: 'sentiment',
      content: (
        <>
          <SentimentIcon className="h-3 w-3" />
          <span>{sentimentDisplay.label}</span>
        </>
      ),
      bgClass: `${sentimentDisplay.bg} ${sentimentDisplay.text}`,
    })
  }

  // Category pill
  if (messageInsights.selectedInsights.category && message.insights.category) {
    pills.push({
      id: 'category',
      content: (
        <>
          <Info className="h-3 w-3" />
          <span>{message.insights.category}</span>
        </>
      ),
    })
  }

  // Aspect Groups pill - PRIORITY (shown first)
  if (
    messageInsights.selectedInsights.aspectGroups &&
    message.insights.aspectGroups &&
    message.insights.aspectGroups.length > 0
  ) {
    pills.push({
      id: 'aspectGroups',
      content: (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowAspectsOverlay(true)
          }}
          className="flex items-center gap-1 text-purple-700 dark:text-purple-300"
        >
          <span>
            {message.insights.aspectGroups.length} group{message.insights.aspectGroups.length > 1 ? 's' : ''}
          </span>
        </button>
      ),
      bgClass: 'bg-purple-100 dark:bg-purple-950 hover:bg-purple-200 dark:hover:bg-purple-900',
    })
  }

  // Ungrouped Aspects pill - shown after aspect groups
  if (
    messageInsights.selectedInsights.aspects &&
    message.insights.aspects &&
    message.insights.aspects.length > 0
  ) {
    // Count ungrouped aspects (aspects not in any group)
    const groupedAspectNames = message.insights.aspectGroups?.flatMap((g: any) =>
      g.aspects?.map((a: any) => a.aspect || a.name || a)
    ) || []
    const ungroupedCount = message.insights.aspects.filter(
      (aspect: any) => {
        const aspectName = typeof aspect === 'string' ? aspect : aspect.aspect || aspect.name
        return !groupedAspectNames.includes(aspectName)
      }
    ).length

    if (ungroupedCount > 0) {
      pills.push({
        id: 'aspects',
        content: (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowAspectsOverlay(true)
            }}
            className="flex items-center gap-1 text-blue-700 dark:text-blue-300"
          >
            <span>
              {ungroupedCount} ungrouped aspect{ungroupedCount > 1 ? 's' : ''}
            </span>
          </button>
        ),
        bgClass: 'bg-blue-100 dark:bg-blue-950 hover:bg-blue-200 dark:hover:bg-blue-900',
      })
    }
  }

  // If no pills to show, don't render
  if (pills.length === 0) return null

  // Show max 2 pills by default, all on hover
  const visiblePills = showAllPills ? pills : pills.slice(0, 2)
  const remainingCount = pills.length - 2

  return (
    <>
      <div
        className={`flex items-center gap-1.5 overflow-hidden ${className}`}
        onMouseEnter={() => setShowAllPills(true)}
        onMouseLeave={() => setShowAllPills(false)}
      >
        {visiblePills.map((pill) => (
          <div
            key={pill.id}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-all ${pill.bgClass || 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
          >
            {pill.content}
          </div>
        ))}

        {!showAllPills && remainingCount > 0 && (
          <div className="flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-700 dark:text-slate-400">
            +{remainingCount}
          </div>
        )}
      </div>

      {/* Aspects Overlay */}
      {showAspectsOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Message Aspects</h3>
              <button
                onClick={() => setShowAspectsOverlay(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Aspect Groups */}
              {message.insights.aspectGroups && message.insights.aspectGroups.length > 0 && (
                <div>
                  <h4 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Aspect Groups ({message.insights.aspectGroups.length})
                  </h4>
                  <div className="space-y-3">
                    {message.insights.aspectGroups.map((group: any, idx: number) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/30"
                      >
                        <div className="mb-2 font-medium text-purple-900 dark:text-purple-100">
                          {typeof group === 'string' ? group : group.name || group.group}
                        </div>
                        {group.aspects && group.aspects.length > 0 && (
                          <div className="space-y-2">
                            {group.aspects.map((aspect: any, aIdx: number) => (
                              <div
                                key={aIdx}
                                className="flex items-start gap-3 rounded bg-white/50 p-2 text-sm dark:bg-slate-900/50"
                              >
                                <div className="flex-1">
                                  <div className="font-medium text-slate-900 dark:text-white">
                                    {typeof aspect === 'string' ? aspect : aspect.aspect || aspect.name}
                                  </div>
                                  {aspect.entity && (
                                    <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                                      Entity: {aspect.entity}
                                    </div>
                                  )}
                                </div>
                                {aspect.opinion && (
                                  <div
                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${aspect.opinion === 'positive'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                        : aspect.opinion === 'negative'
                                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                      }`}
                                  >
                                    {aspect.opinion}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ungrouped Aspects */}
              {message.insights.aspects && message.insights.aspects.length > 0 && (
                <div>
                  <h4 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Ungrouped Aspects
                  </h4>
                  <div className="space-y-2">
                    {message.insights.aspects
                      .filter((aspect: any) => {
                        const groupedAspectNames = message.insights.aspectGroups?.flatMap((g: any) =>
                          g.aspects?.map((a: any) => a.aspect || a.name || a)
                        ) || []
                        const aspectName = typeof aspect === 'string' ? aspect : aspect.aspect || aspect.name
                        return !groupedAspectNames.includes(aspectName)
                      })
                      .map((aspect: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {typeof aspect === 'string' ? aspect : aspect.aspect || aspect.name}
                            </div>
                            {aspect.entity && (
                              <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                                Entity: {aspect.entity}
                              </div>
                            )}
                          </div>
                          {aspect.opinion && (
                            <div
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${aspect.opinion === 'positive'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                  : aspect.opinion === 'negative'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                            >
                              {aspect.opinion}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
