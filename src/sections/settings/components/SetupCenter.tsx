import { useState } from 'react'
import {
  Users,
  Radio,
  Search,
  FolderTree,
  Sparkles,
  Plug,
  BarChart3,
} from 'lucide-react'
import { SetupNav } from './SetupNav'
import { SetupChecklist } from './SetupChecklist'
import { PlaceholderPage } from './PlaceholderPage'
import type { SetupCenterProps } from '@/../product/sections/settings/types'

export function SetupCenter({ data, activePage, onNavigate, onBrandChange }: SetupCenterProps) {
  const [currentPage, setCurrentPage] = useState(activePage)

  const handleNavigate = (pageId: string) => {
    setCurrentPage(pageId)
    onNavigate?.(pageId)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'checklist':
        return (
          <SetupChecklist
            checklist={data.setupChecklist}
            onSelectBrand={onBrandChange}
            onNavigateToSection={(link) => console.log('Navigate to:', link)}
            onExportSummary={() => console.log('Export summary')}
          />
        )
      case 'workspace':
        return (
          <PlaceholderPage
            title="Workspace & Access"
            description="Manage users, roles, teams, calendars, SSO, and audit logs"
            icon={Users}
          />
        )
      case 'brands':
        return (
          <PlaceholderPage
            title="Brands & Channels"
            description="Configure brands, connect channels, manage locations"
            icon={Radio}
          />
        )
      case 'data-scope':
        return (
          <PlaceholderPage
            title="Data Scope"
            description="Set up listening queries, competitor sets, and logical grouping"
            icon={Search}
          />
        )
      case 'taxonomy':
        return (
          <PlaceholderPage
            title="Taxonomy & Data Model"
            description="Configure categories, aspect groups, and custom fields"
            icon={FolderTree}
          />
        )
      case 'ai':
        return (
          <PlaceholderPage
            title="AI Studio"
            description="Configure AI features, knowledge base, and guidelines"
            icon={Sparkles}
          />
        )
      case 'integrations':
        return (
          <PlaceholderPage
            title="Integrations & Email Routing"
            description="Connect external platforms and configure email routing"
            icon={Plug}
          />
        )
      case 'usage':
        return (
          <PlaceholderPage
            title="Usage & Limits"
            description="Monitor consumption, quotas, and request additional resources"
            icon={BarChart3}
          />
        )
      default:
        return (
          <SetupChecklist
            checklist={data.setupChecklist}
            onSelectBrand={onBrandChange}
            onNavigateToSection={(link) => console.log('Navigate to:', link)}
            onExportSummary={() => console.log('Export summary')}
          />
        )
    }
  }

  return (
    <div className="flex h-full">
      <SetupNav
        navigation={data.navigation}
        currentUserRole={data.currentUser.role}
        onNavigate={handleNavigate}
      />
      {renderPage()}
    </div>
  )
}
