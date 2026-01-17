import type { InsightsProps, InsightType } from '@/../product/sections/insights/types'
import { InsightCard } from './InsightCard'
import { InsightDetailPanel } from './InsightDetailPanel'
import { useState } from 'react'

export function InsightsHub({
  insights,
  mentions,
  onViewInsight,
  onToggleBookmark,
  onShareInsight,
  onCreateAlert,
  onViewMentions,
  onFilterByType,
  onSearch,
  onClearFilters,
  onViewMentionDetail
}: Omit<InsightsProps, 'users' | 'onFilterByTimeframe'>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<InsightType | 'all'>('all')
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null)

  // Filter insights
  const filteredInsights = insights.filter(insight => {
    const matchesSearch = searchQuery === '' ||
      insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insight.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insight.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesType = typeFilter === 'all' || insight.type === typeFilter

    return matchesSearch && matchesType
  })

  // Group by timeframe
  const todayInsights = filteredInsights.filter(i => i.timeframe === 'today')
  const weekInsights = filteredInsights.filter(i => i.timeframe === 'week')
  const monthInsights = filteredInsights.filter(i => i.timeframe === 'month')

  const selectedInsight = selectedInsightId
    ? insights.find(i => i.id === selectedInsightId)
    : null

  const selectedMentions = selectedInsight
    ? mentions.filter(m => selectedInsight.relatedMentionIds.includes(m.id))
    : []

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  const handleTypeFilter = (type: InsightType | 'all') => {
    setTypeFilter(type)
    onFilterByType?.(type)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setTypeFilter('all')
    onClearFilters?.()
  }

  const handleViewInsight = (insightId: string) => {
    setSelectedInsightId(insightId)
    onViewInsight?.(insightId)
  }

  const handleClosePanel = () => {
    setSelectedInsightId(null)
  }

  const hasFilters = searchQuery !== '' || typeFilter !== 'all'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-900 via-purple-800 to-sky-700 dark:from-indigo-200 dark:via-purple-200 dark:to-sky-300 bg-clip-text text-transparent mb-2">
              Insights
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-3xl">
              AI-powered discovery of trends, themes, and questions emerging from your brand conversations. Automatically surfaced and prioritized by impact.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search insights by topic, keywords, or summary..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-shadow"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTypeFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${typeFilter === 'all'
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
              >
                All Insights
              </button>
              <button
                onClick={() => handleTypeFilter('trending_topic')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${typeFilter === 'trending_topic'
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
              >
                📈 Trending
              </button>
              <button
                onClick={() => handleTypeFilter('emerging_theme')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${typeFilter === 'emerging_theme'
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
              >
                ✨ Emerging
              </button>
              <button
                onClick={() => handleTypeFilter('audience_question')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${typeFilter === 'audience_question'
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
              >
                💬 Questions
              </button>
              <button
                onClick={() => handleTypeFilter('ai_summary')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${typeFilter === 'ai_summary'
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
              >
                🤖 AI Summaries
              </button>

              {hasFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Today Section */}
        {todayInsights.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-8 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Today
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {todayInsights.length} {todayInsights.length === 1 ? 'insight' : 'insights'}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {todayInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onClick={() => handleViewInsight(insight.id)}
                  onToggleBookmark={(isBookmarked) => onToggleBookmark?.(insight.id, isBookmarked)}
                  onShare={() => onShareInsight?.(insight.id)}
                  onCreateAlert={() => onCreateAlert?.(insight.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* This Week Section */}
        {weekInsights.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-8 bg-gradient-to-b from-sky-500 to-indigo-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                This Week
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {weekInsights.length} {weekInsights.length === 1 ? 'insight' : 'insights'}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {weekInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onClick={() => handleViewInsight(insight.id)}
                  onToggleBookmark={(isBookmarked) => onToggleBookmark?.(insight.id, isBookmarked)}
                  onShare={() => onShareInsight?.(insight.id)}
                  onCreateAlert={() => onCreateAlert?.(insight.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* This Month Section */}
        {monthInsights.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                This Month
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {monthInsights.length} {monthInsights.length === 1 ? 'insight' : 'insights'}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {monthInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onClick={() => handleViewInsight(insight.id)}
                  onToggleBookmark={(isBookmarked) => onToggleBookmark?.(insight.id, isBookmarked)}
                  onShare={() => onShareInsight?.(insight.id)}
                  onCreateAlert={() => onCreateAlert?.(insight.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredInsights.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-500 rounded-2xl mx-auto mb-4 flex items-center justify-center opacity-50">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {hasFilters ? 'No insights match your filters' : 'No insights detected yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {hasFilters
                ? 'Try adjusting your search query or filter selection to find insights.'
                : 'AI-powered insights will automatically appear here as patterns emerge from your brand conversations.'}
            </p>
            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Slide-out Detail Panel */}
      {selectedInsight && (
        <InsightDetailPanel
          insight={selectedInsight}
          mentions={selectedMentions}
          onClose={handleClosePanel}
          onToggleBookmark={(isBookmarked) => onToggleBookmark?.(selectedInsight.id, isBookmarked)}
          onShare={() => onShareInsight?.(selectedInsight.id)}
          onCreateAlert={() => onCreateAlert?.(selectedInsight.id)}
          onViewMentions={() => onViewMentions?.(selectedInsight.relatedMentionIds)}
          onViewMentionDetail={onViewMentionDetail}
        />
      )}
    </div>
  )
}
