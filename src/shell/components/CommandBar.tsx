import { useState, useEffect, useRef } from 'react'
import {
  Search,
  FileText,
  Inbox,
  BarChart3,
  Send,
  Zap,
  Settings,
  Plus,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  category: 'navigation' | 'create' | 'action' | 'ai'
  shortcut?: string
}

interface CommandBarProps {
  isOpen: boolean
  onClose: () => void
  onSelect?: (item: CommandItem) => void
}

const defaultCommands: CommandItem[] = [
  // Navigation
  { id: 'nav-home', label: 'Go to Home', icon: <FileText className="h-4 w-4" />, category: 'navigation' },
  { id: 'nav-mentions', label: 'Go to Mentions', icon: <FileText className="h-4 w-4" />, category: 'navigation' },
  { id: 'nav-inbox', label: 'Go to Inbox', icon: <Inbox className="h-4 w-4" />, category: 'navigation' },
  { id: 'nav-dashboards', label: 'Go to Dashboards', icon: <BarChart3 className="h-4 w-4" />, category: 'navigation' },
  { id: 'nav-workflows', label: 'Go to Workflows', icon: <Zap className="h-4 w-4" />, category: 'navigation' },
  { id: 'nav-settings', label: 'Go to Settings', icon: <Settings className="h-4 w-4" />, category: 'navigation' },
  // Create
  { id: 'create-ticket', label: 'Create Ticket', description: 'Create a new support ticket', icon: <Plus className="h-4 w-4" />, category: 'create' },
  { id: 'create-post', label: 'Create Post', description: 'Draft a new social media post', icon: <Send className="h-4 w-4" />, category: 'create' },
  { id: 'create-workflow', label: 'Create Workflow', description: 'Build a new automation', icon: <Zap className="h-4 w-4" />, category: 'create' },
  // Actions
  { id: 'action-close-ticket', label: 'Close as Resolved', description: 'Close current ticket', icon: <ArrowRight className="h-4 w-4" />, category: 'action' },
  { id: 'action-escalate', label: 'Escalate Ticket', description: 'Escalate to supervisor', icon: <ArrowRight className="h-4 w-4" />, category: 'action' },
  // AI
  { id: 'ai-ask', label: 'Ask AI', description: 'Ask a question about your data', icon: <Sparkles className="h-4 w-4" />, category: 'ai' },
  { id: 'ai-summarize', label: 'Summarize Conversation', description: 'Get AI summary of current thread', icon: <Sparkles className="h-4 w-4" />, category: 'ai' },
]

export function CommandBar({ isOpen, onClose, onSelect }: CommandBarProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredCommands = defaultCommands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(query.toLowerCase())
  )

  // Group by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {} as Record<string, CommandItem[]>)

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    create: 'Create',
    action: 'Actions',
    ai: 'AI',
  }

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = filteredCommands[selectedIndex]
        if (selected) {
          onSelect?.(selected)
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, onClose, onSelect])

  if (!isOpen) return null

  let flatIndex = 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Command Palette */}
      <div className="relative w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-700">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search or jump to..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            className="flex-1 bg-transparent py-4 text-slate-900 placeholder-slate-500 focus:outline-none dark:text-white dark:placeholder-slate-400"
          />
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No results found for "{query}"
            </p>
          ) : (
            Object.entries(groupedCommands).map(([category, commands]) => (
              <div key={category}>
                <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {categoryLabels[category]}
                </p>
                {commands.map((cmd) => {
                  const currentIndex = flatIndex++
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        onSelect?.(cmd)
                        onClose()
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left ${
                        currentIndex === selectedIndex
                          ? 'bg-indigo-50 dark:bg-indigo-950'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span
                        className={`${
                          currentIndex === selectedIndex
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {cmd.icon}
                      </span>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            currentIndex === selectedIndex
                              ? 'text-indigo-900 dark:text-indigo-100'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {cmd.label}
                        </p>
                        {cmd.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {cmd.description}
                          </p>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          <span>
            <kbd className="rounded border border-slate-300 bg-slate-100 px-1 dark:border-slate-600 dark:bg-slate-800">
              ↑↓
            </kbd>{' '}
            to navigate
          </span>
          <span>
            <kbd className="rounded border border-slate-300 bg-slate-100 px-1 dark:border-slate-600 dark:bg-slate-800">
              ↵
            </kbd>{' '}
            to select
          </span>
          <span>
            <kbd className="rounded border border-slate-300 bg-slate-100 px-1 dark:border-slate-600 dark:bg-slate-800">
              esc
            </kbd>{' '}
            to close
          </span>
        </div>
      </div>
    </div>
  )
}

export type { CommandBarProps, CommandItem }
