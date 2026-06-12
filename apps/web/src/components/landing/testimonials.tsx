'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const testimonials = [
  { quote: 'O tutor IA me salvou em Resistência dos Materiais. Explicou de um jeito que o professor não conseguiu.', name: 'Ana Oliveira', role: '5º semestre', rating: 5 },
  { quote: 'Finalmente uma plataforma que entende o que é ser estudante de engenharia. O mapeamento de dificuldades é preciso demais.', name: 'Carlos Mendes', role: '3º semestre', rating: 5 },
  { quote: 'A gamificação me fez estudar muito mais. Subir de nível virou vício — e minha notas melhoraram junto.', name: 'Julia Torres', role: '4º semestre', rating: 5 },
]

export function TestimonialsSection() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setActive((p) => (p + 1) % testimonials.length), 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center">
          <motion.p variants={fadeUp} className="mb-2 text-sm font-semibold text-isometrica-accent">DEPOIMENTOS</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Quem usa recomenda
          </motion.h2>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <Quote className="mb-3 size-6 text-isometrica-accent/30" />
              <p className="text-sm leading-relaxed text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-3 flex gap-0.5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-isometrica-accent to-orange-400 text-xs font-bold text-white">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
