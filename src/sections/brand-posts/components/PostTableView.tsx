import { useState } from 'react'
import type {
  Post,
  Page,
  User,
  Campaign,
  Theme,
  Objective,
  PostMetrics,
  CommentSummary
} from '@/../product/sections/brand-posts/types'
import {
  Eye,
  MessageCircle,
  Heart,
  Zap,
  Edit,
  Copy,
  MoreHorizontal,
  Download,
  Tag,
  Clock,
  Users
} from 'lucide-react'

interface PostTableViewProps {
  posts: Post[]
  pages: Page[]
  users: User[]
  campaigns: Campaign[]
  themes: Theme[]
  objectives: Objective[]
  metrics: PostMetrics[]
  commentSummaries: CommentSummary[]
  onViewPost?: (id: string) => void
  onEditPost?: (id: string) => void
  onDuplicatePost?: (id: string) => void
  onBulkTag?: (postIds: string[], tags: any) => void
  onBulkReschedule?: (postIds: string[], newDate: string) => void
  onBulkDuplicate?: (postIds: string[]) => void
  onExport?: (postIds: string[], format: 'csv' | 'json') => void
}

export function PostTableView({
  posts,
  pages,
  users,
  campaigns,
  themes,
  objectives,
  metrics,
  commentSummaries,
  onViewPost,
  onEditPost,
  onDuplicatePost,
  onBulkTag,
  onBulkReschedule,
  onBulkDuplicate,
  onExport
}: PostTableViewProps) {
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const togglePost = (postId: string) => {
    const newSelected = new Set(selectedPosts)
    if (newSelected.has(postId)) {
      newSelected.delete(postId)
    } else {
      newSelected.add(postId)
    }
    setSelectedPosts(newSelected)
  }

  const toggleAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set())
    } else {
      setSelectedPosts(new Set(posts.map(p => p.id)))
    }
  }

  const hasSelected = selectedPosts.size > 0

  return (
    <div className="flex flex-col h-full">
      {/* Bulk Actions Bar */}
      {hasSelected && (
        <div className="px-6 py-3 bg-indigo-50 dark:bg-indigo-950 border-b border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
              {selectedPosts.size} post{selectedPosts.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onBulkTag?.(Array.from(selectedPosts), {})}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-lg text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors flex items-center gap-2"
              >
                <Tag className="w-4 h-4" />
                Bulk Tag
              </button>
              <button
                onClick={() => onBulkReschedule?.(Array.from(selectedPosts), '')}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-lg text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Reschedule
              </button>
              <button
                onClick={() => onBulkDuplicate?.(Array.from(selectedPosts))}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-lg text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button
                onClick={() => onExport?.(Array.from(selectedPosts), 'csv')}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-lg text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedPosts.size === posts.length && posts.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Post
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Channel
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Date
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Impressions
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Engagement
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Comments
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Tags
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-950 divide-y divide-slate-200 dark:divide-slate-800">
            {posts.map(post => {
              const page = pages.find(p => p.id === post.pageId)
              const postMetrics = metrics.find(m => m.postId === post.id)
              const commentSummary = commentSummaries.find(s => s.postId === post.id)
              const campaign = campaigns.find(c => c.id === post.campaignId)
              const theme = themes.find(t => t.id === post.themeId)
              const isSelected = selectedPosts.has(post.id)

              return (
                <tr
                  key={post.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${
                    isSelected ? 'bg-indigo-50 dark:bg-indigo-950' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => togglePost(post.id)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3 max-w-md">
                      {/* Thumbnail */}
                      {post.mediaUrl ? (
                        <div className="w-12 h-12 rounded bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                            {post.postType}
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900 dark:text-white line-clamp-2 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => onViewPost?.(post.id)}>
                          {post.content}
                        </p>
                        {post.isBoosted && (
                          <div className="flex items-center gap-1 mt-1">
                            <Zap className="w-3 h-3 text-amber-500" />
                            <span className="text-xs text-amber-600 dark:text-amber-400">Boosted</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {page && (
                      <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-medium text-slate-700 dark:text-slate-300">
                        {page.channel}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {post.status === 'published' && post.publishedAt && formatDate(post.publishedAt)}
                      {post.status === 'scheduled' && post.scheduledFor && (
                        <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                          <Clock className="w-3 h-3" />
                          {formatDate(post.scheduledFor)}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    {postMetrics && (
                      <div className="flex items-center justify-center gap-1 text-sm text-slate-900 dark:text-white">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {formatNumber(postMetrics.impressions)}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {postMetrics && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm font-medium text-slate-900 dark:text-white">
                          <Heart className="w-3.5 h-3.5 text-slate-400" />
                          {formatNumber(postMetrics.engagements)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {postMetrics.engagementRate.toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {commentSummary && (
                      <div className="flex items-center justify-center gap-1 text-sm text-slate-900 dark:text-white">
                        <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                        {commentSummary.totalComments}
                        {commentSummary.sentimentSpike && (
                          <span className="ml-1 w-2 h-2 rounded-full bg-red-500" />
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {campaign && (
                        <span className="px-1.5 py-0.5 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded text-xs">
                          {campaign.name.length > 15 ? campaign.name.substring(0, 15) + '...' : campaign.name}
                        </span>
                      )}
                      {theme && (
                        <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded text-xs">
                          {theme.name.length > 15 ? theme.name.substring(0, 15) + '...' : theme.name}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEditPost?.(post.id)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      </button>
                      <button
                        onClick={() => onDuplicatePost?.(post.id)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      </button>
                      <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
