import {
  Sparkles,
  Send,
  User,
  Play,
  AlertCircle,
  ChevronRight,
  Zap,
  FileText,
  Link2,
} from 'lucide-react'
import { useState } from 'react'

interface AgentMessage {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: string
  suggestedActions?: SuggestedAction[]
}

interface SuggestedAction {
  id: string
  title: string
  description: string
  type: 'macro' | 'sop' | 'customer-info' | 'integration'
  icon: string
  requiresConfirmation: boolean
}

interface AgentIQPanelProps {
  onExecuteAction?: (actionId: string) => void
}

export function AgentIQPanel({ onExecuteAction }: AgentIQPanelProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: '1',
      role: 'agent',
      content: `Hi! I'm AgentIQ, your AI assistant. I can help you with:\n\n• Customer information and history\n• Standard operating procedures (SOPs)\n• Automated ticket handling and macros\n• CRM and system integrations\n\nWhat would you like help with?`,
      timestamp: new Date().toISOString(),
      suggestedActions: [
        {
          id: 'sop-delivery-delay',
          title: 'View SOP: Delivery Delay',
          description: 'Standard procedure for handling delivery complaints',
          type: 'sop',
          icon: 'FileText',
          requiresConfirmation: false,
        },
        {
          id: 'customer-history',
          title: 'Customer Purchase History',
          description: 'View all orders and interactions with Jessica Martinez',
          type: 'customer-info',
          icon: 'User',
          requiresConfirmation: false,
        },
        {
          id: 'macro-delivery-investigation',
          title: 'Run: Delivery Investigation Macro',
          description:
            'Check order status in CRM, send update to customer, and create support ticket',
          type: 'macro',
          icon: 'Zap',
          requiresConfirmation: true,
        },
      ],
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSendMessage = () => {
    if (!inputValue.trim() || isProcessing) return

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsProcessing(true)

    // Simulate AI response
    setTimeout(() => {
      const agentResponse: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: `I understand you're asking about "${inputValue}". Let me help you with that.`,
        timestamp: new Date().toISOString(),
        suggestedActions: [
          {
            id: 'action-1',
            title: 'Execute Suggested Action',
            description: 'This would perform the relevant action based on your query',
            type: 'macro',
            icon: 'Play',
            requiresConfirmation: true,
          },
        ],
      }
      setMessages((prev) => [...prev, agentResponse])
      setIsProcessing(false)
    }, 1500)
  }

  const handleExecuteAction = (action: SuggestedAction) => {
    if (action.requiresConfirmation) {
      const confirmed = confirm(
        `Are you sure you want to execute "${action.title}"?\n\n${action.description}`
      )
      if (!confirmed) return
    }

    // Add confirmation message
    const confirmationMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'agent',
      content: `✓ Executing: ${action.title}\n\nThis action will ${action.description.toLowerCase()}`,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, confirmationMessage])

    onExecuteAction?.(action.id)
  }

  const getActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return FileText
      case 'User':
        return User
      case 'Zap':
        return Zap
      case 'Play':
        return Play
      case 'Link2':
        return Link2
      default:
        return Sparkles
    }
  }

  const getActionColor = (type: string) => {
    switch (type) {
      case 'sop':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-900 dark:hover:bg-blue-900'
      case 'customer-info':
        return 'bg-purple-50 border-purple-200 hover:bg-purple-100 dark:bg-purple-950 dark:border-purple-900 dark:hover:bg-purple-900'
      case 'macro':
        return 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950 dark:border-indigo-900 dark:hover:bg-indigo-900'
      case 'integration':
        return 'bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:border-green-900 dark:hover:bg-green-900'
      default:
        return 'bg-slate-50 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700'
    }
  }

  return (
    <div className="flex h-full w-96 flex-col bg-slate-50 dark:bg-slate-900/50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">AgentIQ</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI Assistant</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {/* Message */}
              <div
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${message.role === 'agent'
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                      : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                >
                  {message.role === 'agent' ? (
                    <Sparkles className="h-4 w-4 text-white" />
                  ) : (
                    <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                      : 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white'
                    }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  <p
                    className={`mt-1 text-xs ${message.role === 'user'
                        ? 'text-indigo-200 dark:text-indigo-300'
                        : 'text-slate-500 dark:text-slate-400'
                      }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Suggested Actions */}
              {message.suggestedActions && message.suggestedActions.length > 0 && (
                <div className="ml-11 mt-3 space-y-2">
                  {message.suggestedActions.map((action) => {
                    const Icon = getActionIcon(action.icon)
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleExecuteAction(action)}
                        className={`group w-full rounded-lg border p-3 text-left transition-all ${getActionColor(
                          action.type
                        )}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/50 dark:bg-slate-900/50">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                  {action.title}
                                </p>
                                {action.requiresConfirmation && (
                                  <AlertCircle className="h-3 w-3 text-orange-500" />
                                )}
                              </div>
                              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                                {action.description}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                <Sparkles className="h-4 w-4 animate-pulse text-white" />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 dark:bg-slate-800">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask AgentIQ anything..."
            disabled={isProcessing}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          AgentIQ can help with SOPs, customer info, and automated actions
        </p>
      </div>
    </div>
  )
}
