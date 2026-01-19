import type { Ticket } from '@/../product/sections/inbox/types'
import { DataGrid, type ColumnDef } from '@/components/DataGrid'

interface TicketTableProps {
  tickets: Ticket[]
  selectedIds?: string[]
  onTicketClick?: (ticketId: string) => void
  onSelectionChange?: (ticketId: string, selected: boolean) => void
}

export function TicketTable({
  tickets,
  selectedIds = [],
  onTicketClick,
  onSelectionChange,
}: TicketTableProps) {
  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      instagram: '📷',
      facebook: '👥',
      x: '🐦',
      linkedin: '💼',
      google: '⭐',
      youtube: '▶️',
      whatsapp: '💬',
      'google-reviews': '⭐',
    }
    return icons[platform] || '💬'
  }

  const formatSlaTime = (ticket: Ticket) => {
    const { status, remainingMinutes, breachedBy } = ticket.sla.firstResponse
    if (status === 'breached' && breachedBy) {
      return `Breached ${breachedBy}m ago`
    }
    if (remainingMinutes) {
      return `${remainingMinutes}m`
    }
    return 'On time'
  }

  const getSlaColor = (status: string) => {
    switch (status) {
      case 'breached':
        return 'text-red-600 dark:text-red-400'
      case 'due-soon':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'within-sla':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-slate-600 dark:text-slate-400'
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
      case 'Negative':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
      case 'Neutral':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  const getEmotionColor = (cluster: string) => {
    switch (cluster) {
      case 'Negative':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
      case 'Positive':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  // Define columns with all features
  const columns: ColumnDef<Ticket>[] = [
    {
      id: 'author',
      header: 'Author',
      accessor: 'author',
      width: 200,
      minWidth: 150,
      frozen: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <img src={value.avatarUrl} alt={value.name} className="h-8 w-8 rounded-full" />
          <div>
            <div className="flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-slate-100">
              {row.replyStatus === 'not-replied' && (
                <span className="h-2 w-2 rounded-full bg-red-500" />
              )}
              {value.name}
              {value.isVerified && (
                <svg className="h-3 w-3 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">@{value.username}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'channel',
      header: 'Channel',
      accessor: (row) => row.channel.platform,
      width: 140,
      frozen: true,
      render: (value, row) => (
        <div className="flex items-center gap-1 text-sm text-slate-700 dark:text-slate-300">
          <span>{getPlatformIcon(value)}</span>
          <span>{row.interactionTypeLabel}</span>
        </div>
      ),
    },
    {
      id: 'message',
      header: 'Message',
      accessor: 'messageSnippet',
      width: 400,
      minWidth: 250,
      flex: 1,
      render: (value) => (
        <div className="line-clamp-2 text-sm text-slate-900 dark:text-slate-100">{value}</div>
      ),
    },
    {
      id: 'entityType',
      header: 'Entity Type',
      accessor: (row) => row.classification?.entityType,
      width: 120,
      hidden: true,
      render: (value) =>
        value ? (
          <span className="inline-flex rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {value}
          </span>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
        ),
    },
    {
      id: 'sentiment',
      header: 'Sentiment',
      accessor: (row) => row.classification?.sentiment,
      width: 100,
      hidden: true,
      render: (value) =>
        value ? (
          <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${getSentimentColor(value)}`}>
            {value}
          </span>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
        ),
    },
    {
      id: 'intent',
      header: 'Intent',
      accessor: (row) => row.classification?.intent,
      width: 120,
      hidden: true,
      render: (value) =>
        value ? (
          <span className="inline-flex rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {value}
          </span>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
        ),
    },
    {
      id: 'emotion',
      header: 'Emotion',
      accessor: (row) => row.classification?.emotion,
      width: 130,
      hidden: true,
      render: (value, row) =>
        value && row.classification?.emotionCluster ? (
          <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${getEmotionColor(row.classification.emotionCluster)}`}>
            {value}
          </span>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
        ),
    },
    {
      id: 'upperCategories',
      header: 'Upper Categories',
      accessor: (row) => row.classification?.upperCategories,
      width: 200,
      hidden: true,
      render: (value) => {
        if (!value || value.length === 0) {
          return <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 2).map((category: string, idx: number) => (
              <span
                key={idx}
                className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {category}
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
      id: 'categorizations',
      header: 'Categorizations',
      accessor: (row) => row.classification?.categorizations,
      width: 220,
      hidden: true,
      render: (value) => {
        if (!value || value.length === 0) {
          return <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
        }
        const firstCat = value[0]
        const parts = [firstCat.category, firstCat.subcategory, firstCat.subSubcategory].filter(Boolean)
        return (
          <div className="flex items-center gap-1">
            <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${getSentimentColor(firstCat.sentiment)}`}>
              {parts.join(' → ')}
            </span>
            {value.length > 1 && (
              <span className="px-1 py-0.5 text-xs text-slate-500 dark:text-slate-400">
                +{value.length - 1}
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: 'aspectGroups',
      header: 'Aspect Groups',
      accessor: (row) => row.classification?.aspectGroups,
      width: 200,
      hidden: true,
      render: (value) => {
        if (!value || value.length === 0) {
          return <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 2).map((group: any, idx: number) => (
              <span
                key={idx}
                className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                title={group.aspects?.join(', ')}
              >
                {group.name}
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
      id: 'ungroupedAspects',
      header: 'Other Aspects',
      accessor: (row) => row.classification?.ungroupedAspects,
      width: 180,
      hidden: true,
      render: (value) => {
        if (!value || value.length === 0) {
          return <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 3).map((aspect: string, idx: number) => (
              <span
                key={idx}
                className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-300"
              >
                {aspect}
              </span>
            ))}
            {value.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400">
                +{value.length - 3}
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: 'tags',
      header: 'Tags',
      accessor: 'tags',
      width: 200,
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
      id: 'priority',
      header: 'Priority',
      accessor: 'priority',
      width: 100,
      hidden: true,
      render: (value) => (
        <span
          className={`inline-flex rounded px-2 py-1 text-xs font-medium uppercase ${
            value === 'high'
              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
              : value === 'medium'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      id: 'sla',
      header: 'SLA',
      accessor: (row) => row.sla.firstResponse.status,
      width: 130,
      render: (value, row) => (
        <div className={`text-sm font-medium ${getSlaColor(value)}`}>{formatSlaTime(row)}</div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      width: 100,
      hidden: true,
      render: (value) => (
        <span className="inline-flex rounded bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {value}
        </span>
      ),
    },
    {
      id: 'assignedTo',
      header: 'Assigned To',
      accessor: 'assignedTo',
      width: 180,
      hidden: true,
      render: (value) =>
        value ? (
          <div className="flex items-center gap-2">
            <img src={value.avatarUrl} alt={value.name} className="h-6 w-6 rounded-full" />
            <span className="text-sm text-slate-700 dark:text-slate-300">{value.name}</span>
          </div>
        ) : (
          <span className="text-sm text-slate-400 dark:text-slate-500">Unassigned</span>
        ),
    },
  ]

  return (
    <DataGrid
      data={tickets}
      columns={columns}
      rowKey="id"
      selectedIds={selectedIds}
      onRowClick={(row) => onTicketClick?.(row.id)}
      onSelectionChange={onSelectionChange}
      frozenColumnCount={2}
    />
  )
}
