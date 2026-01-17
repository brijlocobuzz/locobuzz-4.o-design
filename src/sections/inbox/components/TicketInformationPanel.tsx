import { Edit2, X, Check, AlertCircle, ArrowUpCircle, XCircle } from 'lucide-react'
import { useState } from 'react'

interface TicketInformationPanelProps {
  ticket: any
  onSave?: (updates: Record<string, any>) => void
  onEscalate?: () => void
  onClose?: () => void
}

// Define mandatory fields for different actions
const mandatoryFields = {
  escalate: ['escalationReason', 'escalationNotes'],
  close: ['resolutionNotes', 'rootCause', 'dispositionCode'],
}

export function TicketInformationPanel({
  ticket,
  onSave,
  onEscalate,
  onClose: onCloseTicket,
}: TicketInformationPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    category: ticket.category || '',
    subcategory: ticket.subcategory || '',
    productAffected: ticket.productAffected || '',
    issueType: ticket.issueType || '',
    severity: ticket.severity || 'medium',
    resolutionNotes: ticket.resolutionNotes || '',
    rootCause: ticket.rootCause || '',
    dispositionCode: ticket.dispositionCode || '',
    escalationReason: ticket.escalationReason || '',
    escalationNotes: ticket.escalationNotes || '',
    internalReference: ticket.internalReference || '',
  })

  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const handleSave = () => {
    onSave?.(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      category: ticket.category || '',
      subcategory: ticket.subcategory || '',
      productAffected: ticket.productAffected || '',
      issueType: ticket.issueType || '',
      severity: ticket.severity || 'medium',
      resolutionNotes: ticket.resolutionNotes || '',
      rootCause: ticket.rootCause || '',
      dispositionCode: ticket.dispositionCode || '',
      escalationReason: ticket.escalationReason || '',
      escalationNotes: ticket.escalationNotes || '',
      internalReference: ticket.internalReference || '',
    })
    setIsEditing(false)
    setValidationErrors([])
  }

  const validateForAction = (action: 'escalate' | 'close'): boolean => {
    const required = mandatoryFields[action]
    const missing = required.filter((field) => !formData[field as keyof typeof formData])

    if (missing.length > 0) {
      setValidationErrors(missing)
      return false
    }

    setValidationErrors([])
    return true
  }

  const handleEscalate = () => {
    if (validateForAction('escalate')) {
      onEscalate?.()
    }
  }

  const handleCloseTicket = () => {
    if (validateForAction('close')) {
      onCloseTicket?.()
    }
  }

  const isFieldMandatory = (fieldName: string, action: 'escalate' | 'close') => {
    return mandatoryFields[action].includes(fieldName)
  }

  const hasError = (fieldName: string) => validationErrors.includes(fieldName)

  return (
    <div className="flex h-full w-96 flex-col overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">Ticket Information</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                <Check className="h-4 w-4" />
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="border-b border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                Missing Required Fields
              </p>
              <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                Please fill in all mandatory fields before proceeding
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="flex-1 p-6">
        <div className="space-y-4">
          {/* Classification */}
          <div>
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Classification
            </h4>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={!isEditing}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-900 dark:disabled:text-slate-400"
                >
                  <option value="">Select category</option>
                  <option value="product">Product Issue</option>
                  <option value="billing">Billing</option>
                  <option value="technical">Technical Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Subcategory
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  disabled={!isEditing}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-900 dark:disabled:text-slate-400"
                >
                  <option value="">Select subcategory</option>
                  <option value="delivery">Delivery Delay</option>
                  <option value="quality">Quality Issue</option>
                  <option value="missing">Missing Items</option>
                  <option value="damaged">Damaged Product</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Product Affected
                </label>
                <input
                  type="text"
                  value={formData.productAffected}
                  onChange={(e) => setFormData({ ...formData, productAffected: e.target.value })}
                  disabled={!isEditing}
                  placeholder="e.g., Premium Package"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-900 dark:disabled:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Resolution Information (Required for Close) */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Resolution Information
              <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                Required to Close
              </span>
            </h4>
            <div className="space-y-3">
              <div>
                <label
                  className={`mb-1 flex items-center gap-1 text-xs font-medium ${hasError('resolutionNotes')
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-slate-700 dark:text-slate-300'
                    }`}
                >
                  Resolution Notes
                  {isFieldMandatory('resolutionNotes', 'close') && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <textarea
                  value={formData.resolutionNotes}
                  onChange={(e) => setFormData({ ...formData, resolutionNotes: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Describe how the issue was resolved..."
                  className={`w-full resize-none rounded-lg border px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-900 dark:disabled:text-slate-400 ${hasError('resolutionNotes')
                      ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-700 dark:bg-red-950/20 dark:text-red-100'
                      : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    }`}
                />
              </div>

              <div>
                <label
                  className={`mb-1 flex items-center gap-1 text-xs font-medium ${hasError('rootCause')
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-slate-700 dark:text-slate-300'
                    }`}
                >
                  Root Cause
                  {isFieldMandatory('rootCause', 'close') && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <select
                  value={formData.rootCause}
                  onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-900 dark:disabled:text-slate-400 ${hasError('rootCause')
                      ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-700 dark:bg-red-950/20 dark:text-red-100'
                      : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    }`}
                >
                  <option value="">Select root cause</option>
                  <option value="user-error">User Error</option>
                  <option value="product-bug">Product Bug</option>
                  <option value="external-service">External Service Issue</option>
                  <option value="process-failure">Process Failure</option>
                </select>
              </div>

              <div>
                <label
                  className={`mb-1 flex items-center gap-1 text-xs font-medium ${hasError('dispositionCode')
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-slate-700 dark:text-slate-300'
                    }`}
                >
                  Disposition Code
                  {isFieldMandatory('dispositionCode', 'close') && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <select
                  value={formData.dispositionCode}
                  onChange={(e) => setFormData({ ...formData, dispositionCode: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-900 dark:disabled:text-slate-400 ${hasError('dispositionCode')
                      ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-700 dark:bg-red-950/20 dark:text-red-100'
                      : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    }`}
                >
                  <option value="">Select disposition</option>
                  <option value="resolved">Resolved</option>
                  <option value="workaround">Workaround Provided</option>
                  <option value="not-reproducible">Not Reproducible</option>
                  <option value="customer-error">Customer Error</option>
                </select>
              </div>
            </div>
          </div>

          {/* Escalation Information (Required for Escalate) */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Escalation Information
              <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                Required to Escalate
              </span>
            </h4>
            <div className="space-y-3">
              <div>
                <label
                  className={`mb-1 flex items-center gap-1 text-xs font-medium ${hasError('escalationReason')
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-slate-700 dark:text-slate-300'
                    }`}
                >
                  Escalation Reason
                  {isFieldMandatory('escalationReason', 'escalate') && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <select
                  value={formData.escalationReason}
                  onChange={(e) => setFormData({ ...formData, escalationReason: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-900 dark:disabled:text-slate-400 ${hasError('escalationReason')
                      ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-700 dark:bg-red-950/20 dark:text-red-100'
                      : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    }`}
                >
                  <option value="">Select reason</option>
                  <option value="complex">Complex Technical Issue</option>
                  <option value="vip">VIP Customer</option>
                  <option value="sla-breach">SLA Breach Risk</option>
                  <option value="management-request">Management Request</option>
                </select>
              </div>

              <div>
                <label
                  className={`mb-1 flex items-center gap-1 text-xs font-medium ${hasError('escalationNotes')
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-slate-700 dark:text-slate-300'
                    }`}
                >
                  Escalation Notes
                  {isFieldMandatory('escalationNotes', 'escalate') && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <textarea
                  value={formData.escalationNotes}
                  onChange={(e) => setFormData({ ...formData, escalationNotes: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Provide context for escalation..."
                  className={`w-full resize-none rounded-lg border px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-900 dark:disabled:text-slate-400 ${hasError('escalationNotes')
                      ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-700 dark:bg-red-950/20 dark:text-red-100'
                      : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2">
          <button
            onClick={handleEscalate}
            className="flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-300 dark:hover:bg-orange-950/50"
          >
            <ArrowUpCircle className="h-4 w-4" />
            Escalate Ticket
          </button>
          <button
            onClick={handleCloseTicket}
            className="flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300 dark:hover:bg-green-950/50"
          >
            <XCircle className="h-4 w-4" />
            Close Ticket
          </button>
        </div>
      </div>
    </div>
  )
}
