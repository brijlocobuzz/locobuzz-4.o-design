import { ChevronUp, ExternalLink, Heart, MessageCircle, BadgeCheck, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface ParentPostCardProps {
  parentPostContext: any
  threadNavigator?: any
}

export function ParentPostCard({ parentPostContext, threadNavigator }: ParentPostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!parentPostContext) return null

  const { post, threadPosition, parentComment } = parentPostContext

  const getViralityColor = (indicator: string) => {
    switch (indicator) {
      case 'normal':
        return 'text-green-600 dark:text-green-400'
      case 'high':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'viral':
        return 'text-orange-600 dark:text-orange-400'
      case 'critical':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-slate-600 dark:text-slate-400'
    }
  }

  const formatCompactNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="mb-6">
      {/* Collapsed State */}
      {!isExpanded && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex items-start gap-3">
            {/* Thumbnail */}
            {post.media && post.media[0] && (
              <img
                src={post.media[0].thumbnailUrl || post.media[0].url}
                alt=""
                className="h-16 w-16 flex-shrink-0 rounded object-cover"
              />
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                  className="h-6 w-6 rounded-full"
                />
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {post.author.name}
                </span>
                {post.author.isVerified && (
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                )}
              </div>

              <p className="mt-1 text-sm text-slate-600 line-clamp-2 dark:text-slate-400">
                {post.content}
              </p>

              {/* Compact metrics */}
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {formatCompactNumber(post.engagementMetrics.reactions.total)}
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {formatCompactNumber(post.engagementMetrics.comments)}
                </div>
              </div>
            </div>

            {/* View Full Thread Button */}
            <button
              onClick={() => setIsExpanded(true)}
              className="flex-shrink-0 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              View Full Thread
            </button>
          </div>
        </div>
      )}

      {/* Expanded State */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Full Post Display */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            {/* Post Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-white">
                      {post.author.name}
                    </span>
                    {post.author.isVerified && (
                      <BadgeCheck className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    @{post.author.username}
                    {post.author.followerCount && (
                      <span> • {formatCompactNumber(post.author.followerCount)} followers</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Virality Indicator */}
                <div className={`rounded-full bg-slate-100 px-2 py-1 text-xs font-medium ${getViralityColor(post.viralityIndicator)} dark:bg-slate-800`}>
                  {post.viralityIndicator.toUpperCase()}
                </div>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Post Content */}
            <div className="mt-3 text-slate-900 dark:text-white">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Post Media */}
            {post.media && post.media.length > 0 && (
              <div className="mt-3">
                {post.media.map((media: any, idx: number) => (
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
            <div className="mt-4 grid grid-cols-4 gap-4 border-t border-slate-200 pt-4 dark:border-slate-700">
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {formatCompactNumber(post.engagementMetrics.reactions.total)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Reactions</div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {formatCompactNumber(post.engagementMetrics.comments)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Comments</div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {formatCompactNumber(post.engagementMetrics.shares)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Shares</div>
              </div>
              {post.engagementMetrics.reach && (
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {formatCompactNumber(post.engagementMetrics.reach)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Reach</div>
                </div>
              )}
            </div>

            {/* Virality Reason */}
            {post.viralityReason && (
              <div className="mt-3 rounded-lg bg-yellow-50 p-2 text-xs text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-200">
                {post.viralityReason}
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <a
                href={post.platformUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ExternalLink className="h-4 w-4" />
                View on {post.platform}
              </a>
            </div>
          </div>

          {/* Thread Navigator */}
          {threadNavigator && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">Thread Navigation</div>

              {/* Breadcrumb */}
              <div className="mt-2 flex items-center gap-1 flex-wrap text-xs text-slate-600 dark:text-slate-400">
                {threadNavigator.breadcrumb.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1">
                    <button
                      className={`${item.type === 'current'
                          ? 'font-medium text-slate-900 dark:text-white'
                          : 'hover:text-slate-900 dark:hover:text-white'
                        }`}
                      disabled={!item.isClickable}
                    >
                      {item.label}
                    </button>
                    {idx < threadNavigator.breadcrumb.length - 1 && (
                      <ChevronRight className="h-3 w-3 text-slate-400" />
                    )}
                  </div>
                ))}
              </div>

              {/* Thread Position */}
              {threadPosition && (
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Comment {threadPosition.currentCommentNumber} of {threadPosition.totalComments}
                  {' • '}
                  Nesting level: {threadPosition.nestingLevel}
                </div>
              )}

              {/* Parent Comment Preview */}
              {parentComment && (
                <div className="mt-3 rounded-lg border-l-4 border-blue-500 bg-white p-3 dark:bg-slate-900">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Replying to <span className="font-medium">{parentComment.authorUsername}</span>
                  </div>
                  <p className="mt-1 text-xs italic text-slate-700 dark:text-slate-300">
                    {parentComment.contentSnippet}
                  </p>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {parentComment.reactions} reactions
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-3 flex gap-2">
                {threadNavigator.actions.canJumpToParent && (
                  <button className="text-xs text-blue-600 hover:underline dark:text-blue-400">
                    Jump to parent comment ↑
                  </button>
                )}
                {threadNavigator.actions.canViewFullThread && (
                  <a
                    href={threadNavigator.actions.fullThreadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Open full thread on {post.platform} →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
