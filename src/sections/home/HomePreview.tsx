import data from '@/../product/sections/home/data.json'
import { Home } from './components/Home'
import type { HomeData } from '@/../product/sections/home/types'

export default function HomePreview() {
  // Cast the JSON data to our typed interface
  const homeData = data as unknown as HomeData

  return (
    <Home
      data={homeData}
      onViewTicket={(id) => console.log('View ticket:', id)}
      onViewTask={(id) => console.log('View task:', id)}
      onCompleteTask={(id) => console.log('Complete task:', id)}
      onAlertAction={(id) => console.log('Alert action:', id)}
      onDismissAlert={(id) => console.log('Dismiss alert:', id)}
      onViewArticle={(id) => console.log('View article:', id)}
      onQuickAction={(id) => console.log('Quick action:', id)}
      onViewPost={(id) => console.log('View post:', id)}
      onResizeBlock={(id, pos) => console.log('Resize block:', id, pos)}
      onReorderBlocks={(ids) => console.log('Reorder blocks:', ids)}
      onAddBlock={(type) => console.log('Add block:', type)}
      onRemoveBlock={(id) => console.log('Remove block:', id)}
      onCustomizeBlock={(id) => console.log('Customize block:', id)}
      onUpdateBlockConfig={(id, config) => console.log('Update block config:', id, config)}
      onNextBestAction={(id) => console.log('Next best action:', id)}
      onNavigate={(section) => console.log('Navigate to:', section)}
    />
  )
}
