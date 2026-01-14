# Dashboards Specification

## Overview
BI-like composable dashboard system where users create widgets (charts, KPI cards, pivot tables, AI-generated text insights) in a separate widget builder, then compose dashboards by adding, arranging, and resizing widgets. Dashboards support global filters, drill-down to deep dive dashboards, and AI-powered text widgets that analyze connected data widgets.

## User Flows
- View last accessed dashboard with persistent sidebar showing all dashboards
- Create widgets in separate widget builder (chart types: line, bar, pie, graph, cluster, Sankey, pivot tables, data grids, KPI cards, text widgets)
- Create new dashboard and add widgets from saved widget library
- Arrange widgets via drag-and-drop and resize on dashboard canvas
- Apply global filters (time range, channels, sentiment) that update all widgets
- Configure AI text widgets by drawing visual connection lines to data widgets and writing LLM prompts
- Right-click widgets to configure deep dive dashboard (default provided by LocoBuzz, customizable)
- Click widgets to drill down into configured deep dive dashboards
- Share dashboards with users/teams with view/edit permissions
- Generate public shareable links for external stakeholders
- Export dashboards as PDF/image
- Schedule automated email reports with dashboard snapshots

## UI Requirements
- Landing view: Last viewed dashboard with persistent sidebar listing all dashboards
- Dashboard sidebar: List of all dashboards, create new dashboard button, search/filter dashboards
- Dashboard canvas: Drag-and-drop grid layout, widget resize handles, snap-to-grid positioning
- Global filter bar: Time range picker, channel selector, sentiment filter, custom filters
- Widget display: Title, description, 3-dot action menu (edit, duplicate, delete, configure deep dive, refresh)
- Dashboard header: Dashboard title, description field, edit/share/export buttons
- Widget builder (separate page): Widget type selector, configuration panel, data source selector, preview, save to library
- Widget library: Browse saved widgets, search, filter by type, add to dashboard button
- AI text widget configuration: Visual connection lines from text widget to data widgets, LLM prompt editor, preview generated insight
- Deep dive configuration: Right-click context menu on widgets, dropdown to select target dashboard
- Share modal: User/team selector, permission levels (view/edit), public link generator, schedule email reports setup
- Export options: PDF, PNG, scheduled reports configuration

## Configuration
- shell: true
