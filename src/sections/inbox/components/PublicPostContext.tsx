import { ChevronUp, ExternalLink, Heart, MessageCircle, Share2, Eye, BadgeCheck } from 'lucide-react'
import { useState } from 'react'

interface PublicPostContextProps {
  publicPostContext: any
}

export function PublicPostContext({ publicPostContext }: PublicPostContextProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!publicPostContext) return null

  const formatCompactNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getViralityColor = (indicator: string) => {
    switch (indicator) {
      case 'normal':
        return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
      case 'high':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
      case 'viral':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  return (
    <div className="mb-4">
      {/* Collapsed State */}
      {!isExpanded && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/20">
          <div className="flex items-start gap-3">
            {/* Thumbnail */}
            {publicPostContext.media && publicPostContext.media[0] && (
              <img
                src={publicPostContext.media[0].thumbnailUrl || publicPostContext.media[0].url}
                alt=""
                className="h-12 w-12 flex-shrink-0 rounded object-cover"
              />
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
                  Public Post
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {publicPostContext.platform}
                </span>
              </div>

              <p className="mt-1 text-sm text-blue-900 line-clamp-1 dark:text-blue-100">
                {publicPostContext.content}
              </p>

              {/* Compact metrics */}
              <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                {formatCompactNumber(publicPostContext.engagementMetrics.reactions.total)} likes •{' '}
                {formatCompactNumber(publicPostContext.engagementMetrics.comments)} comments
              </div>
            </div>

            {/* View Button */}
            <button
              onClick={() => setIsExpanded(true)}
              className="flex-shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View full post
            </button>
          </div>
        </div>
      )}

      {/* Expanded State */}
      {isExpanded && (
        <div className="rounded-lg border border-blue-200 bg-white p-4 dark:border-blue-900 dark:bg-slate-900">
          {/* Post Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src={publicPostContext.author.avatarUrl}
                alt={publicPostContext.author.name}
                className="h-10 w-10 rounded-full"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {publicPostContext.author.name}
                  </span>
                  {publicPostContext.author.isVerified && (
                    <BadgeCheck className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  @{publicPostContext.author.username}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`rounded-full px-2 py-1 text-xs font-medium ${getViralityColor(publicPostContext.viralityIndicator)}`}>
                {publicPostContext.viralityIndicator.toUpperCase()}
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronUp className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Post Content */}
          <div className="mt-3 text-slate-900 dark:text-white">
            <p className="whitespace-pre-wrap">{publicPostContext.content}</p>
          </div>

          {/* Post Media */}
          {publicPostContext.media && publicPostContext.media.length > 0 && (
            <div className="mt-3">
              {publicPostContext.media.map((media: any, idx: number) => (
                <img
                  key={idx}
                  src={media.url}
                  alt={media.altText}
                  className="w-full rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Engagement Metrics */}
          <div className="mt-4 grid grid-cols-4 gap-4 border-t border-slate-200 pt-3 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-white">
                <Heart className="h-4 w-4 text-red-500" />
                {formatCompactNumber(publicPostContext.engagementMetrics.reactions.total)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Reactions</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-white">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                {formatCompactNumber(publicPostContext.engagementMetrics.comments)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Comments</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-white">
                <Share2 className="h-4 w-4 text-green-500" />
                {formatCompactNumber(publicPostContext.engagementMetrics.shares)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Shares</div>
            </div>
            {publicPostContext.engagementMetrics.reach && (
              <div>
                <div className="flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-white">
                  <Eye className="h-4 w-4 text-purple-500" />
                  {formatCompactNumber(publicPostContext.engagementMetrics.reach)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Reach</div>
              </div>
            )}
          </div>

          {/* Virality Reason */}
          {publicPostContext.viralityReason && (
            <div className="mt-3 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-200">
              ⚠️ {publicPostContext.viralityReason}
            </div>
          )}

          {/* Timestamp & Link */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(publicPostContext.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </div>
            <a
              href={publicPostContext.platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              View on {publicPostContext.platform}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
