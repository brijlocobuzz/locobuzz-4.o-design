import { useState } from 'react'
import data from '@/../product/sections/inbox/data.json'
import { Inbox } from './components/Inbox'
import type { InboxData } from '@/../product/sections/inbox/types'
import { SlidersHorizontal } from 'lucide-react'

export default function InboxPreview() {
  const inboxData = data as unknown as InboxData
  const [activeView, setActiveView] = useState('view-open')
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  return (
    <div className="h-full overflow-hidden relative">
      {/* Filter trigger button (floating) */}
      <button
        onClick={() => setIsFilterPanelOpen(true)}
        className="fixed top-4 right-4 z-30 flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-lg transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-700"
        title="Open filters"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span>Filters</span>
      </button>

      <Inbox
        currentUser={inboxData.currentUser}
        sidebarViews={inboxData.sidebarViews}
        tickets={inboxData.tickets}
        conversationThreads={inboxData.conversationThreads}
        aiSuggestions={inboxData.aiSuggestions}
        savedSearches={inboxData.savedSearches}
        users={inboxData.users}
        teams={inboxData.teams}
        displayMode="compact"
        activeView={activeView}
        isFilterPanelOpen={isFilterPanelOpen}
        onFilterPanelClose={() => setIsFilterPanelOpen(false)}
        onViewChange={(viewId) => {
          console.log('View changed:', viewId)
          setActiveView(viewId)
        }}
        onDisplayModeChange={(mode) => console.log('Display mode changed:', mode)}
        onTicketOpen={(ticketId) => console.log('Ticket opened:', ticketId)}
        onTicketClose={() => console.log('Ticket closed')}
        onPopOut={(ticketId) => console.log('Pop out ticket:', ticketId)}
        onSearch={(query) => console.log('Search:', query)}
        onSaveSearch={(search) => console.log('Save search:', search)}
        onLoadSearch={(searchId) => console.log('Load search:', searchId)}
        onReply={(ticketId, content, tone) => console.log('Reply:', ticketId, content, tone)}
        onInternalNote={(ticketId, content, mentions) => console.log('Internal note:', ticketId, content, mentions)}
        onAssign={(ticketId, userId, teamId) => console.log('Assign:', ticketId, userId, teamId)}
        onClose={(ticketId) => console.log('Close ticket:', ticketId)}
        onAddTags={(ticketId, tags) => console.log('Add tags:', ticketId, tags)}
        onCreateTask={(ticketId) => console.log('Create task:', ticketId)}
        onEscalate={(ticketId) => console.log('Escalate:', ticketId)}
        onSendToTeam={(ticketId, teamId, message) => console.log('Send to team:', ticketId, teamId, message)}
        onChangePriority={(ticketId, priority) => console.log('Change priority:', ticketId, priority)}
        onChangeStatus={(ticketId, status) => console.log('Change status:', ticketId, status)}
        onSelectionChange={(ticketIds) => console.log('Selection changed:', ticketIds)}
        onBulkAssign={(ticketIds, userId, teamId) => console.log('Bulk assign:', ticketIds, userId, teamId)}
        onBulkClose={(ticketIds) => console.log('Bulk close:', ticketIds)}
        onBulkTag={(ticketIds, tags) => console.log('Bulk tag:', ticketIds, tags)}
        onBulkStatusChange={(ticketIds, status) => console.log('Bulk status change:', ticketIds, status)}
        onBulkPriorityChange={(ticketIds, priority) => console.log('Bulk priority change:', ticketIds, priority)}
        onBulkMarkRead={(ticketIds) => console.log('Bulk mark read:', ticketIds)}
        onAIFeedbackPositive={(suggestionId) => console.log('AI feedback positive:', suggestionId)}
        onAIFeedbackNegative={(suggestionId, reason) => console.log('AI feedback negative:', suggestionId, reason)}
        onApplyAISuggestion={(ticketId, suggestionId) => console.log('Apply AI suggestion:', ticketId, suggestionId)}
        onDraftSave={(ticketId, content) => console.log('Draft save:', ticketId, content)}
        onSubmitForApproval={(ticketId, content) => console.log('Submit for approval:', ticketId, content)}
      />
    </div>
  )
}
