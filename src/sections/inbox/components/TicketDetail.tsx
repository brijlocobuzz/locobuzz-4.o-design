import { useState } from 'react'
import { TicketHeader, type MessageInsights } from './TicketHeader'
import { ConversationThread } from './ConversationThread'
import { ReplyComposer } from './ReplyComposer'
import { EmailReplyComposer, EmailComposeModal } from './EmailReplyComposer'
import { RightPanelNav } from './RightPanelNav'
import { CustomerInfoPanel } from './CustomerInfoPanel'
import { PersonalDetailsPanel } from './PersonalDetailsPanel'
import { TicketInformationPanel } from './TicketInformationPanel'
import { CRMIntegrationPanel } from './CRMIntegrationPanel'
import { TimelinePanel } from './TimelinePanel'
import { TicketQueueSidebar } from './TicketQueueSidebar'
import { ClassificationPanel } from './ClassificationPanel'

type RightPanelView =
  | 'customer'
  | 'personal-details'
  | 'ticket-info'
  | 'crm-integration'
  | 'timeline'
  | 'classification'

export interface TicketDetailProps {
  ticket: any
  conversationThread: any
  ticketQueue?: any[]
  timelineEvents?: any[]
  aiSuggestions?: any[]
  currentUser: any
  crmConnected?: boolean
  crmName?: string
  messageInsights?: MessageInsights
  onMessageInsightsChange?: (insights: MessageInsights) => void
  onSendReply?: (content: string) => void
  onAddNote?: (content: string) => void
  onAssign?: (userId: string) => void
  onChangeStatus?: (status: string) => void
  onChangePriority?: (priority: string) => void
  onAddTag?: (tag: string) => void
  onRemoveTag?: (tag: string) => void
  onSelectTicket?: (ticketId: string) => void
  onNextTicket?: () => void
  onSavePersonalDetails?: (updates: Record<string, any>) => void
  onSaveTicketInfo?: (updates: Record<string, any>) => void
  onEscalateTicket?: (data: Record<string, any>) => void
  onCloseTicket?: (data: Record<string, any>) => void
  onCreateCRMTicket?: (ticketData: any) => void
  onSyncCRM?: () => void
  onExecuteAgentAction?: (actionId: string) => void
  onClose?: () => void
}

export function TicketDetail({
  ticket,
  conversationThread,
  ticketQueue = [],
  timelineEvents = [],
  aiSuggestions,
  crmConnected = false,
  crmName = 'Salesforce',
  messageInsights,
  onMessageInsightsChange,
  onSendReply,
  onAddNote,
  onChangeStatus,
  onChangePriority,
  onAddTag,
  onRemoveTag,
  onSelectTicket,
  onNextTicket,
  onSavePersonalDetails,
  onSaveTicketInfo,
  onEscalateTicket,
  onCloseTicket,
  onCreateCRMTicket,
  onSyncCRM,
  onExecuteAgentAction: _onExecuteAgentAction,
  onClose,
}: TicketDetailProps) {
  const [activePanel, setActivePanel] = useState<RightPanelView>('customer')
  const [showEmailComposeModal, setShowEmailComposeModal] = useState(false)

  // Determine if this is an email ticket
  const isEmailTicket = ticket.interactionType === 'email'

  // Get email-specific data for composer
  const getEmailDefaults = () => {
    if (!conversationThread?.emailThreadMetadata) return {}
    const meta = conversationThread.emailThreadMetadata
    return {
      defaultTo: meta.originalParticipants?.from?.email || '',
      defaultCc: meta.originalParticipants?.cc?.map((c: any) => c.email) || [],
    }
  }

  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <TicketHeader
        ticket={ticket}
        hasNextTicket={ticketQueue.length > 0}
        messageInsights={messageInsights}
        onMessageInsightsChange={onMessageInsightsChange}
        onChangeStatus={onChangeStatus}
        onChangePriority={onChangePriority}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
        onNextTicket={onNextTicket}
        onClose={onClose}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Ticket Queue Sidebar */}
        <TicketQueueSidebar
          tickets={ticketQueue}
          currentTicketId={ticket.id}
          onSelectTicket={onSelectTicket}
        />

        {/* Center: Conversation Thread + Reply Composer + AI Assist */}
        <div className="flex flex-1 flex-col">
          <ConversationThread
            conversationThread={conversationThread}
            ticket={ticket}
            messageInsights={messageInsights}
          />
          {isEmailTicket ? (
            <EmailReplyComposer
              aiSuggestions={aiSuggestions}
              {...getEmailDefaults()}
              onSendReply={onSendReply}
              onAddNote={onAddNote}
              onPopOut={() => setShowEmailComposeModal(true)}
            />
          ) : (
            <ReplyComposer
              aiSuggestions={aiSuggestions}
              onSendReply={onSendReply}
              onAddNote={onAddNote}
              ticketPlatform={ticket.channel?.platform || ticket.platform}
              ticketType={ticket.interactionType}
              mentionedUsers={ticket.mentionedUsers || []}
              enableAgentIQ={true}
            />
          )}
        </div>

        {/* Right: Dynamic Panel Content */}
        {activePanel === 'customer' && (
          <CustomerInfoPanel ticket={ticket} crmConnected={crmConnected} />
        )}
        {activePanel === 'classification' && (
          <ClassificationPanel classification={ticket.classification} />
        )}
        {activePanel === 'personal-details' && (
          <PersonalDetailsPanel
            contact={ticket.contact || ticket.author}
            onSave={onSavePersonalDetails}
          />
        )}
        {activePanel === 'ticket-info' && (
          <TicketInformationPanel
            ticket={ticket}
            onSave={onSaveTicketInfo}
            onEscalate={() => onEscalateTicket?.({})}
            onClose={() => onCloseTicket?.({})}
          />
        )}
        {activePanel === 'crm-integration' && (
          <CRMIntegrationPanel
            ticket={ticket}
            crmConnected={crmConnected}
            crmName={crmName}
            onCreateCRMTicket={onCreateCRMTicket}
            onSyncUpdate={onSyncCRM}
          />
        )}
        {activePanel === 'timeline' && <TimelinePanel events={timelineEvents} />}

        {/* Far Right: Panel Navigation */}
        <RightPanelNav
          activeView={activePanel}
          onViewChange={setActivePanel}
          crmConnected={crmConnected}
        />
      </div>

      {/* Email Compose Modal (Pop-out) */}
      {isEmailTicket && (
        <EmailComposeModal
          isOpen={showEmailComposeModal}
          onClose={() => setShowEmailComposeModal(false)}
          {...getEmailDefaults()}
          onSend={(data) => {
            onSendReply?.(data.content)
            setShowEmailComposeModal(false)
          }}
        />
      )}
    </div>
  )
}
