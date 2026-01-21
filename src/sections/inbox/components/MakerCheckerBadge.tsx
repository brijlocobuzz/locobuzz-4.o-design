import { CheckCircle, XCircle, Clock, AlertTriangle, UserCheck } from 'lucide-react'

interface MakerCheckerBadgeProps {
    status: 'pending' | 'approved' | 'rejected'
    reviewType: 'supervisor' | 'checker' | 'reviewer'
    deadline?: string
    submittedBy?: {
        id: string
        name: string
        avatarUrl?: string
    }
    submittedAt?: string
    compact?: boolean
    className?: string
}

export function MakerCheckerBadge({
    status,
    reviewType,
    deadline,
    submittedBy,
    submittedAt,
    compact = false,
    className = '',
}: MakerCheckerBadgeProps) {
    const getStatusConfig = () => {
        switch (status) {
            case 'pending':
                return {
                    bgColor: 'bg-amber-50 dark:bg-amber-950',
                    borderColor: 'border-amber-300 dark:border-amber-700',
                    textColor: 'text-amber-700 dark:text-amber-300',
                    iconColor: 'text-amber-500 dark:text-amber-400',
                    Icon: Clock,
                    label: 'Pending Review',
                }
            case 'approved':
                return {
                    bgColor: 'bg-emerald-50 dark:bg-emerald-950',
                    borderColor: 'border-emerald-300 dark:border-emerald-700',
                    textColor: 'text-emerald-700 dark:text-emerald-300',
                    iconColor: 'text-emerald-500 dark:text-emerald-400',
                    Icon: CheckCircle,
                    label: 'Approved',
                }
            case 'rejected':
                return {
                    bgColor: 'bg-rose-50 dark:bg-rose-950',
                    borderColor: 'border-rose-300 dark:border-rose-700',
                    textColor: 'text-rose-700 dark:text-rose-300',
                    iconColor: 'text-rose-500 dark:text-rose-400',
                    Icon: XCircle,
                    label: 'Rejected',
                }
        }
    }

    const getReviewTypeLabel = () => {
        switch (reviewType) {
            case 'supervisor':
                return 'Supervisor Review'
            case 'checker':
                return 'Checker Review'
            case 'reviewer':
                return 'Reviewer Approval'
        }
    }

    const getTimeRemaining = () => {
        if (!deadline) return null
        const now = new Date()
        const deadlineDate = new Date(deadline)
        const diffMs = deadlineDate.getTime() - now.getTime()

        if (diffMs <= 0) return 'Overdue'

        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

        if (diffHours > 24) {
            const days = Math.floor(diffHours / 24)
            return `${days}d remaining`
        }
        if (diffHours > 0) {
            return `${diffHours}h ${diffMins}m remaining`
        }
        return `${diffMins}m remaining`
    }

    const formatSubmittedTime = () => {
        if (!submittedAt) return ''
        const date = new Date(submittedAt)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / (1000 * 60))

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours}h ago`
        const diffDays = Math.floor(diffHours / 24)
        return `${diffDays}d ago`
    }

    const config = getStatusConfig()
    const { bgColor, borderColor, textColor, iconColor, Icon, label } = config
    const timeRemaining = getTimeRemaining()
    const isOverdue = timeRemaining === 'Overdue'

    if (compact) {
        return (
            <div
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${bgColor} ${borderColor} ${className}`}
            >
                <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                <span className={`text-xs font-medium ${textColor}`}>{label}</span>
            </div>
        )
    }

    return (
        <div
            className={`rounded-lg border ${bgColor} ${borderColor} ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-inherit">
                <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                    <span className={`text-sm font-semibold ${textColor}`}>{label}</span>
                </div>
                {timeRemaining && (
                    <div
                        className={`flex items-center gap-1 text-xs font-medium ${isOverdue
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                    >
                        {isOverdue && <AlertTriangle className="w-3 h-3" />}
                        <Clock className="w-3 h-3" />
                        <span>{timeRemaining}</span>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="px-3 py-2 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{getReviewTypeLabel()}</span>
                </div>

                {submittedBy && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {submittedBy.avatarUrl ? (
                            <img
                                src={submittedBy.avatarUrl}
                                alt={submittedBy.name}
                                className="w-4 h-4 rounded-full"
                            />
                        ) : (
                            <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-medium">
                                {submittedBy.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span>
                            Submitted by {submittedBy.name}
                            {submittedAt && ` • ${formatSubmittedTime()}`}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

// Compact inline badge variant for ticket cards
export function MakerCheckerInlineBadge({
    status,
    reviewType,
}: {
    status: 'pending' | 'approved' | 'rejected'
    reviewType: 'supervisor' | 'checker' | 'reviewer'
}) {
    const getConfig = () => {
        switch (status) {
            case 'pending':
                return {
                    bg: 'bg-amber-100 dark:bg-amber-900/40',
                    text: 'text-amber-700 dark:text-amber-300',
                    icon: Clock,
                }
            case 'approved':
                return {
                    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
                    text: 'text-emerald-700 dark:text-emerald-300',
                    icon: CheckCircle,
                }
            case 'rejected':
                return {
                    bg: 'bg-rose-100 dark:bg-rose-900/40',
                    text: 'text-rose-700 dark:text-rose-300',
                    icon: XCircle,
                }
        }
    }

    const getLabel = () => {
        const prefix = status === 'pending' ? 'Needs' : status === 'approved' ? 'Approved by' : 'Rejected by'
        const type = reviewType.charAt(0).toUpperCase() + reviewType.slice(1)
        return status === 'pending' ? `${prefix} ${type}` : type
    }

    const { bg, text, icon: Icon } = getConfig()

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${bg} ${text}`}>
            <Icon className="w-3 h-3" />
            {getLabel()}
        </span>
    )
}

// Action buttons for maker-checker tickets
interface MakerCheckerActionsProps {
    onApprove?: () => void
    onReject?: () => void
    disabled?: boolean
    compact?: boolean
}

export function MakerCheckerActions({
    onApprove,
    onReject,
    disabled = false,
    compact = false,
}: MakerCheckerActionsProps) {
    if (compact) {
        return (
            <div className="flex items-center gap-1">
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onApprove?.()
                    }}
                    disabled={disabled}
                    className="p-1.5 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                    title="Approve"
                >
                    <CheckCircle className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onReject?.()
                    }}
                    disabled={disabled}
                    className="p-1.5 rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/60"
                    title="Reject"
                >
                    <XCircle className="w-4 h-4" />
                </button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onApprove?.()
                }}
                disabled={disabled}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <CheckCircle className="w-4 h-4" />
                Approve
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onReject?.()
                }}
                disabled={disabled}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <XCircle className="w-4 h-4" />
                Reject
            </button>
        </div>
    )
}
