import data from '@/../product/sections/insights/data.json'
import { InsightsHub } from './components/InsightsHub'
import type { InsightsProps } from '@/../product/sections/insights/types'

export default function InsightsPreview() {
  const insightsData = data as unknown as InsightsProps
  return (
    <InsightsHub
      insights={insightsData.insights}
      mentions={insightsData.mentions}
      onViewInsight={(id) => console.log('View insight:', id)}
      onToggleBookmark={(id, isBookmarked) => console.log('Toggle bookmark:', id, isBookmarked)}
      onShareInsight={(id) => console.log('Share insight:', id)}
      onCreateAlert={(id) => console.log('Create alert:', id)}
      onViewMentions={(mentionIds) => console.log('View mentions:', mentionIds)}
      onFilterByType={(type) => console.log('Filter by type:', type)}
      onSearch={(query) => console.log('Search:', query)}
      onClearFilters={() => console.log('Clear filters')}
      onViewMentionDetail={(id) => console.log('View mention detail:', id)}
    />
  )
}
