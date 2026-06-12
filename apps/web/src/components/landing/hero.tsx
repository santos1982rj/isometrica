'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Sparkles, ArrowRight, GraduationCap, Brain, Star } from 'lucide-react'

function Counter({ from = 0, to, suffix = '', duration = 2 }: { from?: number; to: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(from)
  const ref = useRef<HTMLSpanElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    let start = from
    const end = to
    const step = Math.ceil((end - from) / (duration * 60))
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) } else setCount(start)
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [inView, from, to, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

export function HeroSection() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -60])
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.6])

  return (
    <motion.section style={{ y, opacity }} className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 size-96 rounded-full bg-isometrica-accent/5 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -right-40 top-20 size-96 rounded-full bg-isometrica-primary/5 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-0 left-1/2 size-64 -translate-x-1/2 rounded-full bg-isometrica-accent/5 blur-3xl" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute size-1 rounded-full bg-isometrica-accent/20" style={{ left: `${20 + i * 15}%`, top: `${10 + i * 12}%` }} />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-isometrica-accent/20 bg-isometrica-accent/5 px-4 py-1.5 text-xs font-semibold text-isometrica-accent">
            <Sparkles className="size-3" />
            Plataforma inteligente de evolução acadêmica
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
            className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Sua evolução na{' '}
            <span className="bg-gradient-to-r from-isometrica-accent to-orange-400 bg-clip-text text-transparent">
              Engenharia
            </span>{' '}
            começa aqui.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg"
          >
            Não é um catálogo de cursos. É um ambiente que entende sua dificuldade, 
            mapeia seu progresso e propõe melhorias continuamente — com IA, dados e gamificação.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/cadastro"
              className="group inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-isometrica-accent to-orange-400 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-isometrica-accent/20 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Começar grátis
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-muted"
            >
              Ver recursos
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['#e85d32', '#f07a4a', '#f8a07a'].map((c, i) => (
                  <div key={i} className="size-7 rounded-full border-2 border-background" style={{ background: c }} />
                ))}
              </div>
              <span><strong className="text-foreground"><Counter from={0} to={2400} />+</strong> estudantes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="size-4" />
              <span><strong className="text-foreground"><Counter from={0} to={15} />+</strong> disciplinas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Brain className="size-4" />
              <span><strong className="text-foreground">IA</strong> adaptativa</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1"><strong className="text-foreground">4.8</strong></span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
