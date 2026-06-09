'use client'

import { useEffect, useState } from 'react'

interface SparklineProps {
  data: number[]
  color?: string
  height?: number
  labels?: string[]
  showLabels?: boolean
}

export function Sparkline({
  data,
  color = 'var(--color-isometrica-accent, #e85d32)',
  height = 36,
  labels,
  showLabels = true,
}: SparklineProps) {
  const [path, setPath] = useState('')
  const width = data.length * 30

  useEffect(() => {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const padding = 4

    const points = data.map((v, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2)
      const y = height - padding - ((v - min) / range) * (height - padding * 2)
      return { x, y }
    })

    const d = points.reduce((acc, p, i) => {
      if (i === 0) return `M${p.x},${p.y}`
      const prev = points[i - 1]
      const cx = (prev.x + p.x) / 2
      return `${acc} Q${prev.x},${prev.y} ${cx},${(prev.y + p.y) / 2} T${p.x},${p.y}`
    }, '')

    requestAnimationFrame(() => setPath(d))
  }, [data, height, width])

  return (
    <div>
      {showLabels && labels && (
        <div className="mb-1 flex justify-between">
          {labels.map((l, i) => (
            <span key={i} className="text-[9px] font-medium text-muted-foreground">{l}</span>
          ))}
        </div>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height }}
      >
        {path && (
          <>
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx={width - 4}
              cy={data.length > 0 ? (() => {
                const min = Math.min(...data)
                const max = Math.max(...data)
                const range = max - min || 1
                return height - 4 - ((data[data.length - 1] - min) / range) * (height - 8)
              })() : height / 2}
              r="3.5"
              fill={color}
              stroke="var(--card)"
              strokeWidth="2"
            />
          </>
        )}
      </svg>
    </div>
  )
}
