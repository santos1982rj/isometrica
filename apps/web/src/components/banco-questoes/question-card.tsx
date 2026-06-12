'use client'

import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { Questao } from '@/lib/types'
import { StatsPanel } from '@/components/banco-questoes/stats-panel'

type LocalQuestao = Questao & {
  exam?: { id: string; name: string } | null
  estimatedTime?: number
  tags: { id: string; tag: string }[]
}

interface LocalQuestionStats {
  accuracy: number
  totalAttempts: number
  avgTimeSeconds?: number
}

interface LocalTopicMastery {
  isMastered?: boolean
  consecutiveCorrect?: number
  targetToMaster?: number
}

interface QuestionCardProps {
  questao: LocalQuestao
  selecionada: boolean
  statsQuestao?: LocalQuestionStats | null
  dominio?: LocalTopicMastery | null
  onVerQuestao: (q: Questao) => void
}

const diffLabel: Record<string, string> = { FACIL: 'Fácil', MEDIO: 'Médio', DIFICIL: 'Difícil' }
const diffColor: Record<string, string> = {
  FACIL: 'text-isometrica-success bg-isometrica-success/10',
  MEDIO: 'text-isometrica-warning bg-isometrica-warning/10',
  DIFICIL: 'text-isometrica-danger bg-isometrica-danger/10',
}

export function QuestionCard({ questao: q, selecionada, statsQuestao, dominio, onVerQuestao }: QuestionCardProps) {
  return (
    <div
      className={cn(
        'cursor-pointer rounded-xl border p-4 transition-all',
        selecionada
          ? 'border-isometrica-accent/40 bg-isometrica-accent/[0.02]'
          : 'border-border bg-card hover:border-isometrica-accent/20',
      )}
      onClick={() => onVerQuestao(q)}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-isometrica-accent/10 text-xs font-bold text-isometrica-accent">
          Q
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium leading-relaxed">{q.text}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-[9px]">{q.topic?.name}</Badge>
            <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-semibold', diffColor[q.difficulty])}>
              {diffLabel[q.difficulty]}
            </span>
            {q.exam && <Badge variant="outline" className="text-[9px]">{q.exam.name}</Badge>}
            <span className="text-[9px] text-muted-foreground">{q.estimatedTime}min</span>
          </div>
          {q.tags?.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {q.tags.map((t) => (
                <span key={t.id} className="rounded bg-muted/50 px-1.5 py-0.5 text-[8px] text-muted-foreground">
                  #{t.tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <ChevronRight
          className={cn(
            'size-4 shrink-0 transition-all',
            selecionada ? 'rotate-90 text-isometrica-accent' : 'text-muted-foreground',
          )}
        />
      </div>

      {selecionada && (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          <div className="space-y-1.5">
            {q.alternatives?.map((alt, i) => (
              <div
                key={alt.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm',
                  'border-border',
                )}
              >
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium border',
                    'border-border text-muted-foreground',
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{alt.text}</span>
              </div>
            ))}
          </div>

          {(statsQuestao || dominio) && <StatsPanel stats={statsQuestao!} dominio={dominio} />}
        </div>
      )}
    </div>
  )
}
