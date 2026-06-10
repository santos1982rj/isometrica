'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

interface Recommendation {
  icon: LucideIcon
  emojiBg: string
  title: string
  desc: string
  meta: string
  action: string
}

interface IaSuggestionsProps {
  recommendations: Recommendation[]
}

export function IaSuggestions({ recommendations }: IaSuggestionsProps) {
  return (
    <motion.div variants={itemAnim} className="bento-card rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-accent/10">
            <Sparkles className="size-3.5 text-isometrica-accent" />
          </div>
          <h3 className="text-sm font-semibold">IA Sugere</h3>
        </div>
      </div>
      <div className="flex flex-col gap-0">
        {recommendations.map((rec, i) => (
          <div
            key={rec.title}
            className={`flex items-start gap-3 py-3 ${i < recommendations.length - 1 ? 'border-b border-border' : ''}`}
          >
            <div className={`flex size-6 shrink-0 items-center justify-center rounded-md ${rec.emojiBg}`}>
              <rec.icon className="size-3 text-isometrica-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold">{rec.title}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{rec.desc}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{rec.meta}</p>
            </div>
            <button className="shrink-0 rounded-md border border-border px-2.5 py-1 text-[10px] font-semibold text-foreground transition-all hover:border-isometrica-accent hover:bg-isometrica-accent hover:text-white">
              {rec.action}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
