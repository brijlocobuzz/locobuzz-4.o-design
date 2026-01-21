import { Sparkles } from 'lucide-react'
import type { StarterQuestionsProps } from '@/../product/sections/chat-with-data/types'

export function StarterQuestions({ questions, onSelectQuestion }: StarterQuestionsProps) {
  return (
    <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <Sparkles className="h-4 w-4" />
        <span className="font-medium">Starter questions:</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelectQuestion?.(question)}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )
}
