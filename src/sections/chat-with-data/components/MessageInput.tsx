import { Send } from 'lucide-react'
import { useState } from 'react'
import type { MessageInputProps } from '@/../product/sections/chat-with-data/types'

export function MessageInput({ isProcessing, onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isProcessing) {
      onSendMessage?.(message)
      setMessage('')
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            placeholder="Ask a question about your data..."
            disabled={isProcessing}
            rows={1}
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || isProcessing}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}
