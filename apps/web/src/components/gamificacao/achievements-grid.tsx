'use client'

import { motion } from 'framer-motion'
import { Star, CheckCircle } from 'lucide-react'

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

interface AchievementsGridProps {
  achievements: any[]
  unlockedAchievements: { name: string }[]
}

export function AchievementsGrid({ achievements, unlockedAchievements }: AchievementsGridProps) {
  return (
    <motion.div variants={itemAnim} className="bento-card rounded-xl border border-border bg-card p-5 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-accent/10">
            <Star className="size-3.5 text-isometrica-accent" />
          </div>
          <h3 className="text-sm font-semibold">Conquistas</h3>
        </div>
        <span className="text-xs text-muted-foreground">{unlockedAchievements.length}/{achievements.length}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {achievements.map((ach) => {
          const isUnlocked = ach.unlocked || unlockedAchievements.some((a) => a.name === ach.name)
          return (
            <div
              key={ach.name}
              className={`relative flex flex-col items-center rounded-xl border p-4 text-center transition-all ${
                isUnlocked
                  ? 'border-isometrica-accent/30 bg-isometrica-accent/[0.03]'
                  : 'border-border bg-muted/30 opacity-50'
              }`}
            >
              <ach.icon className="mb-1.5 size-6" />
              <p className={`text-xs font-semibold leading-tight ${isUnlocked ? '' : 'text-muted-foreground'}`}>
                {ach.name}
              </p>
              <p className="mt-0.5 text-[9px] text-muted-foreground leading-tight">{ach.desc}</p>
              {!isUnlocked && ach.progress !== undefined && ach.target !== undefined && (
                <div className="mt-2 w-full">
                  <div className="h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-isometrica-accent/50"
                      style={{ width: `${(ach.progress / ach.target) * 100}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-[8px] text-muted-foreground tabular-nums">
                    {ach.progress}/{ach.target}
                  </p>
                </div>
              )}
              {isUnlocked && (
                <div className="mt-1.5 flex items-center gap-0.5 text-[9px] font-medium text-isometrica-success">
                  <CheckCircle className="size-3" />
                  Desbloqueado
                </div>
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
