# Data Model

## Entities

### Mention
An incoming conversation about a brand captured from social media, web, or surveys. Types include social post, web mention, review, and survey response. Enriched with sentiment, intent, and custom classifications.

### Reply
A response to a Mention within a Ticket, sent by a User or AI Agent. Represents the outbound communication back to the customer.

### Ticket
A customer care case created from one or more Mentions. Bundles related conversations from the same customer and tracks resolution through assignment and status.

### Task
A work item that can be associated with a Ticket, Post, or exist standalone. Assigned to Users for actions like follow-ups, approvals, or reviews.

### Brand
A monitored brand (your own or competitors) with associated keywords, channels, and profiles. The top-level organizational entity for all monitoring and engagement.

### Channel
A connected social media platform or web source such as Twitter, Facebook, Instagram, Google, or web crawlers. Represents the integration with external platforms.

### Page
A specific social media page within a Channel where activity occurs. Can belong to the brand level or be specific to a Location or Product Profile.

### Author
A customer's social media identity on a specific platform. Represents how a person appears on each social network they use.

### Contact
A unified customer profile linking multiple Authors together. Matched by shared email or phone number to create a single view of the customer across platforms.

### Location Profile
A physical location under a Brand. Can have a GMB listing, survey forms (displayable as QR codes), location-specific social pages, and review channels. Mentions can be associated to locations via keywords or AI enrichment.

### Product Profile
A product under a Brand. Can have product reviews, product-specific social pages, and associations with brand posts promoting the product. Mentions can reference multiple products for comparisons.

### User
A team member using the platform such as an agent, manager, or marketer. Can be assigned Tickets, Tasks, and send Replies.

### AI Agent
An AI entity modeled similarly to a User. Can generate responses, execute workflows, perform tasks, and take actions autonomously or upon authorization.

### Team
A group of Users with shared permissions, assignments, and queue access. Used for organizing agents and routing work.

### Knowledge Article
Reference content used for response generation and AI training. Can be tagged to Brand, Product, Location, or Channel for contextual retrieval.

### Workspace
A composable view configuration defining layouts, filters, columns, and data views. Enables the Notion-like customization of how users see and interact with data.

### Workflow
An automation definition with triggers, conditions, and actions. Can act on Mentions, Tickets, Tasks, or Posts to automate routing, enrichment, and responses.

### Post
Published content sent to social media channels. Can be associated with Product Profiles and go through approval Tasks before publishing.

### Report
A saved analytics dashboard or insight view. Composable for custom metrics, sentiment trends, competitive benchmarking, and performance analysis.

### Classification
A custom tag or category applied to Mentions beyond the built-in sentiment and intent. User-defined for brand-specific categorization needs.

## Relationships

- Brand has many Channels, Location Profiles, Product Profiles, and Knowledge Articles
- Channel has many Pages
- Page belongs to a Channel and optionally to a Location Profile or Product Profile
- Mention belongs to a Brand, comes from a Page, and is created by an Author
- Mention can be associated with one Location Profile and multiple Product Profiles
- Author always has a Contact
- Contact has many Authors (unified identity across platforms)
- Ticket is created from one or more Mentions
- Ticket belongs to a Brand and is assigned to Users or Teams
- Ticket has many Replies
- Reply belongs to a Ticket and Mention, sent by a User or AI Agent
- Task is assigned to Users and optionally associated with a Ticket or Post
- AI Agent belongs to a Brand and can send Replies, execute Workflows, and perform Tasks
- Knowledge Article belongs to a Brand and can be tagged to Products, Locations, and Channels
- Post is published to Pages and can be associated with Product Profiles
- Post can have many Tasks (approvals, reviews)
- Workflow belongs to a Brand and triggers actions on Mentions, Tickets, Tasks, or Posts
- Workspace and Report belong to Users or Teams
