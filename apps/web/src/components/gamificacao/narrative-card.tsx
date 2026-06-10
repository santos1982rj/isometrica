'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

interface NarrativeCardProps {
  streak: number
  level: number
}

function getStreakNarrative(days: number) {
  if (days === 0) return { title: 'Hora de começar!', desc: 'Cada grande engenheiro começou com um primeiro passo. Que tal estudar hoje?', color: 'from-slate-400 to-slate-300' }
  if (days < 3) return { title: 'Primeiros passos', desc: 'A consistência é o alicerce de toda obra. Mantenha o ritmo!', color: 'from-isometrica-info to-blue-400' }
  if (days < 7) return { title: 'Ritmo de obra', desc: 'Três dias seguidos mostram disciplina de engenheiro. A fundação está firme.', color: 'from-isometrica-success to-emerald-400' }
  if (days < 14) return { title: 'Concreto curado', desc: 'Uma semana! Seu hábito já está mais resistente que concreto armado.', color: 'from-isometrica-accent to-orange-400' }
  if (days < 30) return { title: 'Estrutura metálica', desc: 'Duas semanas de consistência. Você já é referência de determinação.', color: 'from-purple-500 to-pink-500' }
  if (days < 60) return { title: 'Arranha-céu', desc: '30 dias! Você não está apenas estudando — está construindo um legado.', color: 'from-yellow-500 to-amber-400' }
  return { title: 'Monumento', desc: 'Mais de 60 dias de streak. Você é uma verdadeira obra-prima da engenharia.', color: 'from-isometrica-accent via-purple-500 to-pink-500' }
}

export function NarrativeCard({ streak }: NarrativeCardProps) {
  const narrative = getStreakNarrative(streak)
  return (
    <motion.div variants={itemAnim} className="bento-card relative overflow-hidden rounded-xl border border-border bg-card p-5">
      <div className={`absolute inset-0 bg-gradient-to-br ${narrative.color} opacity-[0.03]`} />
      <div className="relative z-10 flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-isometrica-accent/10">
          <Quote className="size-6 text-isometrica-accent" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold">{narrative.title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">{narrative.desc}</p>
        </div>
      </div>
    </motion.div>
  )
}
