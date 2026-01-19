import { useState } from 'react'
import {
  Home,
  MessageSquare,
  Inbox,
  FileText,
  Bell,
  Zap,
  Lightbulb,
  BarChart3,
  Bot,
  Settings,
} from 'lucide-react'
import { AppShell } from './components/AppShell'
import type { Brand, NavigationItem, SecondaryNavSection } from './components/AppShell'
import { useFilter } from '@/components/UnifiedFilter/FilterContext'

// Sample data
const sampleBrands: Brand[] = [
  { id: '1', name: 'Acme Corporation' },
  { id: '2', name: 'TechStart Inc' },
  { id: '3', name: 'Global Brands Co' },
]

const sampleUser = {
  name: 'Alex Morgan',
  email: 'alex.morgan@acme.com',
  role: 'Customer Care Agent',
}

// Navigation items with icons
const createNavItems = (activeId: string): NavigationItem[] => [
  {
    id: 'home',
    label: 'Home',
    icon: <Home className="h-5 w-5" />,
    href: '/home',
    isActive: activeId === 'home',
  },
  {
    id: 'mentions',
    label: 'Mentions',
    icon: <MessageSquare className="h-5 w-5" />,
    href: '/mentions',
    isActive: activeId === 'mentions',
  },
  {
    id: 'inbox',
    label: 'Inbox',
    icon: <Inbox className="h-5 w-5" />,
    href: '/inbox',
    isActive: activeId === 'inbox',
    hasSecondaryNav: true,
  },
  {
    id: 'brand-posts',
    label: 'Brand Posts',
    icon: <FileText className="h-5 w-5" />,
    href: '/brand-posts',
    isActive: activeId === 'brand-posts',
    hasSecondaryNav: true,
  },
  {
    id: 'alerts',
    label: 'Alerts',
    icon: <Bell className="h-5 w-5" />,
    href: '/alerts',
    isActive: activeId === 'alerts',
  },
  {
    id: 'workflows',
    label: 'Workflows',
    icon: <Zap className="h-5 w-5" />,
    href: '/workflows',
    isActive: activeId === 'workflows',
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: <Lightbulb className="h-5 w-5" />,
    href: '/insights',
    isActive: activeId === 'insights',
  },
  {
    id: 'dashboards',
    label: 'Dashboards',
    icon: <BarChart3 className="h-5 w-5" />,
    href: '/dashboards',
    isActive: activeId === 'dashboards',
  },
  {
    id: 'chat-with-data',
    label: 'Chat with Data',
    icon: <Bot className="h-5 w-5" />,
    href: '/chat-with-data',
    isActive: activeId === 'chat-with-data',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    href: '/settings',
    isActive: activeId === 'settings',
  },
]

// Secondary nav configurations
const inboxSecondaryNav: SecondaryNavSection[] = [
  {
    title: 'Filtered Views',
    items: [
      { id: 'new', label: 'New Tickets', count: 12, isActive: true },
      { id: 'open', label: 'Open Tickets', count: 47 },
      { id: 'recently-closed', label: 'Recently Closed', count: 23 },
    ],
  },
  {
    title: 'Assignment',
    items: [
      { id: 'assigned-me', label: 'Assigned to Me', count: 8 },
      { id: 'assigned-team', label: 'Assigned to My Team', count: 31 },
      { id: 'unassigned', label: 'Unassigned', count: 15 },
    ],
  },
  {
    title: 'Custom Queues',
    items: [
      { id: 'queue-vip', label: 'VIP Customers', count: 3 },
      { id: 'queue-escalated', label: 'Escalated', count: 5 },
      { id: 'queue-billing', label: 'Billing Issues', count: 9 },
    ],
  },
]

const brandPostsSecondaryNav: SecondaryNavSection[] = [
  {
    title: 'Channels',
    items: [
      { id: 'all', label: 'All Channels', isActive: true },
      { id: 'facebook', label: 'Facebook', count: 24 },
      { id: 'instagram', label: 'Instagram', count: 18 },
      { id: 'twitter', label: 'Twitter / X', count: 31 },
      { id: 'linkedin', label: 'LinkedIn', count: 12 },
      { id: 'google', label: 'Google Business', count: 8 },
    ],
  },
]

export default function ShellPreview() {
  const [currentBrand, setCurrentBrand] = useState(sampleBrands[0])
  const [activeNavId, setActiveNavId] = useState('inbox')
  const { openCommandPalette, openPanel } = useFilter()

  const navigationItems = createNavItems(activeNavId)

  // Get secondary nav based on active section
  const getSecondaryNav = () => {
    switch (activeNavId) {
      case 'inbox':
        return inboxSecondaryNav
      case 'brand-posts':
        return brandPostsSecondaryNav
      default:
        return undefined
    }
  }

  // Keyboard shortcut for command bar removed - now handled by UnifiedFilter context

  return (
    <>
      <AppShell
        brands={sampleBrands}
        currentBrand={currentBrand}
        navigationItems={navigationItems}
        secondaryNavSections={getSecondaryNav()}
        user={sampleUser}
        onBrandChange={setCurrentBrand}
        onNavigate={(href) => {
          const navItem = navigationItems.find((item) => item.href === href)
          if (navItem) setActiveNavId(navItem.id)
        }}
        onSecondaryNavSelect={(itemId) => console.log('Secondary nav selected:', itemId)}
        onCommandBarOpen={openCommandPalette}
        onFilterOpen={openPanel}
        onLogout={() => console.log('Logout clicked')}
      >
        {/* Sample Content Area */}
        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {navigationItems.find((item) => item.id === activeNavId)?.label || 'Content'}
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Section content will render here based on the active navigation item.
            </p>
          </div>

          {/* Placeholder content */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="mb-3 h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-700" />
                  <div className="h-3 w-4/5 rounded bg-slate-100 dark:bg-slate-700" />
                  <div className="h-3 w-3/5 rounded bg-slate-100 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>

      {/* Original Command Bar retained for fallback if needed, but triggers replaced */}
    </>
  )
}
