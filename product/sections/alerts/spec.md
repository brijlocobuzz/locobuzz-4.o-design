# Alerts Specification

## Overview
Real-time alert management system for monitoring social media metrics, detecting anomalies, and notifying stakeholders of critical brand events. Supports simple threshold alerts, volumetric alerts based on engagement metrics, and smart anomaly detection using statistical deviation analysis.

## User Flows

### Recent Alerts Tab (Primary View)
- View chronological feed of recently triggered alerts with trigger time, alert type, and delivery status
- Filter alerts by date range, alert type, delivery status, and acknowledgment status
- Click alert to open detail panel showing full trigger context, qualifying data, and delivery statistics
- Navigate from alert detail to source data (filtered mention view)
- Mark alerts as acknowledged or dismiss
- Search alerts by name or content

### Alert Settings Tab (Configuration Management)
- View all configured alerts in table format with name, type, module, created date, last triggered time, and active status
- Toggle alerts active/inactive with switch controls
- Edit existing alert configurations (filters, thresholds, delivery settings)
- View performance stats for each alert (trigger frequency, open rates, acknowledgment rates)
- Create new alerts via multi-step form
- Delete or archive unused alerts
- Filter alert configurations by module (Listening/Mentions), type (Simple/Volumetric/Smart), and status (Active/Inactive)

### Alert Creation Flow (6-Step Process)
- Step 1: Enter alert name and select module (Mentions/Listening for modernization)
- Step 2: Choose alert type (Simple, Volumetric, or Smart/Anomaly)
- Step 3: Define filters and conditions (mention filters with volume based on engagement, impressions, reach)
- Step 4: Set thresholds (for Simple/Volumetric) or configure anomaly detection parameters (deviation %, lookback window)
- Step 5: Configure delivery channels (Email, Push, WhatsApp, Slack/Teams/Gchat) and draft message with variables
- Step 6: Review configuration and save

### Alert Detail View
- Display full alert configuration (name, type, filters, thresholds, delivery channels)
- Show qualifying data that triggered the alert (metric values, deviation percentages, context)
- Display delivery status across all channels (sent, opened/read, acknowledged, failed)
- Provide "View Source Data" button to navigate to filtered mentions
- Show historical trigger data for this alert
- Allow quick actions: acknowledge, edit, deactivate, or delete

### Performance Analytics
- Dashboard showing alert effectiveness metrics across all alerts
- Metrics: total triggers, acknowledgment rate, average time to acknowledge, open rates by channel
- Alert-specific performance breakdown
- Trend analysis of alert triggers over time
- Identification of noisy alerts (high trigger frequency, low acknowledgment)

## UI Requirements

### Layout & Navigation
- Two main tabs: "Recent Alerts" and "Alert Settings"
- Global search and filter controls accessible from both tabs
- "Create Alert" button prominently placed in header

### Recent Alerts Feed
- Chronological list of triggered alerts (newest first)
- Each alert card shows:
  - Alert name and type badge
  - Trigger timestamp (relative and absolute)
  - Brief description of trigger condition met
  - Delivery status indicators (opened/read, acknowledged)
  - Quick action buttons (acknowledge, view details, view source)
- Visual indicators for urgency/severity (anomaly alerts highlighted)
- Empty state with helpful guidance when no recent alerts

### Alert Settings Table
- Columns: Alert Name, Type, Module, Created Date, Last Triggered, Status (Active/Inactive), Actions
- Sortable columns
- Active/Inactive toggle switches inline
- Row actions: Edit, View Stats, Duplicate, Delete
- Bulk actions: Activate/Deactivate multiple, Delete multiple
- Filter controls above table for Type, Module, Status

### Alert Creation/Edit Form
- Multi-step wizard with progress indicator
- Step validation before proceeding
- Preview of alert configuration before saving
- Save as draft functionality
- Clear visual differentiation between alert types with descriptions

### Alert Detail Panel
- Slide-out panel or modal overlay
- Sections: Alert Info, Trigger Details, Qualifying Data, Delivery Status, Historical Triggers
- Contextual visualization (trend chart with anomaly marker for Smart alerts)
- Clear call-to-action buttons
- Breadcrumb or close action to return to list

### Performance Analytics Dashboard
- Summary cards for key metrics (Total Alerts, Active Alerts, Avg Acknowledgment Rate)
- Charts showing trigger frequency over time
- Table of top-performing and underperforming alerts
- Filters by date range and alert type

### Alert Type Configurations
- **Simple Alerts:** Single threshold input (e.g., "Mentions > 100")
- **Volumetric Alerts:** Multiple metric selections (Mentions, Engagement, Impressions, Reach) with volume thresholds
- **Smart/Anomaly Alerts:** Deviation percentage slider, lookback window selector (24h/7d), baseline visualization

### Delivery Configuration
- Channel selection checkboxes (Email, Push, WhatsApp, Slack, Teams, Gchat)
- Message composer with variable insertion dropdown
- Preview of delivery message with sample data
- Suppression window controls (prevent re-alerting for X hours)

### Visual Indicators
- Badge colors for alert types (Simple: blue, Volumetric: purple, Anomaly: orange)
- Status icons for delivery (sent checkmark, opened eye icon, acknowledged check-double)
- Severity indicators for anomaly magnitude (high deviation = red, moderate = amber)
- Trend sparklines for historical trigger frequency

## Configuration
- shell: true
