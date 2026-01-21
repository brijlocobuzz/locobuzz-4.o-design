# Inbox Specification

## Overview
Inbox is an agent-first ticket management workspace designed to minimize time-to-safe-reply for social customer care. It follows a clear mental model: find (left sidebar views/queues) → decide (main worklist) → respond (slide-in panel) without losing place. The system handles the complexity of social context (channel variants, author influence, conversation threading) while keeping the agent focused on next best work through intelligent triage, AI-assisted composition, and decision-critical signals.

## North Star Principle
Every UI element must minimize time-to-safe-reply by improving speed, correctness, or confidence.

## User Flows

### Finding & Navigation
- User lands on Inbox and sees prioritized worklist based on default view (e.g., "Needs Reply" or "Assigned to Me")
- User navigates via left sidebar: Status filters (New, Open, Pending, Resolved, Recently Closed), Assignment filters (Assigned to Me, My Team, Unassigned), SLA/Priority views (Overdue, Due Soon <60m, High Priority, VIP/High Impact), Custom saved queues
- User searches globally (ticket ID, author handle, phone/email, keywords, tags, channel, assigned agent) with advanced syntax (AND/OR, has:attachment, sentiment:negative, SLA:<60m, priority:high)
- User saves frequently used searches for quick access
- User sorts by SLA urgency, priority, impact score, influencer risk, last activity
- User switches between three display modes with clear hierarchy: Compact List (primary, default for agents), Detailed Cards (supervisors/QA/escalations), Table View (ops/reporting)

### Triage & Decisioning
- User reviews "Triage" view showing tickets that need action with "reason surfaced" (e.g., "Breaching in 15m", "VIP + Negative sentiment", "New complaint on public post")
- User sees decision-critical signals in compact list: Reply needed indicator, SLA countdown timer, Priority/VIP badge, Channel + interaction type, Summary chip (e.g., "Complaint • Delivery • Negative")
- User hovers for additional context (full author stats, all enrichment tags, engagement metrics)
- User opens ticket in slide-in side panel to view full context

### Responding & Collaboration
- User clicks ticket to open slide-in panel showing: Full conversation thread (chronological with all mentions and replies), Customer context panel (contact profile, computed Impact/Risk score, social cloud breakdown, ticket history), AI suggestions with confidence indicators and "why this", Action toolbar
- User composes reply using inline composer with: Draft autosave, Template variables, Language detection + translate, Tone controls (formal/apologetic/firm), Policy checks (restricted phrases, compliance), AI assist with guardrails
- User chooses between public reply or internal note (with @mentions for collaboration)
- User sets handoff states: Waiting on internal, Waiting on customer, Pending approval
- User follows approval workflow (if required): Draft → Approve → Send
- User performs quick actions: Close, Assign (supervisor-only), Send to team, Add tags, Create task, Escalate, Pop out to full page (for complex cases)
- User provides AI feedback: 👍👎 on suggestions, "Wrong intent", "Sentiment incorrect" to improve future suggestions

### Bulk Operations
- User selects multiple tickets via checkboxes
- User applies bulk actions: Assign, Close, Tag, Change status, Update priority, Mark as read

### Thread & Conversation Management
- System defines tickets as: Single mention OR full conversation thread (DM exchanges, comment threads with replies) OR bundled mentions from same author within time window
- System merges related mentions from same author automatically with option to split/unlink
- System handles re-open when customer replies after resolved (reopens with "Customer replied" flag)
- System detects duplicates (same content across channels) and flags for agent review

## UI Requirements

### Left Sidebar (Find)
- Collapsible secondary navigation with view categories
- **Triage Section**: Needs Reply, Breaching Soon, New VIP Negative
- **Status Filters**: New, Open, Pending, Resolved, Recently Closed
- **Assignment Filters**: Assigned to Me, My Team, Unassigned, Assigned to Others
- **SLA/Priority**: Overdue, Due Soon (<1 hour), High Priority, High Impact Customers
- **Custom Queues**: User-created saved filters with custom names
- Active view highlighted

### Search Bar (Top of Main Area)
- Global search with autocomplete
- Advanced syntax support: AND/OR, has:attachment, sentiment:negative, SLA:<60m, channel:instagram, priority:high
- Search within current view toggle
- Recent searches dropdown
- Saved searches management

### Main Worklist Area (Decide)

#### Display Mode Hierarchy

**1. Compact List (Primary/Default)** - For high-throughput agents and triage
- Dense rows showing decision-critical signals only:
  - Author avatar (prominent) + name
  - Reply needed indicator (red dot)
  - SLA countdown (color-coded: green >2h, yellow <1h, red breached)
  - Priority/VIP/High Impact badge
  - Channel icon + interaction type (Post, Comment, DM, Story, etc.)
  - Summary chip: "Complaint • Delivery • Negative" (one synthesized insight)
  - Message snippet (truncated)
  - Timestamp
- Hover reveals: Full author stats, all enrichment tags, engagement metrics
- Click opens slide-in panel

**2. Detailed Cards (Specialized)** - For supervisors, QA, escalation review
- Larger cards with full context visible:
  - All decision-critical signals from compact view
  - Full customer cloud stats and impact score breakdown
  - Full message preview (not truncated)
  - All enrichment tags visible (sentiment, intent, aspects, signals)
  - Engagement metrics displayed
  - Reply status and history
- Use case: Quality review, complex escalations, coaching

**3. Table View (Specialized)** - For ops, supervisors, reporting workflows
- Airtable-style customizable columns
- Users choose visible fields: Author, Channel, Sentiment, Intent, SLA, Reply Status, Priority, Assigned To, Tags, etc.
- Sortable by any column
- Filterable inline
- Column reordering via drag-and-drop
- Save column configurations per user
- Use case: Data analysis, batch operations, reporting

#### Display Mode Switcher
- Toggle in toolbar with icons
- Compact List is default and recommended for most users
- Clear labels for specialized use cases

### Ticket Information (Decision-Critical Signals)
- Author display picture (prominent, large in all views)
- Author name and username
- **Computed Impact/Risk Score** (blends: follower count, engagement velocity, sentiment severity, verified status, brand-defined VIP mapping)
  - Drill-down shows: Follower count breakdown, engagement rate, previous interactions, VIP tier
- Channel icon with clear visual distinction
- Interaction type chip with color coding: Post (blue), Comment (purple), Tagged Comment (purple + @), DM (green), Story Mention (orange), Collaboration (teal)
- Summary chip: One synthesized insight combining intent + aspect + sentiment (e.g., "Complaint • Delivery • Negative")
- Reply status: Not replied (red), Replied (green), Pending approval (yellow)
- Unread message count badge
- SLA status: Color-coded badge with countdown timer
  - Green: >2 hours remaining
  - Yellow: <1 hour remaining (shows "Due in 45m")
  - Red: Breached (shows "Breached 2h ago")
- Priority badge (High/Medium/Low)
- Last seen by: Contextual display
  - In detail panel: Always show
  - In list: Only show when relevant ("Seen by others but not acted on", "Handoff pending")

### Slide-in Side Panel (Respond)

#### Panel Layout (Three Zones)

**1. Top: Action Toolbar**
- Primary: Reply (opens inline composer)
- Secondary: Assign, Close, Send to Team, Add Tags, Create Task, Escalate
- Utility: Pop out to full page, Refresh, Close panel

**2. Middle: Scrollable Content**

**Conversation Thread (Left 60%)**
- Chronological display of all mentions and replies
- Visual distinction: Customer mentions (left, with avatar), Agent replies (right, with agent avatar), AI-generated replies (right, with AI badge)
- Thread grouping for comment chains
- Attachment previews (images, videos inline)
- Timestamp on hover
- Internal notes (yellow highlight, lock icon, only visible to team)

**Customer Context Panel (Right 40%)**
- Contact profile card: Name, avatar, verified status
- **Impact/Risk Score** (computed, prominent)
  - Expandable breakdown: Follower count, engagement rate, sentiment history, VIP tier, previous escalations
- Social cloud stats: Followers, posts, engagement rate
- Ticket history: Previous interactions count, last contact date, resolution rate
- **AI Insights Section**:
  - Recommended responses with confidence indicators ("High confidence: 92%")
  - "Why this suggestion" explanation
  - Sentiment trends (if multiple interactions)
  - Knowledge article suggestions with relevance score
  - Similar tickets handled recently
- Feedback buttons: 👍👎 on each suggestion, "Wrong intent", "Sentiment incorrect"

**3. Bottom: Inline Composer (Fixed)**
- **Public Reply vs Internal Note toggle** (prominent, default to public reply)
- Rich text editor with formatting toolbar
- **Composition Controls**:
  - Template selector (dropdown with search)
  - Template variables with autocomplete (@{customer_name}, @{product_name})
  - Language detection + Translate button
  - Tone selector: Formal, Apologetic, Firm, Friendly (adjusts AI suggestions)
  - AI Assist button with guardrails dropdown: "Use knowledge base only", "Use past replies only", "Do not hallucinate"
  - Policy checker (real-time): Highlights restricted phrases, compliance issues
  - Attachment upload
  - Emoji picker
- **Draft autosave** (indicator shows "Saved 2s ago")
- **Send button** (primary) or "Submit for Approval" (if workflow requires)
- **Internal note features** (when toggle active):
  - @mention team members for collaboration
  - Notification on @mention
  - Visible only to internal team (lock icon reminder)

### Pop-out Full Page Mode
- For complex tickets (multi-thread, multiple stakeholders, long history, many attachments)
- Same layout as slide-in but uses full screen width
- "Back to list" button returns to worklist with panel closed

### Bulk Actions Toolbar
- Appears at top when tickets selected
- Shows selection count: "5 tickets selected"
- Actions: Assign to..., Close, Add tag..., Change status..., Update priority..., Mark as read
- Clear selection button

## Conversation & Thread Rules

### Ticket Definition
- **Single Mention**: One social post/comment/DM directed at brand
- **Conversation Thread**: Multi-message DM exchange OR comment thread with replies (treated as one ticket)
- **Bundled Mentions**: Multiple mentions from same author within 24-hour window (auto-merged, splittable)

### Merge Logic
- System auto-merges when: Same author + same channel + within 24h window + no resolution between
- Agent can manually split/unlink merged tickets
- Merge history shown in ticket timeline

### Re-open Handling
- If customer replies after "Resolved", ticket auto-reopens with flag: "Customer replied after resolution"
- Resets SLA timer to "First Response" countdown
- Notifies previously assigned agent

### Duplicate Detection
- System flags potential duplicates: Same content posted across multiple channels, Same content from different authors (copy-paste campaigns)
- Agent reviews flagged duplicates and chooses: Merge, Link as related, or Dismiss flag
- Prevents duplicate responses to same issue

## Collaboration & Workflow

### Internal Notes
- Toggle to switch from public reply to internal note
- Internal notes visible only to team (permission-based)
- @mention team members (triggers notification)
- Use cases: Ask for help, document decision, add context, request approval

### Handoff States
- Ticket status can include sub-states:
  - **Waiting on Internal**: Pending input from another team (shows in "Pending" filtered view)
  - **Waiting on Customer**: Reply sent, awaiting customer response (SLA paused per rules)
  - **Pending Approval**: Draft created, awaiting supervisor approval before send
- Handoff states visible as badges in list and detail view
- Filters available for each handoff state

### Approval Workflow (Enterprise/Regulated Brands)
- Configurable per brand/channel/ticket type
- Flow: Agent creates draft → Submit for approval → Supervisor reviews → Approve/Reject → Send
- Approval requests appear in supervisor queue
- Draft visible to supervisor with "Approve/Reject with feedback" buttons
- Rejected drafts return to agent with feedback note

## SLA Policy Model

### SLA Types
- **First Response SLA**: Time from ticket creation to first agent reply
- **Resolution SLA**: Time from ticket creation to ticket closure
- Separate timers for each type

### SLA Configuration
- Per channel (Instagram SLA ≠ Email SLA)
- Per ticket type (DM faster than public comment)
- Per priority (High priority tighter SLA)
- Per VIP/Impact tier (VIP customers get priority SLA)

### SLA Pause Rules
- Pause when status = "Waiting on Customer"
- Pause when status = "Waiting on Internal" (configurable)
- Pause outside business hours (configurable, with timezone handling)
- Pause on weekends/holidays (brand calendar-based)

### Breach Handling
- Auto-escalate breached tickets to supervisor queue
- Notify supervisor via real-time alert (in-app + optional email/Slack)
- Reprioritize breached tickets to top of "Overdue" view
- Visual indicator (red badge) in all views

### SLA Display
- In list views: Color-coded badge with countdown
  - Green: >2h remaining ("Within SLA")
  - Yellow: <1h remaining ("Due in 45m")
  - Red: Breached ("Breached 2h ago")
- In detail panel: Full SLA breakdown showing both First Response and Resolution timers, pause history, breach reason if applicable

## Permissions & Audit Trail

### Role-Based Access Control (RBAC)
- **Agent**: View assigned tickets, reply, add tags, create tasks, close own tickets
- **Supervisor**: View all team tickets, assign, reassign, close any ticket, override AI labels, change priority/SLA, approve replies
- **Admin**: All supervisor permissions + manage users, configure SLA policies, configure AI rules, access audit logs
- **Quality Analyst**: Read-only access to tickets and replies, cannot modify

### Ticket-Level Audit Log
- Tracks all changes: Assignment changes (who assigned to whom, when), Status changes, Priority/SLA overrides, Tag additions/removals, AI label overrides, Replies sent (with template used if applicable), Edits to tickets or replies, Deletions (with reason), Internal notes added
- Audit log accessible in detail panel under "History" tab
- Exportable for compliance reporting

### Data Masking & Access Controls
- PII masking based on user role (phone numbers, email addresses redacted for agents, visible to supervisors)
- Access controls per brand/location (agents only see tickets for brands/locations they're assigned to)
- Compliance mode: Additional logging and approval workflows for regulated industries (BFSI, healthcare)

## AI UX: Confidence, Explainability, Feedback

### AI Suggestions with Transparency
- Each AI-generated suggestion shows:
  - **Confidence indicator**: High (>80%), Medium (50-80%), Low (<50%)
  - **"Why this suggestion"** explanation: "Based on 15 similar tickets resolved with positive customer feedback"
  - **Source attribution**: "From Knowledge Article: Returns Policy" or "Similar to reply by @agent_name on 12/15"

### Agent Feedback Loop
- 👍👎 buttons on each AI suggestion (quick feedback)
- Detailed feedback options: "Wrong intent detected", "Sentiment incorrect", "Suggestion not helpful", "Tone mismatch"
- Feedback captures context and improves future suggestions
- System shows "Thank you, this helps improve AI" confirmation

### Human Override
- Agents can override AI-detected sentiment, intent, or aspect labels
- Override is logged and used to retrain models
- Overridden labels visually distinguished (e.g., "Sentiment: Negative (AI) → Positive (Agent override)")

### AI Guardrails (User-Configurable)
- "Use knowledge base only" - AI pulls only from approved articles
- "Use past replies only" - AI suggests based on historical agent responses
- "Do not hallucate" - AI restricted to factual retrieval, no generative suggestions
- "Tone enforcement" - AI respects brand voice guidelines
- Guardrails selectable per reply in composer dropdown

## Error States & Real-Time Handling

### Concurrent Edit Detection
- If ticket updated by another user while agent is viewing:
  - Real-time notification banner: "This ticket was updated by @agent_name 10s ago"
  - "Refresh to see latest" button
  - Warning before sending reply: "Ticket may have changed, review before sending"

### Reply Failures & Recovery
- If reply send fails (API error, rate limit, network issue):
  - Error toast: "Reply failed to send. Reason: [API error message]"
  - Draft auto-saved locally
  - "Retry" button available
  - Partial send handled: If posted to some channels but not others, show "Sent to Instagram, failed on Facebook - Retry Facebook?"

### Deleted/Unavailable Content
- If user deleted comment/post after ticket created:
  - Ticket remains accessible with banner: "Original post deleted by author"
  - Conversation thread shows "[Deleted content]" placeholder
  - Agent can still close ticket with internal note

### User Blocked/Unavailable
- If customer blocked brand or deleted account:
  - Banner: "User has blocked this page" or "User account deleted"
  - Reply composer disabled with explanation
  - Ticket auto-closable with reason "User unavailable"

### Rate Limits
- If channel API rate limit hit:
  - Toast notification: "Instagram rate limit reached. Retry in 15 minutes."
  - Queued replies shown with "Pending send" status
  - Auto-retry when rate limit resets

### Network Disconnection
- If user loses connection:
  - Persistent banner: "You are offline. Drafts will save locally and sync when reconnected."
  - Draft autosave continues locally
  - Auto-sync when connection restored

## Ticket Type Variations

The Ticket Detail View must handle four distinct ticket type variations, each with unique conversation patterns, metadata, and UI requirements. The base three-column layout (queue sidebar + conversation thread + context panels) remains consistent across all variations, but the conversation thread rendering and metadata display adapt to the ticket type.

### Variation 1: Email Tickets

**Purpose**: Handle formal customer support emails with traditional email threading, subject lines, and quoted replies. Must address edge cases common in email help desk systems including long threads, mixed content, multiple participants, and attachment management.

**Platform**: `email`
**Interaction Type**: `email`

#### Unique Characteristics
- **Email header metadata**: Subject line, From, To, CC, BCC fields
- **Thread-based conversation**: Long back-and-forth exchanges with quoted reply chains
- **Formal tone default**: AI suggestions and templates optimized for professional email communication
- **HTML rendering**: Support for rich HTML emails with inline images and formatting
- **Attachment prominence**: Email attachments are common and should be clearly displayed
- **Multiple participants**: Threads may involve multiple participants beyond primary customer
- **System messages**: Auto-responders, out-of-office, delivery notifications mixed with real communication

#### UI Requirements

**Email Header Component** (displays at top of conversation thread):
- Subject line (prominent, h3 size, editable on click for agents with permission)
- From: Customer name + email address (clickable to view contact profile)
- To: Brand support email (may show multiple recipients)
- CC/BCC: If present, show collapsed with "Show CC/BCC (3)" toggle
  - **Edge case handling**: When expanded, clearly distinguish To vs. CC vs. BCC with colored badges
  - **Participant role indicators**: Primary customer (blue), CC'd stakeholder (gray), internal CC (yellow)
- Date/Time: Full timestamp with timezone
- Platform badge: "Email" with envelope icon
- **No-reply address warning**: If sender is no-reply@*, show warning banner: "⚠️ This is a no-reply address. Customer cannot receive responses. Alternative contact: [suggest phone/other channel from contact profile]"

**Thread Navigation & Management** (for long threads):
- **Thread timeline navigator**: Vertical timeline on left edge showing:
  - Chronological dots for each email in thread
  - Current position indicator (highlighted dot)
  - Click dot to jump to that email
  - Unread messages shown with blue dot, read with gray dot
- **Collapsible email groups**:
  - Emails older than 7 days auto-collapsed with header: "Earlier messages (12) - Click to expand"
  - Agent can manually collapse/expand any email
  - Keyboard shortcuts: `c` to collapse, `e` to expand, `j/k` to navigate up/down thread
- **Thread summary panel** (optional toggle):
  - AI-generated summary: "23 emails over 14 days about order cancellation request"
  - Key participants: Shows avatars of all participants with message count per person
  - Important dates: First contact, last reply, resolution date
  - Attachment count: "5 files shared in this thread - View all"
- **Quick jump actions**:
  - "Jump to first unread" button (always visible at top)
  - "Jump to latest" button (when scrolled up in long thread)
  - "Jump to first message" button

**Conversation Thread Rendering**:

**Standard Email Display**:
- Each email is a card with subtle shadow and border
- Spacing: 16px between emails
- **Email card header**:
  - Avatar (left) + Name + Email address + Timestamp (right)
  - Role badge: "Customer" (blue), "Agent" (indigo), "CC" (gray), "Internal" (yellow)
  - Actions menu (three dots): Forward, Mark important, View original, Copy email address
- **Email card body**:
  - Content rendering based on type (see Mixed Content Display below)
  - Quoted replies section (collapsed by default)
  - Attachments section (if any)
  - Signature section (auto-detected and collapsed)

**Mixed Content Display**:
- **HTML emails**:
  - Render with sanitized HTML (strip scripts, dangerous tags)
  - Maintain basic formatting: bold, italic, lists, tables, colors
  - Inline images: Display with max-width constraint, clickable to expand
  - External images: Show "Load images from external sources" opt-in button for privacy
  - Complex layouts: If layout breaks, show "View in simplified mode" toggle to render as plain text
- **Plain text emails**:
  - Preserve whitespace and line breaks
  - Detect and linkify URLs, email addresses
  - Monospace font option toggle for technical content
- **View mode toggles** (per email):
  - "View Original" button: Shows raw email source in monospace modal
  - "Simplified View" button: Strips all formatting, shows plain text only
  - "Print-friendly View" button: Clean version for printing/PDFs

**Quoted Reply Handling**:
- **Auto-detection**: System detects quoted content via ">" prefix, "On [date], [person] wrote:", HTML blockquote
- **Collapsed by default**: Show only first line of quoted content with "Show previous message" button
- **Nested quotes**: Visual nesting with left border colors:
  - Level 1: Blue border
  - Level 2: Purple border
  - Level 3+: Gray border with "Older messages" label
- **Expand/collapse all**: Toggle at top of email to "Expand all quotes" or "Collapse all quotes"

**Signature Detection & Handling**:
- **Auto-detection**: Identify signatures via common patterns ("--", "Sent from", "Best regards,", legal disclaimers)
- **Collapsed by default**: Show "Show signature" toggle
- **Signature content**:
  - Customer signatures: Collapsed, less prominent
  - Agent signatures: Expanded by default (may contain important contact info)
  - Legal disclaimers: Collapsed with "Legal disclaimer" label

**Multiple Participant Management**:
- **Participant overview panel** (collapsible sidebar within thread area):
  - **Trigger**: "See all participants (5)" button at top of thread
  - **Panel content**:
    - List of all participants with avatars
    - Role for each: Primary customer, CC'd contact, Internal team member
    - Message count per participant (e.g., "John: 8 messages, Sarah (Agent): 6 messages")
    - Last activity timestamp per participant
    - "Focus on [participant]" filter: Highlights only messages from selected participant
- **Visual hierarchy in thread**:
  - **Primary customer**: Strongest visual weight (larger avatar, blue border on card)
  - **CC'd participants**: Medium weight (smaller avatar, gray border)
  - **Internal participants**: Yellow background, lock icon, "(Internal)" label
  - **System messages**: See System Messages section below

**Attachment Handling**:
- **Attachment management panel** (toggle):
  - **Trigger**: "View all attachments (12)" button at top of thread
  - **Panel content**:
    - Grid view of all attachments across entire thread
    - Filters: By type (Images, Documents, Spreadsheets, Other), By sender, By date
    - Search: Filename search
    - Actions: Download all, Download selected, Preview
    - Metadata: Filename, Type, Size, Sender, Date attached
- **Per-email attachments**:
  - Display in attachment section at bottom of email card
  - **Previews**:
    - Images: Thumbnail preview (120x120px), click to expand
    - PDFs: First page thumbnail, "View PDF" button
    - Documents: Icon + filename, "Preview" button if supported
    - Other: Generic file icon + filename
  - **Metadata**: Filename, Size, Type
  - **Actions**: Download, Preview (if supported), Share link
- **Performance optimization**:
  - Lazy load: Don't load attachment previews until email is scrolled into view
  - Thumbnail generation: Server-side thumbnail generation for large files
  - Download warning: If attachment > 10MB, show size warning before download

**System Messages vs. Customer Communication**:
- **System message detection**:
  - Auto-detect: "Out of Office", "Delivery Status Notification", "Auto-reply", "Undeliverable", "Bounce"
  - Manual label: Agent can mark message as system message
- **Visual distinction**:
  - System messages: Light gray background, smaller card, italic text
  - Icon indicator: Gear icon for auto-replies, airplane icon for OOO, warning icon for bounces
  - Collapsed by default: Show header only: "Out of Office - [Name]" with "Show message" toggle
  - Can be hidden: "Hide system messages" toggle at top of thread (default: show)
- **System activity log** (optional panel):
  - Separate tab in right sidebar: "Activity Log"
  - Shows all system events: Email delivered, Bounced, Opened (if tracking enabled), Link clicked, Auto-responder sent
  - Timeline view with icons and timestamps
  - Filterable: By event type

#### Reply Interface Edge Cases

**Reply Recipient Management**:
- **Recipient selector UI**:
  - **To field**:
    - Pre-populated with customer's email
    - Chip-style display for multiple recipients
    - Red warning if no-reply address: "Cannot send to no-reply@example.com - Remove or add valid address"
  - **CC field**:
    - Collapsed by default, "Add CC" button to reveal
    - When expanded, shows chip-style input
    - Warning if adding external CC: "⚠️ You're adding an external contact to CC. Confirm?"
  - **BCC field**:
    - Collapsed by default, "Add BCC" button to reveal
    - Internal-only usage warning: "BCC is for internal recipients only"
- **Reply All safeguards**:
  - **Reply vs. Reply All toggle**: Prominent, mutually exclusive buttons
  - **Reply All confirmation modal** (if >3 recipients):
    - "You're about to send to 8 people. Are you sure?"
    - Shows list of all recipients with checkboxes to exclude
    - Option: "Always reply to primary customer only" preference
  - **External recipient warning**:
    - If Reply All includes external domains: "This thread includes external contacts: john@competitor.com. Reply All anyway?"
- **Recipient validation**:
  - Real-time validation: Red underline for invalid email format
  - No-reply detection: Auto-warn and suggest removing no-reply addresses
  - Duplicate detection: Prevent adding same recipient twice

**Internal vs. External Communication**:
- **Distinct visual modes**:
  - **External Reply mode** (default):
    - Blue composer border
    - "Reply to Customer" header in blue
    - Warning reminder: "This will be sent to the customer"
    - Subject line shown (editable)
    - To/CC/BCC fields visible
  - **Internal Note mode**:
    - Yellow composer border
    - "Internal Note" header in yellow with lock icon
    - Prominent reminder: "⚠️ INTERNAL ONLY - Not sent to customer"
    - No subject line (not an email)
    - Recipients: Internal team members only, with @mention support
- **Mode toggle**:
  - Tab-style toggle at top of composer: "Reply to Customer" vs. "Internal Note"
  - Color-coded: Blue vs. Yellow
  - Keyboard shortcut: `Alt+I` to switch to internal, `Alt+R` to switch to reply
- **Send safeguards**:
  - **Confirmation modal for external replies**:
    - "Send to [customer email]?" with preview of recipients
    - "Cancel" vs. "Send" buttons
  - **No confirmation for internal notes** (faster workflow)
  - **Accidental mode detection**:
    - If content includes phrases like "internal", "don't tell customer", warn: "This looks like an internal note. Are you sure you want to send it externally?"

**Rich Text Composition**:
- **Formatting toolbar** (for external replies):
  - **First row (common)**: Bold, Italic, Underline, Strikethrough, Link, Bullet list, Numbered list
  - **Second row (advanced)**: Font size, Text color, Background color, Alignment, Indent, Outdent
  - **Third row (insert)**: Attachment, Image, Table, Horizontal line, Code block
  - **Toggle**: "Show advanced formatting" to reveal second/third rows
- **Keyboard shortcuts**:
  - Cmd+B: Bold, Cmd+I: Italic, Cmd+K: Link, Cmd+Shift+7: Numbered list, Cmd+Shift+8: Bullet list
  - Displayed in tooltips on hover
- **Consistency features**:
  - **Brand templates**: Dropdown to insert pre-approved email templates
  - **Signature insertion**: "Insert signature" button to add agent's signature at cursor
  - **Variable support**: `{{customer_name}}`, `{{order_number}}` auto-populated from ticket data
- **Preview mode**:
  - "Preview" tab next to "Compose" tab
  - Shows how email will appear in common email clients (Gmail, Outlook)
  - Warns if formatting may break in plain text clients
- **Attachment support**:
  - **Drag & drop**: Drop files anywhere in composer to attach
  - **Click to upload**: Paperclip icon opens file picker
  - **Attachment list**: Shows attached files with remove (X) button
  - **Size warning**: If total attachments > 25MB, warn about email size limits
  - **Inline images**: Option to insert image inline vs. as attachment

**No-Reply Address Detection**:
- **Early warning system**:
  - **Ticket creation stage**: If incoming email is from no-reply@*, flag ticket with warning badge
  - **Worklist indicator**: Ticket card shows orange "No-reply source" badge
  - **Thread view banner**: Top of thread shows: "⚠️ This ticket originated from a no-reply address. Customer cannot receive email replies."
- **Alternative contact suggestions**:
  - **Automatic suggestion**: System checks contact profile for alternative email, phone, social handles
  - **Suggestion UI**:
    - "Alternative contact available: john.doe@gmail.com (from previous tickets)"
    - "Contact customer via: Phone (555-1234), Instagram (@johndoe)"
    - "Add to To field" button for alternative email
  - **Manual resolution**:
    - "Request alternative contact" action: Sends reply asking customer to provide valid email
    - "Close as uncontactable" action: If no alternative, mark ticket for closure with reason
- **Workflow guidance**:
  - If agent tries to send reply to no-reply address, block with modal: "Cannot send to no-reply address. Options: 1) Add alternative email, 2) Contact via other channel, 3) Close ticket"

#### User Flows

**Viewing Long Email Thread** (Edge Case: 45 emails over 3 months):
1. Agent opens email ticket from worklist
2. Thread timeline navigator shows 45 dots on left edge
3. First 5 emails (most recent) are expanded, older emails collapsed with "Earlier messages (40)" header
4. Agent clicks "Thread summary" toggle in toolbar
5. Summary panel shows: "45 emails over 91 days about subscription cancellation dispute"
6. Key participants: Customer (32 messages), Agent Sarah (10), Agent Mike (3)
7. Agent clicks "Jump to first unread" (email #38)
8. Thread scrolls to email #38, highlighted in yellow
9. Agent reads unread messages, responds

**Handling Mixed HTML/Plain Text** (Edge Case: Customer sends messy HTML forward):
1. Email renders with broken layout (wide table, tiny fonts, awkward colors)
2. Agent clicks "Simplified View" toggle
3. Content re-renders as clean plain text, preserving key information
4. Agent can read and respond without layout issues
5. Agent's reply uses clean HTML template for consistency

**Managing Multiple Participants** (Edge Case: 8 people on thread including internal + external):
1. Email thread has customer + 3 CC'd colleagues + 2 internal team members + manager
2. Agent opens ticket, sees participant count: "7 participants"
3. Agent clicks "See all participants" button
4. Participant panel opens showing:
   - John (Customer, 12 messages)
   - Sarah (Customer CC, 3 messages)
   - Mike (Customer CC, 1 message)
   - Tom (Customer CC, 2 messages)
   - Agent Linda (Internal, 5 messages)
   - Agent Rick (Internal, 2 messages)
   - Manager Alice (Internal, 1 message)
5. Agent needs to reply only to John, clicks "Reply" (not Reply All)
6. To field shows only John's email
7. Agent composes and sends targeted reply

**Handling System Messages** (Edge Case: Thread has 5 out-of-office replies):
1. Email thread shows 25 emails total
2. 5 are auto-responders: "Out of Office: Re: Your support request"
3. System messages shown collapsed with gray background
4. Agent clicks "Hide system messages" toggle
5. Thread now shows only 20 real emails, cleaner view
6. Agent can still access system messages via "Activity Log" tab if needed

**Reply All with External Contacts** (Edge Case: Accidental Reply All to competitor):
1. Agent needs to reply to customer about product issue
2. Thread includes CC to john@competitor.com (customer's colleague)
3. Agent clicks "Reply All" by habit
4. Warning modal appears: "⚠️ Reply All will send to external contact: john@competitor.com. Continue?"
5. Agent sees the risk, clicks "No, Reply to customer only"
6. To field updates to customer's email only
7. Agent sends safe reply

**No-Reply Address Handling** (Edge Case: Ticket from newsletter unsubscribe):
1. Customer replied to marketing email from noreply@brand.com
2. Ticket created but flagged with orange "No-reply source" badge in worklist
3. Agent opens ticket, sees banner: "⚠️ No-reply source - Customer unreachable via email"
4. System suggests: "Alternative contact: sarah.jones@email.com (from profile)"
5. Agent clicks "Add to To field"
6. To field updates to sarah.jones@email.com
7. Agent sends reply to reachable address

**Internal Note Safeguard** (Edge Case: Agent almost sends internal comment to customer):
1. Agent writing internal note: "Customer is difficult, escalate to manager"
2. Agent accidentally has "Reply to Customer" mode selected (blue composer)
3. Agent types content, clicks "Send"
4. System detects keywords "internal", "escalate to manager"
5. Warning modal: "⚠️ This looks like an internal note. You're about to send it to the customer. Switch to Internal Note mode?"
6. Agent realizes mistake, clicks "Switch to Internal Note"
7. Composer switches to yellow mode, content preserved
8. Agent sends as internal note safely

**Sample Conversation Structure** (Realistic Long Thread):
- **Email 1** (Customer → Support): "I was charged twice for order #7291. Please refund."
- **Email 2** (Agent Sarah → Customer): "Sorry to hear that. I'm looking into it. Can you confirm the charge amounts?"
- **Email 3** (Customer → Agent): "One for $49.99 and another for $49.99 on Dec 20."
- **Email 4** (Auto-reply): "Out of Office - Sarah Chen will return Jan 3" (System message, collapsed)
- **Email 5** (Agent Mike → Customer, Internal CC to Sarah): "Sarah is OOO. I've taken over. I see the duplicate charge. Processing refund now."
- **Email 6** (Customer → Agent Mike): "Thank you! How long will refund take?"
- **Email 7** (Agent Mike → Customer): "Refund processed. Should appear in 3-5 business days."
- **Email 8** (Customer → Agent Mike, CC to boss@customer.com): "Still haven't received refund after 7 days."
- **Email 9** (Agent Sarah → Customer, Reply All including boss@customer.com): "I'm back from OOO. Checking on refund status with finance team."
- **Email 10** (Internal Note by Sarah, @mentions Mike): "@Mike can you confirm refund was processed on Dec 28?"
- **Email 11** (Agent Mike → Internal, reply to note): "Yes, confirmed. Refund ID REF-9821."
- **Email 12** (Agent Sarah → Customer + boss@customer.com, Reply All): "Confirmed refund was processed on Dec 28. It may take up to 10 business days. Should appear by Jan 9."
- **Email 13** (Customer → Agent Sarah): "Got the refund today. Thanks for following up!"

---

### Variation 2: Public Post to Direct Message Transition

**Purpose**: Handle conversations that begin on public social posts and transition to private direct messages for sensitive resolution.

**Platform**: `instagram`, `facebook`, `x`, `linkedin`
**Interaction Type**: Starts as `post` or `comment`, transitions to `dm`

#### Unique Characteristics
- **Dual context**: Must show both the original public post AND the private DM thread
- **Transition metadata**: Captures when, why, and who initiated the move to DM
- **Visibility change indicator**: Clear visual distinction between public and private portions
- **Privacy warning**: Remind agent that early messages were public
- **Engagement context**: Show public post's reach and engagement to assess impact

#### UI Requirements

**Transition Indicator Component**:
- Horizontal banner between public and private sections
- Icon: Arrow pointing right with lock icon "Moved to Direct Message"
- Metadata display:
  - Timestamp: "Dec 31, 2024 at 2:45 PM"
  - Initiator: "by @agent_sarah" or "by @customer_john" or "Automated by workflow"
  - Reason: "Customer requested privacy" | "Sensitive information" | "Negative escalation protocol"
- Color: Purple/indigo gradient distinct from both public (blue) and private (green) message styling
- Expandable: Click to see full transition details and original public thread link
- Example: "🔒 Conversation moved to DM by @agent_sarah on Dec 31 at 2:45 PM • Reason: Customer requested privacy • Public post had 245 views"

**Public Post Context Card** (displays at top of thread):
- **Collapsed state** (default to save space):
  - Small post preview with first 100 characters
  - Platform icon + "Public Post" badge (blue background)
  - Engagement summary: "1.2K likes • 345 comments" (compact)
  - "View full post" button
- **Expanded state** (when clicked):
  - Original post content (full text, untruncated, with any images/videos)
  - Post author info (if different from ticket author - may be brand's original post)
  - Platform icon + post type badge ("Public Post" with blue background)
  - Engagement metrics breakdown:
    - Reactions by type (Like, Love, Haha, Sad, Angry with counts)
    - Total comments count
    - Shares/Retweets count
    - Reach/impressions (if available from platform API)
    - Virality indicator: Color-coded (Green: Normal, Yellow: High engagement, Red: Viral risk)
  - Visibility badge: "Public" with globe icon (orange background)
  - Timestamp of original post (full date + time)
  - "View on [Platform]" link to open post in native platform
  - "Collapse" button to return to compact view

**Conversation Thread Rendering**:

**Public Section** (messages before transition):
- **Visual styling for public messages**:
  - Light blue background (#EFF6FF)
  - Globe icon on left of each message indicating public visibility
  - Hover tooltip: "⚠️ This message was publicly visible to all followers"
  - Subtle "PUBLIC" watermark overlay (semi-transparent)
- **Message structure**:
  - Same chronological threading as standard conversation
  - Customer comments shown on left with blue public styling
  - Agent replies shown normally but with "Public Reply" badge
  - Engagement on each message: Like/reaction counts if available

**Transition Indicator** (visual separator between sections):
- Full-width horizontal divider
- Centered badge with purple/indigo gradient background
- Icon: Lock with arrow pointing right
- Primary text: "Conversation moved to Direct Message"
- Secondary text (below, smaller): Timestamp + Initiator + Reason
- Optional: "Why did this move to DM?" expandable explanation panel

**Private Section** (messages after transition):
- **Visual styling for DM messages**:
  - Light green background (#ECFDF5)
  - Lock icon on left of each message indicating private
  - Standard DM chat bubble style (tighter spacing than email)
  - Read receipts and delivery status (if supported by platform)

**DM-Specific Features** (post-transition):
- **Typing indicators**: When customer is typing, show animated "..." bubble
- **Read receipts** (platform-dependent):
  - WhatsApp/Instagram: "Seen" with timestamp
  - Facebook: Circular avatar when read
  - Twitter/X: No read receipts, just delivery confirmation
- **Delivery status per message**:
  - Sent: Single gray checkmark
  - Delivered: Double gray checkmark
  - Read: Double blue checkmark (or platform-specific indicator)
- **Quick reply suggestions**: Optimized for conversational, informal tone (vs. formal email tone)

#### User Flows

**Viewing Public-to-DM Ticket**:
1. Agent opens ticket from worklist flagged "Public → DM"
2. Public Post Context Card displays at top in collapsed state
3. Thread shows public comment(s) with blue "PUBLIC" styling
4. Transition indicator clearly marks the handoff point with reason
5. Private DM messages shown below with green "PRIVATE" styling
6. Agent understands full context: public complaint + private resolution

**Initiating DM Transition (Agent-initiated)**:
1. Agent sees negative public comment on worklist: "Waited 2 hours for support chat. Unacceptable."
2. Ticket shows high engagement: Post has 1,500 views, 89 comments (viral risk)
3. Agent clicks "Move to DM" action button in ticket toolbar
4. Modal appears: "Send public reply inviting customer to DM?"
5. Pre-filled template: "We're sorry to hear about your experience. We'd like to help resolve this privately. Please check your DMs - we've sent you a message."
6. Agent can edit template, adds personalization
7. Agent confirms, system:
   - Posts public reply as comment on original post
   - Sends DM invite to customer
   - Creates transition record in ticket
8. Customer responds in DM: "Thanks, I got your message."
9. Ticket updates with transition indicator
10. Agent continues conversation in private context, avoiding public escalation

**Handling Customer-Initiated Transition**:
1. Customer posts public complaint: "Your product broke after 1 week. Terrible quality!"
2. Customer self-service: Clicks "Send Message" button on brand's profile, sends DM: "Hi, I posted about a broken product. Can you help?"
3. System detects: Same customer, recent public post, DM within 10 minutes
4. System auto-links public post to DM ticket with transition metadata: "Customer initiated DM after public post"
5. Agent sees full context with transition indicator
6. Agent can reference public post in DM reply: "I saw your post about the product issue. I'm sorry to hear that. Let me help you get a replacement."

**Managing Public Visibility Risk**:
1. Agent reviewing ticket sees Public Post Context Card with red "VIRAL RISK" indicator
2. Engagement shows: 5.2K likes, 1,200 comments, 340 shares (extremely high)
3. Sentiment: Overwhelmingly negative comments from other users
4. Agent escalates to supervisor immediately
5. Supervisor reviews, decides on crisis response strategy
6. Public reply crafted with legal/PR team approval
7. DM conversation continues for individual customer resolution
8. Public response mitigates broader brand reputation risk

**Sample Conversation Structure**:

**PUBLIC SECTION:**
- **Original Post** (Brand Official Account): "Introducing our new Express Checkout feature! Shop faster than ever. Try it today! 🛒✨" [3.5K likes, 789 comments]
- **Public Comment 1** (Customer @john_doe): "Tried this yesterday and it charged me twice! Still waiting for refund. Not impressed. @BrandSupport" [125 likes, 23 replies from other users agreeing]
- **Public Reply** (Brand Agent @support_sarah): "We're sorry to hear this, John. This isn't the experience we want for you. I'm sending you a DM now so we can resolve this quickly and privately." [58 likes]

**TRANSITION INDICATOR:**
"🔒 Conversation moved to DM by @support_sarah on Dec 30, 2024 at 3:15 PM • Reason: Sensitive financial information • Public visibility: 450 views, 125 reactions"

**PRIVATE DM SECTION:**
- **DM 1** (Agent Sarah → Customer): "Hi John, I'm Sarah from customer support. I saw your comment about the double charge. I'm really sorry about that. Can you DM me your order number so I can look into this right away?"
- **DM 2** (Customer John → Agent): "Thanks for reaching out. It's order #78291. Both charges were $129.99 on Dec 29."
- **DM 3** (Agent Sarah → Customer): "I found your order. You're absolutely right - there was a duplicate charge due to a system glitch. I'm processing the refund now. It should appear in your account within 3-5 business days."
- **DM 4** (Customer John → Agent): "Oh wow, that was fast! Thank you. Will you let me know when it's refunded?"
- **DM 5** (Agent Sarah → Customer): "Absolutely! Refund confirmed - reference #REF-9482. You'll see it by Jan 4th at the latest. I've also added a $20 credit to your account for the inconvenience."
- **DM 6** (Customer John → Agent): "That's really great customer service. I appreciate you fixing this so quickly."
- **DM 7** (Agent Sarah → Customer): "You're very welcome, John! Thanks for your patience. If you're comfortable, would you consider updating your public comment to let others know we resolved this? No pressure at all!"
- **DM 8** (Customer John → Agent): "Sure, I'll edit my comment now. You earned it! 👍"

---

### Variation 3: Chat-Based Channels (WhatsApp, Telegram, Messenger)

**Purpose**: Handle real-time conversational exchanges from messaging platforms with chat-optimized UI patterns.

**Platform**: `whatsapp`, `telegram`, `messenger`
**Interaction Type**: `chat-message`

#### Unique Characteristics
- **Chat bubble interface**: Tight message grouping, conversation feel vs. email formality
- **Real-time indicators**: Typing, delivery status, read receipts per message
- **High message volume**: Many short messages vs. few long emails
- **Conversational tone**: Quick, informal exchanges
- **Quick replies**: Pre-defined response buttons for common answers
- **Media-heavy**: Images, voice notes, videos, stickers are common
- **Session-based**: Conversations often happen in short bursts with clear sessions

#### UI Requirements

**Chat-Style Message Bubbles**:

**Customer messages** (left side):
- Rounded bubble with tail pointing left
- Light gray background (#F3F4F6)
- Avatar shown only on first message in a group
- Timestamp only on last message in group (or after 5min gap)
- Tighter vertical spacing:
  - 4px between messages in same group
  - 16px between different groups
  - 24px between different days (with date separator)
- Max width: 70% of thread area (allows space on right for agent bubbles)
- Text wrapping within bubble, maintains bubble shape

**Agent messages** (right side):
- Rounded bubble with tail pointing right
- Blue background (#3B82F6 or brand primary color)
- White text color for contrast
- Right-aligned
- No avatar needed (agent info in header)
- Timestamp on last message in group
- Delivery status icon next to timestamp:
  - Sending: Spinner icon (animated)
  - Sent: Single gray checkmark
  - Delivered: Double gray checkmark
  - Read: Double blue checkmark
  - Failed: Red exclamation mark with "Retry" button
- Same spacing and width rules as customer messages

**Message Grouping Logic**:
- **Same-sender grouping**: Consecutive messages from same sender within 2 minutes
- **Group break triggers**:
  - Sender changes (customer → agent or vice versa)
  - Time gap > 2 minutes
  - Different message type (text → image → text breaks group)
  - New day boundary (always break at midnight, add date separator)
- **Visual grouping indicators**:
  - First message in group: Show avatar (customer only), show name, tail on bubble
  - Middle messages in group: No avatar, no name, no tail, tight spacing
  - Last message in group: Show timestamp, show delivery status (agent only)

**Date/Time Separators**:
- Full-width horizontal line with centered date badge
- Format: "Monday, Dec 30, 2024" for different days
- Format: "Today" and "Yesterday" for recent dates
- Spacing: 24px above and below separator
- Helps agent quickly scan conversation timeline

**Typing Indicator**:
- Appears when customer is actively typing
- Positioned at bottom of thread where next message would appear
- Animated: Three dots bouncing animation
- Light gray bubble matching customer message style
- Text: "[Customer name] is typing..." OR just animated dots for minimal version
- Auto-hide after 10 seconds if no message received (customer stopped typing)

**Delivery Status Indicators** (WhatsApp-style, per message):
- **Sending**: Small spinner icon next to message, gray
- **Sent**: Single checkmark ✓ (message left device, gray)
- **Delivered**: Double checkmark ✓✓ (message delivered to recipient's device, gray)
- **Read**: Double checkmark ✓✓ (message read by recipient, blue)
- **Failed**: Red exclamation mark ! with "Tap to retry" affordance
- Positioned: Bottom right corner of agent message bubbles, next to timestamp
- Animated transition: Sending → Sent → Delivered → Read with subtle fade-in

**Quick Reply Suggestions** (in composer area):
- **Trigger**: AI analyzes customer's question and suggests common responses
- **Display**: Horizontal scrollable chips above text input area
- **Visual style**:
  - Pill-shaped buttons with rounded borders
  - Light blue background (#DBEAFE)
  - Blue text (#1E40AF)
  - Compact size: Padding 8px 12px
  - Icon: Sparkles icon on first chip to indicate AI suggestion
- **Content examples**:
  - "Yes, that's correct ✓"
  - "Let me check on that"
  - "One moment please ⏱"
  - "I can help with that"
  - "Is there anything else?"
- **Interaction**:
  - Agent clicks chip → Text inserted into composer input
  - Agent can still edit before sending
  - Quick replies scroll horizontally if more than 3-4 suggestions

**Media Handling**:

**Images**:
- Display inline as rounded bubble with image inside
- Thumbnail within chat flow (max height: 300px, auto-width maintaining aspect ratio)
- Clickable to expand to full-screen lightbox
- Loading state: Gray placeholder with spinner
- If caption: Show caption text below image in same bubble
- Multiple images from customer: Gallery grid within single bubble

**Voice Notes/Audio**:
- Audio player bubble matching message style
- Waveform visualization (static or animated during playback)
- Play/pause button on left
- Duration display on right (e.g., "0:42")
- Progress bar showing playback position
- Playback speed toggle: 1x, 1.5x, 2x
- Auto-download small files (<1MB), show download button for larger files

**Videos**:
- Thumbnail preview with play icon overlay
- Rounded corners matching bubble style
- Duration badge in bottom-right corner (e.g., "1:23")
- Click to play inline OR expand to full-screen
- Loading state: Gray placeholder with spinner

**Files/Documents**:
- Document bubble with file icon on left
- Filename + file extension (e.g., "Order_Receipt.pdf")
- File size below filename (e.g., "234 KB")
- Download button/icon on right
- PDF preview: Show first page thumbnail if possible
- Other docs: Generic file type icon

**Stickers/Emojis** (platform-specific):
- Stickers: Display larger than text messages, centered in bubble
- Emoji-only messages: Render emojis 3x larger than text size
- Reactions to messages: Small emoji reaction badges attached to bubble corner

#### User Flows

**Viewing Chat Ticket**:
1. Agent opens chat ticket from worklist
2. Conversation thread displays in chat bubble UI
3. Messages grouped by sender and time proximity
4. Agent sees clear date separators: "Yesterday", "Today"
5. Last 20 messages visible, scroll up to load earlier history (lazy load)
6. Customer's latest message shows "Read" status (agent just opened)
7. If customer is typing, typing indicator appears at bottom

**Responding in Chat** (Quick, Informal Flow):
1. Agent reviews customer's question: "Hi, I need help with my order"
2. Composer shows quick reply suggestions:
   - "I can help with that ✓"
   - "What's your order number?"
   - "Let me check for you ⏱"
3. Agent clicks "What's your order number?" quick reply
4. Text populates in composer input
5. Agent adds personalization: "What's your order number? I'll look it up right away."
6. Agent presses Enter or clicks Send button
7. Message appears on right as blue bubble with "Sending..." spinner
8. Status updates: Sent ✓ → Delivered ✓✓ → Read ✓✓ (within seconds)
9. Customer responds quickly: "#78291"
10. Agent looks up order, types reply
11. Conversation flows naturally with short back-and-forth

**Sending Media (Screenshot to customer)**:
1. Agent needs to share screenshot showing how to find tracking number
2. Agent clicks attachment icon in composer
3. Selects "Image" option
4. File picker opens, agent selects screenshot from desktop
5. Image preview appears in composer with caption field
6. Agent adds caption: "Here's where to find your tracking number (circled in red)"
7. Agent clicks Send
8. Image appears as bubble in chat thread with caption below
9. Customer receives image, responds: "Got it, found it! Thanks 🙏"

**Handling High-Volume Chat Session** (20+ messages in 10 minutes):
1. Customer initiates chat: "Hi"
2. Customer sends 5 more messages in quick succession:
   - "I need help"
   - "My order is late"
   - "Order #78291"
   - "It was supposed to arrive yesterday"
   - "Can you help?"
3. All 6 customer messages appear as grouped bubbles (no timestamps between)
4. Agent responds: "I can definitely help! Let me check order #78291 for you."
5. Agent finds issue: "I see the delay. The package is out for delivery today."
6. Customer: "Really?"
7. Customer: "That's good news!"
8. Customer: "What time will it arrive?"
9. Agent: "Typically between 12 PM - 6 PM. You'll get a notification when it's 10 stops away."
10. Customer: "Perfect, thank you!"
11. Customer: "👍"
12. **Chat UI benefit**: Tight grouping keeps conversation flowing naturally, easy to scan despite high message count

**Real-Time Typing Indicator Flow**:
1. Agent is viewing chat ticket, waiting for customer response
2. Three animated dots appear at bottom: "John is typing..."
3. Agent waits instead of navigating away (knows response is coming)
4. Typing indicator disappears (customer deleted their draft)
5. Appears again 30 seconds later
6. Customer's message arrives: "Sorry, had to check something. Can you resend the link?"
7. Agent responds immediately, fast resolution

**Sample Conversation Structure**:

**[Session 1 - Dec 29, 2024]**
- **Message 1** (Customer → Agent, 9:23 AM): "Hi, I have a question about my order"
- **Message 2** (Customer → Agent, 9:23 AM): "It was supposed to ship yesterday but I haven't gotten tracking"
- **Message 3** (Customer → Agent, 9:24 AM): "Order #78291"
- **Message 4** (Agent → Customer, 9:25 AM): "Hi! I can help with that. Let me look up order #78291 for you." [✓✓ Delivered]
- **Message 5** (Agent → Customer, 9:26 AM): "I found it! The order shipped this morning. Your tracking number is: 1Z9999999999999999" [✓✓ Read, 9:26 AM]
- **Message 6** (Customer → Agent, 9:26 AM): "Oh great!"
- **Message 7** (Customer → Agent, 9:26 AM): "Thank you!"
- **Message 8** (Agent → Customer, 9:27 AM): "You're welcome! It should arrive by Dec 31. Anything else I can help with?" [✓✓ Read, 9:27 AM]
- **Message 9** (Customer → Agent, 9:27 AM): "No that's all"
- **Message 10** (Customer → Agent, 9:27 AM): "👍"

**[Date Separator: Dec 31, 2024]**

**[Session 2 - Dec 31, 2024]**
- **Message 11** (Customer → Agent, 2:15 PM): "Hi again"
- **Message 12** (Customer → Agent, 2:15 PM): "Package still hasn't arrived"
- **Message 13** (Customer → Agent, 2:15 PM): "Tracking says delivered but I don't have it"
- **[Typing indicator: "John is typing..."]**
- **Message 14** (Customer → Agent, 2:16 PM): "Can you help?"
- **Message 15** (Agent → Customer, 2:17 PM): "I'm sorry to hear that! Let me check with the carrier." [✓ Sent]
- **Message 16** (Agent → Customer, 2:19 PM): "According to the carrier, it was left at your front door at 1:45 PM today. Could it be in a safe spot or with a neighbor?" [✓✓ Delivered]
- **Message 17** (Customer → Agent, 2:20 PM): "Oh wait!"
- **Message 18** (Customer → Agent, 2:20 PM): "Found it behind the planter on my porch"
- **Message 19** (Customer → Agent, 2:20 PM): "😅 my bad"
- **Message 20** (Customer → Agent, 2:20 PM): "Thanks for checking!"
- **Message 21** (Agent → Customer, 2:21 PM): "Glad you found it! Enjoy your order! 😊" [✓✓ Read, 2:21 PM]

---

### Variation 4: Parent Post Context with "View Full Thread"

**Purpose**: Handle tickets created from replies within large comment threads, providing collapsible parent post context and thread navigation.

**Platform**: Any social platform (`instagram`, `facebook`, `x`, `linkedin`)
**Interaction Type**: `comment`, `tagged-comment`

#### Unique Characteristics
- **Parent post context**: Original post that sparked the comment thread
- **Thread depth**: Customer's comment may be nested deep in a large thread (reply to reply to reply)
- **Engagement context**: Parent post's reach and engagement affect priority
- **Thread navigation**: Agent needs to see customer's comment in context of full thread
- **Expandable context**: Collapsed by default to save space, expandable to view full thread

#### UI Requirements

**Parent Post Context Card** (collapsed state, default):
- **Compact preview strip** (minimal height: ~80px):
  - Left: Small thumbnail (60x60px) if post has image/video, OR platform icon if text-only
  - Center (main content):
    - Post snippet: First 100 characters, truncated with "..."
    - Post author: Small avatar (24px) + name (if not brand's own post)
    - Platform + type badge: "Instagram Post" with icon
  - Right (metadata):
    - Engagement metrics (compact): "1.2K 👍 • 345 💬"
    - Timestamp: Relative (e.g., "2 days ago")
  - "View Full Thread" button (blue, prominent) - right side
- **Visual style**:
  - Light background (#F9FAFB)
  - Subtle border
  - Minimal padding to save vertical space
  - Appears at very top of ticket thread, above all messages

**Parent Post Context Card** (expanded state):
- **Full post display** (replaces compact strip when expanded):
  - Full text content (untruncated, max 2000 characters, scroll if longer)
  - All media (images/videos) rendered inline
    - Images: Full-width, aspect-ratio preserved
    - Videos: Embedded player with thumbnail, click to play
    - Carousels: Show all images with left/right navigation
  - Post author info:
    - Larger avatar (48px)
    - Name + username/handle
    - Verified badge if applicable
    - Follow count (if influencer)
  - Full engagement metrics breakdown:
    - **Reactions by type** (if platform supports): Like, Love, Haha, Wow, Sad, Angry with counts
    - **Comments**: Total count (e.g., "345 comments") + "View all on Instagram" link
    - **Shares**: Count (e.g., "89 shares")
    - **Reach/Impressions**: If available from platform API (e.g., "12.5K reached")
    - **Virality indicator**: Visual cue if engagement is unusually high
      - Green: Normal engagement for page
      - Yellow: 2-5x average engagement (high visibility)
      - Red: >5x average engagement (viral, requires careful handling)
  - Post timestamp: Full date + time (e.g., "December 28, 2024 at 3:42 PM")
  - Platform badge: "Public Instagram Post" with globe icon
  - Actions:
    - "View on Instagram" link (opens post in new tab on platform)
    - "Collapse" button (returns to compact view)
    - "Share post link" button (copies URL to clipboard)

**Thread Navigator Component** (appears when Parent Post Context is expanded):
- **Positioned**: Directly below expanded Parent Post Context Card, above ticket conversation
- **Visual structure**: Breadcrumb-style horizontal navigation
- **Breadcrumb elements**:
  - "Original Post" (clickable, scrolls to post preview)
  - → (arrow separator)
  - "@username's comment" (if customer replied to someone)
  - → (arrow separator)
  - "This ticket" (bold, indicates current focus)
- **Thread position indicator**:
  - Text: "Comment 23 of 47" or "Reply 3 of 12"
  - Shows where customer's comment sits in full thread hierarchy
- **Thread depth visual**:
  - Level indicator: "Nesting level: 2" (0 = direct comment, 1 = reply, 2 = reply to reply, etc.)
  - Visual: Nested indent or colored dots showing depth
- **Jump actions** (buttons/links):
  - "Jump to parent comment ↑" (if nested, shows parent comment customer was replying to)
  - "View sibling replies" (if other users also replied to same parent)
  - "View all replies ↓" (if customer's comment has child replies)
  - "Open full thread on [Platform]" (external link, opens native platform thread view)

**Conversation Thread with Thread Context**:

**Ticket conversation** (main focus):
- Customer's comment that created the ticket
- Agent's reply
- Any follow-up exchanges
- Standard conversation threading applies (same as current TicketDetail)

**Thread relationship indicators**:
- **"Replying to" context** (if customer's comment was a reply):
  - Small quoted preview above customer's first message
  - Format: "Replying to @username: [snippet of parent comment]"
  - Light gray background, italic text
  - Expandable: Click "Show full comment" to see complete parent
  - Example:
    ```
    Replying to @sarah_jones: "I agree, the new policy is confusing..."

    [Customer's comment that created ticket]
    ```
- **Other replies indicator** (if customer's comment has child replies from other users):
  - Badge below customer's message: "3 other users replied to this comment"
  - "View on Instagram" link to see other users' responses
  - Helps agent understand if this is part of larger conversation

**Thread Depth Visual Indicator**:
- **Left border on customer's message card**:
  - **Level 0** (direct comment on post): No border (root level)
  - **Level 1** (reply to comment): 3px blue border on left edge
  - **Level 2** (reply to reply): 5px indigo border on left edge, 8px left indent
  - **Level 3+** (deeply nested): 5px purple border, 16px left indent, "Deeply nested reply" label
- **Purpose**: Quickly communicate thread complexity to agent at a glance

**Engagement Impact Indicator** (on ticket card in worklist and thread view):
- **Risk assessment** based on parent post engagement:
  - **Low risk**: Post has <1K reach, normal for brand → Gray/green indicator
  - **Medium risk**: Post has 1K-10K reach, higher visibility → Yellow indicator
  - **High risk**: Post has >10K reach OR viral engagement → Red indicator
  - **Critical**: Post has >50K reach AND negative sentiment → Flashing red, "URGENT" label
- **Why it matters**: Agent knows when to escalate, get approval before replying, or involve PR team

#### User Flows

**Viewing Ticket with Parent Post Context (Collapsed)**:
1. Agent opens ticket from worklist
2. Parent Post Context Card displays at top in compact form
3. Agent sees snippet: "Introducing our new product line! Available now..." [1.5K 👍 • 230 💬]
4. Ticket conversation shows:
   - Customer's comment: "@BrandSupport Same, plus I heard shipping takes forever"
   - No agent reply yet
5. Agent can respond immediately without expanding (for simple acknowledgment)
6. Agent sends: "@john_doe Thanks for the feedback! We actually offer free 2-day shipping on all orders. Can I help you place an order?"

**Expanding to View Full Thread** (Complex case requiring context):
1. Agent needs to understand full context before responding
2. Agent clicks "View Full Thread" button
3. Parent Post Context Card expands to show:
   - Full post: "Introducing our new product line! Premium quality, innovative design. Available now. What do you think?" [Brand's Instagram post]
   - Engagement: 1.5K likes, 230 comments, 120 shares
   - Virality indicator: Yellow (2.5x normal engagement - trending post)
4. Thread Navigator appears below:
   - Breadcrumb: "Original Post → @user1's comment → @user2's reply → **This ticket**"
   - Position: "Viewing reply 3 of 47 comments"
   - Nesting level: 2 (reply to a reply)
5. Agent clicks "Jump to parent comment ↑" to see what customer was replying to
6. Parent comment preview shows:
   - @user1: "Price is too high compared to competitors"
   - └ @user2 (reply): "Agreed, I'll stick with Brand X"
   - └ **@customer_john (THIS TICKET)**: "@user2 Same, plus I heard shipping takes forever"
7. Agent now understands: Customer agreeing with price complaint AND has shipping misconception
8. Agent crafts contextual reply addressing both concerns:
   - "I understand the pricing concern. Our products use premium materials which reflects in cost. However, we offer free 2-day shipping on all orders, so there's no delay. Happy to answer any questions about quality or shipping!"

**Navigating Complex Thread** (Deep nesting scenario):
1. Ticket shows nesting level: 3 (reply to reply to reply)
2. Thread Navigator breadcrumb: "Post → Comment 1 → Reply A → Reply B → **This ticket**"
3. Position: "Comment 23 of 47"
4. Left border: Purple, 16px indent (indicating deep nesting)
5. Agent clicks "Open full thread on Instagram" link
6. New tab opens showing native Instagram post with full comment tree
7. Agent sees visual structure:
   - Original post (brand)
   - └ Comment 1 (@influencer): "Not impressed with this launch"
   - └ Reply A (@fan1): "Give it a chance!"
   - └ Reply B (@fan2): "I agree with @fan1"
   - └ **Reply C (@customer_john, THIS TICKET)**: "I tried it and it's actually great. Worth the price."
8. Agent realizes: Customer is DEFENDING brand, not complaining
9. Agent responds with appreciation: "Thank you so much for sharing your experience! We really appreciate your support."

**Assessing Viral Risk Before Replying**:
1. Agent opens ticket with red "HIGH RISK" indicator
2. Parent Post Context shows: 52K likes, 3.2K comments, viral indicator RED
3. Customer's comment has 340 likes (unusually high for a comment)
4. Comment: "I've been a customer for 5 years and this new policy is a slap in the face. Disappointed."
5. Other replies show: Many users agreeing, some threatening to boycott
6. Agent recognizes: This is a sensitive situation requiring escalation
7. Agent does NOT reply immediately
8. Agent clicks "Escalate to supervisor" action
9. Adds internal note: "Viral post with negative sentiment. Needs PR/legal review before response."
10. Supervisor/PR team crafts approved response, then agent sends

**Handling Positive Engagement in Large Thread**:
1. Parent Post: Brand's contest announcement [8K likes, 1.5K comments]
2. Customer's comment (ticket): "This is amazing! I love your brand! When does the contest end?"
3. Thread position: Comment 487 of 1,523 (buried in large thread)
4. Agent responds quickly: "Thank you! Contest ends Jan 15th. Good luck!"
5. No need to expand full thread - simple positive inquiry

**Sample Scenario**:

**Parent Post** (Brand Instagram, Dec 28, 3:42 PM):
- Content: "Introducing our new EcoLine collection! Sustainable materials, modern design, affordable pricing. What do you think? 🌱✨"
- Media: Carousel with 5 product images
- Engagement: 1.5K likes (👍435, ❤️520, 😍325, 👏220), 230 comments, 120 shares
- Reach: 28.5K accounts (2.5x average - trending)
- Virality indicator: Yellow (high visibility)

**Comment Thread Structure**:
- Comment 1 (@price_conscious_shopper): "Price is too high compared to competitors. $99 for a t-shirt?" [89 likes, 12 replies]
  - Reply 1A (@budget_buyer): "Agreed, I'll stick with Brand X at $29" [23 likes]
    - **Reply 1A-i (@customer_john, THIS IS THE TICKET)**: "@budget_buyer Same, plus I heard shipping takes forever with this brand" [8 likes]

**Ticket Conversation**:
- **Thread Navigator**: Original Post → @price_conscious_shopper's comment → @budget_buyer's reply → **This ticket**
- **Position**: Reply 3 of 47 comments, Nesting level: 2
- **Ticket Messages**:
  - Customer's comment (creates ticket): "@budget_buyer Same, plus I heard shipping takes forever with this brand"
  - **Agent Reply**: "Hi @customer_john! I understand the pricing concern - our EcoLine uses sustainable materials which costs more to produce. However, we offer FREE 2-day shipping on all orders, so there's no delay at all! We also have a 30-day return policy if you're not 100% satisfied. Can I answer any other questions about the collection?"
  - Customer Reply: "Oh really? Free 2-day shipping? That changes things. Didn't know that!"
  - Agent Reply: "Yes! All orders over $25 ship free with 2-day delivery. Plus new customers get 15% off first order with code WELCOME15. Would you like help finding your size?"
  - Customer Reply: "Sure, I'll check it out. Thanks for the info!"

---

## Configuration
- shell: true
