import { MessageSquare, FileText, BarChart3, Inbox } from 'lucide-react'
import type { CategorySelectionProps, DataCategoryIcon } from '@/../product/sections/chat-with-data/types'

const iconMap: Record<DataCategoryIcon, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  FileText,
  BarChart3,
  Inbox,
}

export function CategorySelection({ categories, onSelectCategory }: CategorySelectionProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="max-w-4xl text-center">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
          What would you like to explore?
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Choose a data category to get started with AI-powered insights
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {categories.map((category) => {
            const Icon = iconMap[category.icon]
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory?.(category.id)}
                className="group flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-6 text-left transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-600"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950 dark:text-indigo-400 dark:group-hover:bg-indigo-600 dark:group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {category.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
