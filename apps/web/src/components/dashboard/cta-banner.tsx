'use client'

import { motion } from 'framer-motion'
import { useTutor } from '@/contexts/tutor-context'
import { Brain, ChevronRight } from 'lucide-react'

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

export function CtaBanner() {
  const { openTutor } = useTutor()
  return (
    <motion.div variants={itemAnim}>
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0d1b2a] to-[#1b2d45] p-6 text-white">
        <div className="pointer-events-none absolute -right-10 -top-20 size-96 rounded-full bg-isometrica-accent/5" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-64 rounded-full bg-isometrica-accent/5" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Brain className="size-5" />
            </div>
            <div>
              <h4 className="text-base font-bold">Tutor IA identificou uma oportunidade</h4>
              <p className="mt-0.5 text-sm text-white/70">
                Você revisa Flexão há 3 dias. Que tal praticar com questões inéditas?
              </p>
            </div>
          </div>
          <button
            onClick={() => openTutor()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-isometrica-accent to-[#f07a4a] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-isometrica-accent/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-isometrica-accent/30"
          >
            Praticar agora
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
