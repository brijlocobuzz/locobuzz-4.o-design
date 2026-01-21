import type { GlobalFilters } from '@/../product/sections/dashboards/types'
import { useState } from 'react'

interface GlobalFilterBarProps {
  filters: GlobalFilters
  onApplyFilters: (filters: GlobalFilters) => void
  onResetFilters: () => void
}

export function GlobalFilterBar({ filters, onApplyFilters, onResetFilters }: GlobalFilterBarProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const timeRangeOptions = [
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 90 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' }
  ]

  const channelOptions = ['Twitter', 'Instagram', 'Facebook', 'LinkedIn', 'TikTok']
  const sentimentOptions = ['all', 'positive', 'neutral', 'negative']

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Time Range */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Time:</span>
          <select
            value={localFilters.timeRange}
            onChange={(e) => {
              const newFilters = { ...localFilters, timeRange: e.target.value }
              setLocalFilters(newFilters)
              onApplyFilters(newFilters)
            }}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Channels */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Channels:</span>
          <div className="flex gap-1">
            <button
              onClick={() => {
                const newFilters = { ...localFilters, channels: channelOptions }
                setLocalFilters(newFilters)
                onApplyFilters(newFilters)
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                localFilters.channels.length === channelOptions.length
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All
            </button>
            {channelOptions.slice(0, 3).map(channel => (
              <button
                key={channel}
                onClick={() => {
                  const newChannels = localFilters.channels.includes(channel)
                    ? localFilters.channels.filter(c => c !== channel)
                    : [...localFilters.channels, channel]
                  const newFilters = { ...localFilters, channels: newChannels.length ? newChannels : channelOptions }
                  setLocalFilters(newFilters)
                  onApplyFilters(newFilters)
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  localFilters.channels.includes(channel)
                    ? 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {channel}
              </button>
            ))}
          </div>
        </div>

        {/* Sentiment */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sentiment:</span>
          <select
            value={localFilters.sentiment}
            onChange={(e) => {
              const newFilters = { ...localFilters, sentiment: e.target.value }
              setLocalFilters(newFilters)
              onApplyFilters(newFilters)
            }}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
          >
            {sentimentOptions.map(option => (
              <option key={option} value={option} className="capitalize">{option}</option>
            ))}
          </select>
        </div>

        {/* Reset */}
        <button
          onClick={onResetFilters}
          className="ml-auto px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )
}
