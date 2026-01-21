import { useState } from 'react'
import type { SearchBarProps } from '@/../product/sections/inbox/types'

export function SearchBar({ savedSearches, onSearch, onSaveSearch, onLoadSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [showSaved, setShowSaved] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(query)
  }

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickets... (e.g., sentiment:negative SLA:<60m priority:high)"
            className="w-full px-4 py-2 pl-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSaved(!showSaved)}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Saved Searches
          </button>

          {showSaved && savedSearches && savedSearches.length > 0 && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg z-10">
              <div className="p-2">
                {savedSearches.map(search => (
                  <button
                    key={search.id}
                    onClick={() => {
                      onLoadSearch?.(search.id)
                      setQuery(search.query)
                      setShowSaved(false)
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="font-medium text-slate-900 dark:text-slate-100 text-sm">{search.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{search.query}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => query && onSaveSearch?.({ name: query.slice(0, 30), query })}
          disabled={!query}
          className="px-4 py-2 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Save
        </button>
      </form>

      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-medium">Quick syntax:</span>
        <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">sentiment:negative</code>
        <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">SLA:&lt;60m</code>
        <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">priority:high</code>
        <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">has:attachment</code>
      </div>
    </div>
  )
}
