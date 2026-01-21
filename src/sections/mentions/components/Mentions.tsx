import { useState, useRef, useEffect } from 'react'
import type { MentionsProps, DisplayMode, Mention } from '@/../product/sections/mentions/types'
import { MentionsKpiBar } from './MentionsKpiBar'
import { MentionCardCompact } from './MentionCardCompact'
import { MentionDetailPanel } from './MentionDetailPanel'
import { DataGrid, type ColumnDef } from '@/components/DataGrid'
import { FilterPanel } from '@/components/FilterPanel'
import { FilterBar } from '@/components/FilterBar'
import type { DateRange } from '@/components/DateRangePicker'
import { List, Rows, Save, ChevronDown, Check } from 'lucide-react'

// Insights configuration interface (matching inbox pattern)
export interface MentionInsights {
  showInsights: boolean
  selectedInsights: {
    // AI Classifications
    sentiment: boolean
    entity: boolean
    intent: boolean
    emotion: boolean
    // Categories & Aspects
    category: boolean
    aspectGroups: boolean
    aspects: boolean
    // Special Element
    signalSense: boolean
    // Mention Info
    mentionInfo: {
      media: boolean
      tags: boolean
      engagement: boolean
    }
  }
}

const displayModes: { mode: DisplayMode; icon: typeof List; label: string }[] = [
  { mode: 'table', icon: List, label: 'Table' },
  { mode: 'feed', icon: Rows, label: 'Feed' },
]

export function Mentions({
  userRole = 'supervisor',
  mentions,
  topAuthors,
  trendingKeywords,
  displayMode = 'card',
  onDisplayModeChange,
  onMentionClick,
  onReply,
  onAssign,
  onTag,
  onMarkRead,
  onMarkImportant,
  onOpenInPlatform,
  onMentionHover,
  onSaveView,
  onKeywordClick,
  onAuthorClick,
  isFilterPanelOpen = false,
  onFilterPanelClose,
}: MentionsProps & { isFilterPanelOpen?: boolean; onFilterPanelClose?: () => void }) {
  // Default to feed view since card is removed
  const [currentDisplayMode, setCurrentDisplayMode] = useState<DisplayMode>(displayMode === 'card' ? 'feed' : displayMode)
  const [selectedMentions, setSelectedMentions] = useState<Set<string>>(new Set())
  const [activeFilter, setActiveFilter] = useState<'all' | 'actionable' | 'non-actionable'>('all')
  const [selectedMention, setSelectedMention] = useState<Mention | null>(null)
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])

  // Insights configuration state
  const [mentionInsights, setMentionInsights] = useState<MentionInsights>({
    showInsights: true,
    selectedInsights: {
      // AI Classifications - all true by default
      sentiment: true,
      entity: true,
      intent: true,
      emotion: true,
      // Categories & Aspects
      category: true,
      aspectGroups: true,
      aspects: true,
      // Special Element
      signalSense: true,
      // Mention Info
      mentionInfo: {
        media: true,
        tags: true,
        engagement: true,
      },
    },
  })
  const [showInsightsConfig, setShowInsightsConfig] = useState(false)
  const insightsConfigRef = useRef<HTMLDivElement>(null)

  // Close insights config dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (insightsConfigRef.current && !insightsConfigRef.current.contains(event.target as Node)) {
        setShowInsightsConfig(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Toggle insights setting
  const toggleInsightSetting = (keys: string[]) => {
    if (keys.length === 1) {
      // Top-level option (sentiment, entity, category, etc.)
      const key = keys[0] as keyof MentionInsights['selectedInsights']
      setMentionInsights({
        ...mentionInsights,
        selectedInsights: {
          ...mentionInsights.selectedInsights,
          [key]: !mentionInsights.selectedInsights[key],
        },
      })
    } else if (keys[0] === 'mentionInfo' && keys.length === 2) {
      // Nested mentionInfo option
      const infoKey = keys[1] as keyof MentionInsights['selectedInsights']['mentionInfo']
      setMentionInsights({
        ...mentionInsights,
        selectedInsights: {
          ...mentionInsights.selectedInsights,
          mentionInfo: {
            ...mentionInsights.selectedInsights.mentionInfo,
            [infoKey]: !mentionInsights.selectedInsights.mentionInfo[infoKey],
          },
        },
      })
    }
  }

  const handleDisplayModeChange = (mode: DisplayMode) => {
    setCurrentDisplayMode(mode)
    onDisplayModeChange?.(mode)
  }

  const handleMentionClick = (mentionId: string) => {
    const mention = mentions.find(m => m.id === mentionId)
    if (mention) {
      setSelectedMention(mention)
      setIsDetailPanelOpen(true)
    }
    onMentionClick?.(mentionId)
  }

  const handleSaveMention = (updates: Partial<Mention>) => {
    // In a real app, this would call an API to update the mention
    console.log('Saving mention updates:', updates)
    // You can add the actual save logic here or pass it up via a prop
  }

  // Calculate KPI values from data
  const totalMentions = mentions.length
  const actionableMentions = mentions.filter(m =>
    m.intent === 'complaint' || m.intent === 'question' || m.sentiment === 'negative'
  ).length
  const nonActionableMentions = totalMentions - actionableMentions

  // Calculate brand activity from avenue KPIs (simplified for demo)
  const brandPosts = 45
  const brandReplies = 128

  // Filter mentions based on active filter
  const filteredMentions = mentions.filter(mention => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'actionable') {
      return mention.intent === 'complaint' || mention.intent === 'question' || mention.sentiment === 'negative'
    }
    return mention.intent !== 'complaint' && mention.intent !== 'question' && mention.sentiment !== 'negative'
  })

  // Define columns for the DataGrid
  const mentionColumns: ColumnDef<Mention>[] = [
    {
      id: 'author',
      header: 'Author',
      accessor: 'author',
      width: 200,
      minWidth: 150,
      frozen: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <img src={value.avatarUrl} alt={value.name} className="h-8 w-8 rounded-full" />
          <div>
            <div className="font-medium text-slate-900 dark:text-white">{value.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{value.username}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'channel',
      header: 'Channel',
      accessor: (row) => row.channel.platform,
      width: 120,
      frozen: true,
      render: (value) => (
        <span className="inline-flex rounded bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {value}
        </span>
      ),
    },
    {
      id: 'content',
      header: 'Content',
      accessor: 'contentSnippet',
      width: 400,
      minWidth: 250,
      flex: 1,
      render: (value) => (
        <p className="line-clamp-2 text-sm text-slate-700 dark:text-slate-300">{value}</p>
      ),
    },
    {
      id: 'sentiment',
      header: 'Sentiment',
      accessor: 'sentiment',
      width: 110,
      render: (value) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${value === 'positive'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
              : value === 'negative'
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
            }`}
        >
          {value}
        </span>
      ),
    },
    {
      id: 'intent',
      header: 'Intent',
      accessor: 'intent',
      width: 120,
      hidden: true,
      render: (value) => (
        <span className="inline-flex rounded bg-sky-100 px-2 py-1 text-xs font-medium capitalize text-sky-700 dark:bg-sky-950 dark:text-sky-300">
          {value}
        </span>
      ),
    },
    {
      id: 'reach',
      header: 'Reach',
      accessor: (row) => row.engagementMetrics.reach,
      width: 100,
      hidden: true,
      render: (value) => (
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {(value / 1000).toFixed(1)}K
        </span>
      ),
    },
    {
      id: 'engagement',
      header: 'Engagement',
      accessor: (row) => (row.engagementMetrics?.likes ?? 0) + (row.engagementMetrics?.comments ?? 0) + (row.engagementMetrics?.shares ?? 0),
      width: 120,
      hidden: true,
      render: (value) => (
        <span className="text-sm text-slate-700 dark:text-slate-300">{value.toLocaleString()}</span>
      ),
    },
    {
      id: 'tags',
      header: 'Tags',
      accessor: 'tags',
      width: 180,
      hidden: true,
      render: (value) => {
        if (!value || value.length === 0) {
          return <span className="text-xs text-slate-400 dark:text-slate-500">No tags</span>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 2).map((tag: string) => (
              <span
                key={tag}
                className="rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
              >
                {tag}
              </span>
            ))}
            {value.length > 2 && (
              <span className="px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400">
                +{value.length - 2}
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: 'avenue',
      header: 'Avenue',
      accessor: 'avenue',
      width: 120,
      hidden: true,
      render: (value) => (
        <span className="inline-flex rounded bg-purple-100 px-2 py-1 text-xs font-medium capitalize text-purple-700 dark:bg-purple-950 dark:text-purple-300">
          {value}
        </span>
      ),
    },
    {
      id: 'timestamp',
      header: 'Date',
      accessor: 'timestamp',
      width: 120,
      render: (value) => (
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'isImportant',
      header: 'Important',
      accessor: 'isImportant',
      width: 100,
      hidden: true,
      render: (value) =>
        value ? (
          <span className="text-amber-500">★</span>
        ) : (
          <span className="text-slate-300 dark:text-slate-600">☆</span>
        ),
    },
  ]

  return (
    <div className="flex h-full">
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* KPI Bar */}
        <MentionsKpiBar
          totalMentions={totalMentions}
          actionableMentions={actionableMentions}
          nonActionableMentions={nonActionableMentions}
          brandPosts={brandPosts}
          brandReplies={brandReplies}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Filter Bar */}
        <FilterBar
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedChannels={selectedChannels}
          onChannelsChange={setSelectedChannels}
          showHourlyButton={true}
          onHourlyModeToggle={() => console.log('Switch to hourly mode')}
        />

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {filteredMentions.length} mention{filteredMentions.length !== 1 ? 's' : ''}
            {activeFilter !== 'all' && (
              <span className="ml-2 text-indigo-600 dark:text-indigo-400">
                ({activeFilter})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Display Mode Toggle */}
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
              {displayModes.map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => handleDisplayModeChange(mode)}
                  className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors ${currentDisplayMode === mode
                      ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Insights Configuration Dropdown - Only visible in feed mode */}
            {currentDisplayMode === 'feed' && (
              <div className="relative" ref={insightsConfigRef}>
                <button
                  onClick={() => setShowInsightsConfig(!showInsightsConfig)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    mentionInsights.showInsights
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>Insights</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showInsightsConfig ? 'rotate-180' : ''}`} />
                </button>

                {/* Insights Config Dropdown */}
                {showInsightsConfig && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                    {/* Master Toggle */}
                    <div className="border-b border-slate-200 p-2 dark:border-slate-700">
                      <button
                        onClick={() => setMentionInsights({ ...mentionInsights, showInsights: !mentionInsights.showInsights })}
                        className="flex w-full items-center justify-between rounded px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <span className="font-medium text-slate-900 dark:text-white">Show Insights</span>
                        {mentionInsights.showInsights && (
                          <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </button>
                    </div>

                    {mentionInsights.showInsights && (
                      <div className="p-2 space-y-1">
                        {/* AI Classifications */}
                        <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          AI Classifications
                        </div>
                        {Object.entries({
                          sentiment: 'Sentiment',
                          entity: 'Entity Type',
                          intent: 'Intent',
                          emotion: 'Emotion',
                        }).map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => toggleInsightSetting([key])}
                            className="flex w-full items-center justify-between rounded px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <span className="text-slate-700 dark:text-slate-300">{label}</span>
                            {mentionInsights.selectedInsights[key as keyof MentionInsights['selectedInsights']] && (
                              <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            )}
                          </button>
                        ))}

                        {/* Categories & Aspects */}
                        <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-2">
                          Categories & Aspects
                        </div>
                        {Object.entries({
                          category: 'Category Mapping',
                          aspectGroups: 'Aspect Groups',
                          aspects: 'Ungrouped Aspects',
                        }).map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => toggleInsightSetting([key])}
                            className="flex w-full items-center justify-between rounded px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <span className="text-slate-700 dark:text-slate-300">{label}</span>
                            {mentionInsights.selectedInsights[key as keyof MentionInsights['selectedInsights']] && (
                              <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            )}
                          </button>
                        ))}

                        {/* Signal Sense */}
                        <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-2">
                          Special Element
                        </div>
                        <button
                          onClick={() => toggleInsightSetting(['signalSense'])}
                          className="flex w-full items-center justify-between rounded px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <span className="text-slate-700 dark:text-slate-300">Signal Sense</span>
                          {mentionInsights.selectedInsights.signalSense && (
                            <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </button>

                        {/* Mention Info */}
                        <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-2">
                          Mention Info
                        </div>
                        {Object.entries({
                          'mentionInfo.media': 'Media',
                          'mentionInfo.tags': 'Tags',
                          'mentionInfo.engagement': 'Engagement',
                        }).map(([key, label]) => {
                          const infoKey = key.split('.')[1] as keyof MentionInsights['selectedInsights']['mentionInfo']
                          return (
                            <button
                              key={key}
                              onClick={() => toggleInsightSetting(key.split('.'))}
                              className="flex w-full items-center justify-between rounded px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <span className="text-slate-700 dark:text-slate-300">{label}</span>
                              {mentionInsights.selectedInsights.mentionInfo[infoKey] && (
                                <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Save View */}
            <button
              onClick={() => onSaveView?.({
                name: 'Custom View',
                displayMode: currentDisplayMode,
                filters: {},
                visibleColumns: [],
                sortBy: 'timestamp',
                sortOrder: 'desc',
                isDefault: false,
              })}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save View</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Feed View - compact list style like ticket listing */}
          {currentDisplayMode === 'feed' && (
            <div className="border-t border-slate-200 dark:border-slate-800">
              {filteredMentions.map((mention) => (
                <MentionCardCompact
                  key={mention.id}
                  mention={mention}
                  isSelected={selectedMentions.has(mention.id)}
                  onClick={onMentionClick}
                  onHover={onMentionHover}
                  onMarkImportant={onMarkImportant}
                  onOpenInPlatform={onOpenInPlatform}
                  showInsights={mentionInsights.showInsights}
                  selectedInsights={mentionInsights.selectedInsights}
                />
              ))}
            </div>
          )}

          {/* Table View with DataGrid - full width, no padding */}
          {currentDisplayMode === 'table' && (
            <div className="h-full px-6 pt-6">
              <DataGrid
                data={filteredMentions}
                columns={mentionColumns}
                rowKey="id"
                selectedIds={Array.from(selectedMentions)}
                onRowClick={(row) => handleMentionClick(row.id)}
                onSelectionChange={(id, selected) => {
                  setSelectedMentions((prev) => {
                    const next = new Set(prev)
                    if (selected) {
                      next.add(id)
                    } else {
                      next.delete(id)
                    }
                    return next
                  })
                }}
                onCellEdit={(rowId, columnId, value) => {
                  console.log('Mention cell edited:', { rowId, columnId, value })
                }}
                frozenColumnCount={2}
              />
            </div>
          )}
        </div>
      </div>


      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => onFilterPanelClose?.()}
        teams={[
          { value: 'support', label: 'Support Team' },
          { value: 'sales', label: 'Sales Team' },
          { value: 'marketing', label: 'Marketing Team' },
          { value: 'product', label: 'Product Team' },
        ]}
        channels={[
          { value: 'twitter', label: 'Twitter', icon: '𝕏' },
          { value: 'facebook', label: 'Facebook', icon: '📘' },
          { value: 'instagram', label: 'Instagram', icon: '📷' },
          { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
          { value: 'youtube', label: 'YouTube', icon: '▶️' },
        ]}
        filterFamilies={[
          {
            id: 'mention',
            name: 'Mention',
            attributes: [
              {
                id: 'sentiment', name: 'Sentiment', type: 'select', operators: ['is', 'is not'], options: [
                  { value: 'positive', label: 'Positive' },
                  { value: 'neutral', label: 'Neutral' },
                  { value: 'negative', label: 'Negative' },
                ]
              },
              {
                id: 'intent', name: 'Intent', type: 'select', operators: ['is', 'is not'], options: [
                  { value: 'question', label: 'Question' },
                  { value: 'complaint', label: 'Complaint' },
                  { value: 'feedback', label: 'Feedback' },
                  { value: 'praise', label: 'Praise' },
                  { value: 'general', label: 'General' },
                ]
              },
              { id: 'reach', name: 'Reach', type: 'number', operators: ['greater than', 'less than', 'equals'] },
            ],
          },
          {
            id: 'author',
            name: 'Author',
            attributes: [
              { id: 'followerCount', name: 'Follower Count', type: 'number', operators: ['greater than', 'less than', 'equals'] },
              {
                id: 'isVerified', name: 'Verified', type: 'select', operators: ['is'], options: [
                  { value: 'true', label: 'Yes' },
                  { value: 'false', label: 'No' },
                ]
              },
            ],
          },
          {
            id: 'content',
            name: 'Content',
            attributes: [
              { id: 'keywords', name: 'Keywords', type: 'text', operators: ['contains', 'does not contain'] },
              { id: 'hashtags', name: 'Hashtags', type: 'text', operators: ['contains', 'does not contain'] },
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

      {/* Mention Detail Panel */}
      {selectedMention && (
        <MentionDetailPanel
          mention={selectedMention}
          isOpen={isDetailPanelOpen}
          onClose={() => {
            setIsDetailPanelOpen(false)
            setSelectedMention(null)
          }}
          onSave={handleSaveMention}
          showInsights={true}
        />
      )}
    </div>
  )
}
