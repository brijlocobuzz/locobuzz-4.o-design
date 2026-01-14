import data from '@/../product/sections/inbox/data.json'
import { TicketDetail } from './components/TicketDetail'

/**
 * Priya Sharma - Facebook Comment Ticket Preview
 * Shows ticket-003: A Facebook comment about Shopify integration query.
 * Demonstrates:
 * - Facebook comment interaction type
 * - Question/feature-request intent
 * - Neutral sentiment handling
 * - Multi-message thread with agent reply
 */
export default function PriyaSharmaPreview() {
  // Load Priya Sharma's ticket (ticket-003)
  const ticket = data.tickets.find(t => t.id === 'ticket-003')!
  const conversationThread = data.conversationThreads['ticket-003']

  // Mock ticket queue
  const ticketQueue = data.tickets.filter(t => t.id !== 'ticket-003').slice(0, 4)

  // Mock timeline events for this ticket
  const timelineEvents = [
    {
      id: '1',
      type: 'status-change' as const,
      timestamp: '2024-12-30T16:45:00Z',
      user: {
        name: 'System',
      },
      data: {
        from: 'new',
        to: 'open',
      },
    },
    {
      id: '2',
      type: 'assignment' as const,
      timestamp: '2024-12-30T16:50:00Z',
      user: {
        name: 'System',
      },
      data: {
        assignedTo: 'Sarah Chen',
      },
    },
    {
      id: '3',
      type: 'reply-sent' as const,
      timestamp: '2024-12-30T17:10:00Z',
      user: {
        name: 'Sarah Chen',
        avatarUrl: 'https://i.pravatar.cc/150?img=5',
      },
      data: {
        channel: 'Facebook',
      },
    },
    {
      id: '4',
      type: 'note' as const,
      timestamp: '2024-12-31T09:20:00Z',
      user: {
        name: 'Sarah Chen',
        avatarUrl: 'https://i.pravatar.cc/150?img=5',
      },
      data: {
        content: 'Sent to partnerships team for detailed Shopify integration docs.',
      },
    },
    {
      id: '5',
      type: 'status-change' as const,
      timestamp: '2024-12-31T09:20:00Z',
      user: {
        name: 'Sarah Chen',
        avatarUrl: 'https://i.pravatar.cc/150?img=5',
      },
      data: {
        from: 'open',
        to: 'pending',
      },
    },
  ]

  // AI suggestions for this type of query
  const aiSuggestions = [
    {
      id: 'sug-003-1',
      content: "Hi Priya! Great news - we do support Shopify integration! Our platform connects seamlessly with your Shopify store to consolidate all customer interactions. Would you like me to send you our integration guide?",
      confidence: 0.92,
      type: 'response',
      reasoning: 'Addresses integration question directly with positive confirmation',
    },
    {
      id: 'sug-003-2',
      content: "Thanks for reaching out! Yes, Locobuzz integrates with Shopify and 50+ other platforms. I can have our partnerships team reach out with a personalized demo. What time works best for you?",
      confidence: 0.85,
      type: 'response',
      reasoning: 'Offers proactive follow-up with demo scheduling',
    },
  ]

  return (
    <TicketDetail
      ticket={ticket}
      conversationThread={conversationThread}
      ticketQueue={ticketQueue}
      timelineEvents={timelineEvents}
      aiSuggestions={aiSuggestions}
      currentUser={data.currentUser}
      crmConnected={true}
      crmName="Salesforce"
      onSendReply={(content) => console.log('Send reply:', content)}
      onAddNote={(content) => console.log('Add note:', content)}
      onAssign={(userId) => console.log('Assign to:', userId)}
      onChangeStatus={(status) => console.log('Change status:', status)}
      onChangePriority={(priority) => console.log('Change priority:', priority)}
      onAddTag={(tag) => console.log('Add tag:', tag)}
      onRemoveTag={(tag) => console.log('Remove tag:', tag)}
      onSelectTicket={(ticketId) => console.log('Select ticket:', ticketId)}
      onNextTicket={() => console.log('Next ticket')}
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
