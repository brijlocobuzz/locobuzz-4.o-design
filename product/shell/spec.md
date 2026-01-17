# Application Shell Specification

## Overview
Locobuzz CX uses a hybrid shell pattern with a persistent top bar for global actions and a collapsible sidebar for primary navigation. Certain sidebar items reveal a secondary sidebar for contextual filtering. The interface is desktop-only with a Notion-like composable aesthetic.

## Layout Pattern
**Hybrid: Top Bar + Collapsible Sidebar + Optional Secondary Sidebar**

```
┌─────────────────────────────────────────────────────────────────┐
│  Logo   │  Brand Switcher  │  ⌘K Command Bar  │     User Menu   │  ← Top Bar
├─────┬───┴──────────────────┴──────────────────┴─────────────────┤
│     │                                                           │
│ Nav │  Secondary   │         Content Area                       │
│     │  Sidebar     │                                            │
│     │  (optional)  │                                            │
│     │              │                                            │
└─────┴──────────────┴────────────────────────────────────────────┘
```

## Top Bar

### Components (left to right)
1. **Logo** — Locobuzz CX wordmark/icon
2. **Brand Switcher** — Dropdown to switch between monitored brands
3. **Command Bar** — Universal launcher (⌘/Ctrl+K)
   - Search across all objects (mentions, tickets, contacts, posts)
   - Jump to any section or view
   - Create new items (ticket, post, workflow)
   - Run actions/macros
   - Ask AI questions about data
4. **User Menu** — Avatar, name, dropdown with profile, preferences, logout

## Main Sidebar (Primary Navigation)

Collapsible to icons only. Sections in order:

| Icon | Label | Behavior |
|------|-------|----------|
| 🏠 | Home | Composable role-based home (no secondary) |
| 💬 | Mentions | Raw mention stream (no secondary) |
| 📥 | Inbox | Opens secondary sidebar with ticket filters |
| 📝 | Brand Posts | Opens secondary sidebar with channel filters |
| 🔔 | Alerts | Alert feed (no secondary) |
| ⚡ | Workflows | Workflow builder/list (no secondary) |
| 💡 | Insights | Qualitative insights (no secondary) |
| 📊 | Dashboards | Analytics and reports (no secondary) |
| 🤖 | Chat with Data | AI-powered data exploration (no secondary) |
| ⚙️ | Settings | Configuration (positioned at bottom) |

### Sidebar States
- **Expanded:** Icon + label visible
- **Collapsed:** Icons only, labels appear on hover as tooltip
- **Toggle:** User can collapse/expand via button or keyboard shortcut

## Secondary Sidebar

Appears when certain primary nav items are selected. Provides contextual filtering.

### Inbox Secondary Sidebar
Filters for ticket management:

**Filtered Views**
- New Tickets
- Open Tickets
- Recently Closed

**Assignment**
- Assigned to Me
- Assigned to My Team
- Unassigned

**Custom Queues**
- List of user-defined queues
- Each shows queue name + count badge
- Clicking filters the ticket list

### Brand Posts Secondary Sidebar
Filters for content management:

**Channel Filters**
- All Channels
- Facebook
- Instagram
- Twitter/X
- LinkedIn
- Google Business
- (Other connected channels)

## Home (Composable Dashboard)

Home is not a fixed dashboard screen. It's a layout container where users pin blocks.

### Behavior
- Default landing = My Home
- Template selected by:
  - User role (Agent / Marketer / Analyst / Admin)
  - Enabled modules (Care / Communication / Insights)
  - Brand/workspace context
- Users can customize (add/remove/reorder blocks) if permitted
- Org admins can lock compliance/SLA blocks

### Agent Home (Customer Care Role)
Goal: "Start work in 10 seconds"

**Top Strip (always visible)**
- My Work Today: Assigned tickets (Open / Due / Overdue)
- SLA Risk: Count of tickets breaching soon (30/60/120 mins)
- Next Best Action: 3-item priority queue with reason

**Core Blocks**
- My Queue (table/list with filters: assigned to me, awaiting response, due today)
- Task List (ticket tasks + follow-ups, quick complete/reassign)
- Drafts & Pending Approvals
- Productivity Snapshot (resolved today, avg first response, backlog delta)
- Quick Actions (macro buttons: Close, Request details, Escalate, Tag, Run workflow)

**Optional (collapsed by default)**
- Quality/Coaching: CSAT trend, audit feedback, suggested improvements

### Marketer Home (Brand / Communication Role)
Goal: "See what changed, what needs action, what to post next"

**Top Strip**
- Brand Performance Pulse: reach/impressions/engagement delta
- Alerts: spikes in mentions/negative sentiment/campaign anomalies
- Top Content: Best 3 posts with "why" signal

**Core Blocks**
- Performance Overview (KPIs + trends)
- Alerts & Anomalies Feed
- Content Calendar / Upcoming Posts (with gap detection)
- Top Themes (trending topics, hashtags, audience questions)
- Quick Actions (Create post, Boost, Generate report, Share snapshot)

**Optional**
- Competitor Watchlist block

## Block Primitives (Composable Building Blocks)

These blocks are the LEGO pieces for building any Home:

| Block Type | Description |
|------------|-------------|
| Object List | Tickets/mentions/posts with saved filters |
| KPI Card Row | Metric cards with trend indicators |
| Trend Sparkline | Mini charts for time-series data |
| Alert Feed | Real-time alerts and anomalies |
| Tasks / Approvals | Action items requiring attention |
| Quick Actions / Macros | One-click action buttons |
| Pinned Views | Saved table/board configurations |
| AI Insight Block | Summary, next steps, anomaly explanations |

### Home Design Principle
Home shows only:
- What needs action
- What changed
- What to do next

Everything else is a click away via Command Bar or pinned views.

## Design Notes

### Visual Style
- Neutral CRM aesthetic with indigo accents
- Clean borders, minimal shadows
- Inter font family throughout
- Consistent 8px spacing grid

### Interaction Patterns
- Sidebar collapse/expand with smooth animation
- Secondary sidebar slides in from left
- Command bar opens as centered modal overlay
- Brand switcher as dropdown with search

### Desktop Only
This application is designed for desktop web browsers only. No tablet or mobile responsive layouts are required.
