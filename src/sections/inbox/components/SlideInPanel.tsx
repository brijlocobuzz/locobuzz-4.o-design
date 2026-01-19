import { ConversationThread } from './ConversationThread'
import { ReplyComposer } from './ReplyComposer'
import { EmailReplyComposer } from './EmailReplyComposer'
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
  onApplyAISuggestion: _onApplyAISuggestion,
}: SlideInPanelProps) {

  if (!isOpen) return null

  const isEmail = ticket.interactionType === 'email'

  const handleReply = (content: string, metadata?: { statusAction?: StatusAction; recipients?: { to: string; cc: string[]; bcc: string[] }; taggedUsers?: string[] }) => {
    onReply?.(content, metadata)
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

      {/* Unified Reply Composer (Fixed Bottom) */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
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
    </div>
  )
}
