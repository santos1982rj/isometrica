'use client'

import { Sparkles, BarChart3, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsPanelProps {
  stats?: {
    accuracy: number
    totalAttempts: number
    avgTimeSeconds?: number
    discrimination?: number | null
    alternativeDistribution?: {
      id: string
      text: string
      timesSelected: number
      percentage: number
    }[]
  } | null
  dominio?: {
    isMastered?: boolean
    consecutiveCorrect?: number
    targetToMaster?: number
  } | null
}

function discriminationLabel(val: number | null): { label: string; color: string } {
  if (val === null) return { label: '—', color: 'text-muted-foreground' }
  if (val >= 0.4) return { label: 'Alta', color: 'text-isometrica-success' }
  if (val >= 0.2) return { label: 'Média', color: 'text-isometrica-warning' }
  return { label: 'Baixa', color: 'text-isometrica-danger' }
}

export function StatsPanel({ stats, dominio }: StatsPanelProps) {
  if (!stats && !dominio) return null

  const disc = stats?.discrimination ?? null
  const discInfo = discriminationLabel(disc)

  return (
    <div className="space-y-3">
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
            <div className="rounded-lg border border-border p-3 text-center" title="Índice de discriminação">
              <p className={cn('font-display text-lg font-bold', discInfo.color)}>{disc !== null ? disc.toFixed(2) : '—'}</p>
              <p className="flex items-center justify-center gap-1 text-[9px] text-muted-foreground">
                <BarChart3 className="size-3" /> {discInfo.label}
              </p>
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

      {stats?.alternativeDistribution && stats.alternativeDistribution.length > 0 && (
        <div className="rounded-lg border border-border p-3">
          <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
            <Brain className="size-3" /> Distribuição de alternativas
          </p>
          <div className="space-y-1.5">
            {stats.alternativeDistribution.map((alt) => (
              <div key={alt.id} className="flex items-center gap-2 text-xs">
                <span className="w-4 text-center font-mono text-[10px] text-muted-foreground">
                  {String.fromCharCode(65 + stats.alternativeDistribution!.indexOf(alt))}
                </span>
                <div className="flex-1 overflow-hidden rounded-full bg-muted h-4 relative">
                  <div
                    className="h-full rounded-full bg-isometrica-accent/20 transition-all"
                    style={{ width: `${alt.percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right text-muted-foreground">{alt.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
