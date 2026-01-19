import { useState } from 'react'
import type { BrandPostsProps } from '@/../product/sections/brand-posts/types'
import { SecondaryNav } from './SecondaryNav'
import { PostFeedView } from './PostFeedView'
import { PostGridView } from './PostGridView'
import { PostTableView } from './PostTableView'
import { Search, SlidersHorizontal, BookmarkPlus, LayoutGrid, List, Table } from 'lucide-react'

// Design tokens: indigo (primary), sky (secondary), slate (neutral)
// Typography: Inter for heading/body, JetBrains Mono for mono

export function BrandPostsHub({
  posts,
  pages,
  productProfiles,
  locationProfiles,
  users,
  campaigns,
  themes,
  objectives,
  metrics,
  commentSummaries,
  savedViews,
  viewMode = 'published',
  displayMode = 'feed',
  selectedChannel,
  onViewPost,
  onEditPost,
  onDuplicatePost,
  onCreatePost,
  onTagCampaign,
  onTagTheme,
  onTagObjective,
  onTagProducts,
  onTagLocation,
  onReplyToComment,
  onBulkTag,
  onBulkReschedule,
  onBulkDuplicate,
  onExport,
  onViewModeChange,
  onDisplayModeChange,
  onChannelFilter,
  onOpenCalendar
}: BrandPostsProps) {
  const [currentViewMode, setCurrentViewMode] = useState<'published' | 'scheduled' | 'needs-attention'>(viewMode)
  const [currentDisplayMode, setCurrentDisplayMode] = useState<'feed' | 'grid' | 'table'>(displayMode)
  const [currentChannel, setCurrentChannel] = useState<string | null>(selectedChannel || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Filter posts by view mode and channel
  const filteredPosts = posts.filter(post => {
    // Filter by view mode
    if (currentViewMode === 'published' && post.status !== 'published') return false
    if (currentViewMode === 'scheduled' && !['draft', 'in_review', 'approved', 'scheduled'].includes(post.status)) return false
    if (currentViewMode === 'needs-attention') {
      const summary = commentSummaries.find(s => s.postId === post.id)
      const hasIssue = summary?.sentimentSpike || (summary?.needsReplyCount || 0) > 5
      if (!hasIssue) return false
    }

    // Filter by channel
    if (currentChannel) {
      const postPage = pages.find(p => p.id === post.pageId)
      if (postPage?.channelId !== currentChannel) return false
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!post.content.toLowerCase().includes(query) &&
        !post.hashtags.some(h => h.toLowerCase().includes(query))) {
        return false
      }
    }

    return true
  })

  const handleViewModeChange = (mode: 'published' | 'scheduled' | 'needs-attention') => {
    setCurrentViewMode(mode)
    onViewModeChange?.(mode)
  }

  const handleDisplayModeChange = (mode: 'feed' | 'grid' | 'table') => {
    setCurrentDisplayMode(mode)
    onDisplayModeChange?.(mode)
  }

  const handleChannelFilter = (channelId: string | null) => {
    setCurrentChannel(channelId)
    onChannelFilter?.(channelId)
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Secondary Sidebar - Channel Filters */}
      <SecondaryNav
        pages={pages}
        selectedChannel={currentChannel}
        onSelectChannel={handleChannelFilter}
        onOpenCalendar={onOpenCalendar}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          {/* View Mode Tabs */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => handleViewModeChange('published')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currentViewMode === 'published'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                Published
              </button>
              <button
                onClick={() => handleViewModeChange('scheduled')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currentViewMode === 'scheduled'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                Scheduled
              </button>
              <button
                onClick={() => handleViewModeChange('needs-attention')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currentViewMode === 'needs-attention'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                Needs Attention
                {commentSummaries.filter(s => s.sentimentSpike || s.needsReplyCount > 5).length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {commentSummaries.filter(s => s.sentimentSpike || s.needsReplyCount > 5).length}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={onCreatePost}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Create Post
            </button>
          </div>

          {/* Search & Display Controls */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts, captions, hashtags..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Advanced Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg border font-medium transition-all flex items-center gap-2 ${showFilters
                ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            {/* Saved Views */}
            {savedViews && savedViews.length > 0 && (
              <button className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 font-medium transition-all flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4" />
                Saved Views
              </button>
            )}

            {/* Display Mode Toggle */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => handleDisplayModeChange('feed')}
                className={`p-2 rounded transition-colors ${currentDisplayMode === 'feed'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                title="Feed View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDisplayModeChange('grid')}
                className={`p-2 rounded transition-colors ${currentDisplayMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDisplayModeChange('table')}
                className={`p-2 rounded transition-colors ${currentDisplayMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                title="Table View"
              >
                <Table className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {currentDisplayMode === 'feed' && (
            <PostFeedView
              posts={filteredPosts}
              pages={pages}
              productProfiles={productProfiles}
              locationProfiles={locationProfiles}
              users={users}
              campaigns={campaigns}
              themes={themes}
              objectives={objectives}
              metrics={metrics}
              commentSummaries={commentSummaries}
              onViewPost={onViewPost}
              onEditPost={onEditPost}
              onDuplicatePost={onDuplicatePost}
              onTagCampaign={onTagCampaign}
              onTagTheme={onTagTheme}
              onTagObjective={onTagObjective}
              onTagProducts={onTagProducts}
              onTagLocation={onTagLocation}
              onReplyToComment={onReplyToComment}
            />
          )}

          {currentDisplayMode === 'grid' && (
            <PostGridView
              posts={filteredPosts}
              pages={pages}
              campaigns={campaigns}
              themes={themes}
              objectives={objectives}
              metrics={metrics}
              commentSummaries={commentSummaries}
              onViewPost={onViewPost}
            />
          )}

          {currentDisplayMode === 'table' && (
            <PostTableView
              posts={filteredPosts}
              pages={pages}
              users={users}
              campaigns={campaigns}
              themes={themes}
              objectives={objectives}
              metrics={metrics}
              commentSummaries={commentSummaries}
              onViewPost={onViewPost}
              onEditPost={onEditPost}
              onDuplicatePost={onDuplicatePost}
              onBulkTag={onBulkTag}
              onBulkReschedule={onBulkReschedule}
              onBulkDuplicate={onBulkDuplicate}
              onExport={onExport}
            />
          )}

          {filteredPosts.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-slate-500 dark:text-slate-400 text-lg">No posts found</p>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                  Try adjusting your filters or search query
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
