import type {
  Post,
  Page,
  ProductProfile,
  LocationProfile,
  User,
  Campaign,
  Theme,
  Objective,
  PostMetrics,
  CommentSummary
} from '@/../product/sections/brand-posts/types'
import { SentimentBarometer } from './SentimentBarometer'
import { TagSelector } from './TagSelector'
import {
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  TrendingUp,
  Edit,
  Copy,
  MoreHorizontal,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface PostCardProps {
  post: Post
  page?: Page
  productProfiles: ProductProfile[]
  locationProfiles: LocationProfile[]
  users: User[]
  campaigns: Campaign[]
  themes: Theme[]
  objectives: Objective[]
  metrics?: PostMetrics
  commentSummary?: CommentSummary
  onView?: () => void
  onEdit?: () => void
  onDuplicate?: () => void
  onTagCampaign?: (campaignId: string | null) => void
  onTagTheme?: (themeId: string | null) => void
  onTagObjective?: (objectiveId: string | null) => void
  onReplyToComment?: () => void
}

export function PostCard({
  post,
  page,
  productProfiles,
  locationProfiles,
  users,
  campaigns,
  themes,
  objectives,
  metrics,
  commentSummary,
  onView,
  onEdit,
  onDuplicate,
  onTagCampaign,
  onTagTheme,
  onTagObjective,
  onReplyToComment
}: PostCardProps) {
  const creator = users.find(u => u.id === post.createdBy)
  const products = productProfiles.filter(p => post.productProfileIds.includes(p.id))
  const location = locationProfiles.find(l => l.id === post.locationProfileId)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Channel Badge */}
            {page && (
              <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {page.channel}
                </span>
              </div>
            )}

            {/* Status Badge */}
            {post.status === 'published' && post.publishedAt && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {formatDate(post.publishedAt)}
              </span>
            )}
            {post.status === 'scheduled' && post.scheduledFor && (
              <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400">
                <Clock className="w-3.5 h-3.5" />
                Scheduled for {formatDate(post.scheduledFor)}
              </div>
            )}
            {post.status === 'failed' && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-3.5 h-3.5" />
                Failed
              </div>
            )}

            {/* Boosted Badge */}
            {post.isBoosted && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-950 rounded-md">
                <Zap className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  Boosted
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>
            <button
              onClick={onDuplicate}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Duplicate"
            >
              <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>
            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <MoreHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Post Text */}
        <div
          className="text-slate-900 dark:text-white text-sm leading-relaxed cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          onClick={onView}
        >
          {post.content}
        </div>

        {/* Media Preview */}
        {post.mediaUrl && (
          <div
            className="relative aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden cursor-pointer group"
            onClick={onView}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white font-medium">
              {post.postType}
            </div>
            {/* Placeholder for media - in real implementation, would show image/video */}
            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
              Media: {post.mediaType}
            </div>
          </div>
        )}

        {/* Hashtags */}
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((tag, i) => (
              <span
                key={i}
                className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Associations */}
        {(products.length > 0 || location) && (
          <div className="flex flex-wrap gap-2 text-xs">
            {products.map(product => (
              <span
                key={product.id}
                className="px-2 py-1 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-md"
              >
                {product.name}
              </span>
            ))}
            {location && (
              <span className="px-2 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md">
                {location.name}
              </span>
            )}
          </div>
        )}

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 mb-1">
                <Eye className="w-3.5 h-3.5" />
              </div>
              <div className="text-lg font-semibold text-slate-900 dark:text-white">
                {formatNumber(metrics.impressions)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Impressions</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 mb-1">
                <Heart className="w-3.5 h-3.5" />
              </div>
              <div className="text-lg font-semibold text-slate-900 dark:text-white">
                {formatNumber(metrics.engagements)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {metrics.engagementRate.toFixed(1)}% rate
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 mb-1">
                <MessageCircle className="w-3.5 h-3.5" />
              </div>
              <div className="text-lg font-semibold text-slate-900 dark:text-white">
                {formatNumber(metrics.comments)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Comments</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 mb-1">
                <Share2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-lg font-semibold text-slate-900 dark:text-white">
                {formatNumber(metrics.shares)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Shares</div>
            </div>
          </div>
        )}

        {/* Benchmark Insight */}
        {metrics?.insights && metrics.insights.length > 0 && (
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-lg">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5" />
              <p className="text-xs text-indigo-900 dark:text-indigo-100">
                {metrics.insights[0]}
              </p>
            </div>
          </div>
        )}

        {/* Comment Sentiment */}
        {commentSummary && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <SentimentBarometer summary={commentSummary} />
            {commentSummary.needsReplyCount > 0 && (
              <button
                onClick={onReplyToComment}
                className="mt-3 w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Respond to Comments
              </button>
            )}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <TagSelector
            type="campaign"
            items={campaigns}
            selectedId={post.campaignId}
            onSelect={(id) => onTagCampaign?.(id)}
          />
          <TagSelector
            type="theme"
            items={themes}
            selectedId={post.themeId}
            onSelect={(id) => onTagTheme?.(id)}
          />
          <TagSelector
            type="objective"
            items={objectives}
            selectedId={post.objectiveId}
            onSelect={(id) => onTagObjective?.(id)}
          />
        </div>

        {/* Creator */}
        {creator && (
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Created by {creator.name}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
