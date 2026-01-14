import { TrendingUp, TrendingDown, Minus, MessageSquare, Send, Reply } from 'lucide-react'

interface SparklineData {
  value: number
  label: string
}

interface MentionsKpiBarProps {
  totalMentions: number
  actionableMentions: number
  nonActionableMentions: number
  brandPosts: number
  brandReplies: number
  sparklineData?: SparklineData[]
  activeFilter?: 'all' | 'actionable' | 'non-actionable'
  onFilterChange?: (filter: 'all' | 'actionable' | 'non-actionable') => void
}

// Simple sparkline component
function Sparkline({ data, width = 80, height = 24 }: { data: SparklineData[]; width?: number; height?: number }) {
  if (!data || data.length < 2) return null

  const max = Math.max(...data.map(d => d.value))
  const min = Math.min(...data.map(d => d.value))
  const range = max - min || 1

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((d.value - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  const trend = data[data.length - 1].value >= data[0].value

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={trend ? '#10b981' : '#ef4444'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((data[data.length - 1].value - min) / range) * (height - 4) - 2}
        r="2"
        fill={trend ? '#10b981' : '#ef4444'}
      />
    </svg>
  )
}

export function MentionsKpiBar({
  totalMentions,
  actionableMentions,
  nonActionableMentions,
  brandPosts,
  brandReplies,
  sparklineData = [],
  activeFilter = 'all',
  onFilterChange,
}: MentionsKpiBarProps) {
  const brandActivity = brandPosts + brandReplies

  // Generate sample sparkline data if not provided
  const defaultSparkline: SparklineData[] = sparklineData.length > 0 ? sparklineData : [
    { value: 120, label: 'Mon' },
    { value: 145, label: 'Tue' },
    { value: 132, label: 'Wed' },
    { value: 178, label: 'Thu' },
    { value: 156, label: 'Fri' },
    { value: 189, label: 'Sat' },
    { value: totalMentions > 0 ? Math.floor(totalMentions / 7) : 165, label: 'Today' },
  ]

  const getTrend = () => {
    if (defaultSparkline.length < 2) return { icon: Minus, color: 'text-slate-500' }
    const last = defaultSparkline[defaultSparkline.length - 1].value
    const prev = defaultSparkline[defaultSparkline.length - 2].value
    if (last > prev) return { icon: TrendingUp, color: 'text-emerald-500' }
    if (last < prev) return { icon: TrendingDown, color: 'text-red-500' }
    return { icon: Minus, color: 'text-slate-500' }
  }

  const { icon: TrendIcon, color: trendColor } = getTrend()

  return (
    <div className="flex items-center gap-6 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      {/* Total Mentions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Mentions</span>
        </div>
        <span className="text-xl font-bold text-slate-900 dark:text-white">
          {totalMentions.toLocaleString()}
        </span>
        <div className="flex items-center gap-1">
          <Sparkline data={defaultSparkline} width={60} height={20} />
          <TrendIcon className={`h-3.5 w-3.5 ${trendColor}`} />
        </div>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

      {/* Actionable / Non-actionable Filter Chips */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onFilterChange?.('actionable')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === 'actionable'
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Actionable
          <span className="ml-1 text-xs opacity-75">{actionableMentions.toLocaleString()}</span>
        </button>

        <button
          onClick={() => onFilterChange?.('non-actionable')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === 'non-actionable'
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
        >
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          Non-actionable
          <span className="ml-1 text-xs opacity-75">{nonActionableMentions.toLocaleString()}</span>
        </button>

        {activeFilter !== 'all' && (
          <button
            onClick={() => onFilterChange?.('all')}
            className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

      {/* Brand Activity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Brand Activity</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {brandActivity.toLocaleString()}
          </span>
        </div>

        {/* Distribution */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950">
            <Send className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span className="text-xs font-medium text-sky-700 dark:text-sky-300">Posts</span>
            <span className="text-sm font-bold text-sky-800 dark:text-sky-200">{brandPosts}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950">
            <Reply className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
            <span className="text-xs font-medium text-violet-700 dark:text-violet-300">Replies</span>
            <span className="text-sm font-bold text-violet-800 dark:text-violet-200">{brandReplies}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
