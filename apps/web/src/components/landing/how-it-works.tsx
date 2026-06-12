'use client'

import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const steps = [
  { number: '01', title: 'Crie sua conta', desc: 'Cadastro gratuito em segundos. Sem cartão de crédito.' },
  { number: '02', title: 'Escolha seu curso', desc: 'Navegue por disciplinas organizadas por período da sua grade.' },
  { number: '03', title: 'Estude com IA', desc: 'Aulas, exercícios e tutor disponíveis 24 horas por dia.' },
  { number: '04', title: 'Acompanhe', desc: 'Veja seu progresso em tempo real com dashboards inteligentes.' },
]

export function HowItWorksSection() {
  return (
    <section className="border-y border-border bg-card/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="text-center">
          <motion.p variants={fadeUp} className="mb-2 text-sm font-semibold text-isometrica-accent">COMO FUNCIONA</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Comece em 4 passos
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((s) => (
            <motion.div key={s.number} variants={fadeUp} className="relative text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-isometrica-accent to-orange-400 text-lg font-extrabold text-white shadow-md transition-transform hover:scale-105">
                {s.number}
              </div>
              <h3 className="text-base font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
