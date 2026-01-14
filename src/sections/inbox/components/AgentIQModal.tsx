import { X, TrendingDown, AlertTriangle, CheckCircle, Shield, AlertCircle, BookOpen } from 'lucide-react'
import { useState } from 'react'

type QualityOutcome = 'approved' | 'warning' | 'blocked'
type ComplianceStatus = 'passed' | 'failed' | 'flagged' | 'verified'

interface CSATImpact {
  current: number
  predicted: number
  delta: number
  trend?: 'improving' | 'stable' | 'declining'
}

interface EmpathyScore {
  score: number // 1-10
  reasons: string[]
}

interface ComplianceCheck {
  name: string
  status: ComplianceStatus
  reason?: string
}

interface QualityIssue {
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  impact?: string
}

interface AISuggestion {
  id: string
  title: string
  content: string
  preview: string
  isWithinKB: boolean
  csatImprovement: number
  tags: string[]
}

interface AgentIQModalProps {
  isOpen: boolean
  onClose: () => void
  outcome: QualityOutcome
  currentResponse: string
  csatImpact?: CSATImpact
  empathyScore?: EmpathyScore
  complianceChecks?: ComplianceCheck[]
  issues?: QualityIssue[]
  suggestions?: AISuggestion[]
  isLoadingSuggestions?: boolean
  canOverride?: boolean
  onEditManually: () => void
  onSendAnyway?: (justification: string) => void
  onApplySuggestion: (suggestionId: string) => void
  onRequestSupervisorOverride?: () => void
}

export function AgentIQModal({
  isOpen,
  onClose,
  outcome,
  currentResponse,
  csatImpact,
  empathyScore,
  complianceChecks = [],
  issues = [],
  suggestions = [],
  isLoadingSuggestions = false,
  canOverride = false,
  onEditManually,
  onSendAnyway,
  onApplySuggestion,
  onRequestSupervisorOverride,
}: AgentIQModalProps) {
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false)
  const [overrideJustification, setOverrideJustification] = useState('')
  const [acknowledgeImpact, setAcknowledgeImpact] = useState(false)
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null)

  if (!isOpen) return null

  const outcomeConfig = {
    approved: {
      color: 'green',
      icon: CheckCircle,
      title: 'Quality Check Passed',
      badge: 'Approved',
      badgeClass: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    },
    warning: {
      color: 'amber',
      icon: AlertTriangle,
      title: 'Response Quality Alert',
      badge: 'Review Required',
      badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    },
    blocked: {
      color: 'red',
      icon: AlertCircle,
      title: 'Response Cannot Be Sent',
      badge: 'Blocked',
      badgeClass: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    },
  }

  const config = outcomeConfig[outcome]
  const Icon = config.icon

  const handleOverride = () => {
    if (overrideJustification.trim().length < 20) {
      alert('Justification must be at least 20 characters')
      return
    }
    if (!acknowledgeImpact) {
      alert('You must acknowledge the potential impact')
      return
    }
    onSendAnyway?.(overrideJustification)
    setShowOverrideConfirm(false)
  }

  const getComplianceIcon = (status: ComplianceStatus) => {
    switch (status) {
      case 'passed':
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'failed':
        return <X className="h-4 w-4 text-red-600 dark:text-red-400" />
      case 'flagged':
        return <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
    }
  }

  const getComplianceStatusClass = (status: ComplianceStatus) => {
    switch (status) {
      case 'passed':
      case 'verified':
        return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
      case 'flagged':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
    }
  }

  // Override Confirmation Modal
  if (showOverrideConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-slate-900">
          {/* Header */}
          <div className="border-b border-slate-200 bg-red-50 px-6 py-4 dark:border-slate-700 dark:bg-red-950/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Confirm Override
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  This will bypass quality checks
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 dark:bg-amber-950/20 dark:border-amber-900">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Your supervisor will be notified of this override. Multiple overrides may require additional review.
              </p>
            </div>

            {/* Justification */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Justification (Required) <span className="text-red-600">*</span>
              </label>
              <textarea
                value={overrideJustification}
                onChange={(e) => setOverrideJustification(e.target.value)}
                placeholder="Explain why you need to send this response despite the quality concerns..."
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Minimum 20 characters ({overrideJustification.length}/20)
              </p>
            </div>

            {/* Acknowledgment */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledgeImpact}
                onChange={(e) => setAcknowledgeImpact(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                I understand this may impact customer satisfaction and will be logged for review
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
            <button
              onClick={() => {
                setShowOverrideConfirm(false)
                setOverrideJustification('')
                setAcknowledgeImpact(false)
              }}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel & Edit
            </button>
            <button
              onClick={handleOverride}
              disabled={overrideJustification.trim().length < 20 || !acknowledgeImpact}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Confirm Override
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main Quality Gate Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col rounded-xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                AgentIQ Quality Gate
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                AI-powered response optimization
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.badgeClass}`}>
              {config.badge}
            </span>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Quality Metrics */}
          <div className="w-1/2 overflow-y-auto border-r border-slate-200 p-6 dark:border-slate-700">
            {/* CSAT Impact */}
            {csatImpact && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">
                  <TrendingDown className="h-4 w-4" />
                  CSAT Impact
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-bold text-slate-900 dark:text-white">
                      {csatImpact.current.toFixed(1)}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Current</div>
                  </div>
                  <div className="text-slate-400">→</div>
                  <div>
                    <div className="text-4xl font-bold text-red-600 dark:text-red-400">
                      {csatImpact.predicted.toFixed(1)}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Predicted</div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                    {csatImpact.delta.toFixed(1)} Point Drop
                  </span>
                </div>
              </div>
            )}

            {/* Compliance Checks */}
            {complianceChecks.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                  Compliance Check
                </h3>
                <div className="space-y-2">
                  {complianceChecks.map((check, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        {getComplianceIcon(check.status)}
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {check.name}
                        </span>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getComplianceStatusClass(check.status)}`}>
                        {check.status === 'passed' || check.status === 'verified' ? 'Verified' : check.status === 'failed' ? 'Failed' : 'Flagged'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Response */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Current Response
                </h3>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {currentResponse}
                </p>
              </div>
              {issues.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {issues.map((issue, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300"
                    >
                      {issue.title}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Empathy Score */}
            {empathyScore && (
              <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                  Empathy Score
                </div>
                <div className="mb-3 flex items-end gap-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {empathyScore.score}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">/10</span>
                </div>
                <ul className="space-y-1">
                  {empathyScore.reasons.map((reason, idx) => (
                    <li key={idx} className="text-xs text-slate-600 dark:text-slate-400">
                      • {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: AI Suggestions */}
          <div className="w-1/2 overflow-y-auto bg-slate-50 p-6 dark:bg-slate-800/30">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                <span className="text-xs font-bold text-white">AI</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  AI-Optimized Response
                </h3>
                {suggestions.length > 0 && suggestions[0].csatImprovement > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    +{suggestions[0].csatImprovement.toFixed(1)} CSAT
                  </p>
                )}
              </div>
            </div>

            {isLoadingSuggestions ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                  Generating optimized response...
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  This may take 7-9 seconds
                </p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No suggestions available
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    {/* Suggestion Header */}
                    <div className="border-b border-slate-200 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 dark:border-slate-700 dark:from-green-950/20 dark:to-emerald-950/20">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900 dark:text-white">
                          {suggestion.title}
                        </h4>
                        {suggestion.isWithinKB ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            <BookOpen className="h-3 w-3" />
                            3 KB sources
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            Outside KB
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {suggestion.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-300"
                          >
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Suggestion Content */}
                    <div className="p-4">
                      {!suggestion.isWithinKB && (
                        <div className="mb-3 rounded border border-amber-200 bg-amber-50 p-2 dark:border-amber-900 dark:bg-amber-950/20">
                          <p className="text-xs text-amber-800 dark:text-amber-200">
                            ⚠️ Passes guidelines but outside KB; exercise caution
                          </p>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {expandedSuggestion === suggestion.id
                          ? suggestion.content
                          : suggestion.preview}
                      </p>
                      {suggestion.content.length > suggestion.preview.length && (
                        <button
                          onClick={() =>
                            setExpandedSuggestion(
                              expandedSuggestion === suggestion.id ? null : suggestion.id
                            )
                          }
                          className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          {expandedSuggestion === suggestion.id ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>

                    {/* Suggestion Action */}
                    <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50">
                      <button
                        onClick={() => onApplySuggestion(suggestion.id)}
                        className="w-full rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white hover:from-green-700 hover:to-emerald-700"
                      >
                        Apply AI Suggestion
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex gap-3">
            <button
              onClick={onEditManually}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Edit Manually
            </button>
            {outcome !== 'approved' && canOverride && onSendAnyway && (
              <button
                onClick={() => setShowOverrideConfirm(true)}
                className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-amber-950/30"
              >
                Send Anyway (Override)
              </button>
            )}
            {outcome === 'blocked' && !canOverride && onRequestSupervisorOverride && (
              <button
                onClick={onRequestSupervisorOverride}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Request Supervisor Override
              </button>
            )}
          </div>
          {outcome === 'approved' && (
            <button
              onClick={onClose}
              className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
