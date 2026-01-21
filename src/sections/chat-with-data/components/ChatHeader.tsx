import { ChevronDown, Database } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { ChatHeaderProps } from '@/../product/sections/chat-with-data/types'

export function ChatHeader({
  currentBrand,
  availableBrands,
  conversationTitle,
  onBrandChange,
}: ChatHeaderProps) {
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

  return (
    <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        {/* Left: Brand Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            <Database className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span>{currentBrand.name}</span>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              {availableBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => {
                    onBrandChange?.(brand.id)
                    setIsOpen(false)
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${
                    brand.id === currentBrand.id
                      ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-100'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Database className="h-4 w-4 text-slate-400" />
                  {brand.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Conversation Title */}
        {conversationTitle && (
          <h1 className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {conversationTitle}
          </h1>
        )}
      </div>
    </div>
  )
}
