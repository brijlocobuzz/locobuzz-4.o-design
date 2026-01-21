import { ArrowRight } from 'lucide-react'
import type { ChartRendererProps } from '@/../product/sections/chat-with-data/types'

export function ChartRenderer({
  id,
  chartType,
  title,
  data,
  deepDiveEnabled,
  onDeepDive,
}: ChartRendererProps) {
  // Simplified chart visualization - in production you'd use a real chart library like Chart.js or Recharts
  const maxValue = Math.max(...data.datasets.flatMap((d) => d.values))

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-slate-900 dark:text-white">{title}</h4>
        {deepDiveEnabled && (
          <button
            onClick={() => onDeepDive?.(id)}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Deep Dive
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Simplified chart visualization */}
      {chartType === 'line' && (
        <div className="mt-4 space-y-4">
          {data.datasets.map((dataset, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: getColorValue(dataset.color) }}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {dataset.label}
                </span>
              </div>
              <div className="flex items-end gap-1" style={{ height: '80px' }}>
                {dataset.values.map((value, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${(value / maxValue) * 100}%`,
                        backgroundColor: getColorValue(dataset.color),
                        opacity: 0.7,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            {data.labels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
        </div>
      )}

      {chartType === 'bar' && (
        <div className="mt-4 space-y-2">
          {data.labels.map((label, i) => {
            const value = data.datasets[0]?.values[i] || 0
            const percentage = (value / maxValue) * 100

            return (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300">{label}</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {value.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: getColorValue(data.datasets[0]?.color || 'indigo'),
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function getColorValue(color: string): string {
  const colorMap: Record<string, string> = {
    indigo: '#4f46e5',
    green: '#16a34a',
    red: '#dc2626',
    gray: '#6b7280',
    blue: '#2563eb',
  }
  return colorMap[color] || color
}
