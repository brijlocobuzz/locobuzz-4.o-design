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
import { PostCard } from './PostCard'

interface PostFeedViewProps {
  posts: Post[]
  pages: Page[]
  productProfiles: ProductProfile[]
  locationProfiles: LocationProfile[]
  users: User[]
  campaigns: Campaign[]
  themes: Theme[]
  objectives: Objective[]
  metrics: PostMetrics[]
  commentSummaries: CommentSummary[]
  onViewPost?: (id: string) => void
  onEditPost?: (id: string) => void
  onDuplicatePost?: (id: string) => void
  onTagCampaign?: (postId: string, campaignId: string | null) => void
  onTagTheme?: (postId: string, themeId: string | null) => void
  onTagObjective?: (postId: string, objectiveId: string | null) => void
  onTagProducts?: (postId: string, productIds: string[]) => void
  onTagLocation?: (postId: string, locationId: string | null) => void
  onReplyToComment?: (commentId: string) => void
}

export function PostFeedView({
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
  onViewPost,
  onEditPost,
  onDuplicatePost,
  onTagCampaign,
  onTagTheme,
  onTagObjective,
  onReplyToComment
}: PostFeedViewProps) {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      {posts.map(post => {
        const page = pages.find(p => p.id === post.pageId)
        const postMetrics = metrics.find(m => m.postId === post.id)
        const commentSummary = commentSummaries.find(s => s.postId === post.id)

        return (
          <PostCard
            key={post.id}
            post={post}
            page={page}
            productProfiles={productProfiles}
            locationProfiles={locationProfiles}
            users={users}
            campaigns={campaigns}
            themes={themes}
            objectives={objectives}
            metrics={postMetrics}
            commentSummary={commentSummary}
            onView={() => onViewPost?.(post.id)}
            onEdit={() => onEditPost?.(post.id)}
            onDuplicate={() => onDuplicatePost?.(post.id)}
            onTagCampaign={(campaignId) => onTagCampaign?.(post.id, campaignId)}
            onTagTheme={(themeId) => onTagTheme?.(post.id, themeId)}
            onTagObjective={(objectiveId) => onTagObjective?.(post.id, objectiveId)}
            onReplyToComment={() => {
              // For now, just trigger with first comment if any
              onReplyToComment?.('comment-placeholder')
            }}
          />
        )
      })}
    </div>
  )
}
