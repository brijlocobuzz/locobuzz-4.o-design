import type { Insight, Mention } from '@/../product/sections/insights/types'
import { SentimentBar } from './SentimentBar'
import { Sparkline } from './Sparkline'

interface InsightDetailPanelProps {
  insight: Insight
  mentions: Mention[]
  onClose: () => void
  onToggleBookmark: (isBookmarked: boolean) => void
  onShare: () => void
  onCreateAlert: () => void
  onViewMentions: () => void
  onViewMentionDetail?: (mentionId: string) => void
}

export function InsightDetailPanel({
  insight,
  mentions,
  onClose,
  onToggleBookmark,
  onShare,
  onCreateAlert,
  onViewMentions,
  onViewMentionDetail
}: InsightDetailPanelProps) {
  const getTypeConfig = () => {
    switch (insight.type) {
      case 'trending_topic':
        return {
          icon: '📈',
          label: 'Trending Topic',
          color: 'from-red-500 to-orange-500'
        }
      case 'emerging_theme':
        return {
          icon: '✨',
          label: 'Emerging Theme',
          color: 'from-purple-500 to-pink-500'
        }
      case 'audience_question':
        return {
          icon: '💬',
          label: 'Audience Question',
          color: 'from-sky-500 to-cyan-500'
        }
      case 'ai_summary':
        return {
          icon: '🤖',
          label: 'AI Summary',
          color: 'from-indigo-500 to-purple-500'
        }
    }
  }

  const typeConfig = getTypeConfig()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'positive') return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30'
    if (sentiment === 'negative') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30'
    return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800'
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[600px] bg-white dark:bg-slate-900 z-50 shadow-2xl overflow-y-auto animate-slideInRight">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 bg-gradient-to-r ${typeConfig.color} text-white rounded-full text-xs font-semibold flex items-center gap-1.5`}>
                  <span>{typeConfig.icon}</span>
                  {typeConfig.label}
                </span>
                {insight.isBookmarked && (
                  <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 24 24">
                    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                  </svg>
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {insight.title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                Detected {formatDate(insight.detectedAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onToggleBookmark(!insight.isBookmarked)}
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              {insight.isBookmarked ? (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                  </svg>
                  Bookmarked
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Bookmark
                </>
              )}
            </button>
            <button
              onClick={onShare}
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
            <button
              onClick={onCreateAlert}
              className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Alert
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Summary */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Summary</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {insight.summary}
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="text-sm text-slate-500 dark:text-slate-500 mb-1">Total Mentions</div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {insight.mentionCount.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="text-sm text-slate-500 dark:text-slate-500 mb-1">Trend</div>
              <div className={`text-3xl font-bold ${
                insight.trend.direction === 'up' ? 'text-green-600 dark:text-green-400' :
                insight.trend.direction === 'down' ? 'text-red-600 dark:text-red-400' :
                'text-slate-600 dark:text-slate-400'
              }`}>
                {insight.trend.direction === 'up' ? '↗' : insight.trend.direction === 'down' ? '↘' : '→'} {Math.abs(insight.trend.percentage)}%
              </div>
            </div>
          </div>

          {/* Sentiment Breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Sentiment Distribution</h3>
            <SentimentBar sentiment={insight.sentiment} />
          </div>

          {/* Trend Chart */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Mention Volume Trend</h3>
            <Sparkline data={insight.sparklineData} color={typeConfig.color} />
          </div>

          {/* Channel Distribution */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Channel Distribution</h3>
            <div className="space-y-2">
              {Object.entries(insight.channelDistribution)
                .sort(([, a], [, b]) => b - a)
                .map(([channel, count]) => {
                  const percentage = (count / insight.mentionCount) * 100
                  return (
                    <div key={channel} className="flex items-center gap-3">
                      <div className="w-24 text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {channel}
                      </div>
                      <div className="flex-1 h-6 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-16 text-right text-sm text-slate-600 dark:text-slate-400">
                        {count} ({percentage.toFixed(0)}%)
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {insight.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 rounded-lg"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Source Mentions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Source Mentions ({mentions.length})
              </h3>
              <button
                onClick={onViewMentions}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {mentions.slice(0, 5).map((mention) => (
                <div
                  key={mention.id}
                  onClick={() => onViewMentionDetail?.(mention.id)}
                  className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        {mention.authorName}
                      </span>
                      <span className="text-slate-500 dark:text-slate-500 text-sm">
                        {mention.authorHandle}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded ${getSentimentColor(mention.sentiment)}`}>
                      {mention.sentiment}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 line-clamp-3">
                    {mention.content}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      {mention.channel}
                    </span>
                    <span>{formatDate(mention.publishedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
