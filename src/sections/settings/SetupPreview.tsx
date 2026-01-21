import data from '@/../product/sections/settings/data.json'
import { SetupCenter } from './components/SetupCenter'
import type { SetupCenterData } from '@/../product/sections/settings/types'

export default function SetupPreview() {
  const setupData = data as unknown as SetupCenterData

  return (
    <SetupCenter
      data={setupData}
      activePage="checklist"
      onNavigate={(pageId) => console.log('Navigate to page:', pageId)}
      onBrandChange={(brandId) => console.log('Brand changed:', brandId)}
    />
  )
}
