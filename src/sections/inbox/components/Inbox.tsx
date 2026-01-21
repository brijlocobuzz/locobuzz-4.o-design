import { useState } from 'react'
import type { InboxProps, DisplayMode } from '@/../product/sections/inbox/types'
import { Sidebar } from './Sidebar'
import { SearchBar } from './SearchBar'
import { TicketList } from './TicketList'
import { SlideInPanel } from './SlideInPanel'
import { BulkActionsBar } from './BulkActionsBar'
import { FilterPanel } from '@/components/FilterPanel'
import { FilterBar } from '@/components/FilterBar'
import type { DateRange } from '@/components/DateRangePicker'
import { Eye, EyeOff, ChevronDown, Check } from 'lucide-react'
import type { MessageInsights } from './TicketHeader'

export function Inbox({
  sidebarViews,
  tickets,
  conversationThreads,
  aiSuggestions,
  savedSearches,
  users,
  teams,
  displayMode = 'compact',
  activeView,
  openTicketId,
  onViewChange,
  onDisplayModeChange,
  onTicketOpen,
  onTicketClose,
  onPopOut,
  onSearch,
  onSaveSearch,
  onLoadSearch,
  onReply,
  onInternalNote,
  onAssign,
  onAddTags,
  onCreateTask,
  onEscalate,
  onSendToTeam,
  onSelectionChange,
  onBulkAssign,
  onBulkClose,
  onBulkTag,
  onBulkStatusChange,
  onBulkPriorityChange,
  onBulkMarkRead,
  onAIFeedbackPositive,
  onAIFeedbackNegative,
  onApplyAISuggestion,
  onDraftSave,
  onSubmitForApproval,
  isFilterPanelOpen = false,
  onFilterPanelClose,
}: InboxProps & { isFilterPanelOpen?: boolean; onFilterPanelClose?: () => void }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentDisplayMode, setCurrentDisplayMode] = useState<DisplayMode>(displayMode)
  const [currentOpenTicketId, setCurrentOpenTicketId] = useState<string | null>(openTicketId ?? null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [messageInsights, setMessageInsights] = useState<MessageInsights>({
    showInsights: true,
    selectedInsights: {
      // AI Classifications - all true by default
      sentiment: true,
      entity: true,
      intent: true,
      emotion: true,

      // Categories & Aspects - all true by default
      category: true,
      aspects: true,
      aspectGroups: true,

      // Special - true by default
      signalSense: true,

      // Essentials - all true by default
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

      // Ticket Info - all true by default
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
    },
  })
  const [showInsightsDropdown, setShowInsightsDropdown] = useState(false)

  const handleTicketOpen = (ticketId: string) => {
    setCurrentOpenTicketId(ticketId)
    onTicketOpen?.(ticketId)
  }

  const handleTicketClose = () => {
    setCurrentOpenTicketId(null)
    onTicketClose?.()
  }

  const handleDisplayModeChange = (mode: DisplayMode) => {
    setCurrentDisplayMode(mode)
    onDisplayModeChange?.(mode)
  }

  const handleSelectionChange = (newSelectedIds: string[]) => {
    setSelectedIds(newSelectedIds)
    onSelectionChange?.(newSelectedIds)
  }

  const handleToggleInsights = () => {
    setMessageInsights({
      ...messageInsights,
      showInsights: !messageInsights.showInsights,
    })
  }

  const handleToggleInsightOption = (option: string) => {
    // Handle nested paths like "essentials.customerName" or "ticketInfo.brandName"
    const keys = option.split('.')

    if (keys.length === 1) {
      // Top-level option (sentiment, entity, category, etc.)
      const key = keys[0] as keyof MessageInsights['selectedInsights']
      setMessageInsights({
        ...messageInsights,
        selectedInsights: {
          ...messageInsights.selectedInsights,
          [key]: !messageInsights.selectedInsights[key],
        },
      })
    } else if (keys[0] === 'essentials' && keys.length === 2) {
      // Nested essentials option
      const essentialKey = keys[1] as keyof MessageInsights['selectedInsights']['essentials']
      setMessageInsights({
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
      setMessageInsights({
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

  const openTicket = currentOpenTicketId ? tickets.find(t => t.id === currentOpenTicketId) : null
  const openConversation = currentOpenTicketId ? conversationThreads[currentOpenTicketId] : null
  const openAISuggestions = currentOpenTicketId ? aiSuggestions[currentOpenTicketId] : null

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar
        views={sidebarViews}
        activeView={activeView}
        onViewChange={onViewChange}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search Bar */}
        <SearchBar
          savedSearches={savedSearches}
          onSearch={onSearch}
          onSaveSearch={onSaveSearch}
          onLoadSearch={onLoadSearch}
        />

        {/* Filter Bar */}
        <FilterBar
          selectedBrands={selectedBrands}
          onBrandsChange={setSelectedBrands}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedChannels={selectedChannels}
          onChannelsChange={setSelectedChannels}
          showHourlyButton={true}
          onHourlyModeToggle={() => console.log('Switch to hourly mode')}
        />

        {/* Bulk Actions Bar */}
        <BulkActionsBar
          selectedCount={selectedIds.length}
          users={users}
          teams={teams}
          onAssign={(userId, teamId) => onBulkAssign?.(selectedIds, userId, teamId)}
          onClose={() => {
            onBulkClose?.(selectedIds)
            setSelectedIds([])
          }}
          onAddTags={(tags) => onBulkTag?.(selectedIds, tags)}
          onChangeStatus={(status) => onBulkStatusChange?.(selectedIds, status)}
          onChangePriority={(priority) => onBulkPriorityChange?.(selectedIds, priority)}
          onMarkRead={() => onBulkMarkRead?.(selectedIds)}
          onClearSelection={() => setSelectedIds([])}
        />

        {/* Display Mode Switcher */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">View:</span>
              <button
                onClick={() => handleDisplayModeChange('compact')}
                className={`px-3 py-1.5 rounded text-sm transition-colors
                  ${currentDisplayMode === 'compact'
                    ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }
                `}
                title="Compact List - Primary mode for high-throughput agents"
              >
                📋 Compact
              </button>
              <button
                onClick={() => handleDisplayModeChange('table')}
                className={`px-3 py-1.5 rounded text-sm transition-colors
                  ${currentDisplayMode === 'table'
                    ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }
                `}
                title="Table View - For ops, reporting, batch operations"
              >
                📊 Table
              </button>
            </div>

            {/* Message Insights Toggle & Selector */}
            <div className="flex items-center gap-4">
              <div className="relative flex items-center gap-1">
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
                      onClick={() => setShowInsightsDropdown(!showInsightsDropdown)}
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
                        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-slate-200 bg-white py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                          {/* AI Classifications Section */}
                          <div className="px-3 pb-2 pt-3">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              AI Classifications:
                            </p>
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
                          <div className="px-3 pb-2">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              Categories & Aspects:
                            </p>
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
                          <div className="px-3 pb-2">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              Special:
                            </p>
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

                          {/* Essentials Section */}
                          <div className="px-3 pb-2">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              Essentials:
                            </p>
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

                          {/* Divider */}
                          <div className="my-2 h-px bg-slate-200 dark:bg-slate-700" />

                          {/* Ticket Info Section */}
                          <div className="px-3 pb-2">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              Ticket Info:
                            </p>
                          </div>
                          {Object.entries({
                            'ticketInfo.brandName': 'Brand Name',
                            'ticketInfo.locationProfileName': 'Location Profile',
                            'ticketInfo.ticketId': 'Ticket ID',
                            'ticketInfo.time': 'Time',
                            'ticketInfo.language': 'Language',
                            'ticketInfo.media': 'Media Preview',
                            'ticketInfo.ticketTags': 'Tags',
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
                                {messageInsights.selectedInsights.ticketInfo[ticketInfoKey] && (
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

              <div className="text-sm text-slate-600 dark:text-slate-400">
                {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Ticket List */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
          <TicketList
            tickets={tickets}
            displayMode={currentDisplayMode}
            selectedIds={selectedIds}
            onTicketClick={handleTicketOpen}
            onSelectionChange={handleSelectionChange}
            messageInsights={messageInsights}
          />
        </div>
      </div>

      {/* Slide-in Panel */}
      {openTicket && openConversation && (
        <SlideInPanel
          ticket={openTicket}
          conversation={openConversation}
          aiSuggestions={openAISuggestions || []}
          users={users}
          teams={teams}
          isOpen={currentOpenTicketId !== null}
          onClose={handleTicketClose}
          onPopOut={onPopOut}
          onReply={(content, metadata) => onReply?.(openTicket.id, content, metadata)}
          onInternalNote={(content, mentions) => onInternalNote?.(openTicket.id, content, mentions)}
          onAssign={(userId, teamId) => onAssign?.(openTicket.id, userId, teamId)}
          onAddTags={(tags) => onAddTags?.(openTicket.id, tags)}
          onCreateTask={() => onCreateTask?.(openTicket.id)}
          onEscalate={() => onEscalate?.(openTicket.id)}
          onSendToTeam={(teamId, message) => onSendToTeam?.(openTicket.id, teamId, message)}
          onAIFeedbackPositive={onAIFeedbackPositive}
          onAIFeedbackNegative={onAIFeedbackNegative}
          onApplyAISuggestion={(suggestionId) => onApplyAISuggestion?.(openTicket.id, suggestionId)}
          onDraftSave={(content) => onDraftSave?.(openTicket.id, content)}
          onSubmitForApproval={(content) => onSubmitForApproval?.(openTicket.id, content)}
        />
      )}

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => onFilterPanelClose?.()}
        teams={[
          { value: 'support', label: 'Support Team' },
          { value: 'sales', label: 'Sales Team' },
          { value: 'escalation', label: 'Escalation Team' },
          { value: 'vip', label: 'VIP Support' },
        ]}
        channels={[
          { value: 'twitter', label: 'Twitter', icon: '𝕏' },
          { value: 'facebook', label: 'Facebook', icon: '📘' },
          { value: 'instagram', label: 'Instagram', icon: '📷' },
          { value: 'email', label: 'Email', icon: '📧' },
          { value: 'chat', label: 'Live Chat', icon: '💬' },
          { value: 'whatsapp', label: 'WhatsApp', icon: '📱' },
        ]}
        filterFamilies={[
          {
            id: 'ticket',
            name: 'Ticket',
            attributes: [
              {
                id: 'status', name: 'Status', type: 'select', operators: ['is', 'is not'], options: [
                  { value: 'open', label: 'Open' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'resolved', label: 'Resolved' },
                  { value: 'closed', label: 'Closed' },
                ]
              },
              {
                id: 'priority', name: 'Priority', type: 'select', operators: ['is', 'is not'], options: [
                  { value: 'urgent', label: 'Urgent' },
                  { value: 'high', label: 'High' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'low', label: 'Low' },
                ]
              },
              {
                id: 'sentiment', name: 'Sentiment', type: 'select', operators: ['is', 'is not'], options: [
                  { value: 'positive', label: 'Positive' },
                  { value: 'neutral', label: 'Neutral' },
                  { value: 'negative', label: 'Negative' },
                ]
              },
            ],
          },
          {
            id: 'customer',
            name: 'Customer',
            attributes: [
              { id: 'followerCount', name: 'Follower Count', type: 'number', operators: ['greater than', 'less than', 'equals'] },
              {
                id: 'isVip', name: 'VIP', type: 'select', operators: ['is'], options: [
                  { value: 'true', label: 'Yes' },
                  { value: 'false', label: 'No' },
                ]
              },
            ],
          },
          {
            id: 'sla',
            name: 'SLA',
            attributes: [
              {
                id: 'breaching', name: 'Breaching', type: 'select', operators: ['is'], options: [
                  { value: 'true', label: 'Yes' },
                  { value: 'false', label: 'No' },
                ]
              },
              { id: 'timeRemaining', name: 'Time Remaining (mins)', type: 'number', operators: ['greater than', 'less than', 'equals'] },
            ],
          },
        ]}
        onApplyFilters={(filters) => {
          console.log('Applied filters:', filters)
          onFilterPanelClose?.()
        }}
        onSaveFilter={(name, filters) => {
          console.log('Saved filter as:', name, filters)
        }}
      />
    </div>
  )
}
