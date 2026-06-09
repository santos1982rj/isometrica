'use client'

import { useMemo } from 'react'

interface HeatmapProps {
  data: number[]
  days?: string[]
}

const levels = ['bg-muted', 'bg-isometrica-accent/20', 'bg-isometrica-accent/40', 'bg-isometrica-accent/65', 'bg-isometrica-accent']

export function Heatmap({ data, days }: HeatmapProps) {
  const cols = useMemo(() => {
    const result: number[][] = []
    const colsCount = Math.ceil(data.length / 7)
    for (let c = 0; c < colsCount; c++) {
      const col: number[] = []
      for (let r = 0; r < 7; r++) {
        const idx = r * colsCount + c
        if (idx < data.length) col.push(data[idx])
      }
      if (col.length > 0) result.push(col)
    }
    return result
  }, [data])

  const getLevel = (v: number) => {
    if (v === 0) return 0
    if (v <= 2) return 1
    if (v <= 5) return 2
    if (v <= 10) return 3
    return 4
  }

  return (
    <div>
      <div className="flex gap-[3px]">
        {cols.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-[3px]">
            {col.map((v, ri) => (
              <div
                key={ri}
                className={`size-[9px] rounded-[2px] transition-all duration-200 hover:scale-150 hover:rounded-sm ${levels[getLevel(v)]}`}
                title={`${v} atividades`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[8.5px] font-medium text-muted-foreground">Menos</span>
        <div className="flex items-center gap-[2px]">
          {levels.map((l, i) => (
            <div key={i} className={`size-[8px] rounded-[2px] ${l}`} />
          ))}
        </div>
        <span className="text-[8.5px] font-medium text-muted-foreground">Mais</span>
      </div>
    </div>
  )
}
