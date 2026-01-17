import data from '@/../product/sections/inbox/data.json'
import { TicketDetail } from './components/TicketDetail'

/**
 * Michael Chen - Google Review Ticket Preview
 * Shows ticket-004: A positive 5-star Google review.
 * Demonstrates:
 * - Google Review interaction type
 * - Positive sentiment / praise intent
 * - New ticket (unassigned, not replied)
 * - Review-specific display with star rating
 */
export default function MichaelChenPreview() {
  // Load Michael Chen's ticket (ticket-004)
  const ticket = data.tickets.find(t => t.id === 'ticket-004')!
  const conversationThread = data.conversationThreads['ticket-004']

  // Mock ticket queue
  const ticketQueue = data.tickets.filter(t => t.id !== 'ticket-004').slice(0, 4)

  // Mock timeline events - minimal since it's a new ticket
  const timelineEvents = [
    {
      id: '1',
      type: 'created' as const,
      timestamp: '2024-12-31T09:30:00Z',
      user: {
        name: 'System',
      },
      data: {
        source: 'Google Reviews',
      },
    },
  ]

  // AI suggestions for responding to positive reviews
  const aiSuggestions = [
    {
      id: 'sug-004-1',
      content: "Thank you so much for the wonderful review, Michael! We're thrilled to hear that our customer service team made your onboarding experience smooth. It means a lot that your team found the platform intuitive. We're here whenever you need us!",
      confidence: 0.95,
      type: 'response',
      reasoning: 'Grateful acknowledgment of positive feedback, reinforces mentioned positives',
    },
    {
      id: 'sug-004-2',
      content: "Michael, thank you for taking the time to share your experience! We're so glad the real-time analytics dashboard is helping your team. If you ever have questions or want to explore more features, don't hesitate to reach out. Welcome to the Locobuzz family!",
      confidence: 0.88,
      type: 'response',
      reasoning: 'Warm response that acknowledges specific feature mentioned and offers ongoing support',
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
      crmConnected={false}
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
