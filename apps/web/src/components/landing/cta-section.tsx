'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Shield } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

export function FinalCTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0d1b2a] to-[#1b2d45] py-20 lg:py-28">
      <div className="pointer-events-none absolute -right-20 -top-20 size-96 rounded-full bg-isometrica-accent/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 size-64 rounded-full bg-isometrica-accent/5 blur-3xl" />
      <div className="relative mx-auto max-w-3xl px-5 text-center">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-bold text-white sm:text-4xl">
            Pronto para transformar sua jornada?
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-white/60">
            Junte-se a milhares de estudantes de Engenharia que já estão evoluindo com a Isométrica.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-isometrica-accent to-orange-400 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-isometrica-accent/25 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Começar grátis <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-7 py-3.5 text-sm font-semibold text-white/80 transition-all hover:bg-white/5 hover:text-white"
            >
              <Shield className="size-4" /> Sem compromisso
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
