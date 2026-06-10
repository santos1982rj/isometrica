'use client'

import { motion } from 'framer-motion'
import type { ProgressoCurso } from '@/lib/types'

interface ProgressCardProps {
  progresso: ProgressoCurso
  grad: string
}

export function ProgressCard({ progresso, grad }: ProgressCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-muted-foreground">Progresso</span>
        <span className="font-semibold text-isometrica-accent">{progresso.percentage}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div className={`h-full rounded-full bg-gradient-to-r ${grad}`}
          initial={{ width: 0 }} animate={{ width: `${progresso.percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }} />
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">{progresso.completed} de {progresso.total} aulas</p>
    </div>
  )
}
