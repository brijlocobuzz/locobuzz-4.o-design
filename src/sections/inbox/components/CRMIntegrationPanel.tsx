import { Link2, CheckCircle2, ExternalLink, RefreshCw, Plus, Clock, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface CRMIntegrationPanelProps {
  ticket: any
  crmConnected?: boolean
  crmName?: string
  onCreateCRMTicket?: (ticketData: any) => void
  onSyncUpdate?: () => void
}

export function CRMIntegrationPanel({
  ticket,
  crmConnected = true,
  crmName = 'Salesforce',
  onCreateCRMTicket,
  onSyncUpdate,
}: CRMIntegrationPanelProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    subject: ticket.messageSnippet || '',
    description: '',
    priority: ticket.priority || 'medium',
    type: 'Customer Issue',
  })

  // Mock CRM sync status
  const crmSyncStatus = {
    lastSync: '2024-12-31T09:30:00Z',
    status: 'synced',
    crmTicketId: 'SF-2024-0123',
    crmTicketUrl: 'https://salesforce.com/tickets/SF-2024-0123',
  }

  const handleCreateTicket = () => {
    onCreateCRMTicket?.(formData)
    setShowCreateForm(false)
  }

  if (!crmConnected) {
    return (
      <div className="flex h-full w-96 flex-col items-center justify-center bg-slate-50 p-6 dark:bg-slate-900/50">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
            <Link2 className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
            CRM Not Connected
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Connect your CRM to sync tickets and customer data
          </p>
          <button className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
            Connect CRM
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-96 flex-col overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">CRM Integration</h3>
          <div className="flex items-center gap-2 rounded-lg bg-green-100 px-2 py-1 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-700 dark:text-green-300">
              {crmName}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        {/* Sync Status */}
        <div className="mb-6">
          <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Sync Status
          </h4>
          {crmSyncStatus.status === 'synced' ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/20">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-900 dark:text-green-100">
                      Synced with {crmName}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
                      <Clock className="h-3 w-3" />
                      Last synced{' '}
                      {new Date(crmSyncStatus.lastSync).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300">
                      Ticket ID: {crmSyncStatus.crmTicketId}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onSyncUpdate}
                  className="rounded-lg p-2 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-950/50"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <a
                href={crmSyncStatus.crmTicketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-2 text-sm text-green-700 hover:text-green-800 dark:text-green-300 dark:hover:text-green-200"
              >
                View in {crmName}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <span className="font-medium text-yellow-900 dark:text-yellow-100">
                  Not synced
                </span>
              </div>
              <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                This ticket hasn't been synced to {crmName} yet
              </p>
            </div>
          )}
        </div>

        {/* Create CRM Ticket */}
        {!showCreateForm && !crmSyncStatus.crmTicketId && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Plus className="h-4 w-4" />
            Create {crmName} Ticket
          </button>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                Create {crmName} Ticket
              </h4>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Detailed description..."
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Customer Issue">Customer Issue</option>
                  <option value="Technical Problem">Technical Problem</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Billing Question">Billing Question</option>
                </select>
              </div>

              <button
                onClick={handleCreateTicket}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                Create Ticket
              </button>
            </div>
          </div>
        )}

        {/* Recent Updates */}
        {crmSyncStatus.crmTicketId && (
          <div className="mt-6">
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Recent Updates
            </h4>
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      Ticket created in {crmName}
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(crmSyncStatus.lastSync).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
