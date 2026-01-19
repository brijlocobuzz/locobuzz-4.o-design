import type {
  Post,
  Page,
  Campaign,
  Theme,
  Objective,
  PostMetrics,
  CommentSummary
} from '@/../product/sections/brand-posts/types'
import { SentimentBarometer } from './SentimentBarometer'
import { Eye, Heart, MessageCircle, Zap, Clock } from 'lucide-react'

interface PostGridViewProps {
  posts: Post[]
  pages: Page[]
  campaigns: Campaign[]
  themes: Theme[]
  objectives: Objective[]
  metrics: PostMetrics[]
  commentSummaries: CommentSummary[]
  onViewPost?: (id: string) => void
}

export function PostGridView({
  posts,
  pages,
  campaigns,
  themes,
  objectives: _objectives,
  metrics,
  commentSummaries,
  onViewPost
}: PostGridViewProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {posts.map(post => {
          const page = pages.find(p => p.id === post.pageId)
          const postMetrics = metrics.find(m => m.postId === post.id)
          const commentSummary = commentSummaries.find(s => s.postId === post.id)
          const campaign = campaigns.find(c => c.id === post.campaignId)
          const theme = themes.find(t => t.id === post.themeId)

          return (
            <div
              key={post.id}
              onClick={() => onViewPost?.(post.id)}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all cursor-pointer"
            >
              {/* Media Thumbnail */}
              <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
                {post.mediaUrl ? (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20 group-hover:from-black/70 transition-all">
                    {/* Placeholder for media */}
                    <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                      {post.postType}
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-6">
                      {post.content}
                    </p>
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
                  {page && (
                    <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs font-medium text-white">
                      {page.channel}
                    </span>
                  )}
                  {post.isBoosted && (
                    <div className="p-1 bg-amber-500 rounded">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Quick Metrics Overlay */}
                {postMetrics && (
                  <div className="absolute bottom-2 left-2 right-2 flex items-center gap-3 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {formatNumber(postMetrics.impressions)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" />
                      {formatNumber(postMetrics.engagements)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {formatNumber(postMetrics.comments)}
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                {/* Date & Status */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  {post.status === 'published' && post.publishedAt && (
                    <span>{formatDate(post.publishedAt)}</span>
                  )}
                  {post.status === 'scheduled' && post.scheduledFor && (
                    <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                      <Clock className="w-3 h-3" />
                      {formatDate(post.scheduledFor)}
                    </div>
                  )}
                  {postMetrics && (
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {postMetrics.engagementRate.toFixed(1)}%
                    </span>
                  )}
                </div>

                {/* Caption Preview */}
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                  {post.content}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {campaign && (
                    <span className="px-1.5 py-0.5 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded text-xs">
                      {campaign.name}
                    </span>
                  )}
                  {theme && (
                    <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded text-xs">
                      {theme.name}
                    </span>
                  )}
                </div>

                {/* Sentiment */}
                {commentSummary && commentSummary.totalComments > 0 && (
                  <SentimentBarometer summary={commentSummary} compact />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
