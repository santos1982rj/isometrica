'use client'

import { motion } from 'framer-motion'
import { Flame, Trophy, Target } from 'lucide-react'

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

interface StreakCardsProps {
  streak: number
  achievements: number
  missions: number
  totalAchievements: number
  totalMissions: number
}

export function StreakCards({ streak, achievements, missions, totalAchievements, totalMissions }: StreakCardsProps) {
  return (
    <motion.div variants={itemAnim} className="lg:col-span-2">
      <div className="grid h-full grid-cols-3 gap-4">
        <div className="bento-card flex flex-col items-center justify-center rounded-xl border border-border bg-card p-5 text-center">
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-isometrica-accent/10">
            <Flame className="size-5 text-isometrica-accent" />
          </div>
          <p className="font-display text-2xl font-bold tabular-nums">{streak}</p>
          <p className="text-[10px] font-medium text-muted-foreground">Streak atual</p>
          <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-isometrica-accent"><Flame className="size-3" /> Melhor: 12 dias</p>
        </div>
        <div className="bento-card flex flex-col items-center justify-center rounded-xl border border-border bg-card p-5 text-center">
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-isometrica-success/10">
            <Trophy className="size-5 text-isometrica-success" />
          </div>
          <p className="font-display text-2xl font-bold tabular-nums">{achievements}</p>
          <p className="text-[10px] font-medium text-muted-foreground">Conquistas</p>
          <p className="mt-1 text-[10px] text-muted-foreground">de {totalAchievements} disponíveis</p>
        </div>
        <div className="bento-card flex flex-col items-center justify-center rounded-xl border border-border bg-card p-5 text-center">
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-isometrica-info/10">
            <Target className="size-5 text-isometrica-info" />
          </div>
          <p className="font-display text-2xl font-bold tabular-nums">{missions}</p>
          <p className="text-[10px] font-medium text-muted-foreground">Missões</p>
          <p className="mt-1 text-[10px] text-muted-foreground">{totalMissions} ativas</p>
        </div>
      </div>
    </motion.div>
  )
}
