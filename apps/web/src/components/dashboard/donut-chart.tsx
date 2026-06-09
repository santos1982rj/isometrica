'use client'

import { useEffect, useState } from 'react'

interface DonutChartProps {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
}

export function DonutChart({
  value,
  size = 76,
  strokeWidth = 5,
  color = 'var(--color-isometrica-accent, #e85d32)',
  label,
}: DonutChartProps) {
  const [offset, setOffset] = useState(999)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setOffset(circumference - (Math.min(value, 100) / 100) * circumference)
    })
    return () => cancelAnimationFrame(timer)
  }, [value, circumference])

  const pct = Math.round(Math.min(value, 100))

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-lg font-bold leading-none tabular-nums">{pct}%</span>
        {label && <span className="mt-0.5 text-[8px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>}
      </div>
    </div>
  )
}
