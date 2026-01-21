import data from '@/../product/sections/brand-posts/data.json'
import { BrandPostsHub } from './components/BrandPostsHub'

export default function BrandPostsPreview() {
  return (
    <BrandPostsHub
      posts={data.posts}
      pages={data.pages}
      productProfiles={data.productProfiles}
      locationProfiles={data.locationProfiles}
      users={data.users}
      campaigns={data.campaigns}
      themes={data.themes}
      objectives={data.objectives}
      metrics={data.metrics}
      comments={data.comments}
      commentSummaries={data.commentSummaries}
      savedViews={[]}
      viewMode="published"
      displayMode="feed"
      selectedChannel={null}
      onViewPost={(id) => console.log('View post:', id)}
      onEditPost={(id) => console.log('Edit post:', id)}
      onReschedulePost={(id) => console.log('Reschedule post:', id)}
      onDuplicatePost={(id) => console.log('Duplicate post:', id)}
      onDeletePost={(id) => console.log('Delete post:', id)}
      onCreatePost={() => console.log('Create new post')}
      onTagCampaign={(postId, campaignId) => console.log('Tag campaign:', postId, campaignId)}
      onTagTheme={(postId, themeId) => console.log('Tag theme:', postId, themeId)}
      onTagObjective={(postId, objectiveId) => console.log('Tag objective:', postId, objectiveId)}
      onTagProducts={(postId, productIds) => console.log('Tag products:', postId, productIds)}
      onTagLocation={(postId, locationId) => console.log('Tag location:', postId, locationId)}
      onReplyToComment={(commentId) => console.log('Reply to comment:', commentId)}
      onModerateComment={(commentId, action) => console.log('Moderate comment:', commentId, action)}
      onAssignComment={(commentId, userId) => console.log('Assign comment:', commentId, userId)}
      onSubmitForApproval={(postId) => console.log('Submit for approval:', postId)}
      onApprovePost={(postId, notes) => console.log('Approve post:', postId, notes)}
      onRejectPost={(postId, notes) => console.log('Reject post:', postId, notes)}
      onBulkTag={(postIds, tags) => console.log('Bulk tag:', postIds, tags)}
      onBulkReschedule={(postIds, newDate) => console.log('Bulk reschedule:', postIds, newDate)}
      onBulkDuplicate={(postIds) => console.log('Bulk duplicate:', postIds)}
      onBulkChangeOwner={(postIds, userId) => console.log('Bulk change owner:', postIds, userId)}
      onExport={(postIds, format) => console.log('Export:', postIds, format)}
      onViewModeChange={(mode) => console.log('View mode change:', mode)}
      onDisplayModeChange={(mode) => console.log('Display mode change:', mode)}
      onChannelFilter={(channelId) => console.log('Channel filter:', channelId)}
      onApplyFilters={(filters) => console.log('Apply filters:', filters)}
      onSaveView={(view) => console.log('Save view:', view)}
      onSelectSavedView={(viewId) => console.log('Select saved view:', viewId)}
      onOpenCalendar={(filters) => console.log('Open calendar:', filters)}
    />
  )
}
