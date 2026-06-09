'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import type { Curso } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Clock, ChevronRight, GraduationCap } from 'lucide-react'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

const gradients = [
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-rose-600',
  'from-blue-500 to-cyan-600',
  'from-pink-500 to-fuchsia-600',
  'from-amber-500 to-yellow-600',
]

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    api.courses.listar().then(setCursos).catch(console.error).finally(() => setCarregando(false));
  }, [])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemAnim}>
        <h1 className="font-display text-2xl font-bold">Meus Cursos</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Todos os cursos disponíveis na plataforma</p>
      </motion.div>

      {carregando ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border bg-card animate-pulse">
              <div className="h-40 bg-muted" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-5 w-3/4 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div variants={container} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cursos.map((curso, idx) => {
            const totalAulas = curso.modules?.reduce((a, m) => a + (m.lessons?.length ?? 0), 0) ?? 0
            const totalModulos = curso.modules?.length ?? 0
            const grad = gradients[idx % gradients.length]

            return (
              <motion.div key={curso.id} variants={itemAnim}>
                <Link href={`/cursos/${curso.id}`} className="group block">
                  <div className="bento-card overflow-hidden rounded-xl border border-border bg-card transition-all">
                    <div className={`relative h-40 bg-gradient-to-br ${grad} p-5 flex flex-col justify-end`}>
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="relative">
                        <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                          {curso.subject?.name ?? 'Geral'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-display text-base font-bold leading-snug group-hover:text-isometrica-accent transition-colors">
                        {curso.name}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {curso.description}
                      </p>

                      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <GraduationCap className="size-3.5" />
                          <span>{totalModulos} módulo{totalModulos !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="size-3.5" />
                          <span>{totalAulas} aula{totalAulas !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                        <span className="text-xs font-medium text-isometrica-accent group-hover:gap-1.5 transition-all inline-flex items-center gap-1">
                          Continuar curso
                          <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {Math.floor(Math.random() * 60) + 20}% completo
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
