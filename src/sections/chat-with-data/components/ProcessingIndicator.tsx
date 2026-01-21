import { Loader2 } from 'lucide-react'
import type { ProcessingIndicatorProps } from '@/../product/sections/chat-with-data/types'

export function ProcessingIndicator({ steps, currentStep }: ProcessingIndicatorProps) {
  const activeStep = steps[currentStep - 1]

  return (
    <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
      <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {activeStep?.label || 'Processing...'}
        </p>
        <div className="mt-2 flex items-center gap-2">
          {steps.map((step) => (
            <div
              key={step.step}
              className={`h-1 flex-1 rounded-full ${
                step.step <= currentStep
                  ? 'bg-indigo-600 dark:bg-indigo-500'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Step {currentStep} of {steps.length}
        </p>
      </div>
    </div>
  )
}
