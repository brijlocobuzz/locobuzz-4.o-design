import {
  Send,
  Sparkles,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Lock,
  MessageCircle,
  Maximize2,
  X,
  UserPlus,
} from 'lucide-react'
import type { AISuggestion, EmailReplyComposerProps, StatusAction } from '@/../product/sections/inbox/types'
import { AISuggestionOverlay } from './AISuggestionOverlay'

import { useState } from 'react'

type InternalStatusAction = '' | StatusAction

export function EmailReplyComposer({
  aiSuggestions = [],
  defaultTo = '',
  defaultCc = [],
  onSendReply,
  onAddNote,
  onPopOut,
}: EmailReplyComposerProps) {
  const [replyMode, setReplyMode] = useState<'reply' | 'note'>('reply')
  const [content, setContent] = useState('')
  const [showRecipientFields, setShowRecipientFields] = useState(false)
  const [to, setTo] = useState(defaultTo)
  const [cc, setCc] = useState(defaultCc?.join('; ') ?? '')
  const [bcc, setBcc] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [statusAction, setStatusAction] = useState<InternalStatusAction>('')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

  // AI Suggest state
  const [isLoadingAISuggestion, setIsLoadingAISuggestion] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null)
  const [showAISuggestion, setShowAISuggestion] = useState(false)

  const handleSend = () => {
    if (!content.trim()) return

    if (replyMode === 'reply') {
      onSendReply?.(content, {
        to,
        cc: cc.split(';').map(e => e.trim()).filter(Boolean),
        bcc: bcc.split(';').map(e => e.trim()).filter(Boolean),
      }, statusAction || undefined)
    } else {
      onAddNote?.(content)
    }

    setContent('')
    setShowAISuggestion(false)
    setAiSuggestion(null)
    setStatusAction('')
  }

  const getStatusLabel = (action: InternalStatusAction) => {
    switch (action) {
      case 'hold':
        return 'Put on Hold'
      case 'escalate':
        return 'Escalate'
      case 'awaiting':
        return 'Awaiting Customer Response'
      default:
        return ''
    }
  }

  const getSendButtonText = () => {
    if (replyMode === 'note') return 'Add Note'
    if (statusAction) return `Reply and ${getStatusLabel(statusAction)}`
    return 'Send Reply'
  }

  const generateAISuggestion = () => {
    if (!content.trim()) return

    setIsLoadingAISuggestion(true)
    setShowAISuggestion(true)

    // Simulate API call with 2-4 second delay
    const delay = 2000 + Math.random() * 2000
    setTimeout(() => {
      // Use first suggestion from aiSuggestions if available
      if (aiSuggestions && aiSuggestions.length > 0) {
        setAiSuggestion(aiSuggestions[0])
      } else {
        // Fallback improved suggestion
        setAiSuggestion({
          id: 'ai-generated',
          content: `I understand your concern and I'm here to help. ${content} I'll make sure to address this promptly and keep you updated throughout the process. Please let me know if there's anything specific you'd like me to prioritize.`,
          tone: 'friendly',
          source: 'Knowledge Base - Email Response Guidelines',
          isWithinKB: true,
        } as AISuggestion)
      }
      setIsLoadingAISuggestion(false)
    }, delay)
  }

  const handleUseAISuggestion = (suggestionContent: string) => {
    setContent(suggestionContent)
    setShowAISuggestion(false)
    setAiSuggestion(null)
  }

  const handleDiscardAISuggestion = () => {
    setShowAISuggestion(false)
    setAiSuggestion(null)
  }

  return (
    <div className="relative border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Mode Tabs + Actions */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex">
          <button
            onClick={() => setReplyMode('reply')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${replyMode === 'reply'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
          >
            <MessageCircle className="h-4 w-4" />
            Reply
          </button>
          <button
            onClick={() => setReplyMode('note')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${replyMode === 'note'
              ? 'border-yellow-600 text-yellow-600 dark:border-yellow-400 dark:text-yellow-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
          >
            <Lock className="h-4 w-4" />
            Internal Note
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 px-2">
          {/* Pop-out button */}
          <button
            onClick={onPopOut}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            title="Pop out editor"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Recipient Fields (collapsible) - Only for reply mode */}
      {replyMode === 'reply' && (
        <div className="border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setShowRecipientFields(!showRecipientFields)}
            className="flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <UserPlus className="h-4 w-4" />
              <span>To: {to || 'Select recipient'}</span>
              {cc && <span className="text-slate-400">• CC: {cc.split(';').length} people</span>}
              {bcc && <span className="text-slate-400">• BCC: {bcc.split(';').length} people</span>}
            </div>
            {showRecipientFields ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {showRecipientFields && (
            <div className="space-y-3 bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
              {/* To field */}
              <div className="flex items-center gap-3">
                <label className="w-12 flex-shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
                  To:
                </label>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="recipient@email.com"
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                />
              </div>

              {/* CC field */}
              <div className="flex items-center gap-3">
                <label className="w-12 flex-shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
                  CC:
                </label>
                <input
                  type="text"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="email1@example.com; email2@example.com"
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                />
              </div>

              {/* BCC field */}
              <div className="flex items-center gap-3">
                <label className="w-12 flex-shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
                  BCC:
                </label>
                <input
                  type="text"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="hidden@example.com"
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Composer Area */}
      <div className="p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={replyMode === 'reply' ? 'Write your reply...' : 'Add internal note...'}
          rows={isExpanded ? 8 : 4}
          className={`w-full resize-none rounded-lg border px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 ${replyMode === 'reply'
            ? 'border-slate-200 bg-white focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800'
            : 'border-yellow-200 bg-yellow-50 focus:border-yellow-500 focus:ring-yellow-500/20 dark:border-yellow-900 dark:bg-yellow-950/20'
            } text-slate-900 dark:text-white dark:placeholder-slate-500`}
        />

        {/* Actions */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300">
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              title={isExpanded ? 'Collapse editor' : 'Expand editor'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>

            {/* AI Suggest Button */}
            <button
              onClick={generateAISuggestion}
              disabled={!content.trim() || isLoadingAISuggestion}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              title="Get AI-improved suggestion"
            >
              <Sparkles className="h-4 w-4" />
              AI Suggest
            </button>
          </div>

          <div className="flex items-center gap-0">
            <button
              onClick={handleSend}
              disabled={!content.trim()}
              className={`flex items-center gap-2 rounded-lg rounded-r-none px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${replyMode === 'reply'
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                : 'bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600'
                }`}
            >
              <Send className="h-4 w-4" />
              {getSendButtonText()}
            </button>

            {/* Status Change Dropdown - Only show for reply mode */}
            {replyMode === 'reply' && (
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="flex items-center rounded-lg rounded-l-none border-l border-indigo-500 bg-indigo-600 px-2 py-2 text-white transition-colors hover:bg-indigo-700 dark:border-indigo-400 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Dropdown Menu */}
                {showStatusDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowStatusDropdown(false)}
                    />
                    <div className="absolute bottom-full right-0 z-20 mb-1 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                      <button
                        onClick={() => {
                          setStatusAction('')
                          setShowStatusDropdown(false)
                        }}
                        className={`flex w-full items-center px-4 py-2 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${statusAction === ''
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                          : 'text-slate-700 dark:text-slate-300'
                          }`}
                      >
                        Reply only
                      </button>
                      <button
                        onClick={() => {
                          setStatusAction('hold')
                          setShowStatusDropdown(false)
                        }}
                        className={`flex w-full items-center px-4 py-2 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${statusAction === 'hold'
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                          : 'text-slate-700 dark:text-slate-300'
                          }`}
                      >
                        Put on Hold
                      </button>
                      <button
                        onClick={() => {
                          setStatusAction('escalate')
                          setShowStatusDropdown(false)
                        }}
                        className={`flex w-full items-center px-4 py-2 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${statusAction === 'escalate'
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                          : 'text-slate-700 dark:text-slate-300'
                          }`}
                      >
                        Escalate
                      </button>
                      <button
                        onClick={() => {
                          setStatusAction('awaiting')
                          setShowStatusDropdown(false)
                        }}
                        className={`flex w-full items-center px-4 py-2 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${statusAction === 'awaiting'
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                          : 'text-slate-700 dark:text-slate-300'
                          }`}
                      >
                        Awaiting Customer Response
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Suggestion Overlay */}
      <AISuggestionOverlay
        isOpen={showAISuggestion}
        isLoading={isLoadingAISuggestion}
        suggestion={aiSuggestion}
        onUse={handleUseAISuggestion}
        onDiscard={handleDiscardAISuggestion}
      />
    </div>
  )
}

// Gmail-style Pop-out Composer
export function EmailComposeModal({
  isOpen,
  onClose,
  aiSuggestions = [],
  defaultTo = '',
  defaultCc = [],
  defaultSubject = '',
  onSend,
}: {
  isOpen: boolean
  onClose: () => void
  aiSuggestions?: any[]
  defaultTo?: string
  defaultCc?: string[]
  defaultSubject?: string
  onSend?: (data: { to: string; cc: string[]; bcc: string[]; subject: string; content: string; statusAction?: string }) => void
}) {
  const [to, setTo] = useState(defaultTo)
  const [cc, setCc] = useState(defaultCc?.join('; ') ?? '')
  const [bcc, setBcc] = useState('')
  const [subject] = useState(defaultSubject)
  const [content, setContent] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [showRecipientFields, setShowRecipientFields] = useState(false)
  const [statusAction, setStatusAction] = useState<InternalStatusAction>('')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

  // AI Suggest state
  const [isLoadingAISuggestion, setIsLoadingAISuggestion] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null)
  const [showAISuggestion, setShowAISuggestion] = useState(false)

  if (!isOpen) return null

  const handleSend = () => {
    onSend?.({
      to,
      cc: cc.split(';').map(e => e.trim()).filter(Boolean),
      bcc: bcc.split(';').map(e => e.trim()).filter(Boolean),
      subject,
      content,
      statusAction: statusAction || undefined,
    })
    onClose()
  }

  const getStatusLabel = (action: InternalStatusAction) => {
    switch (action) {
      case 'hold':
        return 'Put on Hold'
      case 'escalate':
        return 'Escalate'
      case 'awaiting':
        return 'Awaiting Customer Response'
      default:
        return ''
    }
  }

  const getSendButtonText = () => {
    if (statusAction) return `Send and ${getStatusLabel(statusAction)}`
    return 'Send'
  }

  const generateAISuggestion = () => {
    if (!content.trim()) return

    setIsLoadingAISuggestion(true)
    setShowAISuggestion(true)

    // Simulate API call with 2-4 second delay
    const delay = 2000 + Math.random() * 2000
    setTimeout(() => {
      // Use first suggestion from aiSuggestions if available
      if (aiSuggestions && aiSuggestions.length > 0) {
        setAiSuggestion(aiSuggestions[0])
      } else {
        // Fallback improved suggestion
        setAiSuggestion({
          id: 'ai-generated',
          content: `I understand your concern and I'm here to help. ${content} I'll make sure to address this promptly and keep you updated throughout the process. Please let me know if there's anything specific you'd like me to prioritize.`,
          tone: 'friendly',
          source: 'Knowledge Base - Email Response Guidelines',
          isWithinKB: true,
        } as AISuggestion)
      }
      setIsLoadingAISuggestion(false)
    }, delay)
  }

  const handleUseAISuggestion = (suggestionContent: string) => {
    setContent(suggestionContent)
    setShowAISuggestion(false)
    setAiSuggestion(null)
  }

  const handleDiscardAISuggestion = () => {
    setShowAISuggestion(false)
    setAiSuggestion(null)
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-6 z-50 w-80">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex w-full items-center justify-between rounded-t-lg bg-slate-900 px-4 py-3 text-white shadow-2xl hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <span className="font-medium">Compose Reply</span>
          <div className="flex items-center gap-2">
            <ChevronUp className="h-4 w-4" />
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="rounded p-1 hover:bg-slate-700 dark:hover:bg-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Transparent overlay - allows background interaction */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Floating compose window - Gmail style */}
      <div className="relative fixed bottom-0 right-6 z-50 flex w-[600px] flex-col rounded-t-xl bg-white shadow-2xl dark:bg-slate-900" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-xl bg-slate-900 px-4 py-3 text-white dark:bg-slate-100 dark:text-slate-900">
          <div className="flex items-center gap-3">
            <h3 className="font-medium">Compose Reply</h3>
            {!showRecipientFields && defaultTo && (
              <span className="text-xs opacity-70">to {defaultTo.split('@')[0]}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="rounded p-1.5 hover:bg-slate-700 dark:hover:bg-slate-200"
              title="Minimize"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded p-1.5 hover:bg-slate-700 dark:hover:bg-slate-200"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Compact Recipients Header */}
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 dark:text-slate-400">To:</span>
            {!showRecipientFields ? (
              <button
                onClick={() => setShowRecipientFields(true)}
                className="flex-1 text-left text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
              >
                {defaultTo || 'Select recipient'}
                {cc && <span className="ml-2 text-xs text-slate-500">+CC</span>}
              </button>
            ) : (
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@email.com"
                className="flex-1 border-0 bg-transparent p-0 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder-slate-500"
              />
            )}
          </div>

          {/* Expandable CC/BCC */}
          {showRecipientFields && (
            <>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="text-slate-500 dark:text-slate-400">CC:</span>
                <input
                  type="text"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="Optional"
                  className="flex-1 border-0 bg-transparent p-0 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder-slate-500"
                />
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="text-slate-500 dark:text-slate-400">BCC:</span>
                <input
                  type="text"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="Optional"
                  className="flex-1 border-0 bg-transparent p-0 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder-slate-500"
                />
              </div>
            </>
          )}

          {/* Subject - Compact */}
          {subject && (
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              Re: {subject}
            </div>
          )}
        </div>

        {/* Compose Area - Main Focus */}
        <div className="flex-1 overflow-y-auto p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your email..."
            className="h-full min-h-[300px] w-full resize-none border-0 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
            autoFocus
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 p-3 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
              <Paperclip className="h-4 w-4" />
              Attach
            </button>

            {/* AI Suggest Button */}
            <button
              onClick={generateAISuggestion}
              disabled={!content.trim() || isLoadingAISuggestion}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1.5 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              title="Get AI-improved suggestion"
            >
              <Sparkles className="h-4 w-4" />
              AI Suggest
            </button>
          </div>

          <div className="flex items-center gap-0">
            <button
              onClick={handleSend}
              disabled={!content.trim() || !to.trim()}
              className="flex items-center gap-2 rounded-lg rounded-r-none bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {getSendButtonText()}
            </button>

            {/* Status Change Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex items-center rounded-lg rounded-l-none border-l border-indigo-500 bg-indigo-600 px-2 py-2 text-white transition-colors hover:bg-indigo-700"
              >
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* Dropdown Menu */}
              {showStatusDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowStatusDropdown(false)}
                  />
                  <div className="absolute bottom-full right-0 z-20 mb-1 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                    <button
                      onClick={() => {
                        setStatusAction('')
                        setShowStatusDropdown(false)
                      }}
                      className={`flex w-full items-center px-4 py-2 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${statusAction === ''
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-300'
                        }`}
                    >
                      Send only
                    </button>
                    <button
                      onClick={() => {
                        setStatusAction('hold')
                        setShowStatusDropdown(false)
                      }}
                      className={`flex w-full items-center px-4 py-2 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${statusAction === 'hold'
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-300'
                        }`}
                    >
                      Put on Hold
                    </button>
                    <button
                      onClick={() => {
                        setStatusAction('escalate')
                        setShowStatusDropdown(false)
                      }}
                      className={`flex w-full items-center px-4 py-2 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${statusAction === 'escalate'
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-300'
                        }`}
                    >
                      Escalate
                    </button>
                    <button
                      onClick={() => {
                        setStatusAction('awaiting')
                        setShowStatusDropdown(false)
                      }}
                      className={`flex w-full items-center px-4 py-2 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${statusAction === 'awaiting'
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-300'
                        }`}
                    >
                      Awaiting Customer Response
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* AI Suggestion Overlay */}
        <AISuggestionOverlay
          isOpen={showAISuggestion}
          isLoading={isLoadingAISuggestion}
          suggestion={aiSuggestion}
          onUse={handleUseAISuggestion}
          onDiscard={handleDiscardAISuggestion}
        />
      </div>
    </>
  )
}
