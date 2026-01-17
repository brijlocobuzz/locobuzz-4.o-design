import data from '@/../product/sections/inbox/data.json'
import { TicketDetail } from './components/TicketDetail'

/**
 * Email Thread Ticket Preview
 * Shows the email ticket (ticket-016) with the new simplified email thread view.
 * This demonstrates:
 * - Thread header with subject shown once prominently
 * - Simplified message headers (no From/To/CC on each message)
 * - Participant changes shown with +/- badges
 * - Internal vs external message distinction
 * - HTML and plain text email handling
 */
export default function TicketVariationsPreview() {
  // Load the email ticket
  const ticket = data.tickets.find(t => t.id === 'ticket-016')!
  const conversationThread = data.conversationThreads['ticket-016']

  // Mock ticket queue
  const ticketQueue = data.tickets.slice(1, 4)

  // Mock timeline events
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

  return (
    <TicketDetail
      ticket={ticket}
      conversationThread={conversationThread}
      ticketQueue={ticketQueue}
      timelineEvents={timelineEvents}
      aiSuggestions={data.aiSuggestions['ticket-016'] || []}
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
