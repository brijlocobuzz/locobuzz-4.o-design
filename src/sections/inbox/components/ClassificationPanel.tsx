import {
  FolderTree,
  Tag,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Brain,
} from 'lucide-react'
import type { Classification, Categorization, AspectGroup } from '@/../product/sections/inbox/types'

interface ClassificationPanelProps {
  classification: Classification | undefined
}

export function ClassificationPanel({ classification }: ClassificationPanelProps) {
  if (!classification) {
    return (
      <div className="flex h-full w-96 flex-col bg-slate-50 dark:bg-slate-900/50">
        <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-semibold text-slate-900 dark:text-white">Classification</h3>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No classification data available
          </p>
        </div>
      </div>
    )
  }

  // Safe access with fallbacks for missing data
  const safeClassification = {
    entityType: classification?.entityType || 'N/A',
    sentiment: classification?.sentiment || 'Neutral',
    intent: classification?.intent || 'N/A',
    emotion: classification?.emotion || 'N/A',
    emotionCluster: classification?.emotionCluster || 'Neutral',
    upperCategories: classification?.upperCategories || [],
    categorizations: classification?.categorizations || [],
    aspectGroups: classification?.aspectGroups || [],
    ungroupedAspects: classification?.ungroupedAspects || [],
  }

  const getEmotionColor = (cluster: string) => {
    switch (cluster) {
      case 'Negative':
        return 'text-rose-600 dark:text-rose-400'
      case 'Positive':
        return 'text-emerald-600 dark:text-emerald-400'
      default:
        return 'text-slate-600 dark:text-slate-400'
    }
  }

  return (
    <div className="flex h-full w-96 flex-col overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-semibold text-slate-900 dark:text-white">Classification</h3>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Fixed AI Classifications */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <Brain className="h-4 w-4" />
            AI Classifications
          </h4>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Entity Type</span>
              <span className="font-medium text-slate-900 dark:text-white">{safeClassification.entityType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Sentiment</span>
              <span className={`font-medium ${
                safeClassification.sentiment === 'Positive'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : safeClassification.sentiment === 'Negative'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-600 dark:text-slate-400'
              }`}>
                {safeClassification.sentiment}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Intent</span>
              <span className="font-medium text-slate-900 dark:text-white">{safeClassification.intent}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Emotion</span>
              <span className={`font-medium ${getEmotionColor(safeClassification.emotionCluster)}`}>
                {safeClassification.emotion}
              </span>
            </div>
          </div>
        </div>

        {/* AI Upper Categories */}
        {safeClassification.upperCategories && safeClassification.upperCategories.length > 0 && (
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Sparkles className="h-4 w-4" />
              Customer's Intent (AI Upper Categories)
            </h4>
            <div className="flex flex-wrap gap-2">
              {safeClassification.upperCategories.map((category: string, idx: number) => (
                <span
                  key={idx}
                  className="rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Categorizations */}
        {safeClassification.categorizations && safeClassification.categorizations.length > 0 && (
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <FolderTree className="h-4 w-4" />
              Category Hierarchy
            </h4>
            <div className="space-y-2">
              {safeClassification.categorizations.map((cat: Categorization, idx: number) => {
                const sentimentBg = cat.sentiment === 'Negative'
                  ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800'
                  : cat.sentiment === 'Positive'
                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800'
                    : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                const sentimentText = cat.sentiment === 'Negative'
                  ? 'text-rose-700 dark:text-rose-300'
                  : cat.sentiment === 'Positive'
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-slate-700 dark:text-slate-300'

                return (
                  <div key={idx} className={`rounded-lg border p-4 ${sentimentBg}`}>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`font-medium ${sentimentText}`}>
                        {cat.category}
                      </span>
                      {cat.subcategory && (
                        <>
                          <ChevronRight className="h-3 w-3 text-slate-400" />
                          <span className={`font-medium ${sentimentText}`}>
                            {cat.subcategory}
                          </span>
                        </>
                      )}
                      {cat.subSubcategory && (
                        <>
                          <ChevronRight className="h-3 w-3 text-slate-400" />
                          <span className={`font-medium ${sentimentText}`}>
                            {cat.subSubcategory}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Aspect Groups */}
        {safeClassification.aspectGroups && safeClassification.aspectGroups.length > 0 && (
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <MessageSquare className="h-4 w-4" />
              Aspect Groups
            </h4>
            <div className="space-y-3">
              {safeClassification.aspectGroups.map((group: AspectGroup, idx: number) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                >
                  <h5 className="mb-3 font-medium text-slate-900 dark:text-white">
                    {group.name}
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {group.aspects.map((aspect: string, aspectIdx: number) => (
                      <span
                        key={aspectIdx}
                        className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      >
                        {aspect}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ungrouped Aspects */}
        {safeClassification.ungroupedAspects && safeClassification.ungroupedAspects.length > 0 && (
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Tag className="h-4 w-4" />
              Other Aspects
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {safeClassification.ungroupedAspects.map((aspect: string, idx: number) => (
                <span
                  key={idx}
                  className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                >
                  {aspect}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
