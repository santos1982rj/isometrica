'use client'

import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import type { EventLog } from '@/lib/types'

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

interface ActivityTimelineProps {
  eventos: EventLog[]
}

export function ActivityTimeline({ eventos }: ActivityTimelineProps) {
  const activityEvents = eventos.slice(0, 4).map((e: EventLog) => {
    const labels: Record<string, string> = {
      LESSON_COMPLETED: 'Concluiu uma aula',
      QUESTION_CORRECT: 'Acertou uma questão',
      QUESTION_INCORRECT: 'Errou uma questão',
      CONVERSATION_STARTED: 'Iniciou conversa com Tutor IA',
      ENROLLMENT_CREATED: 'Matriculou-se em um curso',
      ACHIEVEMENT_UNLOCKED: 'Desbloqueou uma conquista',
      LEVEL_UP: 'Subiu de nível',
      STREAK_UPDATED: 'Streak atualizado',
    }
    return {
      title: labels[e.type] ?? e.type,
      time: new Date(e.createdAt).toLocaleString('pt-BR'),
      color: e.type === 'QUESTION_INCORRECT' ? 'bg-isometrica-danger' : e.type === 'QUESTION_CORRECT' ? 'bg-isometrica-success' : 'bg-isometrica-accent',
    }
  })

  return (
    <motion.div variants={itemAnim} className="bento-card rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-accent/10">
            <TrendingUp className="size-3.5 text-isometrica-accent" />
          </div>
          <h3 className="text-sm font-semibold">Atividade</h3>
        </div>
      </div>
      <div className="flex flex-col gap-0">
        {activityEvents.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma atividade recente</p>
        ) : (
          activityEvents.map((act, i) => (
            <div key={act.title} className="flex items-start gap-3 py-2.5">
              <div className="flex flex-col items-center gap-0.5 pt-1">
                <div className={`size-2 rounded-full ${act.color} ${i === 0 ? 'animate-pulse' : ''}`} />
                {i < activityEvents.length - 1 && <div className="mt-0.5 h-full w-0.5 bg-border" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium leading-snug">{act.title}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{act.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}
