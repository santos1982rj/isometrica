'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const plans = [
  {
    name: 'Gratuito', price: 'R$ 0', period: '/mês', desc: 'Para começar sua jornada',
    features: ['Acesso a 5 cursos', 'Tutor IA limitado', 'Dashboard básico', '10 questões/dia'],
    cta: 'Começar grátis', href: '/cadastro', featured: false,
  },
  {
    name: 'Premium', price: 'R$ 29,90', period: '/mês', desc: 'Para evoluir sem limites',
    features: ['Todos os cursos', 'Tutor IA ilimitado', 'BI completo + insights', 'Questões ilimitadas', 'Gamificação completa', 'Certificados'],
    cta: 'Assinar Premium', href: '/cadastro', featured: true,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="border-y border-border bg-card/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="text-center">
          <motion.p variants={fadeUp} className="mb-2 text-sm font-semibold text-isometrica-accent">PLANOS</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Invista na sua evolução
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="mt-12 mx-auto grid max-w-3xl gap-6 md:grid-cols-2"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name} variants={fadeUp}
              className={`relative overflow-hidden rounded-xl border p-6 transition-all hover:-translate-y-1 ${
                plan.featured
                  ? 'border-isometrica-accent/30 bg-card shadow-lg shadow-isometrica-accent/5'
                  : 'border-border bg-card'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-isometrica-accent to-orange-400 px-4 py-1 text-[10px] font-bold text-white shadow-sm">
                  MAIS POPULAR
                </div>
              )}
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-3xl font-extrabold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`mt-0.5 size-4 shrink-0 ${plan.featured ? 'text-isometrica-accent' : 'text-isometrica-success'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  plan.featured
                    ? 'bg-gradient-to-r from-isometrica-accent to-orange-400 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                    : 'border border-border text-foreground hover:bg-muted'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
