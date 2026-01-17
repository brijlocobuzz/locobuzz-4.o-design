import type { Insight } from '@/../product/sections/insights/types'
import { Sparkline } from './Sparkline'
import { SentimentBar } from './SentimentBar'

interface InsightCardProps {
  insight: Insight
  onClick: () => void
  onToggleBookmark: (isBookmarked: boolean) => void
  onShare: () => void
  onCreateAlert: () => void
}

export function InsightCard({
  insight,
  onClick,
  onToggleBookmark,
  onShare,
  onCreateAlert
}: InsightCardProps) {
  const getTypeConfig = () => {
    switch (insight.type) {
      case 'trending_topic':
        return {
          icon: '📈',
          label: 'Trending Topic',
          color: 'from-red-500 to-orange-500',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          borderColor: 'border-red-200 dark:border-red-800/50'
        }
      case 'emerging_theme':
        return {
          icon: '✨',
          label: 'Emerging Theme',
          color: 'from-purple-500 to-pink-500',
          bgColor: 'bg-purple-50 dark:bg-purple-950/20',
          borderColor: 'border-purple-200 dark:border-purple-800/50'
        }
      case 'audience_question':
        return {
          icon: '💬',
          label: 'Audience Question',
          color: 'from-sky-500 to-cyan-500',
          bgColor: 'bg-sky-50 dark:bg-sky-950/20',
          borderColor: 'border-sky-200 dark:border-sky-800/50'
        }
      case 'ai_summary':
        return {
          icon: '🤖',
          label: 'AI Summary',
          color: 'from-indigo-500 to-purple-500',
          bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
          borderColor: 'border-indigo-200 dark:border-indigo-800/50'
        }
    }
  }

  const typeConfig = getTypeConfig()

  const getTrendColor = () => {
    if (insight.trend.direction === 'up') {
      return 'text-green-600 dark:text-green-400'
    } else if (insight.trend.direction === 'down') {
      return 'text-red-600 dark:text-red-400'
    }
    return 'text-slate-600 dark:text-slate-400'
  }

  const getTrendIcon = () => {
    if (insight.trend.direction === 'up') {
      return '↗'
    } else if (insight.trend.direction === 'down') {
      return '↘'
    }
    return '→'
  }

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white dark:bg-slate-900 rounded-xl border ${typeConfig.borderColor} p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer`}
    >
      {/* Type Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-3 py-1 ${typeConfig.bgColor} rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5`}>
          <span>{typeConfig.icon}</span>
          {typeConfig.label}
        </span>

        {/* Bookmark Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleBookmark(!insight.isBookmarked)
          }}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {insight.isBookmarked ? (
            <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 24 24">
              <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          )}
        </button>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {insight.title}
      </h3>

      {/* Summary */}
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
        {insight.summary}
      </p>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Mention Count + Trend */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Mentions</div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {insight.mentionCount.toLocaleString()}
              </span>
              <span className={`text-sm font-semibold ${getTrendColor()}`}>
                {getTrendIcon()} {Math.abs(insight.trend.percentage)}%
              </span>
            </div>
          </div>
        </div>

        {/* Top Channels */}
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">Top Channels</div>
          <div className="flex items-center gap-1">
            {insight.topChannels.slice(0, 3).map((channel, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 rounded"
              >
                {channel}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sentiment Bar */}
      <div className="mb-4">
        <div className="text-xs text-slate-500 dark:text-slate-500 mb-2">Sentiment</div>
        <SentimentBar sentiment={insight.sentiment} />
      </div>

      {/* Sparkline */}
      <div className="mb-4">
        <div className="text-xs text-slate-500 dark:text-slate-500 mb-2">Trend</div>
        <Sparkline data={insight.sparklineData} color={typeConfig.color} />
      </div>

      {/* Keywords */}
      <div className="flex flex-wrap gap-1.5">
        {insight.keywords.slice(0, 4).map((keyword, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 rounded"
          >
            #{keyword}
          </span>
        ))}
        {insight.keywords.length > 4 && (
          <span className="px-2 py-0.5 text-xs text-slate-500 dark:text-slate-500">
            +{insight.keywords.length - 4} more
          </span>
        )}
      </div>

      {/* Hover Actions */}
      <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onShare()
          }}
          className="p-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-lg"
          title="Share insight"
        >
          <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onCreateAlert()
          }}
          className="p-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-lg"
          title="Create alert"
        >
          <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>
    </div>
  )
}
