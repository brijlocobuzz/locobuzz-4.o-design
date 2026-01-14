import { ChevronLeft, ChevronRight, MessageCircle, Star, Clock, Tag } from 'lucide-react'
import { useState } from 'react'

interface TicketQueueItem {
  id: string
  ticketNumber: string
  author: {
    name: string
    platform: string
    avatarUrl?: string
  }
  messageSnippet: string
  status: string
  priority: string
  tags: string[]
  interactionType: string
  sentiment: string
  sla: {
    firstResponse: {
      status: string
      remainingMinutes: number
    }
  }
  impactScore: {
    tier: string
  }
}

interface TicketQueueSidebarProps {
  tickets: TicketQueueItem[]
  currentTicketId: string
  onSelectTicket?: (ticketId: string) => void
}

export function TicketQueueSidebar({
  tickets,
  currentTicketId,
  onSelectTicket,
}: TicketQueueSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const currentIndex = tickets.findIndex((t) => t.id === currentTicketId)
  const upcomingTickets = tickets.slice(currentIndex + 1, currentIndex + 6)

  const statusColors = {
    open: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    'in-progress': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
    resolved: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    closed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  }

  const priorityColors = {
    urgent: 'text-red-600 dark:text-red-400',
    high: 'text-orange-600 dark:text-orange-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    low: 'text-slate-600 dark:text-slate-400',
  }

  if (!isExpanded) {
    return (
      <div className="flex h-full w-16 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {/* Collapse/Expand Toggle */}
        <div className="border-b border-slate-200 p-3 dark:border-slate-800">
          <button
            onClick={() => setIsExpanded(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Expand queue"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Collapsed Ticket List */}
        <div className="flex-1 overflow-y-auto py-2">
          {upcomingTickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => onSelectTicket?.(ticket.id)}
              className="group relative mb-2 flex w-full flex-col items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800"
              title={`${ticket.author.name}: ${ticket.messageSnippet}`}
            >
              {/* Avatar */}
              {ticket.author.avatarUrl ? (
                <img
                  src={ticket.author.avatarUrl}
                  alt={ticket.author.name}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                  <MessageCircle className="h-4 w-4 text-slate-500" />
                </div>
              )}

              {/* Priority Indicator */}
              {ticket.priority === 'urgent' && (
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
              )}

              {/* VIP Indicator */}
              {ticket.impactScore.tier === 'vip' && (
                <Star className="h-3 w-3 fill-purple-500 text-purple-500" />
              )}

              {/* SLA Warning */}
              {ticket.sla.firstResponse.remainingMinutes < 30 && (
                <Clock className="h-3 w-3 text-orange-500" />
              )}
            </button>
          ))}
        </div>

        {/* Queue Count */}
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <div className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            +{upcomingTickets.length}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-80 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-white">Up Next</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          title="Collapse queue"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Ticket Queue */}
      <div className="flex-1 overflow-y-auto">
        {upcomingTickets.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <div>
              <MessageCircle className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                No more tickets in queue
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {upcomingTickets.map((ticket, index) => (
              <button
                key={ticket.id}
                onClick={() => onSelectTicket?.(ticket.id)}
                className="w-full p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {/* Position & Author */}
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {index + 1}
                    </div>
                    {ticket.author.avatarUrl ? (
                      <img
                        src={ticket.author.avatarUrl}
                        alt={ticket.author.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                        <MessageCircle className="h-4 w-4 text-slate-500" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {ticket.author.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {ticket.author.platform} • {ticket.interactionType}
                      </div>
                    </div>
                  </div>

                  {/* VIP Badge */}
                  {ticket.impactScore.tier === 'vip' && (
                    <Star className="h-4 w-4 fill-purple-500 text-purple-500" />
                  )}
                </div>

                {/* Message Snippet */}
                <p className="mb-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                  {ticket.messageSnippet}
                </p>

                {/* Status, Priority, SLA */}
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${statusColors[ticket.status as keyof typeof statusColors] ||
                      statusColors.open
                      }`}
                  >
                    {ticket.status}
                  </span>

                  <span
                    className={`text-xs font-medium ${priorityColors[ticket.priority as keyof typeof priorityColors] ||
                      priorityColors.medium
                      }`}
                  >
                    {ticket.priority}
                  </span>

                  {ticket.sla.firstResponse.remainingMinutes < 30 && (
                    <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                      <Clock className="h-3 w-3" />
                      {ticket.sla.firstResponse.remainingMinutes}m
                    </span>
                  )}
                </div>

                {/* Tags */}
                {ticket.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    {ticket.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                    {ticket.tags.length > 2 && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        +{ticket.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          {upcomingTickets.length} ticket{upcomingTickets.length !== 1 ? 's' : ''} remaining
        </div>
      </div>
    </div>
  )
}
