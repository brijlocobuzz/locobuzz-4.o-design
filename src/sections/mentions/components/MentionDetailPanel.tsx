import { useState } from 'react'
import { X, ExternalLink, Tag, Hash, User, MapPin, Package, TrendingUp, Eye, EyeOff } from 'lucide-react'
import type { Mention, CategoryMapping } from '@/../product/sections/mentions/types'
import { CategoryMappingPicker } from '@/components/CategoryMappingPicker'

interface MentionDetailPanelProps {
  mention: Mention
  isOpen: boolean
  onClose: () => void
  onSave?: (updates: Partial<Mention>) => void
  showInsights?: boolean
}

export function MentionDetailPanel({ mention, isOpen, onClose, onSave, showInsights = true }: MentionDetailPanelProps) {
  const [editedMention, setEditedMention] = useState<Partial<Mention>>({})
  const [activeTab, setActiveTab] = useState<'details' | 'engagement'>('details')

  if (!isOpen) return null

  const handleSave = () => {
    onSave?.(editedMention)
    onClose()
  }

  const updateField = (field: keyof Mention, value: any) => {
    setEditedMention((prev) => ({ ...prev, [field]: value }))
  }

  const getCurrentValue = <K extends keyof Mention>(field: K): Mention[K] => {
    return (editedMention[field] ?? mention[field]) as Mention[K]
  }

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      instagram: '📷',
      facebook: '👥',
      x: '🐦',
      linkedin: '💼',
      google: '⭐',
      youtube: '▶️',
      reddit: '🗨️',
      trustpilot: '⭐',
      web: '🌐',
      podcast: '🎙️',
    }
    return icons[platform] || '💬'
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
      case 'negative':
        return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
    }
  }

  // Picklist options
  const sentimentOptions = [
    { value: 'positive', label: 'Positive' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'negative', label: 'Negative' },
  ]

  const intentOptions = [
    { value: 'praise', label: 'Praise' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'question', label: 'Question' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'general', label: 'General' },
  ]

  const tagOptions = [
    'urgent', 'follow-up', 'escalated', 'resolved', 'influencer',
    'brand-mention', 'competitor', 'product-feedback', 'service-issue'
  ]

  const classificationOptions = [
    'Product Quality', 'Customer Service', 'Delivery', 'Pricing',
    'Features', 'Usability', 'Performance', 'Support', 'Documentation'
  ]

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      {/* Side Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto bg-white shadow-xl dark:bg-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Mention Details</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {getPlatformIcon(mention.platform)} {mention.channel.name} • {new Date(mention.timestamp).toLocaleString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-4 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('details')}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'details'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('engagement')}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'engagement'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              Engagement
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Author Info - Read Only */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Author
                </h3>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                  <img
                    src={mention.author.avatarUrl}
                    alt={mention.author.name}
                    className="h-12 w-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">{mention.author.name}</span>
                      {mention.author.isVerified && (
                        <svg className="h-4 w-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      @{mention.author.username} • {mention.author.followerCount.toLocaleString()} followers
                    </p>
                  </div>
                </div>
              </div>

              {/* Content - Read Only */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Content
                </h3>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                  <p className="whitespace-pre-wrap text-sm text-slate-900 dark:text-white">{mention.content}</p>
                </div>
              </div>

              {/* Sentiment - Editable */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Sentiment
                </h3>
                <PicklistField
                  value={getCurrentValue('sentiment')}
                  options={sentimentOptions}
                  onChange={(value) => updateField('sentiment', value)}
                  renderValue={(value) => (
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getSentimentColor(value)}`}>
                      {value}
                    </span>
                  )}
                />
              </div>

              {/* Intent - Editable */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Intent
                </h3>
                <PicklistField
                  value={getCurrentValue('intent')}
                  options={intentOptions}
                  onChange={(value) => updateField('intent', value)}
                />
              </div>

              {/* Category Mapping - Editable (Only show if insights enabled) */}
              {showInsights && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Category Mapping
                  </h3>
                  <CategoryMappingPicker
                    value={getCurrentValue('categoryMapping')}
                    onChange={(value) => updateField('categoryMapping', value)}
                  />
                </div>
              )}

              {/* Classifications - Editable */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Classifications
                </h3>
                <MultiSelectPicklist
                  value={getCurrentValue('classifications')}
                  options={classificationOptions}
                  onChange={(value) => updateField('classifications', value)}
                  icon={<Hash className="h-4 w-4" />}
                />
              </div>

              {/* Tags - Editable */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Tags
                </h3>
                <MultiSelectPicklist
                  value={getCurrentValue('tags')}
                  options={tagOptions}
                  onChange={(value) => updateField('tags', value)}
                  icon={<Tag className="h-4 w-4" />}
                />
              </div>

              {/* Location & Product - Read Only */}
              {mention.locationProfile && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <MapPin className="mr-1 inline h-4 w-4" />
                    Location
                  </h3>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                    {mention.locationProfile.name}
                  </div>
                </div>
              )}

              {mention.productProfiles.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <Package className="mr-1 inline h-4 w-4" />
                    Products
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {mention.productProfiles.map((product) => (
                      <span
                        key={product.id}
                        className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        {product.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'engagement' && (
            <div className="space-y-6">
              {/* Engagement Metrics - Read Only */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Engagement Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Likes</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                      {mention.engagementMetrics.likes.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Comments</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                      {mention.engagementMetrics.comments.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Shares</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                      {mention.engagementMetrics.shares.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Reach</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                      {mention.engagementMetrics.reach.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Priority Score - Read Only */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Priority Score
                </h3>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-slate-400" />
                    <div>
                      <div className="text-2xl font-semibold text-slate-900 dark:text-white">
                        {mention.priorityScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">out of 10</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Flags - Editable */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Status
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={getCurrentValue('isRead')}
                      onChange={(e) => updateField('isRead', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Eye className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-900 dark:text-white">Mark as Read</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={getCurrentValue('isImportant')}
                      onChange={(e) => updateField('isImportant', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-900 dark:text-white">Mark as Important</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => window.open(`#`, '_blank')}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ExternalLink className="h-4 w-4" />
                View on Platform
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Helper components for picklists
function PicklistField({
  value,
  options,
  onChange,
  renderValue,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  renderValue?: (value: string) => React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800"
      >
        {renderValue ? renderValue(value) : <span className="text-slate-900 dark:text-white">{value}</span>}
        <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className="flex w-full items-center px-4 py-2 text-left text-sm text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-700"
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function MultiSelectPicklist({
  value,
  options,
  onChange,
  icon,
}: {
  value: string[] | undefined
  options: string[]
  onChange: (value: string[]) => void
  icon?: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  // Safe fallback for undefined values
  const safeValue = value || []
  const safeOptions = options || []

  const toggleOption = (option: string) => {
    if (safeValue.includes(option)) {
      onChange(safeValue.filter((v) => v !== option))
    } else {
      onChange([...safeValue, option])
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {safeValue.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
          >
            {icon}
            {item}
            <button
              onClick={() => toggleOption(item)}
              className="hover:text-indigo-900 dark:hover:text-indigo-100"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="relative mt-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
        >
          Add...
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
              {safeOptions.filter((opt) => !safeValue.includes(opt)).map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    toggleOption(option)
                    setIsOpen(false)
                  }}
                  className="flex w-full items-center px-4 py-2 text-left text-sm text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-700"
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
