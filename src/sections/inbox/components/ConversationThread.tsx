import { User, Lock, Instagram, Facebook, MessageCircle } from 'lucide-react'
import { EmailThreadView, EmailThreadHeader } from './EmailThreadView'
import { ChatBubbleView } from './ChatBubbleView'
import { TransitionBadge } from './TransitionBadge'
import { ParentPostCard } from './ParentPostCard'
import { PublicPostContext } from './PublicPostContext'
import { MessageInsightsBar } from './MessageInsightsBar'
import type { MessageInsights } from './TicketHeader'

interface ConversationThreadProps {
  conversationThread: any
  ticket: any
  messageInsights?: MessageInsights
}

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: MessageCircle,
  linkedin: MessageCircle,
}

// Helper: Group chat messages (within 2 minutes = same group)
function groupChatMessages(messages: any[]) {
  const groups: any[][] = []
  let currentGroup: any[] = []
  let lastTimestamp: Date | null = null

  messages.forEach((msg) => {
    const msgTime = new Date(msg.timestamp)
    const isSameAuthor = currentGroup.length > 0 && currentGroup[0].author.id === msg.author.id
    const withinTimeWindow = lastTimestamp && (msgTime.getTime() - lastTimestamp.getTime()) <= 2 * 60 * 1000

    if (isSameAuthor && withinTimeWindow) {
      currentGroup.push(msg)
    } else {
      if (currentGroup.length > 0) groups.push(currentGroup)
      currentGroup = [msg]
    }
    lastTimestamp = msgTime
  })

  if (currentGroup.length > 0) groups.push(currentGroup)
  return groups
}

export function ConversationThread({ conversationThread, ticket, messageInsights }: ConversationThreadProps) {
  const { mentions, replies, internalNotes } = conversationThread

  // Combine and sort all messages chronologically
  const allMessages = [
    ...mentions.map((m: any) => ({ ...m, type: 'mention' })),
    ...replies.map((r: any) => ({ ...r, type: 'reply' })),
    ...internalNotes.map((n: any) => ({ ...n, type: 'note' })),
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  // Detect variation type
  const isEmail = ticket.interactionType === 'email'
  const isChat = ticket.interactionType === 'chat-message'
  const hasTransition = ticket.conversationTransition !== undefined
  const hasParentPost = ticket.parentPostContext !== undefined
  const hasPublicPost = ticket.publicPostContext !== undefined

  // Find transition point index
  let transitionIndex = -1
  if (hasTransition && ticket.conversationTransition) {
    transitionIndex = allMessages.findIndex(
      (msg) => new Date(msg.timestamp) >= new Date(ticket.conversationTransition.timestamp)
    )
  }

  const PlatformIcon = platformIcons[ticket.author.platform as keyof typeof platformIcons]

  // Render chat variation with grouped bubbles
  if (isChat) {
    const chatMessages = allMessages.filter(m => m.type === 'mention' || m.type === 'reply')
    const messageGroups = groupChatMessages(chatMessages)

    return (
      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-3xl space-y-4 p-6">
          {/* Parent Post Context (if exists) */}
          {hasParentPost && (
            <ParentPostCard
              parentPostContext={ticket.parentPostContext}
              threadNavigator={ticket.threadNavigator}
            />
          )}

          {/* Public Post Context (if exists) */}
          {hasPublicPost && (
            <PublicPostContext publicPostContext={ticket.publicPostContext} />
          )}

          {/* Chat Messages */}
          {messageGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {group.map((message, msgIdx) => {
                const isCustomer = message.type === 'mention'
                const isFirstInGroup = msgIdx === 0
                const isLastInGroup = msgIdx === group.length - 1

                return (
                  <ChatBubbleView
                    key={message.id}
                    message={message}
                    isCustomer={isCustomer}
                    showAvatar={true}
                    showTimestamp={true}
                    isFirstInGroup={isFirstInGroup}
                    isLastInGroup={isLastInGroup}
                    messageInsights={messageInsights}
                  />
                )
              })}
            </div>
          ))}

          {/* Internal Notes */}
          {internalNotes.map((note: any) => (
            <div
              key={note.id}
              className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-950/20"
            >
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-yellow-900 dark:text-yellow-100">
                      Internal Note
                    </span>
                    <span className="text-xs text-yellow-700 dark:text-yellow-400">•</span>
                    <span className="text-xs text-yellow-700 dark:text-yellow-400">
                      {note.author.name}
                    </span>
                    <span className="text-xs text-yellow-600 dark:text-yellow-500">
                      {new Date(note.timestamp).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-yellow-900 dark:text-yellow-100">
                    {note.content}
                  </p>
                  {note.mentions?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {note.mentions.map((mention: string, idx: number) => (
                        <span
                          key={idx}
                          className="rounded bg-yellow-200 px-2 py-0.5 text-xs text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
                        >
                          {mention}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        {/* Email Thread Header (for email tickets - shows subject once) */}
        {isEmail && ticket.emailThreadMetadata && (
          <EmailThreadHeader threadMetadata={ticket.emailThreadMetadata} />
        )}

        {/* Parent Post Context (if exists) */}
        {hasParentPost && (
          <ParentPostCard
            parentPostContext={ticket.parentPostContext}
            threadNavigator={ticket.threadNavigator}
          />
        )}

        {/* Public Post Context (if exists) */}
        {hasPublicPost && (
          <PublicPostContext publicPostContext={ticket.publicPostContext} />
        )}

        {allMessages.map((message, index) => {
          // Show transition badge at the transition point
          const showTransition = hasTransition && index === transitionIndex

          return (
            <div key={message.id}>
              {showTransition && (
                <TransitionBadge transition={ticket.conversationTransition} />
              )}

              {/* Render email messages with EmailThreadView */}
              {isEmail && (message.type === 'mention' || message.type === 'reply') && (
                <EmailThreadView
                  message={message}
                  isCustomer={message.type === 'mention'}
                  messageInsights={messageInsights}
                />
              )}

              {/* Render standard DM/post messages (non-email, non-chat) */}
              {!isEmail && message.type === 'mention' && (
                <div>
                  <div className="flex gap-3">
                    {/* Customer Avatar */}
                    {message.author.avatarUrl ? (
                      <img
                        src={message.author.avatarUrl}
                        alt={message.author.name}
                        className="h-10 w-10 flex-shrink-0 rounded-full"
                      />
                    ) : (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                        <User className="h-5 w-5 text-slate-500" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {message.author.name}
                        </span>
                        {PlatformIcon && <PlatformIcon className="h-4 w-4 text-slate-400" />}
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(message.timestamp).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="mt-2 rounded-lg rounded-tl-none bg-slate-100 px-4 py-3 dark:bg-slate-800">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Message Insights Bar - Below message */}
                  <MessageInsightsBar
                    message={message}
                    messageInsights={messageInsights}
                    className="ml-[52px] mt-1"
                  />
                </div>
              )}

              {!isEmail && message.type === 'reply' && (
                <div>
                  <div className="flex gap-3">
                    {/* Agent Avatar */}
                    {message.author.avatarUrl ? (
                      <img
                        src={message.author.avatarUrl}
                        alt={message.author.name}
                        className="h-10 w-10 flex-shrink-0 rounded-full"
                      />
                    ) : (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
                        <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {message.author.name}
                        </span>
                        <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          Agent
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(message.timestamp).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="mt-2 rounded-lg rounded-tl-none bg-indigo-50 px-4 py-3 dark:bg-indigo-950/30">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Message Insights Bar - Below message */}
                  <MessageInsightsBar
                    message={message}
                    messageInsights={messageInsights}
                    className="ml-[52px] mt-1"
                  />
                </div>
              )}

              {/* Internal Notes (always rendered the same) */}
              {message.type === 'note' && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-950/20">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-yellow-900 dark:text-yellow-100">
                          Internal Note
                        </span>
                        <span className="text-xs text-yellow-700 dark:text-yellow-400">•</span>
                        <span className="text-xs text-yellow-700 dark:text-yellow-400">
                          {message.author.name}
                        </span>
                        <span className="text-xs text-yellow-600 dark:text-yellow-500">
                          {new Date(message.timestamp).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-yellow-900 dark:text-yellow-100">
                        {message.content}
                      </p>
                      {message.mentions?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {message.mentions.map((mention: string, idx: number) => (
                            <span
                              key={idx}
                              className="rounded bg-yellow-200 px-2 py-0.5 text-xs text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
                            >
                              {mention}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* No messages state */}
        {allMessages.length === 0 && (
          <div className="py-12 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              No conversation messages yet
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
