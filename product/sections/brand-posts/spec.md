# Brand Posts Specification

## Overview
Posts Hub for published and scheduled brand content across social channels. Enables users to find posts through powerful search and filtering, understand performance through metrics and comment health, and act through tagging, moderation, bulk operations, and governance workflows.

## Core User Jobs
1. **Find the post** - Search, filters, saved views
2. **Understand performance** - Metrics, benchmarks, comment health, trends
3. **Act** - Reply/moderate, retag, duplicate, reschedule, escalate

## Core Views

**Published Posts (default)**
- Feed/grid/table display modes
- Full analytics and comment health
- Channel filter in secondary sidebar

**Scheduled / Drafts**
- Approval workflow states and ownership
- Channel-specific previews
- Scheduled date/time and status
- Publishing failure handling

**Needs Attention (optional but powerful)**
- Posts with negative comment spikes
- High unanswered comment counts
- Performance anomalies

## User Flows

### Finding & Filtering
- Global search (text/caption/hashtags, post ID/permalink)
- Advanced filters:
  - Date range
  - Post type (reel/story/video/carousel/text)
  - Media presence, language
  - Author/team
  - Campaign/theme/objective
  - Approval status
  - Boosted/paid posts
  - "Has unanswered comments"
  - Sentiment threshold
- Sort options: recency, engagement rate, impressions, negative comment rate, saves/shares, click rate, "rising comments in last X hours"
- Save filter combinations as custom views

### Understanding Performance
- View canonical metrics:
  - Primary: impressions/reach, engagements, engagement rate, clicks, video views/watch time, saves, shares, comments
  - Secondary: follower change attributed (if available), profile visits, CTR
  - "When unavailable" fallback behaviors per channel
- Benchmark indicators: "vs last 30 posts" or "vs channel median"
- Quick insights: "negative comments spiked after 2 hours", "best performing format this week: Reels"
- "What changed?" indicators: boosted vs organic, edit history, publishing time, media type

### Comment Management
- Unread/unreplied comment counters with SLA tracking
- Filter comments: sentiment, intent, author influence, newest/oldest, "needs reply", "hidden/deleted"
- Moderation actions: hide, delete (where supported), restrict user, report, pin (platform dependent)
- Assignment/notes for threads requiring attention
- Comment sentiment barometer with:
  - Count + % + confidence/coverage (e.g., "Sentiment on 220/310 comments analyzed")
  - Time window toggle (last 24h / since publish)
  - Spike indicator: "Negativity ↑ in last 2h"

### Tagging & Organization
- Inline tag selectors for campaign, content theme, post objective
- Bulk tagging in table mode

### Publishing & Scheduling
- View scheduled posts with:
  - Scheduled date/time prominently displayed
  - Draft status indicator
  - Approval workflow status (Draft → In Review → Approved → Scheduled → Published → Failed)
  - Per-channel preview
- Edit or reschedule posts (with platform-specific constraints):
  - Specify supported edits per channel (caption only, alt text, etc.)
  - For unsupported edits, offer "create revised post" flow
- Duplicate posts with channel adaptation:
  - Auto-truncate for character limits
  - Hashtag rules per platform
  - Aspect ratio suggestions
  - Per-channel preview and validation before scheduling
  - Link-in-bio or UTM options

### Calendar Integration
- Navigate to content calendar
- Open calendar filtered to same channel/campaign/time window
- Drag-and-drop reschedule
- Conflict warnings (posting frequency rules, blackout windows)

### Bulk Operations (Table Mode)
- Multi-select posts
- Bulk actions:
  - Tag (campaign/theme/objective)
  - Reschedule
  - Duplicate
  - Change owner/team
  - Send for approval
  - Export (CSV)
- Shareable filtered views

## UI Requirements

### Layout & Navigation
- Secondary sidebar: channel filters (Facebook, Instagram, Twitter, LinkedIn, Google Business)
- View switcher: Published / Scheduled / Needs Attention
- Display mode toggle: Feed / Grid / Table
- Search bar with advanced filter panel
- Saved views dropdown

### Post Display (varies by mode)
- **Feed view**: Full post content and media, complete metrics, comment sentiment barometer, inline actions
- **Grid view**: Visual browsing with thumbnails, key metrics overlay, tags visible
- **Table view**: Compact rows with thumbnail, truncated copy, key metrics columns, tags, status, checkboxes for bulk selection

### Post Card/Row Components
- Post content and media (full in feed, preview in grid, thumbnail in table)
- Engagement statistics (canonical metrics with per-channel mapping)
- Comment count with sentiment barometer (count + % + confidence + spike indicator)
- Inline tag selectors for campaign, theme, objective
- Action buttons: Edit, Respond to Comments, Duplicate
- Performance indicators: benchmarks, "what changed", quick insights

### Scheduled Post Additional Elements
- Scheduled date/time (prominent)
- Draft status indicator
- Approval workflow status with roles and states
- Channel-specific preview mode
- Publishing failure alerts

### Comment Management Panel
- Comment list with filters (sentiment, intent, needs reply, etc.)
- Moderation action buttons
- Assignment and notes fields
- Reply interface

## Permissions & Audit
- Roles: Creator, Approver, Publisher
- States: Draft → In Review → Approved → Scheduled → Published → Failed
- Audit log: who edited copy, who changed schedule, who approved
- Locking: prevent edits after approval unless it re-triggers review
- Edit history per post

## Saved Views & Bulk Actions
- Save filter combinations as named views (e.g., "Instagram Reels – Campaign X – Needs reply")
- Table supports multi-select with bulk action menu
- Export and share filtered views

## Configuration
- shell: true
