import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export interface Channel {
  id: string
  name: string
  icon: string
  color: string
}

export interface ChannelFilterProps {
  channels: Channel[]
  selectedChannels: string[]
  onChange: (selectedChannels: string[]) => void
}

const defaultChannels: Channel[] = [
  { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  { id: 'facebook', name: 'Facebook', icon: '👥', color: 'bg-blue-600' },
  { id: 'x', name: 'X (Twitter)', icon: '🐦', color: 'bg-slate-900 dark:bg-slate-200' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', color: 'bg-red-600' },
  { id: 'google', name: 'Google Reviews', icon: '⭐', color: 'bg-blue-500' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'bg-green-600' },
  { id: 'reddit', name: 'Reddit', icon: '🔴', color: 'bg-orange-600' },
  { id: 'trustpilot', name: 'Trustpilot', icon: '⭐', color: 'bg-emerald-600' },
  { id: 'web', name: 'Web', icon: '🌐', color: 'bg-slate-600' },
  { id: 'email', name: 'Email', icon: '📧', color: 'bg-purple-600' },
  { id: 'sms', name: 'SMS', icon: '📱', color: 'bg-teal-600' }
]

export function ChannelFilter({
  channels = defaultChannels,
  selectedChannels,
  onChange
}: ChannelFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const toggleChannel = (channelId: string) => {
    if (selectedChannels.includes(channelId)) {
      onChange(selectedChannels.filter(id => id !== channelId))
    } else {
      onChange([...selectedChannels, channelId])
    }
  }

  const selectAll = () => {
    onChange(channels.map(c => c.id))
  }

  const clearAll = () => {
    onChange([])
  }

  const getButtonLabel = () => {
    if (selectedChannels.length === 0) {
      return 'All Channels'
    }
    if (selectedChannels.length === channels.length) {
      return 'All Channels'
    }
    if (selectedChannels.length === 1) {
      const channel = channels.find(c => c.id === selectedChannels[0])
      return channel ? channel.name : '1 Channel'
    }
    return `${selectedChannels.length} Channels`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
      >
        <span className="text-slate-700 dark:text-slate-300">
          {getButtonLabel()}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <div className="font-semibold text-slate-900 dark:text-white">
                Filter by Channel
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={selectAll}
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  Select All
                </button>
                <span className="text-slate-400">•</span>
                <button
                  onClick={clearAll}
                  className="text-slate-600 hover:text-slate-700 dark:text-slate-400"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Channel List */}
            <div className="max-h-96 overflow-y-auto p-2">
              {channels.map((channel) => {
                const isSelected = selectedChannels.includes(channel.id)

                return (
                  <button
                    key={channel.id}
                    onClick={() => toggleChannel(channel.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/30'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded ${channel.color} text-white`}>
                      <span className="text-sm">{channel.icon}</span>
                    </div>
                    <span className="flex-1 text-left text-sm text-slate-700 dark:text-slate-300">
                      {channel.name}
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Footer with count */}
            <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-700">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {selectedChannels.length === 0
                  ? 'No channels selected (showing all)'
                  : `${selectedChannels.length} of ${channels.length} selected`}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
