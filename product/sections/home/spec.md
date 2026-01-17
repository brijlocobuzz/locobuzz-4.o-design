# Home Specification

## Overview
Home is a composable, role-based dashboard where users land after login. Rather than a fixed layout, it's a container of pinnable, resizable blocks that surface what needs attention, what changed, and what to do next. Default templates are provided based on user role (Agent, Marketer, Analyst, Admin), with customization allowed within permission boundaries. Each block type has its own customizer for adding/removing content and configuring display. Home also serves as a discovery surface for new knowledge articles and product updates.

## User Flows
- User lands on Home after login, sees their role-based default layout
- User views blocks showing priority items (tickets, alerts, tasks, KPIs, knowledge articles)
- User clicks items within blocks to navigate to relevant sections
- User resizes blocks (GridStack-style drag to resize) — larger blocks show more information
- User opens block customizer to configure the block (add/remove KPIs, change filters, add columns)
- User customizes Home layout by adding, removing, or reordering blocks (if permitted)
- Admin locks specific blocks for compliance/SLA visibility across the org
- User discovers new knowledge articles and product updates via Knowledge Articles block
- User executes quick actions directly from Home (close ticket, create post, run macro)

## UI Requirements

### Layout
- GridStack-style resizable block grid
- Blocks can be dragged to resize — larger blocks display more information (more KPIs, more list rows, more columns)
- Grid-based container where blocks can span 1-3 columns

### Top Strip (Always Visible)
Role-contextual summary row at the top of Home:
- **Agent:** My Work Today (Open/Due/Overdue), SLA Risk (breaching soon), Next Best Action (3-item priority queue with reason)
- **Marketer:** Brand Performance Pulse (reach/impressions/engagement delta), Alerts (spikes/anomalies), Top Content (best 3 posts with "why" signal)

### Block Types & Customization

| Block Type | Description | Customization Options |
|------------|-------------|----------------------|
| **Object List** | Tickets, mentions, posts with saved filters | Add/remove columns, apply filters, choose saved view |
| **KPI Card Row** | Metrics with trend indicators | Add/remove KPIs (permission-driven), resize to fit more cards |
| **Trend Sparkline** | Mini time-series charts | Select metric, time range, comparison period |
| **Alert Feed** | Real-time alerts and anomalies | Filter by alert type, severity, source |
| **Tasks / Approvals** | Action items requiring attention | Filter by status, assignee, due date; add/remove columns |
| **Quick Actions / Macros** | One-click action buttons | Add/remove action buttons, reorder |
| **Pinned Views** | Saved table/board configurations | Select saved view, configure visible columns |
| **AI Insight Block** | Summaries, next steps, anomaly explanations | Choose insight type (summary, next steps, anomalies) |
| **Knowledge Articles** | New/updated articles, product announcements | Filter by category, show new/updated, feature "What's New" |

### Block Customizer
- Each block has a settings panel (gear icon or "Customize" button)
- Opens inline or as a slide-out panel
- Allows configuration without leaving Home

### Permission-Driven Content
- Agents see their own KPIs (personal performance, queue metrics)
- Marketers and Managers see brand-level KPIs (reach, engagement, sentiment)
- Available columns, filters, and KPIs respect user permissions
- Knowledge Articles can be targeted by role/team

### Admin Controls
- Admins can lock specific blocks (visual badge indicator)
- Locked blocks cannot be removed, resized, or reconfigured by users
- Used for compliance, SLA visibility, and org-wide announcements

### Customization Panel
- Slide-out panel to manage Home layout
- Add new blocks from block library
- Remove existing blocks (unless locked)
- Reorder blocks via drag-and-drop
- Access individual block settings

### Empty State
- Guided setup for first-time users
- Suggests blocks based on role
- Quick-start templates to get productive immediately

## Role Templates

### Agent Home (Customer Care)
Goal: "Start work in 10 seconds"
- **Top Strip:** My Work Today, SLA Risk, Next Best Action
- **Blocks:** My Queue (table/list), Task List, Drafts & Pending Approvals, Productivity Snapshot (resolved today, avg first response, backlog delta), Quick Actions (Close, Request details, Escalate, Tag, Run workflow), Knowledge Articles
- **Optional (collapsed):** Quality/Coaching (CSAT trend, audit feedback)

### Marketer Home (Brand / Communication)
Goal: "See what changed, what needs action, what to post next"
- **Top Strip:** Brand Performance Pulse, Alerts, Top Content
- **Blocks:** Performance Overview (KPIs + trends), Alerts & Anomalies Feed, Content Calendar / Upcoming Posts (with gap detection), Top Themes (trending topics, hashtags, audience questions), Quick Actions (Create post, Boost, Generate report, Share snapshot), Knowledge Articles
- **Optional:** Competitor Watchlist

### Analyst Home
- KPI Overview with multiple metrics
- Trend Charts (multi-line comparisons)
- Competitive Snapshot
- AI Insights (automated analysis)

### Admin Home
- Team Performance metrics
- SLA Compliance overview
- System Alerts
- Quick Actions for admin tasks

## Design Principle
Home shows only:
- What needs action
- What changed
- What to do next

Everything else is a click away via the Command Bar or pinned views.

## Configuration
- shell: true
