import { useState } from 'react'
import { TopBar } from './TopBar'
import { MainNav } from './MainNav'
import { SecondaryNav } from './SecondaryNav'

export interface Brand {
  id: string
  name: string
  logoUrl?: string
}

export interface NavigationItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  isActive?: boolean
  hasSecondaryNav?: boolean
}

export interface SecondaryNavSection {
  title?: string
  items: Array<{
    id: string
    label: string
    count?: number
    isActive?: boolean
  }>
}

export interface User {
  name: string
  email?: string
  avatarUrl?: string
  role?: string
}

export interface AppShellProps {
  children: React.ReactNode
  brands: Brand[]
  currentBrand?: Brand
  navigationItems: NavigationItem[]
  secondaryNavSections?: SecondaryNavSection[]
  user: User
  onBrandChange?: (brand: Brand) => void
  onNavigate?: (href: string) => void
  onSecondaryNavSelect?: (itemId: string) => void
  onCommandBarOpen?: () => void
  onFilterOpen?: () => void
  onLogout?: () => void
}

export function AppShell({
  children,
  brands,
  currentBrand,
  navigationItems,
  secondaryNavSections,
  user,
  onBrandChange,
  onNavigate,
  onSecondaryNavSelect,
  onCommandBarOpen,
  onFilterOpen,
  onLogout,
}: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const activeNavItem = navigationItems.find((item) => item.isActive)
  const showSecondaryNav = activeNavItem?.hasSecondaryNav && secondaryNavSections && secondaryNavSections.length > 0

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {/* Top Bar */}
      <TopBar
        brands={brands}
        currentBrand={currentBrand}
        user={user}
        onBrandChange={onBrandChange}
        onCommandBarOpen={onCommandBarOpen}
        onFilterOpen={onFilterOpen}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Primary Sidebar */}
        <MainNav
          items={navigationItems}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onNavigate={onNavigate}
        />

        {/* Secondary Sidebar */}
        {showSecondaryNav && (
          <SecondaryNav
            sections={secondaryNavSections}
            onSelect={onSecondaryNavSelect}
          />
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-white dark:bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  )
}
