interface SparklineProps {
  data: number[]
  color: string
}

export function Sparkline({ data, color }: SparklineProps) {
  if (data.length === 0) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = range === 0 ? 50 : ((max - value) / range) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="w-full h-12 relative">
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className="text-indigo-500" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="100%" className="text-sky-500" stopColor="currentColor" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke={`url(#gradient-${color})`}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}
