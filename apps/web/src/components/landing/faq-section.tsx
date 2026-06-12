'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const faqs = [
  { q: 'Preciso pagar para começar?', a: 'Não! O plano Gratuito dá acesso a 5 cursos completos, tutor IA limitado e dashboard básico. Sem cartão de crédito.' },
  { q: 'O tutor IA funciona para qualquer matéria?', a: 'Sim, o tutor é treinado em todo o conteúdo de Engenharia Civil, do 1º ao 10º período. Cálculo, Física, Resistência, Geotecnia e muito mais.' },
  { q: 'Posso mudar de plano depois?', a: 'Sim! Você pode migrar do Gratuito para o Premium a qualquer momento. Seu progresso é mantido.' },
  { q: 'Como funciona o mapa de dificuldades?', a: 'A IA analisa suas tentativas de questões, tempo de resposta e matérias evitadas para construir um perfil de dificuldade preciso — sem prova diagnóstica.' },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="text-center">
          <motion.p variants={fadeUp} className="mb-2 text-sm font-semibold text-isometrica-accent">FAQ</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Perguntas frequentes
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="mt-12 space-y-3"
        >
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={fadeUp} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold transition-colors hover:bg-muted/50"
              >
                {faq.q}
                <ChevronDown className={`size-4 text-muted-foreground transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
