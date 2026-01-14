import { User, Sparkles } from 'lucide-react'
import { MessageComponentRenderer } from './MessageComponentRenderer'
import type { MessageListProps } from '@/../product/sections/chat-with-data/types'

export function MessageList({ messages, onDeepDive }: MessageListProps) {
  return (
    <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
      {messages.map((message) => {
        if (message.type === 'user') {
          return (
            <div key={message.id} className="flex justify-end">
              <div className="flex max-w-2xl items-start gap-3">
                <div className="flex-1 space-y-1">
                  <div className="rounded-lg bg-indigo-600 px-4 py-2.5 text-white dark:bg-indigo-500">
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-right text-xs text-slate-400 dark:text-slate-500">
                    {new Date(message.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
                  <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </div>
          )
        }

        // AI message
        return (
          <div key={message.id} className="flex justify-start">
            <div className="flex max-w-4xl items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950">
                <Sparkles className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="flex-1 space-y-4">
                {message.components.map((component, index) => (
                  <MessageComponentRenderer
                    key={index}
                    component={component}
                    onDeepDive={() => onDeepDive?.(`${message.id}-${index}`)}
                  />
                ))}
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {new Date(message.timestamp).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
