import { Check, CheckCheck, Clock } from 'lucide-react'
import type { MessageInsights } from './TicketHeader'
import { MessageInsightsBar } from './MessageInsightsBar'

interface ChatBubbleViewProps {
  message: any
  isCustomer: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
  isFirstInGroup?: boolean
  isLastInGroup?: boolean
  messageInsights?: MessageInsights
}

export function ChatBubbleView({
  message,
  isCustomer,
  showAvatar = true,
  showTimestamp = true,
  isFirstInGroup = false,
  isLastInGroup = false,
  messageInsights,
}: ChatBubbleViewProps) {
  const chatMeta = message.chatMetadata

  const getDeliveryStatusIcon = () => {
    if (!chatMeta || isCustomer) return null

    switch (chatMeta.deliveryStatus) {
      case 'sending':
        return <Clock className="h-3 w-3 text-slate-400" />
      case 'sent':
        return <Check className="h-3 w-3 text-slate-400" />
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-slate-400" />
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      case 'failed':
        return <span className="text-xs text-red-500">!</span>
      default:
        return null
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div>
      <div className={`flex gap-2 ${isCustomer ? 'justify-start' : 'justify-end'}`}>
        {/* Customer Avatar (left side) */}
        {isCustomer && showAvatar && isFirstInGroup && (
          <img
            src={message.author.avatarUrl}
            alt={message.author.name}
            className="h-8 w-8 flex-shrink-0 rounded-full"
          />
        )}

        {/* Spacer for grouped messages */}
        {isCustomer && (!showAvatar || !isFirstInGroup) && <div className="w-8 flex-shrink-0" />}

        {/* Message Bubble */}
        <div
          className={`max-w-[70%] ${
            isCustomer
              ? 'rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-800'
              : 'rounded-2xl rounded-tr-sm bg-blue-500 dark:bg-blue-600'
          }`}
        >
          {/* Author name for first message in group */}
          {isFirstInGroup && isCustomer && (
            <div className="px-3 pt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              {message.author.name}
            </div>
          )}

          {/* Message content */}
          <div className="px-3 py-2">
            <p
              className={`text-sm ${
                isCustomer ? 'text-slate-900 dark:text-slate-100' : 'text-white'
              }`}
            >
              {message.content}
            </p>
          </div>

          {/* Timestamp and delivery status (shown on last message in group) */}
          {isLastInGroup && showTimestamp && (
            <div
              className={`flex items-center justify-end gap-1 px-3 pb-1 text-xs ${
                isCustomer
                  ? 'text-slate-500 dark:text-slate-400'
                  : 'text-blue-100 dark:text-blue-200'
              }`}
            >
              <span>{formatTime(message.timestamp)}</span>
              {getDeliveryStatusIcon()}
            </div>
          )}
        </div>

        {/* Agent Avatar would go here if needed (right side) - not typically shown */}
      </div>

      {/* Message Insights Bar - Below bubble on last message in group */}
      {isLastInGroup && (
        <MessageInsightsBar
          message={message}
          messageInsights={messageInsights}
          className={`mt-1 ${isCustomer ? 'ml-10' : 'mr-10 flex justify-end'}`}
        />
      )}
    </div>
  )
}
