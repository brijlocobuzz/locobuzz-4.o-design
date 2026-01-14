import { useState } from 'react'
import data from '@/../product/sections/mentions/data.json'
import { Mentions } from './components/Mentions'
import type { MentionsData } from '@/../product/sections/mentions/types'
import { SlidersHorizontal } from 'lucide-react'

export default function MentionsPreview() {
  // Cast the JSON data to our typed interface
  const mentionsData = data as unknown as MentionsData
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  return (
    <div className="h-screen relative">
      {/* Filter trigger button (floating) */}
      <button
        onClick={() => setIsFilterPanelOpen(true)}
        className="fixed top-4 right-4 z-30 flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-lg transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-700"
        title="Open filters"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span>Filters</span>
      </button>

      <Mentions
        avenueKpis={mentionsData.avenueKpis}
        mentions={mentionsData.mentions}
        topAuthors={mentionsData.topAuthors}
        trendingKeywords={mentionsData.trendingKeywords}
        savedViews={mentionsData.savedViews}
        displayMode="card"
        isFilterPanelOpen={isFilterPanelOpen}
        onFilterPanelClose={() => setIsFilterPanelOpen(false)}
        onAvenueClick={(id) => console.log('Avenue clicked:', id)}
        onSubAvenueClick={(id) => console.log('Sub-avenue clicked:', id)}
        onDisplayModeChange={(mode) => console.log('Display mode changed:', mode)}
        onMentionClick={(id) => console.log('Mention clicked:', id)}
        onReply={(id) => console.log('Reply to mention:', id)}
        onAssign={(id) => console.log('Assign mention:', id)}
        onTag={(id) => console.log('Tag mention:', id)}
        onMarkRead={(id, isRead) => console.log('Mark read:', id, isRead)}
        onMarkImportant={(id, isImportant) => console.log('Mark important:', id, isImportant)}
        onOpenInPlatform={(id) => console.log('Open in platform:', id)}
        onMentionHover={(id) => console.log('Mention hovered:', id)}
        onSaveView={() => console.log('Save view')}
        onKeywordClick={(keyword) => console.log('Keyword clicked:', keyword)}
        onAuthorClick={(id) => console.log('Author clicked:', id)}
      />
    </div>
  )
}
