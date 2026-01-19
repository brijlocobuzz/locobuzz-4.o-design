import { useState } from 'react'
import data from '@/../product/sections/inbox/data.json'
import { TicketDetail } from './components/TicketDetail'
import type { MessageInsights } from './components/TicketHeader'

/**
 * Interactive Inbox Preview
 * Shows multiple tickets with working queue navigation.
 * Click different tickets in the "Up Next" queue to view their details.
 */
export default function InboxInteractivePreview() {
  // Start with email ticket (ticket-016)
  const [selectedTicketId, setSelectedTicketId] = useState('ticket-016')

  // Message Insights state
  const [messageInsights, setMessageInsights] = useState<MessageInsights>({
    showInsights: false,
    selectedInsights: {
      sentiment: true,
      entity: false,
      intent: false,
      emotion: false,
      category: true,
      aspects: true,
      aspectGroups: true,
      reasonSurfaced: false,
      essentials: {
        customerName: false,
        avatar: false,
        handleAndFollowers: false,
        platformAndType: false,
        timestamp: false,
        messageSnippet: false,
        messageCount: false,
        priorityBadge: false,
        slaStatus: false,
        unreadCount: false,
      },
    },
  })

  // Define the tickets available in the queue
  const availableTickets = [
    data.tickets.find(t => t.id === 'ticket-016')!, // Robert Patterson - Email
    data.tickets.find(t => t.id === 'ticket-002')!, // Tech Insights Daily - X mention
    data.tickets.find(t => t.id === 'ticket-003')!, // Priya Sharma - Facebook comment
    data.tickets.find(t => t.id === 'ticket-004')!, // Michael Chen - Google review
  ]

  // Get the currently selected ticket
  const currentTicket = availableTickets.find(t => t.id === selectedTicketId)!
  const currentThread = data.conversationThreads[selectedTicketId as keyof typeof data.conversationThreads]

  // Get tickets for the queue (all except current)
  const ticketQueue = availableTickets.filter(t => t.id !== selectedTicketId)

  // Get the index of current ticket for "Next" button
  const currentIndex = availableTickets.findIndex(t => t.id === selectedTicketId)
  const hasNext = currentIndex < availableTickets.length - 1

  // Timeline events (mock - same for all tickets for simplicity)
  const timelineEvents = [
    {
      id: '1',
      type: 'status-change' as const,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      user: {
        name: 'Sarah Chen',
        avatarUrl: 'https://i.pravatar.cc/150?img=5',
      },
      data: {
        from: 'new',
        to: 'open',
      },
    },
    {
      id: '2',
      type: 'assignment' as const,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      user: {
        name: 'System',
      },
      data: {
        assignedTo: 'Sarah Chen',
      },
    },
  ]

  // AI suggestions - customize based on ticket type
  const getAiSuggestions = (ticketId: string) => {
    const suggestions: Record<string, any[]> = {
      'ticket-016': [ // Email ticket - KB suggestion (GREEN hue)
        {
          id: 'sug-016-1',
          content: "I sincerely apologize for the duplicate charge on order #7291. I've processed a full refund of $49.99 which should appear in your account within 3-5 business days. I've also added a $10 credit to your account for the inconvenience. Is there anything else I can help you with?",
          confidence: 0.94,
          type: 'response',
          reasoning: 'Addresses billing issue directly, offers compensation, maintains professional tone',
          source: 'Knowledge Base - Billing Policies',
          isWithinKB: true,
        },
      ],
      'ticket-002': [ // X mention - Non-KB suggestion (RED hue)
        {
          id: 'sug-002-1',
          content: "We sincerely apologize for the data sync delays you're experiencing. Our engineering team has identified the root cause and is working on a fix with highest priority. We'll update you within 2 hours with the resolution timeline. Thank you for your patience.",
          confidence: 0.89,
          type: 'response',
          reasoning: 'Acknowledges public complaint from media outlet, commits to timeline',
          source: 'External - Social Media Best Practices',
          isWithinKB: false,
        },
      ],
      'ticket-003': [ // Facebook comment - KB suggestion (GREEN hue)
        {
          id: 'sug-003-1',
          content: "Hi Priya! Great news - we do support Shopify integration! Our platform connects seamlessly with your Shopify store. I'll have our partnerships team send you detailed setup documentation within 24 hours. Is there anything specific about the integration you'd like to know?",
          confidence: 0.92,
          type: 'response',
          reasoning: 'Answers integration question positively, offers proactive follow-up',
          source: 'Knowledge Base - Integration FAQ',
          isWithinKB: true,
        },
      ],
      'ticket-004': [ // Google review - KB suggestion (GREEN hue)
        {
          id: 'sug-004-1',
          content: "Thank you so much for the wonderful review, Michael! We're thrilled to hear that our customer service team made your onboarding smooth and that your team found the platform intuitive. We're here whenever you need us!",
          confidence: 0.95,
          type: 'response',
          reasoning: 'Grateful acknowledgment of positive feedback, reinforces mentioned positives',
          source: 'Knowledge Base - Review Response Templates',
          isWithinKB: true,
        },
      ],
    }

    return suggestions[ticketId] || []
  }

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId)
  }

  const handleNextTicket = () => {
    if (hasNext) {
      const nextTicket = availableTickets[currentIndex + 1]
      setSelectedTicketId(nextTicket.id)
    }
  }

  return (
    <TicketDetail
      ticket={currentTicket}
      conversationThread={currentThread}
      ticketQueue={ticketQueue}
      timelineEvents={timelineEvents}
      aiSuggestions={getAiSuggestions(selectedTicketId)}
      currentUser={data.currentUser}
      crmConnected={selectedTicketId === 'ticket-016'} // Only email ticket has CRM connected
      crmName="Salesforce"
      messageInsights={messageInsights}
      onMessageInsightsChange={setMessageInsights}
      onSendReply={(content) => console.log('Send reply:', content)}
      onAddNote={(content) => console.log('Add note:', content)}
      onAssign={(userId) => console.log('Assign to:', userId)}
      onChangeStatus={(status) => console.log('Change status:', status)}
      onChangePriority={(priority) => console.log('Change priority:', priority)}
      onAddTag={(tag) => console.log('Add tag:', tag)}
      onRemoveTag={(tag) => console.log('Remove tag:', tag)}
      onSelectTicket={handleSelectTicket}
      onNextTicket={handleNextTicket}
      onSavePersonalDetails={(updates) => console.log('Save personal details:', updates)}
      onSaveTicketInfo={(updates) => console.log('Save ticket info:', updates)}
      onEscalateTicket={(data) => console.log('Escalate ticket:', data)}
      onCloseTicket={(data) => console.log('Close ticket:', data)}
      onCreateCRMTicket={(ticketData) => console.log('Create CRM ticket:', ticketData)}
      onSyncCRM={() => console.log('Sync CRM')}
      onExecuteAgentAction={(actionId) => console.log('Execute agent action:', actionId)}
      onClose={() => console.log('Close ticket detail')}
    />
  )
}
