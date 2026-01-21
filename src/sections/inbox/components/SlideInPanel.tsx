import { useState } from 'react'
import { XCircle, UserPlus, Mail, ChevronDown } from 'lucide-react'
import { ConversationThread } from './ConversationThread'
import { ReplyComposer } from './ReplyComposer'
import { EmailReplyComposer } from './EmailReplyComposer'
import { TicketCloseModal } from './TicketCloseModal'
import type { SlideInPanelProps, StatusAction } from '@/../product/sections/inbox/types'

export function SlideInPanel({
  ticket,
  conversation,
  aiSuggestions,
  isOpen,
  onClose,
  onPopOut,
  onDraftSave,
  onSubmitForApproval,
  onInternalNote,
  onReply,
  onApplyAISuggestion,
}: SlideInPanelProps) {

  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showAssignDropdown, setShowAssignDropdown] = useState(false)

  // Sample team members for assignment
  const teamMembers = [
    { id: 'tm-1', name: 'Sarah Chen', role: 'Senior Support' },
    { id: 'tm-2', name: 'Mike Rodriguez', role: 'Team Lead' },
    { id: 'tm-3', name: 'Emily Watson', role: 'Technical Support' },
    { id: 'tm-4', name: 'Alex Kumar', role: 'Support Specialist' },
  ]

  if (!isOpen) return null

  const isEmail = ticket.interactionType === 'email'

  const handleReply = (content: string, metadata?: { statusAction?: StatusAction; recipients?: { to: string; cc: string[]; bcc: string[] }; taggedUsers?: string[] }) => {
    onReply?.(content, metadata)
  }

  const handleCloseTicket = (disposition: string, sendFeedbackForm: boolean, notes?: string) => {
    console.log('Closing ticket:', { ticketId: ticket.id, disposition, sendFeedbackForm, notes })
    setShowCloseModal(false)
    // In real implementation, this would call an API to close the ticket
  }

  const handleAssignTicket = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId)
    console.log('Assigning ticket to:', member?.name)
    setShowAssignDropdown(false)
    // In real implementation, this would call an API to assign the ticket
  }

  const handleEmailInternal = () => {
    console.log('Opening internal email for ticket:', ticket.id)
    // In real implementation, this would open an email composer modal
    alert(`Email internal team about ticket ${ticket.ticketNumber}`)
  }

  return (
    <div className="fixed inset-y-0 right-0 w-2/3 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-50">
      {/* Header Toolbar */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {ticket.ticketNumber}
            </h2>
            <span className={`px-2 py-1 rounded text-xs font-medium uppercase
              ${ticket.status === 'new' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : ''}
              ${ticket.status === 'open' ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300' : ''}
              ${ticket.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300' : ''}
              ${ticket.status === 'resolved' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' : ''}
            `}>
              {ticket.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPopOut?.(ticket.id)}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
              title="Pop out to full page"
            >
              <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
              title="Close panel"
            >
              <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="grid grid-cols-3 gap-6 p-6 flex-1">
          {/* Conversation Thread (Left 2/3) */}
          <div className="col-span-2 flex flex-col min-h-0">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Conversation</h3>
            <div className="flex-1 overflow-y-auto border rounded-xl border-slate-200 dark:border-slate-800">
              <ConversationThread
                conversationThread={conversation}
                ticket={ticket}
              />
            </div>
          </div>

          {/* Customer Context Panel (Right 1/3) */}
          <div className="space-y-6">
            {/* Contact Profile */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Customer Profile</h4>
              <div className="flex items-center gap-3 mb-4">
                <img src={ticket.author.avatarUrl} alt={ticket.author.name} className="w-12 h-12 rounded-full" />
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{ticket.contact.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">@{ticket.author.username}</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {ticket.contact.email && (
                  <div className="text-slate-600 dark:text-slate-400">{ticket.contact.email}</div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">Followers</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {ticket.author.followerCount?.toLocaleString() || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">Previous Interactions</span>
                  <span className="font-medium text-slate-900 dark:text-white">{ticket.contact.previousInteractions}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Reply Composer with Action Buttons */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="flex gap-4">
          {/* Reply Composer (Left side - takes most space) */}
          <div className="flex-1 min-w-0">
            {isEmail ? (
              <EmailReplyComposer
                aiSuggestions={aiSuggestions}
                defaultTo={ticket.contact.email || ''}
                onSendReply={(content, recipients, action) => {
                  handleReply(content, { recipients, statusAction: action })
                }}
                onAddNote={onInternalNote}
                onPopOut={() => onPopOut?.(ticket.id)}
              />
            ) : (
              <ReplyComposer
                aiSuggestions={aiSuggestions}
                onDraftSave={onDraftSave}
                onSubmitForApproval={onSubmitForApproval}
                onSendReply={(content, action, taggedUsers) => {
                  handleReply(content, { statusAction: action, taggedUsers })
                }}
                onAddNote={onInternalNote}
                ticketPlatform={ticket.channel.platform}
                ticketType={ticket.interactionType}
              />
            )}
          </div>

          {/* Quick Action Buttons (Right side) */}
          <div className="flex-shrink-0 flex flex-col justify-center gap-2 pr-4 py-4 border-l border-slate-200 dark:border-slate-800 pl-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
              Quick Actions
            </p>

            {/* Close Ticket Button */}
            <button
              onClick={() => setShowCloseModal(true)}
              className="flex items-center gap-2 rounded-lg bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50"
            >
              <XCircle className="h-4 w-4" />
              Close Ticket
            </button>

            {/* Assign Ticket Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                className="flex w-full items-center justify-between gap-2 rounded-lg bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
              >
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Assign
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showAssignDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Assign Dropdown */}
              {showAssignDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowAssignDropdown(false)}
                  />
                  <div className="absolute bottom-full right-0 z-20 mb-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                    <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                        Assign to
                      </p>
                    </div>
                    <div className="max-h-48 overflow-y-auto py-1">
                      {teamMembers.map((member) => (
                        <button
                          key={member.id}
                          onClick={() => handleAssignTicket(member.id)}
                          className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <div>
                            <div className="font-medium text-slate-700 dark:text-slate-300">{member.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{member.role}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Email Internal Team Button */}
            <button
              onClick={handleEmailInternal}
              className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50"
            >
              <Mail className="h-4 w-4" />
              Email Team
            </button>
          </div>
        </div>
      </div>

      {/* Close Ticket Modal */}
      <TicketCloseModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={handleCloseTicket}
        ticketId={ticket.ticketNumber}
        customerName={ticket.contact.name}
      />
    </div>
  )
}
