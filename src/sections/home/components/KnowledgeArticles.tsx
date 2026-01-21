import { BookOpen, Clock, Sparkles, ArrowRight } from 'lucide-react'
import type { KnowledgeArticle } from '@/../product/sections/home/types'
import { BlockWrapper } from './BlockWrapper'

interface KnowledgeArticlesProps {
  title: string
  articles: KnowledgeArticle[]
  isLocked?: boolean
  onViewArticle?: (articleId: string) => void
  onCustomize?: () => void
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function KnowledgeArticles({
  title,
  articles,
  isLocked = false,
  onViewArticle,
  onCustomize,
}: KnowledgeArticlesProps) {
  // Separate featured/new articles from others
  const featuredArticles = articles.filter((a) => a.isFeatured || a.isNew)
  const otherArticles = articles.filter((a) => !a.isFeatured && !a.isNew)

  return (
    <BlockWrapper title={title} isLocked={isLocked} onCustomize={onCustomize}>
      <div className="space-y-3">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <BookOpen className="h-6 w-6 text-slate-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              No articles available
            </p>
          </div>
        ) : (
          <>
            {/* Featured/New Articles */}
            {featuredArticles.map((article) => (
              <button
                key={article.id}
                onClick={() => onViewArticle?.(article.id)}
                className="group w-full rounded-lg border border-indigo-100 bg-gradient-to-r from-indigo-50 to-sky-50 p-3 text-left transition-all hover:border-indigo-200 hover:shadow-sm dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-sky-950/30 dark:hover:border-indigo-800"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                    {article.category === 'Product Update' ? (
                      <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {article.isNew && (
                        <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-xs font-medium text-white">
                          New
                        </span>
                      )}
                      <span className="text-xs text-indigo-600 dark:text-indigo-400">
                        {article.category}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                      {article.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                      {article.summary}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </span>
                      <span>{formatDate(article.publishedAt)}</span>
                      <span className="flex items-center gap-1 font-medium text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-indigo-400">
                        Read
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {/* Other Articles */}
            {otherArticles.map((article) => (
              <button
                key={article.id}
                onClick={() => onViewArticle?.(article.id)}
                className="group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  <BookOpen className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-900 dark:text-white">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{article.category}</span>
                    <span>·</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-600" />
              </button>
            ))}
          </>
        )}
      </div>
    </BlockWrapper>
  )
}
