import { Layers, ChevronDown } from 'lucide-react'
import type { AspectGroup, Aspect, Sentiment } from '@/../product/sections/inbox/types'

interface AspectGroupPillProps {
  group: AspectGroup
  showIcon?: boolean
}

const sentimentColors: Record<Sentiment, { bg: string; text: string; border: string }> = {
  Positive: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  Neutral: {
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
  },
  Negative: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
  },
  None: {
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
  },
}

function isDetailedAspect(aspect: string | Aspect): aspect is Aspect {
  return typeof aspect === 'object' && 'name' in aspect && 'sentiment' in aspect
}

export function AspectGroupPill({ group, showIcon = true }: AspectGroupPillProps) {
  const aspects = group.aspects || []
  const hasDetailedAspects = aspects.some(isDetailedAspect)

  // Get icon - use custom icon if defined, or fallback to Layers
  const renderIcon = () => {
    if (!showIcon) return null
    if (group.icon) {
      // Check if it's an emoji (simple heuristic: emojis are usually 1-2 chars with high code points)
      if (/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u.test(group.icon)) {
        return <span className="text-xs mr-1">{group.icon}</span>
      }
      // Otherwise it's an icon name - use default
      return <Layers className="w-3 h-3 mr-1" />
    }
    return <Layers className="w-3 h-3 mr-1" />
  }

  return (
    <div className="group relative">
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50 cursor-default">
        {renderIcon()}
        {group.name}
        {aspects.length > 0 && (
          <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200">
            {aspects.length}
          </span>
        )}
        <ChevronDown className="w-3 h-3 ml-0.5 opacity-50" />
      </span>

      {/* Hover Popover */}
      {aspects.length > 0 && (
        <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-72 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
          <div className="rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-700 bg-purple-50 dark:bg-purple-900/20">
              <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-semibold text-purple-900 dark:text-purple-100">
                {group.name}
              </span>
              <span className="ml-auto text-xs text-purple-600 dark:text-purple-400">
                {aspects.length} aspect{aspects.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Aspects List */}
            <div className="max-h-64 overflow-y-auto p-2 space-y-1.5">
              {aspects.map((aspect, idx) => {
                if (isDetailedAspect(aspect)) {
                  // Detailed aspect with sentiment and opinion
                  const colors = sentimentColors[aspect.sentiment] || sentimentColors.Neutral
                  return (
                    <div
                      key={idx}
                      className={`rounded-md border p-2.5 ${colors.bg} ${colors.border}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className={`text-xs font-medium ${colors.text}`}>
                          {aspect.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
                          {aspect.sentiment}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-1.5">
                        <span className="font-medium">{aspect.entityType}:</span> {aspect.entityName}
                      </div>
                      {aspect.opinion && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2">
                          "{aspect.opinion}"
                        </p>
                      )}
                    </div>
                  )
                } else {
                  // Simple string aspect (legacy)
                  return (
                    <div
                      key={idx}
                      className="rounded-md bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300"
                    >
                      {aspect}
                    </div>
                  )
                }
              })}
            </div>

            {/* Arrow */}
            <div className="absolute -top-1.5 left-4 h-3 w-3 rotate-45 border-l border-t border-slate-200 bg-purple-50 dark:border-slate-700 dark:bg-purple-900/20" />
          </div>
        </div>
      )}
    </div>
  )
}

export default AspectGroupPill
