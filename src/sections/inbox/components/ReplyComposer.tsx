import { useState, useEffect } from 'react'
import {
  Send,
  Sparkles,
  Paperclip,
  ChevronDown,
  Lock,
  MessageCircle,
  X,
  AtSign,
  Mail,
  Link,
  Smile,
  MessageSquare,
} from 'lucide-react'
import { AgentIQModal } from './AgentIQModal'
import { AgentIQCheckingIndicator } from './AgentIQCheckingIndicator'
import { AISuggestionOverlay } from './AISuggestionOverlay'

import type { ReplyComposerProps, StatusAction } from '@/../product/sections/inbox/types'

type InternalStatusAction = '' | StatusAction
type TwitterAction = 'dm' | 'email' | 'feedback-link'
type AgentIQStatus = 'idle' | 'checking' | 'approved' | 'warning' | 'blocked' | 'timeout' | 'error'

export function ReplyComposer({
  onSendReply,
  onAddNote,
  ticketPlatform = 'x',
  mentionedUsers = [],
  enableAgentIQ = true
}: ReplyComposerProps) {
  const [replyMode, setReplyMode] = useState<'reply' | 'note'>('reply')
  const [content, setContent] = useState('')
  const [statusAction, setStatusAction] = useState<InternalStatusAction>('')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [taggedUsers, setTaggedUsers] = useState<string[]>(mentionedUsers)
  const [newUserTag, setNewUserTag] = useState('')
  const [showUserTagInput, setShowUserTagInput] = useState(false)

  // AgentIQ Quality Gate state
  const [agentIQStatus, setAgentIQStatus] = useState<AgentIQStatus>('idle')
  const [showAgentIQModal, setShowAgentIQModal] = useState(false)
  const [qualityCheckResult, setQualityCheckResult] = useState<any>(null)
  const [checkingElapsedTime, setCheckingElapsedTime] = useState(0)
  const [pendingResponse, setPendingResponse] = useState<{
    content: string
    statusAction?: InternalStatusAction
    taggedUsers?: string[]
  } | null>(null)

  // AI Suggestion Overlay state
  const [showAISuggestionOverlay, setShowAISuggestionOverlay] = useState(false)
  const [isLoadingAISuggestion, setIsLoadingAISuggestion] = useState(false)
  const [aiSuggestion, setAISuggestion] = useState<{
    id: string
    content: string
    tone?: string
    source?: string
  } | null>(null)

  const isTwitter = ticketPlatform === 'x'
  const isWhatsApp = ticketPlatform === 'whatsapp'
  const isFacebook = ticketPlatform === 'facebook'
  const isInstagram = ticketPlatform === 'instagram'
  const isVoice = ticketPlatform === 'voice'

  // Timer for checking elapsed time
  useEffect(() => {
    let interval: any
    if (agentIQStatus === 'checking') {
      interval = setInterval(() => {
        setCheckingElapsedTime((prev) => {
          const next = prev + 0.1
          // Simulate timeout after 10 seconds
          if (next >= 10) {
            setAgentIQStatus('timeout')
            return prev
          }
          return next
        })
      }, 100)
    } else {
      setCheckingElapsedTime(0)
    }
    return () => clearInterval(interval)
  }, [agentIQStatus])

  // Simulate AgentIQ quality check API call
  const performQualityCheck = async (responseContent: string): Promise<any> => {
    // Simulate API delay (2-4 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000))

    // Demo: Simulate different outcomes based on content
    const lowerContent = responseContent.toLowerCase()

    // Blocked scenario
    if (
      lowerContent.includes('cannot help') ||
      lowerContent.includes('not something we support') ||
      lowerContent.length < 30
    ) {
      return {
        outcome: 'blocked',
        csatImpact: { current: 8.1, predicted: 4.7, delta: -3.4, trend: 'declining' },
        empathyScore: {
          score: 2,
          reasons: ['Dismissive tone', 'No acknowledgment', 'Lacks helpful guidance'],
        },
        complianceChecks: [
          { name: 'Brand Guidelines', status: 'failed' },
          { name: 'Content Policy', status: 'flagged' },
          { name: 'Fact Check', status: 'verified' },
        ],
        issues: [
          { severity: 'critical', title: 'Too Direct', description: 'Tone is abrupt and dismissive' },
          { severity: 'critical', title: 'No Empathy', description: 'Lacks emotional connection' },
          {
            severity: 'critical',
            title: 'Incomplete Resolution',
            description: 'Customer question not addressed',
          },
        ],
        suggestions: [
          {
            id: 'sug-1',
            title: 'Empathetic + Complete',
            content:
              "I understand this is important to you, and I appreciate you reaching out. While this specific request falls outside our current capabilities, I'd love to explore alternative approaches that could help achieve your goal. Let me suggest a few options that might work for you...",
            preview:
              "I understand this is important to you, and I appreciate you reaching out. While this specific request falls outside our current capabilities, I'd love to explore alternative approaches...",
            isWithinKB: true,
            csatImprovement: 4.8,
            tags: ['Empathetic', 'Solution-focused'],
          },
        ],
      }
    }

    // Warning scenario
    if (
      lowerContent.includes('check our documentation') ||
      lowerContent.includes('please check') ||
      (!lowerContent.includes('understand') && !lowerContent.includes('appreciate'))
    ) {
      return {
        outcome: 'warning',
        csatImpact: { current: 8.1, predicted: 6.5, delta: -1.6, trend: 'declining' },
        empathyScore: {
          score: 4,
          reasons: ['Response lacks empathy', 'No personalized acknowledgment'],
        },
        complianceChecks: [
          { name: 'Brand Guidelines', status: 'flagged' },
          { name: 'Content Policy', status: 'passed' },
          { name: 'Fact Check', status: 'verified' },
        ],
        issues: [
          { severity: 'warning', title: 'Low Empathy', description: 'Lacks emotional connection' },
          {
            severity: 'warning',
            title: 'Missing Next Steps',
            description: 'No clear guidance on what customer should do',
          },
        ],
        suggestions: [
          {
            id: 'sug-1',
            title: 'Empathetic + Actionable',
            content:
              "I understand how frustrating this must be for you, and I genuinely want to help resolve this. While this specific request falls outside our current capabilities, I'd love to explore alternative approaches that could help you achieve your goal. Let me suggest a few options that might work for you...",
            preview:
              "I understand how frustrating this must be for you, and I genuinely want to help resolve this. While this specific request falls outside our current capabilities...",
            isWithinKB: true,
            csatImprovement: 1.8,
            tags: ['Empathetic', 'Solution-focused'],
          },
        ],
      }
    }

    // Approved scenario (default)
    return {
      outcome: 'approved',
      csatImpact: { current: 8.1, predicted: 8.3, delta: 0.2, trend: 'improving' },
      empathyScore: {
        score: 8,
        reasons: ['Acknowledges customer concern', 'Provides clear next steps'],
      },
      complianceChecks: [
        { name: 'Brand Guidelines', status: 'passed' },
        { name: 'Content Policy', status: 'passed' },
        { name: 'Fact Check', status: 'verified' },
      ],
      issues: [],
      suggestions: [],
    }
  }

  const handleSend = async () => {
    if (!content.trim()) return

    // Notes bypass quality check
    if (replyMode === 'note') {
      onAddNote?.(content)
      setContent('')
      return
    }

    // Store pending response
    setPendingResponse({
      content,
      statusAction: statusAction || undefined,
      taggedUsers: isTwitter ? taggedUsers : undefined,
    })

    // If AgentIQ is disabled, send directly
    if (!enableAgentIQ) {
      actualSendReply(content, statusAction || undefined, isTwitter ? taggedUsers : undefined)
      return
    }

    // Start quality check
    setAgentIQStatus('checking')

    try {
      const result = await performQualityCheck(content)
      setQualityCheckResult(result)

      if (result.outcome === 'approved') {
        // Auto-send on approval
        setAgentIQStatus('approved')
        setTimeout(() => {
          actualSendReply(content, statusAction || undefined, isTwitter ? taggedUsers : undefined)
          setAgentIQStatus('idle')
        }, 1500)
      } else {
        // Show modal for warning or blocked
        setAgentIQStatus(result.outcome)
        setShowAgentIQModal(true)
      }
    } catch (error) {
      console.error('Quality check failed:', error)
      setAgentIQStatus('error')
    }
  }

  const actualSendReply = (
    responseContent: string,
    action?: InternalStatusAction,
    users?: string[]
  ) => {
    onSendReply?.(responseContent, action || undefined, users)
    setContent('')
    setStatusAction('')
    setPendingResponse(null)
    setQualityCheckResult(null)
  }

  const handleAddUserTag = () => {
    if (!newUserTag.trim()) return
    const username = newUserTag.startsWith('@') ? newUserTag : `@${newUserTag}`
    if (!taggedUsers.includes(username)) {
      setTaggedUsers([...taggedUsers, username])
    }
    setNewUserTag('')
    setShowUserTagInput(false)
  }

  const handleRemoveUserTag = (user: string) => {
    setTaggedUsers(taggedUsers.filter(u => u !== user))
  }

  const handleTwitterAction = (action: TwitterAction) => {
    // These would trigger different workflows in the parent component
    console.log(`Twitter action: ${action}`)
  }

  // AgentIQ Modal Actions
  const handleEditManually = () => {
    setShowAgentIQModal(false)
    setAgentIQStatus('idle')
    // Keep content so agent can edit
  }

  const handleApplySuggestion = (suggestionId: string) => {
    const suggestion = qualityCheckResult?.suggestions?.find((s: any) => s.id === suggestionId)
    if (suggestion) {
      setContent(suggestion.content)
      setShowAgentIQModal(false)
      setAgentIQStatus('idle')
      // Optionally auto-send the improved version
      // actualSendReply(suggestion.content, pendingResponse?.statusAction, pendingResponse?.taggedUsers)
    }
  }

  const handleSendAnyway = (justification: string) => {
    console.log('Override justification:', justification)
    if (pendingResponse) {
      actualSendReply(
        pendingResponse.content,
        pendingResponse.statusAction || undefined,
        pendingResponse.taggedUsers
      )
    }
    setShowAgentIQModal(false)
    setAgentIQStatus('idle')
  }

  const handleRequestSupervisorOverride = () => {
    console.log('Supervisor override requested')
    alert('Supervisor override request sent. You will be notified when reviewed.')
    setShowAgentIQModal(false)
    setAgentIQStatus('idle')
  }

  // Timeout/Error handlers
  const handleKeepWaiting = () => {
    setAgentIQStatus('checking')
    setCheckingElapsedTime(0)
  }

  const handleSendWithoutCheck = () => {
    console.log('Bypassing quality check')
    if (pendingResponse) {
      actualSendReply(
        pendingResponse.content,
        pendingResponse.statusAction || undefined,
        pendingResponse.taggedUsers
      )
    }
    setAgentIQStatus('idle')
  }

  const handleCancelSend = () => {
    setAgentIQStatus('idle')
    setPendingResponse(null)
  }

  const handleRetry = () => {
    if (pendingResponse) {
      handleSend()
    }
  }

  // AI Suggestion Generation
  const generateAISuggestion = async () => {
    if (!content.trim()) {
      alert('Please type a message first')
      return
    }

    setShowAISuggestionOverlay(true)
    setIsLoadingAISuggestion(true)
    setAISuggestion(null)

    // Simulate API call (2-4 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000))

    // Generate improved suggestion based on current content
    const improvedContent = generateImprovedResponse(content)

    setAISuggestion({
      id: `ai-${Date.now()}`,
      content: improvedContent,
      tone: 'Empathetic & Professional',
      source: 'Knowledge Base',
    })
    setIsLoadingAISuggestion(false)
  }

  const generateImprovedResponse = (originalContent: string): string => {
    // Simple improvement logic (in production, this would be an API call)
    const hasGreeting = /^(hi|hello|hey|dear)/i.test(originalContent)
    const hasClosing = /(thanks|regards|sincerely|best)/i.test(originalContent)
    const hasEmpathy = /(understand|appreciate|sorry|apologize)/i.test(originalContent)

    let improved = originalContent

    // Add greeting if missing
    if (!hasGreeting) {
      improved = `Thank you for reaching out! ${improved}`
    }

    // Add empathy if missing
    if (!hasEmpathy && improved.length > 50) {
      const sentences = improved.split(/[.!?]+/).filter((s) => s.trim())
      if (sentences.length > 1) {
        sentences.splice(
          1,
          0,
          " I understand how important this is to you, and I'm here to help"
        )
        improved = sentences.join('. ') + '.'
      }
    }

    // Add closing if missing
    if (!hasClosing) {
      improved = `${improved}\n\nPlease let me know if you have any questions. I'm happy to assist further!`
    }

    // Add specific improvements based on content
    if (improved.toLowerCase().includes('cannot') || improved.toLowerCase().includes("can't")) {
      improved = improved.replace(
        /cannot|can't/gi,
        "I'd love to explore alternative solutions for you. While this specific option isn't available,"
      )
    }

    return improved
  }

  const handleUseAISuggestion = (suggestionContent: string) => {
    setContent(suggestionContent)
    setShowAISuggestionOverlay(false)
    setAISuggestion(null)
  }

  const handleDiscardAISuggestion = () => {
    setShowAISuggestionOverlay(false)
    setAISuggestion(null)
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

  return (
    <div className="relative border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* AI Suggestion Overlay */}
      <AISuggestionOverlay
        isOpen={showAISuggestionOverlay}
        isLoading={isLoadingAISuggestion}
        suggestion={aiSuggestion}
        onUse={handleUseAISuggestion}
        onDiscard={handleDiscardAISuggestion}
      />

      {/* Mode Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setReplyMode('reply')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${replyMode === 'reply'
            ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
        >
          <MessageCircle className="h-4 w-4" />
          Reply to Customer
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

      {/* Twitter User Tags - Only for Twitter tickets in reply mode */}
      {isTwitter && replyMode === 'reply' && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">
              Tagged Users
            </span>
            <button
              onClick={() => setShowUserTagInput(!showUserTagInput)}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
            >
              <AtSign className="h-3 w-3" />
              Add User
            </button>
          </div>

          {/* Tagged Users List */}
          {taggedUsers.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {taggedUsers.map((user) => (
                <span
                  key={user}
                  className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                >
                  {user}
                  <button
                    onClick={() => handleRemoveUserTag(user)}
                    className="rounded-full hover:bg-sky-200 dark:hover:bg-sky-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add User Input */}
          {showUserTagInput && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newUserTag}
                onChange={(e) => setNewUserTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddUserTag()
                  }
                }}
                placeholder="@username"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <button
                onClick={handleAddUserTag}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowUserTagInput(false)
                  setNewUserTag('')
                }}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Composer */}
      <div className="p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSend()
            }
          }}
          placeholder={
            replyMode === 'reply'
              ? isTwitter
                ? 'Type your reply... (Tagged users will be mentioned)'
                : isWhatsApp
                  ? 'Type your WhatsApp message...'
                  : isFacebook
                    ? 'Type your Facebook reply...'
                    : isInstagram
                      ? 'Type your Instagram reply...'
                      : isVoice
                        ? 'Log call notes or send follow-up message (if enabled)...'
                        : 'Type your reply to the customer...'
              : 'Add an internal note (not visible to customer)...'
          }
          rows={4}
          className={`w-full resize-none rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${replyMode === 'reply'
            ? 'border-slate-200 bg-white focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800'
            : 'border-yellow-200 bg-yellow-50 focus:border-yellow-500 focus:ring-yellow-500 dark:border-yellow-900 dark:bg-yellow-950/20'
            } dark:text-white dark:placeholder-slate-400`}
        />

        {/* Actions */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Standard Actions */}
            <button
              title="Attach file"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button
              title="Add emoji"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <Smile className="h-5 w-5" />
            </button>

            {/* AI Suggest Button */}
            {replyMode === 'reply' && (
              <>
                <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <button
                  onClick={generateAISuggestion}
                  disabled={!content.trim() || isLoadingAISuggestion}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
                  title="Get AI-improved version"
                >
                  <Sparkles className="h-4 w-4" />
                  AI Suggest
                </button>
              </>
            )}

            {/* Twitter-Specific Quick Actions - Only in reply mode */}
            {isTwitter && replyMode === 'reply' && (
              <>
                <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <button
                  onClick={() => handleTwitterAction('dm')}
                  title="Suggest DM"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/30"
                >
                  <MessageSquare className="h-4 w-4" />
                  Send DM
                </button>
                <button
                  onClick={() => handleTwitterAction('email')}
                  title="Request email"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
                <button
                  onClick={() => handleTwitterAction('feedback-link')}
                  title="Share feedback link"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950/30"
                >
                  <Link className="h-4 w-4" />
                  Feedback
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-0">
            <button
              onClick={handleSend}
              disabled={!content.trim()}
              className={`flex items-center gap-2 rounded-lg rounded-r-none px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${replyMode === 'reply'
                ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                : 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-500'
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
                    <div className="absolute bottom-full right-0 z-20 mb-2 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                      <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                          Reply + Action
                        </p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setStatusAction('')
                            setShowStatusDropdown(false)
                          }}
                          className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${statusAction === ''
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                            : 'text-slate-700 dark:text-slate-300'
                            }`}
                        >
                          <span className="font-medium">Reply only</span>
                          {statusAction === '' && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400">✓</span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setStatusAction('hold')
                            setShowStatusDropdown(false)
                          }}
                          className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${statusAction === 'hold'
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                            : 'text-slate-700 dark:text-slate-300'
                            }`}
                        >
                          <div>
                            <div className="font-medium">Reply and Hold</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Pause ticket until follow-up needed
                            </div>
                          </div>
                          {statusAction === 'hold' && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400">✓</span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setStatusAction('escalate')
                            setShowStatusDropdown(false)
                          }}
                          className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${statusAction === 'escalate'
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                            : 'text-slate-700 dark:text-slate-300'
                            }`}
                        >
                          <div>
                            <div className="font-medium">Reply and Escalate</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Assign to higher support tier
                            </div>
                          </div>
                          {statusAction === 'escalate' && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400">✓</span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setStatusAction('awaiting')
                            setShowStatusDropdown(false)
                          }}
                          className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${statusAction === 'awaiting'
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                            : 'text-slate-700 dark:text-slate-300'
                            }`}
                        >
                          <div>
                            <div className="font-medium">Reply and Mark Awaiting</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Waiting for customer response
                            </div>
                          </div>
                          {statusAction === 'awaiting' && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400">✓</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Press{' '}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            ⌘
          </kbd>{' '}
          +{' '}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Enter
          </kbd>{' '}
          to send
        </p>
      </div>

      {/* AgentIQ Checking Indicator */}
      {enableAgentIQ && agentIQStatus !== 'idle' && !showAgentIQModal && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/30">
          <AgentIQCheckingIndicator
            status={agentIQStatus}
            elapsedTime={checkingElapsedTime}
            onKeepWaiting={handleKeepWaiting}
            onSendWithoutCheck={handleSendWithoutCheck}
            onCancel={handleCancelSend}
            onRetry={handleRetry}
          />
        </div>
      )}

      {/* AgentIQ Quality Gate Modal */}
      {showAgentIQModal && qualityCheckResult && (
        <AgentIQModal
          isOpen={showAgentIQModal}
          onClose={() => setShowAgentIQModal(false)}
          outcome={qualityCheckResult.outcome}
          currentResponse={pendingResponse?.content || content}
          csatImpact={qualityCheckResult.csatImpact}
          empathyScore={qualityCheckResult.empathyScore}
          complianceChecks={qualityCheckResult.complianceChecks}
          issues={qualityCheckResult.issues}
          suggestions={qualityCheckResult.suggestions}
          isLoadingSuggestions={false}
          canOverride={qualityCheckResult.outcome === 'warning'}
          onEditManually={handleEditManually}
          onSendAnyway={qualityCheckResult.outcome === 'warning' ? handleSendAnyway : undefined}
          onApplySuggestion={handleApplySuggestion}
          onRequestSupervisorOverride={
            qualityCheckResult.outcome === 'blocked' ? handleRequestSupervisorOverride : undefined
          }
        />
      )}
    </div>
  )
}
