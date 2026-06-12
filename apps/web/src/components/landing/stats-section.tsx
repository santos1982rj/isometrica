'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

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

export function StatsSection() {
  return (
    <section className="border-y border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {[
            { value: 2400, label: 'Estudantes ativos', suffix: '+' },
            { value: 15, label: 'Disciplinas', suffix: '+' },
            { value: 120, label: 'Aulas', suffix: '+' },
            { value: 48, label: 'Avaliação média', suffix: '', prefix: '' },
          ].map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
              <p className="font-display text-3xl font-extrabold text-isometrica-accent">
                {s.prefix}<Counter from={0} to={s.value} />{s.suffix}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
