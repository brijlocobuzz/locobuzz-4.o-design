import { ChevronDown, CheckCircle2, Circle, AlertCircle, ExternalLink, Download } from 'lucide-react'
import { useState } from 'react'
import type { SetupChecklistProps, SetupStatus } from '@/../product/sections/settings/types'

const statusIcons: Record<SetupStatus, React.ComponentType<{ className?: string }>> = {
  complete: CheckCircle2,
  partial: AlertCircle,
  'not-started': Circle,
}

const statusColors: Record<SetupStatus, string> = {
  complete: 'text-green-600 dark:text-green-400',
  partial: 'text-yellow-600 dark:text-yellow-400',
  'not-started': 'text-slate-300 dark:text-slate-600',
}

export function SetupChecklist({
  checklist,
  onSelectBrand,
  onNavigateToSection,
  onExportSummary,
}: SetupChecklistProps) {
  const [selectedBrand, setSelectedBrand] = useState(checklist.selectedBrandId)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const currentBrand = checklist.brands.find((b) => b.id === selectedBrand)

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId)
    onSelectBrand?.(brandId)
    setIsDropdownOpen(false)
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-8 py-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Setup Checklist
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Complete your brand setup to unlock full platform capabilities
            </p>
          </div>
          <button
            onClick={onExportSummary}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Download className="h-4 w-4" />
            Export Summary
          </button>
        </div>
      </div>

      {/* Brand Selector */}
      <div className="border-b border-slate-200 bg-white px-8 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative w-64">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            <div>
              <div className="text-left font-medium">{currentBrand?.name}</div>
              <div className="text-left text-xs text-slate-500 dark:text-slate-400">
                {currentBrand?.completionPercentage}% complete
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              {checklist.brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => handleBrandChange(brand.id)}
                  className={`flex w-full items-center justify-between px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 ${
                    brand.id === selectedBrand
                      ? 'bg-indigo-50 dark:bg-indigo-950/50'
                      : ''
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {brand.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {brand.completionPercentage}% complete
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Fix Next Recommendation */}
          {checklist.fixNext && (
            <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-900 dark:bg-yellow-950/20">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                  <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                    Recommended Next Step
                  </h3>
                  <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
                    {checklist.fixNext.title}
                  </p>
                  <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    {checklist.fixNext.reason}
                  </p>
                  <button
                    onClick={() => onNavigateToSection?.(checklist.fixNext.deepLink)}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600"
                  >
                    Configure Now
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Progress Ring */}
          <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-800">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="h-32 w-32 -rotate-90 transform">
                  <circle
                    className="text-slate-200 dark:text-slate-700"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-indigo-600 dark:text-indigo-500"
                    strokeWidth="8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 56 * (1 - (currentBrand?.completionPercentage || 0) / 100)
                    }`}
                  />
                </svg>
                <div className="absolute">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {currentBrand?.completionPercentage}%
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Complete</div>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist Categories */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Setup Progress
            </h2>
            {currentBrand?.categories.map((category, index) => {
              const StatusIcon = statusIcons[category.status]
              const statusColor = statusColors[category.status]

              return (
                <button
                  key={category.id}
                  onClick={() => onNavigateToSection?.(category.deepLink)}
                  className="flex w-full items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/30"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {index + 1}
                  </div>
                  <StatusIcon className={`h-5 w-5 flex-shrink-0 ${statusColor}`} />
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-white">{category.name}</h3>
                    {category.details && (
                      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        {category.details}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {category.status === 'complete' && category.completedAt && (
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(category.completedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                    <ExternalLink className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
