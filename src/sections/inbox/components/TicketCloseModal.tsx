import { useState } from 'react'
import {
  X,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  ClipboardList,
  Send,
} from 'lucide-react'

interface TicketCloseModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (disposition: string, sendFeedbackForm: boolean, notes?: string) => void
  ticketId: string
  customerName?: string
}

type DispositionOption = {
  id: string
  label: string
  description: string
  icon: typeof CheckCircle2
  color: string
}

const dispositionOptions: DispositionOption[] = [
  {
    id: 'resolved',
    label: 'Resolved',
    description: 'Issue has been successfully resolved',
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'no-action-needed',
    label: 'No Action Needed',
    description: 'Issue did not require any action',
    icon: AlertCircle,
    color: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    description: 'This is a duplicate of another ticket',
    icon: Clock,
    color: 'text-slate-600 dark:text-slate-400',
  },
  {
    id: 'spam',
    label: 'Spam / Not Relevant',
    description: 'Message is spam or not relevant',
    icon: XCircle,
    color: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'customer-unresponsive',
    label: 'Customer Unresponsive',
    description: 'Customer did not respond after multiple attempts',
    icon: Clock,
    color: 'text-slate-600 dark:text-slate-400',
  },
  {
    id: 'referred-externally',
    label: 'Referred Externally',
    description: 'Issue referred to another team or third party',
    icon: Send,
    color: 'text-indigo-600 dark:text-indigo-400',
  },
]

export function TicketCloseModal({
  isOpen,
  onClose,
  onConfirm,
  ticketId,
  customerName = 'Customer',
}: TicketCloseModalProps) {
  const [selectedDisposition, setSelectedDisposition] = useState<string | null>(null)
  const [sendFeedbackForm, setSendFeedbackForm] = useState(false)
  const [closingNotes, setClosingNotes] = useState('')

  if (!isOpen) return null

  const handleConfirm = () => {
    if (!selectedDisposition) return
    onConfirm(selectedDisposition, sendFeedbackForm, closingNotes || undefined)
    // Reset state
    setSelectedDisposition(null)
    setSendFeedbackForm(false)
    setClosingNotes('')
  }

  const handleClose = () => {
    setSelectedDisposition(null)
    setSendFeedbackForm(false)
    setClosingNotes('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Close Ticket
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Select a disposition for ticket #{ticketId}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {/* Disposition Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Disposition <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {dispositionOptions.map((option) => {
                const Icon = option.icon
                const isSelected = selectedDisposition === option.id
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedDisposition(option.id)}
                    className={`flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${option.color}`} />
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-medium ${
                          isSelected
                            ? 'text-indigo-700 dark:text-indigo-300'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {option.label}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {option.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Closing Notes */}
          <div className="mt-5">
            <label
              htmlFor="closing-notes"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Closing Notes (Optional)
            </label>
            <textarea
              id="closing-notes"
              value={closingNotes}
              onChange={(e) => setClosingNotes(e.target.value)}
              rows={2}
              placeholder="Add any additional notes about this ticket closure..."
              className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:placeholder-slate-500"
            />
          </div>

          {/* Feedback Form Checkbox */}
          <div className="mt-5 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/30">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={sendFeedbackForm}
                onChange={(e) => setSendFeedbackForm(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500 dark:border-purple-700 dark:bg-slate-800"
              />
              <div>
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Send Feedback Form
                  </span>
                </div>
                <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                  Send a satisfaction survey to {customerName} after closing this ticket
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
          <button
            onClick={handleClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedDisposition}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <CheckCircle2 className="h-4 w-4" />
            Close Ticket
          </button>
        </div>
      </div>
    </div>
  )
}
