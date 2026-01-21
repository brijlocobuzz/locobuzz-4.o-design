import {
  Activity,
  MessageCircle,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit3,
  Tag,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'

type TimelineEventType =
  | 'status-change'
  | 'assignment'
  | 'note'
  | 'reply'
  | 'sla-breach'
  | 'edit'
  | 'tag-added'
  | 'priority-change'

interface TimelineEvent {
  id: string
  type: TimelineEventType
  timestamp: string
  user: {
    name: string
    avatarUrl?: string
  }
  data: any
}

interface TimelinePanelProps {
  events: TimelineEvent[]
}

export function TimelinePanel({ events }: TimelinePanelProps) {
  const [visibilityFilter, setVisibilityFilter] = useState<TimelineEventType | 'all'>('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  const filterOptions = [
    { value: 'all', label: 'All Events', icon: Activity },
    { value: 'status-change', label: 'Status Changes', icon: CheckCircle2 },
    { value: 'assignment', label: 'Assignments', icon: UserPlus },
    { value: 'note', label: 'Notes', icon: MessageCircle },
    { value: 'reply', label: 'Replies', icon: MessageCircle },
    { value: 'sla-breach', label: 'SLA Breaches', icon: AlertCircle },
    { value: 'edit', label: 'Edits', icon: Edit3 },
    { value: 'tag-added', label: 'Tags', icon: Tag },
    { value: 'priority-change', label: 'Priority Changes', icon: Clock },
  ]

  const filteredEvents =
    visibilityFilter === 'all'
      ? events
      : events.filter((event) => event.type === visibilityFilter)

  const getEventIcon = (type: TimelineEventType) => {
    switch (type) {
      case 'status-change':
        return CheckCircle2
      case 'assignment':
        return UserPlus
      case 'note':
      case 'reply':
        return MessageCircle
      case 'sla-breach':
        return AlertCircle
      case 'edit':
        return Edit3
      case 'tag-added':
        return Tag
      case 'priority-change':
        return Clock
      default:
        return Activity
    }
  }

  const getEventColor = (type: TimelineEventType) => {
    switch (type) {
      case 'status-change':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-950'
      case 'assignment':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950'
      case 'note':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-950'
      case 'reply':
        return 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-950'
      case 'sla-breach':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950'
      case 'edit':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950'
      case 'tag-added':
        return 'text-sky-600 bg-sky-100 dark:text-sky-400 dark:bg-sky-950'
      case 'priority-change':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-950'
      default:
        return 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800'
    }
  }

  const getEventDescription = (event: TimelineEvent) => {
    switch (event.type) {
      case 'status-change':
        return (
          <span>
            changed status from <strong>{event.data.from}</strong> to{' '}
            <strong>{event.data.to}</strong>
          </span>
        )
      case 'assignment':
        return (
          <span>
            assigned ticket to <strong>{event.data.assignedTo}</strong>
          </span>
        )
      case 'note':
        return (
          <span>
            added a note: <span className="italic">"{event.data.content}"</span>
          </span>
        )
      case 'reply':
        return (
          <span>
            sent a reply: <span className="italic">"{event.data.content}"</span>
          </span>
        )
      case 'sla-breach':
        return (
          <span className="text-red-600 dark:text-red-400">
            <strong>SLA breached:</strong> {event.data.slaType}
          </span>
        )
      case 'edit':
        return (
          <span>
            edited <strong>{event.data.field}</strong> from "{event.data.oldValue}" to "
            {event.data.newValue}"
          </span>
        )
      case 'tag-added':
        return (
          <span>
            added tag <strong>{event.data.tag}</strong>
          </span>
        )
      case 'priority-change':
        return (
          <span>
            changed priority from <strong>{event.data.from}</strong> to{' '}
            <strong>{event.data.to}</strong>
          </span>
        )
      default:
        return <span>performed an action</span>
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const selectedFilter = filterOptions.find((opt) => opt.value === visibilityFilter)

  return (
    <div className="flex h-full w-96 flex-col overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">Timeline</h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {filteredEvents.length} events
          </span>
        </div>

        {/* Visibility Filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <div className="flex items-center gap-2">
              {selectedFilter && <selectedFilter.icon className="h-4 w-4" />}
              <span>{selectedFilter?.label || 'Filter'}</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </button>

          {showFilterMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowFilterMenu(false)}
              />
              <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                {filterOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setVisibilityFilter(option.value as TimelineEventType | 'all')
                        setShowFilterMenu(false)
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 ${visibilityFilter === option.value
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-300'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Timeline Events */}
      <div className="flex-1 p-6">
        {filteredEvents.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <Activity className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                No events to display
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute bottom-0 left-4 top-0 w-px bg-slate-200 dark:bg-slate-700" />

            {/* Events */}
            <div className="space-y-6">
              {filteredEvents.map((event) => {
                const Icon = getEventIcon(event.type)
                const colorClass = getEventColor(event.type)

                return (
                  <div key={event.id} className="relative flex gap-4">
                    {/* Icon */}
                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {event.user.avatarUrl ? (
                            <img
                              src={event.user.avatarUrl}
                              alt={event.user.name}
                              className="h-5 w-5 rounded-full"
                            />
                          ) : (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs dark:bg-slate-700">
                              {event.user.name[0]}
                            </div>
                          )}
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {event.user.name}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {getEventDescription(event)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
