# Workflows Specification

## Overview
No-code workflow automation builder with AI-assisted creation. Users can design automation rules using a visual node-based canvas or natural language input that generates workflows via LLM. Supports trigger-based events, complex condition logic with AI classifiers, and automated actions including routing, responses, CRM integrations, and notifications. Workflows are ranked - only the highest-ranked qualifying workflow executes for each event.

## User Flows

### Workflow Management (List View)
- View all configured workflows in ranked order (only active workflows are ranked)
- Drag and drop workflows to reorder rank/priority
- See status (active/inactive) with quick toggle for each workflow
- View execution statistics (run count, success rate, last execution time)
- See trigger summary for each workflow
- Access quick actions: edit, duplicate, delete, test, view analytics
- Browse version history and rollback to previous versions
- Search and filter workflows by status, trigger type, or tags
- Create new workflow (opens canvas builder)
- Understand that only the highest-ranked workflow that matches conditions will execute for any given mention/ticket/event

### Visual Workflow Builder (Canvas)
- Design workflows using drag-and-drop node-based canvas
- Node types: Trigger nodes, Condition nodes, Action nodes
- Connect nodes with lines to define flow logic
- Support if-else branching with visual split paths
- Click condition nodes to open side panel for detailed configuration
- In side panel: select attributes, apply filters, configure AI classifiers (sentiment, intent, actionability)
- Add delay nodes for time-based waits
- Configure action nodes: routing (round robin, skill-based, sticky), auto-response, CRM push, notifications, moderation

### AI-Assisted Workflow Creation
- Natural language input box at bottom of canvas
- Type instructions in plain English (e.g., "When a negative mention comes in from Instagram, route it to the crisis team and send a Slack notification")
- LLM processes input and generates/modifies visual nodes on canvas
- Users can iterate: manually edit nodes OR provide additional natural language instructions
- Canvas updates in real-time as LLM interprets instructions

### Condition Configuration (Side Panel)
- Opens when clicking on condition nodes
- Select from attribute categories: Channel, Author metadata, Ticket properties, Content filters
- Apply boolean operators: AND/OR grouping, nested conditions, NOT logic
- Configure AI classifiers: Actionability check, Intent recognition, Sentiment filtering
- Set time constraints: business hours, holiday exclusions
- Live preview of condition logic

### Workflow Testing (Simulator)
- "Test It" button in canvas header
- Input test mention data (text content, author info)
- Set optional parameters: channel, author attributes, timestamp
- Run simulation through workflow
- Visual highlighting: path lights up on canvas showing which nodes execute
- Execution log panel: step-by-step breakdown of conditions evaluated (pass/fail) and actions taken
- View simulated outputs: would-be assignments, responses, notifications
- Debug mode for troubleshooting logic issues

### Version History & Rollback
- View timeline of all changes to workflow
- See who made changes and when
- Preview previous versions side-by-side
- Rollback to any previous version
- Comment/note system for version changes

## UI Requirements

### Workflow List
- Table/list layout with drag handles for reordering
- Visual rank indicator: numbered badges (1, 2, 3...) showing priority order
- Only active workflows show rank numbers (inactive workflows appear at bottom without ranks)
- Drag and drop to reorder: dragging updates all rank numbers automatically
- Visual feedback during drag: highlighted drop zones, rank preview
- Columns: Rank, Drag Handle, Name, Status (toggle), Trigger, Last Run, Success Rate, Total Runs, Version, Actions
- Status indicator: green dot (active with rank), gray dot (inactive, no rank)
- Inline toggle switch for quick activate/deactivate (activating adds to bottom of ranked list)
- Trigger summary as readable text (e.g., "New mention on Social")
- Execution stats with visual indicators (success rate percentage)
- Action dropdown menu per row: Edit, Duplicate, Test, Analytics, Delete
- Version number badge (clickable to view history)
- Search bar and filter controls at top
- Info callout explaining: "Only the highest-ranked workflow that matches will execute for each event"
- "Create Workflow" button prominent in header
- Empty state with onboarding flow for first workflow

### Visual Canvas Builder
- Infinite canvas with pan and zoom controls
- Node palette on left sidebar: drag to add Triggers, Conditions, Actions, Delays
- Connection lines with arrows showing flow direction
- If-else branching: condition node splits into two paths (green for true, red for false)
- Node types visually distinct: Triggers (blue), Conditions (yellow), Actions (green), Delays (purple)
- Selected node highlights with glow/border
- Mini-map in corner for large workflows
- Toolbar: Undo/Redo, Zoom controls, Auto-layout, Save, Test It

### AI Input Box (Bottom Panel)
- Fixed position at bottom of canvas
- Text input with placeholder: "Describe your workflow in plain English..."
- Submit button or Enter to process
- Loading state while LLM generates nodes
- Show brief explanation of what was generated
- Suggested prompts for common workflows
- Clear button to dismiss input
- Collapsible to maximize canvas space

### Condition Configuration Side Panel
- Slides in from right when condition node clicked
- Tabs: Basic Filters, AI Classifiers, Time Constraints
- Attribute selector with searchable dropdown
- Operator selector (equals, contains, greater than, etc.)
- Value input (text field, multi-select, date picker based on attribute type)
- Add condition button for compound logic
- AND/OR toggle between condition groups
- Visual nesting with indentation for grouped conditions
- Live condition summary in readable English
- Apply and Cancel buttons

### Test Mode Interface
- Modal or side panel overlay on canvas
- Input form: mention text, channel selector, author fields (name, followers, verified)
- Optional advanced fields: timestamp, tags, classifications
- "Run Test" button
- Results split view:
  - Left: Canvas with animated path highlighting (nodes light up sequentially)
  - Right: Execution log with expandable steps
- Log entries: timestamp, node name, condition result (pass/fail with details), action result
- Success/failure indicator at top
- Export test results
- Clear and run another test

### Version History Panel
- Timeline view with date markers
- Each version shows: version number, author, timestamp, change summary
- Click to preview: side-by-side diff of workflow canvas
- Restore button for rollback
- Comment/notes for each version
- Filter by author or date range

## Configuration
- shell: true
