import { Sparkles, X, Check, Wand2 } from 'lucide-react'
import { useState, useEffect } from 'react'

interface AISuggestion {
  id: string
  content: string
  tone?: string
  source?: string
  isWithinKB?: boolean
}

interface AISuggestionOverlayProps {
  isOpen: boolean
  isLoading: boolean
  suggestion: AISuggestion | null
  onUse: (content: string) => void
  onDiscard: () => void
}

export function AISuggestionOverlay({
  isOpen,
  isLoading,
  suggestion,
  onUse,
  onDiscard,
}: AISuggestionOverlayProps) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (!isLoading && suggestion) {
      // Delay content appearance for smooth transition
      const timer = setTimeout(() => setShowContent(true), 100)
      return () => clearTimeout(timer)
    } else {
      setShowContent(false)
    }
  }, [isLoading, suggestion])

  if (!isOpen) return null

  // Determine color scheme based on Knowledge Base source
  const isFromKB = suggestion?.isWithinKB ?? false

  // Color classes for KB vs non-KB
  const backdropGradient = isFromKB
    ? 'bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10'
    : 'bg-gradient-to-br from-red-500/10 via-orange-500/10 to-rose-500/10'

  const radialGradients = isFromKB
    ? `radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
       radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)`
    : `radial-gradient(circle at 20% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
       radial-gradient(circle at 80% 80%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)`

  return (
    <div className="absolute inset-0 z-30 overflow-hidden rounded-lg">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 ${backdropGradient} backdrop-blur-sm animate-in fade-in duration-300`}
        style={{
          backgroundImage: radialGradients,
        }}
      />

      {/* Content Container */}
      <div className="relative flex h-full items-center justify-center p-6">
        {isLoading ? (
          /* Loading State with Modern Animation */
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Animated AI Icon */}
            <div className="relative">
              {/* Outer rotating ring */}
              <div className="absolute inset-0 animate-spin-slow">
                <div className="h-20 w-20 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500" />
              </div>
              {/* Middle pulsing ring */}
              <div className="absolute inset-2 animate-pulse">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
              </div>
              {/* Center icon */}
              <div className="relative flex h-20 w-20 items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/50">
                  <Wand2 className="h-6 w-6 text-white animate-pulse" />
                </div>
              </div>
            </div>

            {/* Loading text with shimmer effect */}
            <div className="space-y-2 text-center">
              <div className="relative overflow-hidden">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Crafting AI Response
                </h3>
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Analyzing tone, empathy, and compliance...
              </p>
            </div>

            {/* Animated dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '1s',
                  }}
                />
              ))}
            </div>
          </div>
        ) : suggestion ? (
          /* Suggestion Display with Slide-in Animation */
          <div
            className={`flex w-full max-w-2xl flex-col gap-4 transition-all duration-500 ${
              showContent
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            }`}
          >
            {/* Header with gradient */}
            <div className={`flex items-center justify-between rounded-t-xl border px-4 py-3 ${
              isFromKB
                ? 'border-green-200 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:border-green-900 dark:from-green-950/50 dark:via-emerald-950/50 dark:to-teal-950/50'
                : 'border-red-200 bg-gradient-to-r from-red-50 via-orange-50 to-rose-50 dark:border-red-900 dark:from-red-950/50 dark:via-orange-950/50 dark:to-rose-950/50'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg shadow-lg ${
                  isFromKB
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/30'
                    : 'bg-gradient-to-br from-red-500 to-orange-600 shadow-red-500/30'
                }`}>
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    AI-Optimized Response
                  </h4>
                  {suggestion.tone && (
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {suggestion.tone}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onDiscard}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200/50 hover:text-slate-600 dark:hover:bg-slate-700/50 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Suggestion Content */}
            <div className={`max-h-[300px] overflow-y-auto rounded-lg border p-4 shadow-lg ${
              isFromKB
                ? 'border-green-200 bg-white dark:border-green-900 dark:bg-slate-900'
                : 'border-red-200 bg-white dark:border-red-900 dark:bg-slate-900'
            }`}>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {suggestion.content}
                </p>
              </div>
            </div>

            {/* Source Badge */}
            {suggestion.source && (
              <div className="flex items-center gap-2 px-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Source: {suggestion.source}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 px-4 pb-4">
              <button
                onClick={onDiscard}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:shadow-md dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Discard
              </button>
              <button
                onClick={() => onUse(suggestion.content)}
                className={`group flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${
                  isFromKB
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-green-500/30 hover:shadow-green-500/40'
                    : 'bg-gradient-to-r from-red-600 to-orange-600 shadow-red-500/30 hover:shadow-red-500/40'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4" />
                  Use This Response
                </span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes zoom-in-95 {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-in {
          animation-fill-mode: both;
        }

        .fade-in {
          animation-name: fade-in;
        }

        .zoom-in-95 {
          animation-name: zoom-in-95;
        }

        .duration-300 {
          animation-duration: 300ms;
        }

        .duration-500 {
          animation-duration: 500ms;
        }
      `}</style>
    </div>
  )
}
