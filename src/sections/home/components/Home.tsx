import type { HomeProps } from '@/../product/sections/home/types'
import { TopStripAgent } from './TopStripAgent'
import { KpiCardRow } from './KpiCardRow'
import { MyQueue } from './MyQueue'
import { TaskList } from './TaskList'
import { AlertFeed } from './AlertFeed'
import { QuickActions } from './QuickActions'
import { KnowledgeArticles } from './KnowledgeArticles'

export function Home({
  data,
  onViewTicket,
  onViewTask,
  onCompleteTask,
  onAlertAction,
  onDismissAlert,
  onViewArticle,
  onQuickAction,
  onCustomizeBlock,
  onNextBestAction,
}: HomeProps) {
  const {
    currentUser,
    topStripAgent,
    tickets,
    tasks,
    alerts,
    kpis,
    knowledgeArticles,
    quickActions,
    blocks,
  } = data

  // Filter data based on block configurations
  const getBlockKpis = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId)
    if (!block?.config.kpiIds) return kpis.slice(0, 4)
    return kpis.filter((k) => block.config.kpiIds?.includes(k.id))
  }

  const getFilteredTickets = () => {
    // In a real app, this would apply the block's filter config
    return tickets.filter(
      (t) =>
        t.assignedTo === currentUser.id &&
        ['open', 'awaiting-response'].includes(t.status)
    )
  }

  const getFilteredTasks = () => {
    return tasks.filter(
      (t) =>
        t.assignedTo === currentUser.id &&
        ['pending', 'in-progress'].includes(t.status)
    )
  }

  const getFilteredAlerts = () => {
    return alerts.filter((a) =>
      ['critical', 'high', 'warning'].includes(a.severity)
    )
  }

  const getFilteredQuickActions = () => {
    const block = blocks.find((b) => b.type === 'quick-actions')
    if (!block?.config.actionIds) return quickActions.slice(0, 4)
    return quickActions.filter((a) => block.config.actionIds?.includes(a.id))
  }

  const getFilteredArticles = () => {
    return knowledgeArticles.filter((a) => a.isNew || a.isFeatured).slice(0, 4)
  }

  // Find block configurations
  const kpiBlock = blocks.find((b) => b.type === 'kpi-card-row')
  const queueBlock = blocks.find((b) => b.type === 'object-list')
  const tasksBlock = blocks.find((b) => b.type === 'tasks')
  const alertsBlock = blocks.find((b) => b.type === 'alert-feed')
  const actionsBlock = blocks.find((b) => b.type === 'quick-actions')
  const articlesBlock = blocks.find((b) => b.type === 'knowledge-articles')

  return (
    <div className="min-h-full bg-slate-50 p-6 dark:bg-slate-950">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Welcome back, {currentUser.name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Here's what needs your attention today
        </p>
      </div>

      {/* Top Strip - Always Visible Summary */}
      {currentUser.role === 'agent' && (
        <TopStripAgent
          data={topStripAgent}
          onWorkTodayClick={(filter) => console.log('Work today filter:', filter)}
          onSlaRiskClick={() => console.log('SLA Risk clicked')}
          onNextBestActionClick={onNextBestAction}
        />
      )}

      {/* Block Grid */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {/* Row 1: KPI Cards - Full Width */}
        <div className="col-span-3">
          <KpiCardRow
            title={kpiBlock?.title || 'My Performance'}
            kpis={getBlockKpis(kpiBlock?.id || '')}
            isLocked={kpiBlock?.isLocked}
            onCustomize={() => onCustomizeBlock?.(kpiBlock?.id || '')}
          />
        </div>

        {/* Row 2: My Queue (2 cols) + Tasks (1 col) */}
        <div className="col-span-2 row-span-2">
          <MyQueue
            title={queueBlock?.title || 'My Queue'}
            tickets={getFilteredTickets()}
            isLocked={queueBlock?.isLocked}
            onViewTicket={onViewTicket}
            onCustomize={() => onCustomizeBlock?.(queueBlock?.id || '')}
          />
        </div>

        <div className="row-span-2">
          <TaskList
            title={tasksBlock?.title || 'My Tasks'}
            tasks={getFilteredTasks()}
            isLocked={tasksBlock?.isLocked}
            onViewTask={onViewTask}
            onCompleteTask={onCompleteTask}
            onCustomize={() => onCustomizeBlock?.(tasksBlock?.id || '')}
          />
        </div>

        {/* Row 3: Alerts + Quick Actions + Knowledge */}
        <div className="row-span-2">
          <AlertFeed
            title={alertsBlock?.title || 'Alerts'}
            alerts={getFilteredAlerts()}
            isLocked={alertsBlock?.isLocked}
            onAlertAction={onAlertAction}
            onDismiss={onDismissAlert}
            onCustomize={() => onCustomizeBlock?.(alertsBlock?.id || '')}
          />
        </div>

        <div>
          <QuickActions
            title={actionsBlock?.title || 'Quick Actions'}
            actions={getFilteredQuickActions()}
            isLocked={actionsBlock?.isLocked}
            onAction={onQuickAction}
            onCustomize={() => onCustomizeBlock?.(actionsBlock?.id || '')}
          />
        </div>

        <div className="row-span-2">
          <KnowledgeArticles
            title={articlesBlock?.title || 'Knowledge Base'}
            articles={getFilteredArticles()}
            isLocked={articlesBlock?.isLocked}
            onViewArticle={onViewArticle}
            onCustomize={() => onCustomizeBlock?.(articlesBlock?.id || '')}
          />
        </div>
      </div>
    </div>
  )
}
