import { useEffect, useState } from 'react'
import { Palette } from 'lucide-react'

type Theme = 'stone' | 'grayscale'

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get theme from localStorage or default to 'stone'
    const saved = localStorage.getItem('color-theme') as Theme
    return saved || 'stone'
  })

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
    // Save to localStorage
    localStorage.setItem('color-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(current => current === 'stone' ? 'grayscale' : 'stone')
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        title={`Current theme: ${theme === 'stone' ? 'Warm Stone' : 'Pure Grayscale'}`}
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">
          {theme === 'stone' ? 'Warm Stone' : 'Pure Grayscale'}
        </span>
      </button>
    </div>
  )
}

// Alternative dropdown version
export function ThemeSwitcherDropdown() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('color-theme') as Theme
    return saved || 'stone'
  })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('color-theme', theme)
  }, [theme])

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">
          {theme === 'stone' ? 'Warm Stone' : 'Pure Grayscale'}
        </span>
        <svg
          className="h-4 w-4 transition-transform"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-border bg-popover shadow-lg">
            <div className="p-2">
              <button
                onClick={() => handleThemeChange('stone')}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  theme === 'stone'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded border border-border bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900">
                  <span className="text-xs">🪨</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">Warm Stone</div>
                  <div className="text-xs opacity-70">Editorial warmth</div>
                </div>
                {theme === 'stone' && (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>

              <button
                onClick={() => handleThemeChange('grayscale')}
                className={`mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  theme === 'grayscale'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded border border-border bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900">
                  <span className="text-xs">⬜</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">Pure Grayscale</div>
                  <div className="text-xs opacity-70">Minimal & clean</div>
                </div>
                {theme === 'grayscale' && (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
