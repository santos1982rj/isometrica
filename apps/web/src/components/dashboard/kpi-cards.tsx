'use client'

import { motion } from 'framer-motion'
import { Zap, Flame, Trophy, BookOpen } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkline } from '@/components/dashboard/sparkline'

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

const sparklineData = [12, 18, 8, 22, 30, 16, 28]
const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

interface KpiCardsProps {
  xp: number
  streak: number
  level: number
  activeCourses: number
  isLoading?: boolean
}

export function KpiCards({ xp, streak, level, activeCourses, isLoading }: KpiCardsProps) {
  const kpis = [
    { label: 'XP Total', value: xp.toLocaleString('pt-BR'), icon: Zap, color: 'text-isometrica-accent', bg: 'bg-isometrica-accent/10' },
    { label: 'Streak', value: `${streak} dias`, icon: Flame, color: 'text-isometrica-accent', bg: 'bg-isometrica-accent/10' },
    { label: 'Nível', value: String(level), icon: Trophy, color: 'text-isometrica-info', bg: 'bg-isometrica-info/10' },
    { label: 'Cursos Ativos', value: String(activeCourses), icon: BookOpen, color: 'text-isometrica-success', bg: 'bg-isometrica-success/10' },
  ]

  return (
    <motion.div variants={itemAnim} className="rounded-xl border border-border bg-card p-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
          >
            <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${kpi.bg}`}>
              <kpi.icon className={`size-4 ${kpi.color}`} />
            </div>
            <div className="min-w-0">
              {isLoading ? <Skeleton className="h-5 w-14 mb-1" /> : <p className="font-display text-lg font-bold leading-none tabular-nums">{kpi.value}</p>}
              <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <Sparkline data={sparklineData} labels={diasSemana} />
      </div>
    </motion.div>
  )
}
