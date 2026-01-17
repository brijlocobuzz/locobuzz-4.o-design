import { useState, useRef, useEffect } from 'react'
import { ChevronDown, LogOut, Settings, User as UserIcon } from 'lucide-react'

export interface User {
  name: string
  email?: string
  avatarUrl?: string
  role?: string
}

interface UserMenuProps {
  user: User
  onLogout?: () => void
  onProfileClick?: () => void
  onPreferencesClick?: () => void
}

export function UserMenu({
  user,
  onLogout,
  onProfileClick,
  onPreferencesClick,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
            {initials}
          </div>
        )}
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {user.name}
          </p>
          {user.role && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user.role}
            </p>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {/* User Info */}
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {user.name}
            </p>
            {user.email && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                onProfileClick?.()
                setIsOpen(false)
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <UserIcon className="h-4 w-4" />
              Profile
            </button>
            <button
              onClick={() => {
                onPreferencesClick?.()
                setIsOpen(false)
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Settings className="h-4 w-4" />
              Preferences
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-200 py-1 dark:border-slate-700">
            <button
              onClick={() => {
                onLogout?.()
                setIsOpen(false)
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export type { UserMenuProps }
