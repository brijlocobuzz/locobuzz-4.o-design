import { ChevronDown, ChevronUp, Plus, Minus, Lock, MoreHorizontal, FileText, Image as ImageIcon, StickyNote } from 'lucide-react'
import { useState } from 'react'
import type { MessageInsights } from './TicketHeader'
import { MessageInsightsBar } from './MessageInsightsBar'

interface EmailThreadViewProps {
  message: any
  isCustomer: boolean
  showSignatureDefault?: boolean
  messageInsights?: MessageInsights
}

export function EmailThreadView({ message, isCustomer, showSignatureDefault = false, messageInsights }: EmailThreadViewProps) {
  const [showSignature, setShowSignature] = useState(showSignatureDefault)
  const [showHtmlContent, setShowHtmlContent] = useState(false)
  const [showRecipients, setShowRecipients] = useState(false)
  const [showQuotedText, setShowQuotedText] = useState(false)

  const emailMeta = message.emailMetadata

  // Distinguish between internal notes (no email channel) and internal emails (email channel, not sent to customer)
  const isInternalNote = !emailMeta // Locobuzz internal feature, not via email
  const isInternalEmail = emailMeta?.isInternal ?? false // Email channel, but internal only
  const isAgent = !isCustomer && !isInternalNote && !isInternalEmail
  const hasParticipantChanges = emailMeta?.participantChanges &&
    ((emailMeta.participantChanges.added?.length > 0) || (emailMeta.participantChanges.removed?.length > 0))

  // Count recipients (only for email-based messages)
  const toCount = emailMeta?.to?.length || 0
  const ccCount = emailMeta?.cc?.length || 0
  const bccCount = emailMeta?.bcc?.length || 0
  const totalRecipients = toCount + ccCount + bccCount

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // Determine layout: customer left, agent/internal (note or email) right
  const containerClasses = isCustomer ? 'mr-12' : 'ml-12'

  // Styling based on message type
  const cardStyleClasses = isInternalNote
    ? 'bg-purple-50/50 border-purple-200 dark:bg-purple-950/10 dark:border-purple-900'
    : isInternalEmail
      ? 'bg-yellow-50/50 border-yellow-200 dark:bg-yellow-950/10 dark:border-yellow-900'
      : isAgent
        ? 'bg-blue-50/50 border-blue-100 dark:bg-blue-950/10 dark:border-blue-900'
        : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700'

  return (
    <div className={`mb-4 ${containerClasses}`}>
      <div className={`relative rounded-lg border shadow-sm ${cardStyleClasses}`}>

        {/* Internal/Agent Indicator (Top Right Corner) */}
        {(isAgent || isInternalNote || isInternalEmail) && (
          <div className="absolute right-0 top-0 flex items-center gap-1.5 rounded-bl-lg rounded-tr-lg border-b border-l border-slate-100/50 bg-white/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:border-slate-700/50 dark:bg-slate-800/50">
            {isInternalNote && <StickyNote size={10} className="text-purple-600" />}
            {isInternalEmail && <Lock size={10} className="text-yellow-600" />}
            <span>
              {isInternalNote ? 'Internal Note' : isInternalEmail ? 'Internal Email' : 'Agent Reply'}
            </span>
          </div>
        )}

        {/* Message Header */}
        <div className="px-4 py-3 md:px-5">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            {message.author.avatarUrl ? (
              <img
                src={message.author.avatarUrl}
                alt={message.author.name}
                className="h-8 w-8 flex-shrink-0 rounded-full shadow-sm"
              />
            ) : (
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${isInternalNote
                  ? 'bg-purple-200 dark:bg-purple-900'
                  : isInternalEmail
                    ? 'bg-yellow-200 dark:bg-yellow-900'
                    : isAgent
                      ? 'bg-blue-200 dark:bg-blue-900'
                      : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {message.author.name.charAt(0)}
                </span>
              </div>
            )}

            {/* Sender Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {message.author.name}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {formatDateTime(message.timestamp)}
                  </span>
                </div>
              </div>

              {/* Recipient Line with Expand - Only for email-based messages */}
              {!isInternalNote && emailMeta && (
                <div className="mt-0.5 flex flex-col gap-1">
                  <button
                    onClick={() => setShowRecipients(!showRecipients)}
                    className="flex w-fit items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <span className="opacity-75">to</span>
                    <span>{emailMeta.to?.[0]?.name || emailMeta.to?.[0]?.email?.split('@')[0]}</span>
                    {totalRecipients > 1 && (
                      <span className="rounded bg-black/5 px-1 text-[10px] font-medium text-slate-600 dark:bg-white/5 dark:text-slate-400">
                        +{totalRecipients - 1} more
                      </span>
                    )}
                    <ChevronDown
                      size={10}
                      className={`opacity-50 transition-transform ${showRecipients ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Participant Changes - Inline */}
                  {hasParticipantChanges && (
                    <div className="flex flex-wrap gap-1">
                      {emailMeta.participantChanges.added?.map((p: any, idx: number) => (
                        <div
                          key={`add-${idx}`}
                          className="flex items-center gap-1 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400"
                        >
                          <Plus size={10} />
                          <span>Added: {p.name || p.email.split('@')[0]}</span>
                        </div>
                      ))}
                      {emailMeta.participantChanges.removed?.map((p: any, idx: number) => (
                        <div
                          key={`rem-${idx}`}
                          className="flex items-center gap-1 rounded-md border border-red-100 bg-red-50 px-2 py-0.5 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400"
                        >
                          <Minus size={10} />
                          <span>Removed: {p.name || p.email.split('@')[0]}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Internal Note Indicator - No recipients */}
              {isInternalNote && (
                <div className="mt-0.5 text-xs text-purple-600 dark:text-purple-400">
                  Internal note - not sent via email
                </div>
              )}

              {/* Expanded Recipients - Only for email-based messages */}
              {!isInternalNote && showRecipients && emailMeta && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-1 rounded border border-black/5 bg-black/5 p-2 text-xs text-slate-600 dark:border-white/5 dark:bg-white/5 dark:text-slate-400">
                  <div className="mb-1 grid grid-cols-[24px_1fr] gap-1">
                    <span className="text-right text-slate-400">To:</span>
                    <div className="flex flex-wrap gap-1">
                      {emailMeta.to?.map((u: any, idx: number) => (
                        <span key={idx} className="text-slate-700 dark:text-slate-300">
                          {u.email};
                        </span>
                      ))}
                    </div>
                  </div>
                  {ccCount > 0 && (
                    <div className="grid grid-cols-[24px_1fr] gap-1">
                      <span className="text-right text-slate-400">CC:</span>
                      <div className="flex flex-wrap gap-1">
                        {emailMeta.cc?.map((u: any, idx: number) => (
                          <span key={idx} className="text-slate-700 dark:text-slate-300">
                            {u.email};
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Insights Bar - Single line, max 2 pills + count */}
        <MessageInsightsBar
          message={message}
          messageInsights={messageInsights}
          className="border-t border-slate-100/50 px-4 py-1.5 pl-[60px] dark:border-slate-700/50 md:px-5 md:pl-[68px]"
        />

        {/* Message Body */}
        <div className="px-4 pb-4 pl-[60px] md:px-5 md:pl-[68px]">
          {/* HTML Toggle - Only for email-based messages */}
          {!isInternalNote && emailMeta?.isHtml && emailMeta?.htmlContent && (
            <div className="mb-2">
              <button
                onClick={() => setShowHtmlContent(!showHtmlContent)}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                {showHtmlContent ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    View plain text
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    View formatted email
                  </>
                )}
              </button>
            </div>
          )}

          {/* Content */}
          {!isInternalNote && emailMeta?.isHtml && emailMeta?.htmlContent && showHtmlContent ? (
            <div
              className="prose prose-sm max-w-none text-slate-800 leading-relaxed dark:prose-invert dark:text-slate-300"
              dangerouslySetInnerHTML={{ __html: emailMeta.htmlContent }}
            />
          ) : (
            <div className="max-w-none text-sm leading-relaxed text-slate-800 whitespace-pre-wrap dark:text-slate-300">
              {message.content}
            </div>
          )}

          {/* Attachments */}
          {message.hasAttachments && message.attachments && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100/50 pt-3 dark:border-slate-700/50">
              {message.attachments.map((attachment: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  {attachment.type === 'image' ? (
                    <ImageIcon size={16} className="text-purple-600" />
                  ) : (
                    <FileText size={16} className="text-blue-600" />
                  )}
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                      {attachment.filename || 'Attachment'}
                    </span>
                    {attachment.size && (
                      <span className="text-xs text-slate-400">
                        {(attachment.size / 1024).toFixed(0)} KB
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quoted Text (Collapsed) - Only for email-based messages */}
          {!isInternalNote && emailMeta?.quotedBody && (
            <div className="mt-3 pt-2">
              {!showQuotedText ? (
                <button
                  onClick={() => setShowQuotedText(true)}
                  className="flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <MoreHorizontal size={12} />
                  <span>Show quoted text</span>
                </button>
              ) : (
                <div className="relative mt-1 border-l-2 border-slate-200 pl-3 dark:border-slate-700">
                  <div
                    className="text-xs text-slate-400 dark:text-slate-500"
                    dangerouslySetInnerHTML={{ __html: emailMeta.quotedBody }}
                  />
                  <button
                    onClick={() => setShowQuotedText(false)}
                    className="mt-2 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
                  >
                    <ChevronUp size={12} /> Hide
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Signature - Only for email-based messages */}
          {!isInternalNote && emailMeta?.hasSignature && emailMeta?.signatureContent && (
            <div className="mt-3 border-t border-slate-100/50 pt-2 dark:border-slate-700/50">
              <button
                onClick={() => setShowSignature(!showSignature)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              >
                {showSignature ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
                {showSignature ? 'Hide signature' : 'Show signature'}
              </button>

              {showSignature && (
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <p className="whitespace-pre-wrap">
                    {emailMeta.signatureContent.replace(/\\n/g, '\n')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Thread header component - shows subject and original participants once at the top
export function EmailThreadHeader({ threadMetadata }: { threadMetadata: any }) {
  if (!threadMetadata) return null

  const toCount = threadMetadata.originalParticipants.to?.length || 0
  const ccCount = threadMetadata.originalParticipants.cc?.length || 0

  return (
    <div className="mb-4 border-b border-slate-200 pb-4 dark:border-slate-700">
      {/* Subject - Large and prominent */}
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
        {threadMetadata.subject}
      </h1>

      {/* Thread info */}
      <div className="mt-2 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        <span>{threadMetadata.totalMessages} messages in thread</span>
        <span>•</span>
        <span>
          Started by {threadMetadata.originalParticipants.from.name}
        </span>
        {ccCount > 0 && (
          <>
            <span>•</span>
            <span>{toCount + ccCount} participants</span>
          </>
        )}
      </div>
    </div>
  )
}
