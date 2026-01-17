# Insights Specification

## Overview
AI-powered qualitative insights dashboard that automatically detects and surfaces trending topics, emerging themes, audience questions, and conversation summaries. Users can explore insights organized by time period, drill down to source mentions, and take action on important trends.

## User Flows
- View insights organized into time-based sections (Today, This Week, This Month)
- Filter insights by type (Trending Topics, Emerging Themes, Audience Questions, AI Summaries)
- Click an insight to open slide-out panel with full details and source mentions
- Save/bookmark important insights for later reference
- Share insights with team members or export for stakeholders
- Create monitoring alerts based on identified trends or themes
- View insight metrics: mention count, sentiment breakdown, trend indicators, top channels

## UI Requirements
- Filterable list layout with type selector (all types, trending topics, emerging themes, questions, summaries)
- Time-based grouping headers: Today, This Week, This Month
- Insight cards displaying: title/summary, mention count, sentiment breakdown (visual bar), trend indicator (up/down arrow with %), top channels (icons)
- Mini charts integrated into cards: sparklines for trends, sentiment distribution bars
- Slide-out detail panel on click showing: full insight details, source mention list, related insights, action buttons
- Action toolbar per insight: bookmark, share, create alert, drill down
- Search bar to find specific insights
- Empty states for each time period when no insights detected
- Visual distinction between insight types (icons, color coding)

## Configuration
- shell: true
