'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsPanelProps {
  stats?: {
    accuracy: number
    totalAttempts: number
    avgTimeSeconds?: number
  } | null
  dominio?: {
    isMastered?: boolean
    consecutiveCorrect?: number
    targetToMaster?: number
  } | null
}

export function StatsPanel({ stats, dominio }: StatsPanelProps) {
  if (!stats && !dominio) return null

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats && (
        <>
          <div className="rounded-lg border border-border p-3 text-center">
            <p className="font-display text-lg font-bold">{stats.accuracy}%</p>
            <p className="text-[9px] text-muted-foreground">Acerto geral</p>
          </div>
          <div className="rounded-lg border border-border p-3 text-center">
            <p className="font-display text-lg font-bold">{stats.totalAttempts}</p>
            <p className="text-[9px] text-muted-foreground">Tentativas</p>
          </div>
          <div className="rounded-lg border border-border p-3 text-center">
            <p className="font-display text-lg font-bold">{stats.avgTimeSeconds}s</p>
            <p className="text-[9px] text-muted-foreground">Tempo médio</p>
          </div>
        </>
      )}
      {dominio && (
        <div
          className={cn(
            'rounded-lg border p-3 text-center',
            dominio.isMastered ? 'border-isometrica-success/30 bg-isometrica-success/[0.02]' : 'border-border',
          )}
        >
          <p className={cn('font-display text-lg font-bold', dominio.isMastered ? 'text-isometrica-success' : '')}>
            {dominio.consecutiveCorrect}/{dominio.targetToMaster}
          </p>
          <p className="text-[9px] text-muted-foreground">
            {dominio.isMastered ? (
              <span className="inline-flex items-center gap-1">
                Dominado! <Sparkles className="size-3 text-isometrica-success" />
              </span>
            ) : (
              'Acertos consecutivos'
            )}
          </p>
        </div>
      )}
    </div>
  )
}
