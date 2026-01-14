# Setup Center Specification

## Overview
Setup Center is the foundational configuration hub for Locobuzz CX, designed as a minimal set of setup screens that separate one-time foundational setup from frequent operational configuration. It guides enterprise admins through brand setup with a completion checklist, manages workspace governance, data sources, taxonomy, AI policies, and integrations. Frequent operational configurations (Workflows, Alerts, Publishing Approvals, Queue Management) live in their respective main app modules.

## User Flows
- User lands on Setup Checklist showing all brands with completion status
- User selects a brand to view detailed setup progress across 12 checklist categories
- System highlights "Fix next" recommendation based on highest-impact gaps
- User clicks checklist item to navigate to specific setup page/section
- User completes configuration on targeted page (Workspace & Access, Brands & Channels, etc.)
- System updates checklist completion status in real-time
- User can export setup summary for documentation
- Admin can search across all setup entities globally

## UI Requirements

### Global Layout
- Left sidebar navigation with 8 main pages
- Brand scope indicator (always visible for brand-scoped pages)
- Global search in header (searches across all setup entities)
- Breadcrumb trail: Setup Center > [Page Name] > [Section]
- Audit trail accessible from top-right menu

### Navigation Structure (8 Pages)

**1. Setup Checklist** (Landing Page)
- Brand selector showing all brands with 0-100% completion
- 12 checklist categories per brand:
  1. Brand identity + timezone/languages
  2. Channels connected (owned/public/messaging/reviews/email)
  3. Token health alerts configured
  4. Messaging window channels chosen
  5. Listening queries configured
  6. Competitor set configured
  7. Taxonomy configured (category mapping, aspect groups)
  8. Data model configured (custom fields)
  9. AI Studio configured (enabled features + KB)
  10. Integrations configured
  11. Inbox Ticket Lifecycle configured (in-module link)
  12. Brand Posts publishing governance configured (in-module link)
- "Fix next" recommendation panel
- Deep links to exact page/section for each item
- Export setup summary button (PDF/CSV)
- Validation gates (mark complete only if requirements met)

**2. Workspace & Access**
- Users: invite, create, deactivate, bulk actions, role/brand assignment
- Roles & Permissions: define roles with granular permissions matrix
- Teams: create teams, assign members/supervisors, team permissions
- Calendars: workspace default + team calendars for holidays/working hours
- SSO & Identity: SAML/OIDC config, domain settings, SCIM mapping
- Audit Log: searchable admin action history with exports

**3. Brands & Channels**
- Manage Brands: create, list, archive, timezone/language settings
- Channel Directory: connect/disconnect channels (owned/public/messaging/review/email)
- Channel configuration: ingestion toggles, publishing eligibility, metadata mapping
- Token Health & Alerts: expiry alerts, recipients, thresholds
- Messaging Window Eligibility: select channels for inbox messaging experience
- Location Profiles: create/manage locations, map review pages, bulk import/export

**4. Data Scope**
- Listening Queries: keyword/query sets, include/exclude terms, geo/language filters
- Query testing: preview matches before saving
- Competitor Sets: map brand ↔ competitors for benchmarking
- Logical Grouping: group brands for analytics filters
- Version tracking: audit who changed queries/when

**5. Taxonomy & Data Model**
- Category Mapping: multi-level category tree, keyword auto-tagging rules
- Aspect Group Management: create groups, map aspects, exclusivity rules
- Schema Studio (Unified Custom Fields):
  - Object selector: Author, Ticket, Post, Location, Campaign
  - Field builder: text/number/date/dropdown/multi-select with validation
  - Auto-extraction: regex extraction from mention text (with test tool)
  - Ticket field requirements by lifecycle status
  - Import/export schema with diff preview
- Taxonomy governance: role-based edit permissions, version history

**6. AI Studio**
- Feature toggles: ResponseGenie, Knowledge grounding, Rephrase, Summarization, AI Ticket Intelligence, SignalSense, AgentIQ
- Knowledge Base: add/update sources, versioning, enable/disable
- Guidelines & Guardrails: response tone, compliance rules, channel restrictions
- Confidence thresholds: auto-tagging, signal labeling, actionability assist
- Safety policies: blocked words (or link to Response Governance)
- Feedback loop: capture correct/incorrect tags, helpful/unhelpful suggestions
- Audit: track AI policy/guideline/KB changes

**7. Integrations & Email Routing**
- Integration Hub: connect CRM/work management apps, manage auth/scopes
- Embedded integrations: configure iframe targets (e.g., Salesforce)
- Field mapping: map Locobuzz objects → external fields, dedupe keys
- Email routing: escalation recipients (individual/group), group toggle
- Email whitelist: approved domains/emails, optional denylist
- Escalation reminders: multi-level templates, frequency, stop conditions
- Logs: sync/failure logs, exportable

**8. Usage & Limits**
- Unified consumption view: mentions processed, profiles used, credits consumed
- Breakdowns: by brand, channel, module, time period
- Threshold alerts: warnings at 80/90/100%, configure recipients
- Request more: form to request additional limits/credits/premium modules

### In-Module Admin (Not in Setup Center)
- Inbox → Ticket Lifecycle Admin (7-step stepper):
  1. Ticket Creation (Actionability)
  2. Assignment & Queues
  3. SLA & Calendars
  4. Reopen Rules
  5. Follow-ups & Auto-closure
  6. Dispositions & Closure Policy
  7. Response Governance
- Brand Posts → Publishing Admin (approvals + governance)
- Alerts (main navigation module)
- Workflows (main navigation module)

## Checklist Completion Rules

- **Channels = Complete** if ≥1 ingestion source connected
- **Listening = Complete** if ≥1 active query exists (if listening enabled)
- **Taxonomy = Partial/Complete** if ≥1 category map exists
- **Custom Fields = Complete** if ≥1 ticket field exists OR user confirms none needed
- **AI Studio = Complete** if all enabled features have required prerequisites (e.g., KB added if ResponseGenie enabled)
- **Ticket Lifecycle = Complete** if actionability + queues + SLA + reopen + auto-close + dispositions saved
- **Publishing Admin = Complete** if approvals configured or explicitly set to "no approvals"

## Global Features (All Pages)
- Brand scope indicator: required for brand-scoped pages
- Global search: search entities across all setup pages
- Audit trail: all critical changes logged
- Diff preview: for destructive changes (imports, remaps)
- "Where is this used?" panel: shows usage in Mentions/Inbox/Dashboards/Workflows/Alerts/Brand Posts

## Key Interactions
- Setup Checklist: Click item → Navigate to exact configuration page/section
- Workspace & Access: Invite user → Assign role → Brand access → Send email
- Brands & Channels: Connect channel → OAuth flow → Configure ingestion/publishing → Map metadata
- Data Scope: Create query → Add keywords → Test preview → Save → Version track
- Taxonomy & Data Model: Build category tree → Add auto-tag rules → Test on sample text → Save
- AI Studio: Enable feature → Configure prerequisites (KB/guidelines) → Set thresholds → Save
- Integrations: Select platform → Authenticate → Map fields → Test → Save
- Usage & Limits: View consumption → Set alerts → Request more → Submit

## Display
Inside app shell, accessible from main sidebar (bottom, Settings/gear icon)

## Role-Based Access
- Admins: see all 8 pages
- Team leads: see Setup Checklist, Workspace & Access (limited), Brands & Channels, Data Scope
- Agents/Marketers/Analysts: see Setup Checklist (read-only), Workspace Preferences subset
