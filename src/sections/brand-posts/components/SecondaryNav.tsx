import type { Page } from '@/../product/sections/brand-posts/types'
import { Calendar, Instagram, Facebook, Twitter, Linkedin, Globe } from 'lucide-react'

interface SecondaryNavProps {
  pages: Page[]
  selectedChannel: string | null
  onSelectChannel: (channelId: string | null) => void
  onOpenCalendar?: () => void
}

const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Instagram: Instagram,
  Facebook: Facebook,
  Twitter: Twitter,
  LinkedIn: Linkedin,
  'Google Business': Globe
}

export function SecondaryNav({
  pages,
  selectedChannel,
  onSelectChannel,
  onOpenCalendar
}: SecondaryNavProps) {
  // Group pages by channel
  const channelGroups = pages.reduce((acc, page) => {
    const channelId = page.channelId
    if (!acc[channelId]) {
      acc[channelId] = {
        channel: page.channel,
        channelId,
        pages: []
      }
    }
    acc[channelId].pages.push(page)
    return acc
  }, {} as Record<string, { channel: string; channelId: string; pages: Page[] }>)

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="font-semibold text-slate-900 dark:text-white">Channels</h2>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-auto p-3">
        {/* All Channels */}
        <button
          onClick={() => onSelectChannel(null)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${
            selectedChannel === null
              ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <span className="text-sm">All Channels</span>
        </button>

        <div className="h-px bg-slate-200 dark:bg-slate-800 my-3" />

        {/* Individual Channels */}
        {Object.values(channelGroups).map(({ channel, channelId }) => {
          const Icon = channelIcons[channel] || Globe
          const isSelected = selectedChannel === channelId

          return (
            <button
              key={channelId}
              onClick={() => onSelectChannel(channelId)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${
                isSelected
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                  isSelected
                    ? 'bg-indigo-100 dark:bg-indigo-900'
                    : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isSelected
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                />
              </div>
              <span className="text-sm">{channel}</span>
            </button>
          )
        })}
      </div>

      {/* Calendar Link */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onOpenCalendar}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">Content Calendar</span>
        </button>
      </div>
    </div>
  )
}
