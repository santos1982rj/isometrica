'use client'

import { motion } from 'framer-motion'
import { Target, Gift } from 'lucide-react'

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

interface MissionsListProps {
  missions: any[]
}

export function MissionsList({ missions }: MissionsListProps) {
  return (
    <motion.div variants={itemAnim} className="bento-card rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-warning/10">
            <Target className="size-3.5 text-isometrica-warning" />
          </div>
          <h3 className="text-sm font-semibold">Missões Ativas</h3>
        </div>
      </div>
      <div className="flex flex-col gap-0">
        {missions.map((mission, i) => (
          <div
            key={mission.name}
            className={`py-4 ${i < missions.length - 1 ? 'border-b border-border' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <mission.icon className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight">{mission.name}</p>
                <p className="text-[11px] text-muted-foreground">{mission.desc}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-isometrica-accent to-orange-400"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(mission.progress / mission.target) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                    {mission.progress}/{mission.target}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-isometrica-accent">
                  <Gift className="size-3" />
                  <span>{mission.xpReward} XP</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
