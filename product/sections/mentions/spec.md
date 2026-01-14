# Mentions Specification

## Overview
Mentions is a flexible, multi-layer workspace for exploring brand conversations. It combines a top-level KPI overview showing mention distribution across avenues (Social, Keywords, Reviews, etc.) with a bottom record view that displays individual mentions in Card, Table, or Feed layouts. The experience flows from exploration → zoom in → act or analyze, with real-time updates and customizable saved views.

## User Flows
- User lands on Mentions and sees KPI Core Cards showing mention volume and sentiment distribution across avenues
- User clicks a KPI card (e.g., Social) to expand it inline, revealing sub-avenues (Instagram, Facebook, X, etc.) with live distribution and latest mentions preview
- Clicking a KPI automatically filters the Record View below to show only mentions from that avenue
- User switches between Card View (Pinterest-style), Table View (Airtable-style with custom columns), or Feed View (LinkedIn/Threads-style) using top toolbar
- User customizes Table View by adding/removing columns, reordering them, and saving the layout as a named view
- User applies filters (channel, sentiment, classification, time range, keywords) to refine the record view
- User hovers over mention cards for quick preview and inline actions (reply, assign, tag, mark)
- User takes bulk actions by selecting multiple mentions with checkboxes
- User saves current display mode, filters, and layout configuration as a custom view for reuse
- Real-time mentions animate in subtly as they arrive
- Persistent right rail shows mini summaries (Top Mentions, Trending Keywords, Top Authors)

## UI Requirements

### KPI Core Cards (Top Section)
- Modular KPI tiles showing mention counts (Today/7 days/30 days), sentiment %, and share of voice across avenues
- Each tile is expandable: click to reveal sub-avenues with live distribution chart and inline mention previews
- Sub-avenue views include interaction shortcuts (reply, open post, assign)
- Cards update dynamically as filters are applied
- Avenues include: Social, Keywords, Reviews, Broadcast, News, etc.

### Record View (Bottom Section)
- **Card View:** Pinterest-style compact tiles with text snippet, sentiment color tag, timestamp, reach, avenue chip
- **Table View:** Airtable-style with user-customizable columns (sentiment, reach, author influence, platform, tags, etc.), sorting, filtering, grouping, column pinning, drag-and-drop reordering
- **Feed View:** Continuous vertical flow with inline threading for multi-reply mentions, inline interactions (like, reply, mark, annotate)
- View mode switcher in top toolbar
- Filter bar: channel/platform, sentiment, classification/intent, time range, keywords, location/product profiles, read/unread status
- Full query builder for advanced filtering with all available attributes
- "Save View" button to capture current mode, filters, and column configuration

### Mention Data Display
- Author & platform
- Content & timestamp
- AI enrichments (sentiment, intent, classifications, priority score)
- Engagement metrics (likes, shares, comments, reach)

### Interactions
- Click any KPI card to filter Record View
- Hover actions: quick preview, sentiment highlight, open in native platform
- Inline actions on mentions: assign, tag, classify, mark as read/important
- Bulk actions: checkbox selection for multi-mention operations
- Real-time updates with subtle animation for new mentions

### Persistent Right Rail
- Top Mentions summary
- Trending Keywords
- Top Authors

## Configuration
- shell: true
