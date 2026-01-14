# Chat with Data Specification

## Overview
A conversational AI interface for querying and analyzing Locobuzz data across mentions, social posts, competition benchmarking, and ticket/user performance. Users select a brand and data category, then interact with an AI assistant that provides visual answers with inline charts, tables, and text explanations, with deep dive capabilities on any component.

## User Flows
- User selects a brand from dropdown to set analysis context
- User creates new conversation or selects from saved conversation history
- User chooses data source category (Mentions, Posts, Competition, Tickets/User Performance)
- System displays contextual starter question chips based on selected category
- User clicks starter question or types custom query
- System shows progress indicator with processing steps (~1 minute)
- AI responds with visual layout: text explanations, charts, KPI cards, and data tables inline in conversation
- User can click deep dive on any chart/component to explore further
- User can continue conversation thread with follow-up questions
- All conversations auto-save and are searchable
- User can manage multiple conversation tabs simultaneously

## UI Requirements
- Tabbed interface for multiple concurrent conversation threads with close buttons
- Brand selector dropdown in header (required before starting)
- Left sidebar with searchable conversation history and "New Conversation" button
- Category selection step at conversation start (Mentions/Posts/Competition/Tickets)
- Starter question chips displayed after category selection
- Chat interface with user messages (right-aligned) and AI responses (left-aligned)
- AI responses contain mixed content: text paragraphs, charts, KPI cards, data tables
- Progress indicator during processing showing current step ("Analyzing sentiment...", "Generating visualizations...")
- Quick action buttons on charts/tables for deep dive exploration
- Message input with send button and loading state
- Responsive layout with collapsible sidebar on mobile

## Configuration
- shell: true
