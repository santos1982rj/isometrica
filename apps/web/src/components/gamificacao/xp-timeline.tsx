'use client'

import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

interface XpHistoryItem {
  icon: React.ComponentType<{ className?: string }>
  action: string
  time: string
  xp: number
}

interface XpTimelineProps {
  xpHistory: XpHistoryItem[]
}

export function XpTimeline({ xpHistory }: XpTimelineProps) {
  return (
    <motion.div variants={itemAnim} className="bento-card rounded-xl border border-border bg-card p-5 lg:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-info/10">
            <TrendingUp className="size-3.5 text-isometrica-info" />
          </div>
          <h3 className="text-sm font-semibold">Histórico de XP</h3>
        </div>
      </div>
      {xpHistory.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">Nenhuma atividade recente</p>
      ) : (
        <div className="flex flex-col gap-0">
          {xpHistory.map((item, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 py-3 ${i < xpHistory.length - 1 ? 'border-b border-border' : ''}`}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <item.icon className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.action}</p>
                <p className="text-[11px] text-muted-foreground">{item.time}</p>
              </div>
              {item.xp > 0 && (
                <Badge variant="secondary" className="shrink-0 bg-isometrica-success/10 text-isometrica-success text-[10px] font-semibold">
                  +{item.xp} XP
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
