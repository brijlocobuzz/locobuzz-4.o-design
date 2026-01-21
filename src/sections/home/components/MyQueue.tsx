import { Clock, MessageSquare, AlertCircle, Star, ExternalLink } from 'lucide-react'
import type { Ticket, TicketPriority, SlaStatus, Sentiment } from '@/../product/sections/home/types'
import { BlockWrapper } from './BlockWrapper'

interface MyQueueProps {
  title: string
  tickets: Ticket[]
  isLocked?: boolean
  onViewTicket?: (ticketId: string) => void
  onCustomize?: () => void
}

const priorityStyles: Record<TicketPriority, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
  medium: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-400',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

const slaStyles: Record<SlaStatus, { bg: string; text: string; icon?: boolean }> = {
  'on-track': { bg: 'bg-emerald-100 dark:bg-emerald-900/50', text: 'text-emerald-700 dark:text-emerald-400' },
  'at-risk': { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-700 dark:text-amber-400', icon: true },
  breached: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-700 dark:text-red-400', icon: true },
  met: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' },
}

const sentimentDot: Record<Sentiment, string> = {
  positive: 'bg-emerald-500',
  neutral: 'bg-slate-400',
  negative: 'bg-red-500',
}

const channelIcons: Record<string, string> = {
  Twitter: '𝕏',
  Facebook: 'f',
  Instagram: '📷',
  Email: '✉',
  'Web Chat': '💬',
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return date.toLocaleDateString()
}

export function MyQueue({
  title,
  tickets,
  isLocked = false,
  onViewTicket,
  onCustomize,
}: MyQueueProps) {
  return (
    <BlockWrapper title={title} isLocked={isLocked} onCustomize={onCustomize}>
      <div className="space-y-2">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <MessageSquare className="h-6 w-6 text-slate-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              No tickets in queue
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              You're all caught up!
            </p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => onViewTicket?.(ticket.id)}
              className="group w-full rounded-lg border border-slate-100 bg-white p-3 text-left transition-all hover:border-indigo-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
            >
              <div className="flex items-start gap-3">
                {/* Channel Icon */}
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {channelIcons[ticket.channel] || ticket.channel[0]}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">
                      {ticket.ticketNumber}
                    </span>
                    {ticket.isVip && (
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    )}
                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${priorityStyles[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-slate-900 dark:text-white">
                    {ticket.subject}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className={`h-2 w-2 rounded-full ${sentimentDot[ticket.sentiment]}`} />
                      {ticket.contactName}
                    </span>
                    <span>·</span>
                    <span>{ticket.mentionCount} messages</span>
                    <span>·</span>
                    <span>{formatTimeAgo(ticket.updatedAt)}</span>
                  </div>
                </div>

                {/* SLA Status */}
                <div className="flex flex-col items-end gap-1">
                  <div
                    className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${slaStyles[ticket.slaStatus].bg} ${slaStyles[ticket.slaStatus].text}`}
                  >
                    {slaStyles[ticket.slaStatus].icon && (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    {ticket.slaStatus === 'on-track' && <Clock className="h-3 w-3" />}
                    {ticket.slaStatus.replace('-', ' ')}
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-600" />
                </div>
              </div>

              {/* Last Message Preview */}
              <p className="mt-2 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                "{ticket.lastMessage}"
              </p>
            </button>
          ))
        )}
      </div>
    </BlockWrapper>
  )
}
