import data from '@/../product/sections/inbox/data.json'
import { TicketDetail } from './components/TicketDetail'

export default function TicketDetailPreview() {
  const ticket = data.tickets[0]
  const conversationThread = data.conversationThreads['ticket-001']
  const aiSuggestions = (data.aiSuggestions as any)['ticket-001'] || []

  // Mock ticket queue - upcoming tickets
  const ticketQueue = data.tickets.slice(1)

  // Mock timeline events
  const timelineEvents = [
    {
      id: '1',
      type: 'status-change' as const,
      timestamp: '2024-12-31T08:15:00Z',
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
      timestamp: '2024-12-31T08:16:00Z',
      user: {
        name: 'System',
      },
      data: {
        assignedTo: 'Sarah Chen',
      },
    },
    {
      id: '3',
      type: 'note' as const,
      timestamp: '2024-12-31T08:20:00Z',
      user: {
        name: 'Sarah Chen',
        avatarUrl: 'https://i.pravatar.cc/150?img=5',
      },
      data: {
        content: 'Customer seems frustrated. Checking order status in system.',
      },
    },
    {
      id: '4',
      type: 'priority-change' as const,
      timestamp: '2024-12-31T08:25:00Z',
      user: {
        name: 'Sarah Chen',
        avatarUrl: 'https://i.pravatar.cc/150?img=5',
      },
      data: {
        from: 'medium',
        to: 'high',
      },
    },
    {
      id: '5',
      type: 'tag-added' as const,
      timestamp: '2024-12-31T08:26:00Z',
      user: {
        name: 'Sarah Chen',
        avatarUrl: 'https://i.pravatar.cc/150?img=5',
      },
      data: {
        tag: 'premium-customer',
      },
    },
    {
      id: '6',
      type: 'edit' as const,
      timestamp: '2024-12-31T08:30:00Z',
      user: {
        name: 'Sarah Chen',
        avatarUrl: 'https://i.pravatar.cc/150?img=5',
      },
      data: {
        field: 'Category',
        oldValue: 'General',
        newValue: 'Delivery Issue',
      },
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
