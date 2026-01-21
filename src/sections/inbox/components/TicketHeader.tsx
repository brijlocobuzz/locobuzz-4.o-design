import {
  X,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Tag,
  MoreHorizontal,
  Plus,
  Trash2,
  Copy,
  Archive,
  Flag,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  Merge,
  UserPlus,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react'
import { useState } from 'react'

export interface MessageInsights {
  showInsights: boolean
  selectedInsights: {
    // AI Classifications (formerly combined)
    sentiment: boolean
    entity: boolean
    intent: boolean
    emotion: boolean

    // Categories & Aspects
    category: boolean
    aspects: boolean
    aspectGroups: boolean

    // Special Element
    signalSense: boolean

    // Ticket Info Section (new configurable fields)
    ticketInfo: {
      brandName: boolean          // Brand name
      ticketId: boolean           // Ticket ID display
      time: boolean               // Enhanced timestamp/time
      media: boolean              // Media attachments preview
      categoryWithSentiment: boolean  // Categories with sentiment per family
      ticketTags: boolean         // Tags on ticket
      locationProfileName: boolean // Location profile
      facebookLocationName: boolean // GMB/Facebook Location
      language: boolean           // Ticket language
      assignTo: boolean           // Assigned agent
      seenBy: boolean             // Users who've seen it
    }

    // Essentials Section
    essentials: {
      customerName: boolean
      avatar: boolean
      handleAndFollowers: boolean
      platformAndType: boolean
      timestamp: boolean
      messageSnippet: boolean
      messageCount: boolean
      priorityBadge: boolean
      slaStatus: boolean
      unreadCount: boolean
    }
  }
}

interface TicketHeaderProps {
  ticket: any
  hasNextTicket?: boolean
  messageInsights?: MessageInsights
  onMessageInsightsChange?: (insights: MessageInsights) => void
  onChangeStatus?: (status: string) => void
  onChangePriority?: (priority: string) => void
  onAddTag?: (tag: string) => void
  onRemoveTag?: (tag: string) => void
  onNextTicket?: () => void
  onClose?: () => void
}

const statusConfig = {
  new: { label: 'New', color: 'purple', icon: MessageSquare },
  open: { label: 'Open', color: 'blue', icon: AlertCircle },
  pending: { label: 'Pending', color: 'yellow', icon: Clock },
  'in-progress': { label: 'In Progress', color: 'yellow', icon: Clock },
  resolved: { label: 'Resolved', color: 'green', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'gray', icon: CheckCircle2 },
}

const priorityConfig = {
  low: { label: 'Low', color: 'slate' },
  medium: { label: 'Medium', color: 'yellow' },
  high: { label: 'High', color: 'orange' },
  urgent: { label: 'Urgent', color: 'red' },
}

const commonTags = [
  'delivery-issue',
  'premium-customer',
  'billing-question',
  'product-quality',
  'feature-request',
  'bug-report',
  'urgent',
  'vip',
  'follow-up-needed',
]

export function TicketHeader({
  ticket,
  hasNextTicket = true,
  messageInsights,
  onMessageInsightsChange,
  onChangeStatus,
  onChangePriority,
  onAddTag,
  onRemoveTag,
  onNextTicket,
  onClose,
}: TicketHeaderProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const [showTagsDropdown, setShowTagsDropdown] = useState(false)
  const [showInsightsDropdown, setShowInsightsDropdown] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [newTag, setNewTag] = useState('')

  const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open
  const StatusIcon = statusInfo.icon
  const priorityInfo = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.medium

  const handleAddTag = (tag: string) => {
    if (tag && !ticket.tags.includes(tag)) {
      onAddTag?.(tag)
      setNewTag('')
    }
  }

  const handleToggleInsights = () => {
    if (messageInsights && onMessageInsightsChange) {
      onMessageInsightsChange({
        ...messageInsights,
        showInsights: !messageInsights.showInsights,
      })
    }
  }

  const handleToggleInsightOption = (option: string) => {
    if (messageInsights && onMessageInsightsChange) {
      // Handle nested paths like "essentials.customerName" or "ticketInfo.brandName"
      const keys = option.split('.')

      if (keys.length === 1) {
        // Top-level option (sentiment, entity, category, etc.)
        const key = keys[0] as keyof MessageInsights['selectedInsights']
        onMessageInsightsChange({
          ...messageInsights,
          selectedInsights: {
            ...messageInsights.selectedInsights,
            [key]: !messageInsights.selectedInsights[key],
          },
        })
      } else if (keys[0] === 'essentials' && keys.length === 2) {
        // Nested essentials option
        const essentialKey = keys[1] as keyof MessageInsights['selectedInsights']['essentials']
        onMessageInsightsChange({
          ...messageInsights,
          selectedInsights: {
            ...messageInsights.selectedInsights,
            essentials: {
              ...messageInsights.selectedInsights.essentials,
              [essentialKey]: !messageInsights.selectedInsights.essentials[essentialKey],
            },
          },
        })
      } else if (keys[0] === 'ticketInfo' && keys.length === 2) {
        // Nested ticketInfo option
        const ticketInfoKey = keys[1] as keyof MessageInsights['selectedInsights']['ticketInfo']
        onMessageInsightsChange({
          ...messageInsights,
          selectedInsights: {
            ...messageInsights.selectedInsights,
            ticketInfo: {
              ...messageInsights.selectedInsights.ticketInfo,
              [ticketInfoKey]: !messageInsights.selectedInsights.ticketInfo[ticketInfoKey],
            },
          },
        })
      }
    }
  }

  const handleSelectAll = () => {
    if (messageInsights && onMessageInsightsChange) {
      onMessageInsightsChange({
        ...messageInsights,
        selectedInsights: {
          sentiment: true,
          entity: true,
          intent: true,
          emotion: true,
          category: true,
          aspects: true,
          aspectGroups: true,
          signalSense: true,
          ticketInfo: {
            brandName: true,
            ticketId: true,
            time: true,
            media: true,
            categoryWithSentiment: true,
            ticketTags: true,
            locationProfileName: true,
            facebookLocationName: true,
            language: true,
            assignTo: true,
            seenBy: true,
          },
          essentials: {
            customerName: true,
            avatar: true,
            handleAndFollowers: true,
            platformAndType: true,
            timestamp: true,
            messageSnippet: true,
            messageCount: true,
            priorityBadge: true,
            slaStatus: true,
            unreadCount: true,
          },
        },
      })
    }
  }

  const handleDeselectAll = () => {
    if (messageInsights && onMessageInsightsChange) {
      onMessageInsightsChange({
        ...messageInsights,
        selectedInsights: {
          sentiment: false,
          entity: false,
          intent: false,
          emotion: false,
          category: false,
          aspects: false,
          aspectGroups: false,
          signalSense: false,
          ticketInfo: {
            brandName: false,
            ticketId: false,
            time: false,
            media: false,
            categoryWithSentiment: false,
            ticketTags: false,
            locationProfileName: false,
            facebookLocationName: false,
            language: false,
            assignTo: false,
            seenBy: false,
          },
          essentials: {
            customerName: false,
            avatar: false,
            handleAndFollowers: false,
            platformAndType: false,
            timestamp: false,
            messageSnippet: false,
            messageCount: false,
            priorityBadge: false,
            slaStatus: false,
            unreadCount: false,
          },
        },
      })
    }
  }

  const handleSectionSelectAll = (section: string) => {
    if (messageInsights && onMessageInsightsChange) {
      const updates: Partial<MessageInsights['selectedInsights']> = {}

      switch (section) {
        case 'ai':
          updates.sentiment = true
          updates.entity = true
          updates.intent = true
          updates.emotion = true
          break
        case 'categories':
          updates.category = true
          updates.aspects = true
          updates.aspectGroups = true
          break
        case 'special':
          updates.signalSense = true
          break
        case 'ticketInfo':
          updates.ticketInfo = {
            brandName: true,
            ticketId: true,
            time: true,
            media: true,
            categoryWithSentiment: true,
            ticketTags: true,
            locationProfileName: true,
            facebookLocationName: true,
            language: true,
            assignTo: true,
            seenBy: true,
          }
          break
        case 'essentials':
          updates.essentials = {
            customerName: true,
            avatar: true,
            handleAndFollowers: true,
            platformAndType: true,
            timestamp: true,
            messageSnippet: true,
            messageCount: true,
            priorityBadge: true,
            slaStatus: true,
            unreadCount: true,
          }
          break
      }

      onMessageInsightsChange({
        ...messageInsights,
        selectedInsights: {
          ...messageInsights.selectedInsights,
          ...updates,
        },
      })
    }
  }

  const handleSectionDeselectAll = (section: string) => {
    if (messageInsights && onMessageInsightsChange) {
      const updates: Partial<MessageInsights['selectedInsights']> = {}

      switch (section) {
        case 'ai':
          updates.sentiment = false
          updates.entity = false
          updates.intent = false
          updates.emotion = false
          break
        case 'categories':
          updates.category = false
          updates.aspects = false
          updates.aspectGroups = false
          break
        case 'special':
          updates.signalSense = false
          break
        case 'ticketInfo':
          updates.ticketInfo = {
            brandName: false,
            ticketId: false,
            time: false,
            media: false,
            categoryWithSentiment: false,
            ticketTags: false,
            locationProfileName: false,
            facebookLocationName: false,
            language: false,
            assignTo: false,
            seenBy: false,
          }
          break
        case 'essentials':
          updates.essentials = {
            customerName: false,
            avatar: false,
            handleAndFollowers: false,
            platformAndType: false,
            timestamp: false,
            messageSnippet: false,
            messageCount: false,
            priorityBadge: false,
            slaStatus: false,
            unreadCount: false,
          }
          break
      }

      onMessageInsightsChange({
        ...messageInsights,
        selectedInsights: {
          ...messageInsights.selectedInsights,
          ...updates,
        },
      })
    }
  }

  const handleMoreAction = (action: string) => {
    setShowMoreMenu(false)
    console.log(`Action: ${action}`)
    // These would trigger actual handlers passed as props
  }

  const moreMenuActions = [
    { id: 'assign', label: 'Reassign Ticket', icon: UserPlus },
    { id: 'merge', label: 'Merge with Another', icon: Merge },
    { id: 'flag', label: 'Flag for Review', icon: Flag },
    { id: 'copy-link', label: 'Copy Link', icon: Copy },
    { id: 'open-external', label: 'Open in CRM', icon: ExternalLink },
    { id: 'archive', label: 'Archive Ticket', icon: Archive },
  ]

  return (
    <div className="border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        {/* Left: Ticket Info */}
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-slate-900 dark:text-white">
            {ticket.ticketNumber}
          </h1>

          {/* SLA Timers - Inline */}
          <div className="flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-700">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                FRT:{' '}
                <span
                  className={
                    ticket.sla.firstResponse.status === 'due-soon'
                      ? 'font-medium text-orange-600 dark:text-orange-400'
                      : 'font-medium text-green-600 dark:text-green-400'
                  }
                >
                  {ticket.sla.firstResponse.remainingMinutes}m
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Res:{' '}
                <span className="font-medium text-green-600 dark:text-green-400">
                  {Math.floor(ticket.sla.resolution.remainingMinutes / 60)}h{' '}
                  {ticket.sla.resolution.remainingMinutes % 60}m
                </span>
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown)
                setShowPriorityDropdown(false)
                setShowTagsDropdown(false)
                setShowMoreMenu(false)
              }}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors
                ${statusInfo.color === 'blue'
                  ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300'
                  : statusInfo.color === 'yellow'
                    ? 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-300'
                    : statusInfo.color === 'green'
                      ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-900 dark:bg-green-950 dark:text-green-300'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
            >
              <StatusIcon className="h-4 w-4" />
              {statusInfo.label}
              <ChevronDown className="h-3 w-3" />
            </button>

            {showStatusDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowStatusDropdown(false)}
                />
                <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  {Object.entries(statusConfig).map(([key, config]) => {
                    const Icon = config.icon
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          onChangeStatus?.(key)
                          setShowStatusDropdown(false)
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <Icon className="h-4 w-4" />
                        {config.label}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Priority Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPriorityDropdown(!showPriorityDropdown)
                setShowStatusDropdown(false)
                setShowTagsDropdown(false)
                setShowMoreMenu(false)
              }}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors
                ${priorityInfo.color === 'red'
                  ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-300'
                  : priorityInfo.color === 'orange'
                    ? 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300'
                    : priorityInfo.color === 'yellow'
                      ? 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-300'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
            >
              {priorityInfo.label}
              <ChevronDown className="h-3 w-3" />
            </button>

            {showPriorityDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowPriorityDropdown(false)}
                />
                <div className="absolute left-0 top-full z-50 mt-2 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  {Object.entries(priorityConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => {
                        onChangePriority?.(key)
                        setShowPriorityDropdown(false)
                      }}
                      className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Tags - Editable */}
          <div className="relative">
            <button
              onClick={() => {
                setShowTagsDropdown(!showTagsDropdown)
                setShowStatusDropdown(false)
                setShowPriorityDropdown(false)
                setShowMoreMenu(false)
              }}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <Tag className="h-4 w-4 text-slate-400" />
              {ticket.tags && ticket.tags.length > 0 ? (
                <>
                  {ticket.tags.slice(0, 2).map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                  {ticket.tags.length > 2 && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      +{ticket.tags.length - 2}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400">Add tags</span>
              )}
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showTagsDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowTagsDropdown(false)}
                />
                <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  {/* Current Tags */}
                  {ticket.tags && ticket.tags.length > 0 && (
                    <div className="border-b border-slate-200 p-3 dark:border-slate-700">
                      <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                        Current Tags
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {ticket.tags.map((tag: string) => (
                          <button
                            key={tag}
                            onClick={() => onRemoveTag?.(tag)}
                            className="group flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-red-950 dark:hover:text-red-400"
                          >
                            {tag}
                            <Trash2 className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Tag */}
                  <div className="p-3">
                    <div className="mb-2 flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag(newTag)}
                        placeholder="Type tag name..."
                        className="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                      <button
                        onClick={() => handleAddTag(newTag)}
                        className="flex items-center gap-1 rounded bg-indigo-600 px-3 py-1 text-xs text-white hover:bg-indigo-700 dark:bg-indigo-500"
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </button>
                    </div>

                    {/* Suggested Tags */}
                    <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      Suggested
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {commonTags
                        .filter((tag) => !ticket.tags?.includes(tag))
                        .slice(0, 6)
                        .map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleAddTag(tag)}
                            className="rounded bg-slate-50 px-2 py-1 text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-indigo-950 dark:hover:text-indigo-400"
                          >
                            {tag}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Message Insights Toggle & Selector */}
          {messageInsights && (
            <div className="relative ml-2 flex items-center gap-1 border-l border-slate-200 pl-4 dark:border-slate-700">
              {/* Toggle Button */}
              <button
                onClick={handleToggleInsights}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${messageInsights.showInsights
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                  }`}
              >
                {messageInsights.showInsights ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                {messageInsights.showInsights ? 'Insights On' : 'Insights Off'}
              </button>

              {/* Dropdown Selector - Only visible when insights are on */}
              {messageInsights.showInsights && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowInsightsDropdown(!showInsightsDropdown)
                      setShowStatusDropdown(false)
                      setShowPriorityDropdown(false)
                      setShowTagsDropdown(false)
                      setShowMoreMenu(false)
                    }}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                  >
                    <span className="text-xs text-slate-600 dark:text-slate-400">Configure</span>
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  </button>

                  {showInsightsDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowInsightsDropdown(false)}
                      />
                      <div className="absolute left-0 top-full z-50 mt-2 w-64 max-h-[70vh] overflow-y-auto rounded-lg border border-slate-200 bg-white py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                        {/* Global Select All / Deselect All */}
                        <div className="flex gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                          <button
                            onClick={handleSelectAll}
                            className="flex-1 px-3 py-1.5 text-xs font-medium rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900"
                          >
                            Select All
                          </button>
                          <button
                            onClick={handleDeselectAll}
                            className="flex-1 px-3 py-1.5 text-xs font-medium rounded bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            Deselect All
                          </button>
                        </div>

                        {/* AI Classifications Section */}
                        <div className="flex items-center justify-between px-3 pb-2 pt-3">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            AI Classifications:
                          </p>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSectionSelectAll('ai')}
                              className="px-2 py-0.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded dark:text-indigo-400 dark:hover:bg-indigo-950"
                            >
                              All
                            </button>
                            <button
                              onClick={() => handleSectionDeselectAll('ai')}
                              className="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100 rounded dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                              None
                            </button>
                          </div>
                        </div>
                        {Object.entries({
                          sentiment: 'Sentiment',
                          entity: 'Entity Type',
                          intent: 'Intent',
                          emotion: 'Emotion',
                        }).map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => handleToggleInsightOption(key)}
                            className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <span className="text-slate-700 dark:text-slate-300">{label}</span>
                            {messageInsights.selectedInsights[
                              key as keyof MessageInsights['selectedInsights']
                            ] && (
                                <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              )}
                          </button>
                        ))}

                        {/* Divider */}
                        <div className="my-2 h-px bg-slate-200 dark:bg-slate-700" />

                        {/* Categories & Aspects Section */}
                        <div className="flex items-center justify-between px-3 pb-2">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Categories & Aspects:
                          </p>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSectionSelectAll('categories')}
                              className="px-2 py-0.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded dark:text-indigo-400 dark:hover:bg-indigo-950"
                            >
                              All
                            </button>
                            <button
                              onClick={() => handleSectionDeselectAll('categories')}
                              className="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100 rounded dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                              None
                            </button>
                          </div>
                        </div>
                        {Object.entries({
                          category: 'Categories',
                          aspects: 'Aspects',
                          aspectGroups: 'Aspect Groups',
                        }).map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => handleToggleInsightOption(key)}
                            className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <span className="text-slate-700 dark:text-slate-300">{label}</span>
                            {messageInsights.selectedInsights[
                              key as keyof MessageInsights['selectedInsights']
                            ] && (
                                <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              )}
                          </button>
                        ))}

                        {/* Divider */}
                        <div className="my-2 h-px bg-slate-200 dark:bg-slate-700" />

                        {/* Special Section */}
                        <div className="flex items-center justify-between px-3 pb-2">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Special:
                          </p>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSectionSelectAll('special')}
                              className="px-2 py-0.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded dark:text-indigo-400 dark:hover:bg-indigo-950"
                            >
                              All
                            </button>
                            <button
                              onClick={() => handleSectionDeselectAll('special')}
                              className="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100 rounded dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                              None
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleInsightOption('signalSense')}
                          className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          <span className="text-slate-700 dark:text-slate-300">Signal Sense</span>
                          {messageInsights.selectedInsights.signalSense && (
                            <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </button>

                        {/* Divider */}
                        <div className="my-2 h-px bg-slate-200 dark:bg-slate-700" />

                        {/* Ticket Info Section */}
                        <div className="flex items-center justify-between px-3 pb-2">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Ticket Info:
                          </p>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSectionSelectAll('ticketInfo')}
                              className="px-2 py-0.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded dark:text-indigo-400 dark:hover:bg-indigo-950"
                            >
                              All
                            </button>
                            <button
                              onClick={() => handleSectionDeselectAll('ticketInfo')}
                              className="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100 rounded dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                              None
                            </button>
                          </div>
                        </div>
                        {Object.entries({
                          'ticketInfo.brandName': 'Brand Name',
                          'ticketInfo.ticketId': 'Ticket ID',
                          'ticketInfo.time': 'Time',
                          'ticketInfo.media': 'Media Preview',
                          'ticketInfo.categoryWithSentiment': 'Categories (with Sentiment)',
                          'ticketInfo.ticketTags': 'Ticket Tags',
                          'ticketInfo.locationProfileName': 'Location Profile',
                          'ticketInfo.facebookLocationName': 'GMB/Facebook Location',
                          'ticketInfo.language': 'Language',
                          'ticketInfo.assignTo': 'Assigned To',
                          'ticketInfo.seenBy': 'Seen By',
                        }).map(([key, label]) => {
                          const ticketInfoKey = key.split('.')[1] as keyof MessageInsights['selectedInsights']['ticketInfo']
                          return (
                            <button
                              key={key}
                              onClick={() => handleToggleInsightOption(key)}
                              className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                              <span className="text-slate-700 dark:text-slate-300">{label}</span>
                              {messageInsights.selectedInsights.ticketInfo?.[ticketInfoKey] && (
                                <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              )}
                            </button>
                          )
                        })}

                        {/* Divider */}
                        <div className="my-2 h-px bg-slate-200 dark:bg-slate-700" />

                        {/* Essentials Section */}
                        <div className="flex items-center justify-between px-3 pb-2">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Essentials:
                          </p>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSectionSelectAll('essentials')}
                              className="px-2 py-0.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded dark:text-indigo-400 dark:hover:bg-indigo-950"
                            >
                              All
                            </button>
                            <button
                              onClick={() => handleSectionDeselectAll('essentials')}
                              className="px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100 rounded dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                              None
                            </button>
                          </div>
                        </div>
                        {Object.entries({
                          'essentials.customerName': 'Customer Name',
                          'essentials.avatar': 'Avatar',
                          'essentials.handleAndFollowers': 'Handle & Followers',
                          'essentials.platformAndType': 'Platform & Type',
                          'essentials.timestamp': 'Timestamp',
                          'essentials.messageSnippet': 'Message Snippet',
                          'essentials.messageCount': 'Message Count',
                          'essentials.priorityBadge': 'Priority Badge',
                          'essentials.slaStatus': 'SLA Status',
                          'essentials.unreadCount': 'Unread Count',
                        }).map(([key, label]) => {
                          const essentialKey = key.split('.')[1] as keyof MessageInsights['selectedInsights']['essentials']
                          return (
                            <button
                              key={key}
                              onClick={() => handleToggleInsightOption(key)}
                              className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                              <span className="text-slate-700 dark:text-slate-300">{label}</span>
                              {messageInsights.selectedInsights.essentials[essentialKey] && (
                                <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Next Ticket Button */}
          {hasNextTicket && (
            <button
              onClick={onNextTicket}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMoreMenu(!showMoreMenu)
                setShowStatusDropdown(false)
                setShowPriorityDropdown(false)
                setShowTagsDropdown(false)
              }}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {showMoreMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMoreMenu(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  {moreMenuActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleMoreAction(action.id)}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        <Icon className="h-4 w-4 text-slate-400" />
                        {action.label}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
