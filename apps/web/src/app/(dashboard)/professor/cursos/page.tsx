'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Plus, BookOpen, FileText, Users, Edit, Trash2, ChevronRight, GraduationCap, AlertCircle } from 'lucide-react'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

const gradients = [
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-rose-600',
  'from-blue-500 to-cyan-600',
]

export default function ProfessorCursosPage() {
  const [cursos, setCursos] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)

  function carregar() {
    setCarregando(true)
    api.courses.listar().then(setCursos).catch(console.error).finally(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  async function remover(id: string, nome: string) {
    if (!confirm(`Remover "${nome}"? Esta ação não pode ser desfeita.`)) return
    try {
      await api.courses.remover(id)
      carregar()
    } catch (err) {
      toast.error('Erro ao remover curso')
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Meus Cursos</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Gerencie seus cursos, módulos e aulas</p>
        </div>
        <Link
          href="/professor/cursos/novo"
          className="inline-flex items-center gap-1.5 rounded-lg bg-isometrica-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-isometrica-accent/90"
        >
          <Plus className="size-4" />
          Novo Curso
        </Link>
      </motion.div>

      {carregando ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-border bg-card">
              <div className="h-36 bg-muted" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : cursos.length === 0 ? (
        <motion.div variants={item} className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <BookOpen className="mb-3 size-10 text-muted-foreground/50" />
          <h3 className="font-display text-lg font-semibold">Nenhum curso ainda</h3>
          <p className="mt-1 text-sm text-muted-foreground">Crie seu primeiro curso para começar</p>
          <Link
            href="/professor/cursos/novo"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-isometrica-accent px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus className="size-4" />
            Criar Curso
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={container} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cursos.map((curso, idx) => {
            const totalAulas = curso.modules?.reduce((a: number, m: any) => a + (m.lessons?.length ?? 0), 0) ?? 0
            const grad = gradients[idx % gradients.length]

            return (
              <motion.div key={curso.id} variants={item}>
                <div className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-md">
                  <div className={`relative h-36 bg-gradient-to-br ${grad} p-5 flex flex-col justify-end`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <span className="relative inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm w-fit">
                      {curso.subject?.name ?? 'Sem disciplina'}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-base font-bold leading-snug">{curso.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{curso.description}</p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><GraduationCap className="size-3.5" />{curso.modules?.length ?? 0} módulos</span>
                      <span className="flex items-center gap-1"><FileText className="size-3.5" />{totalAulas} aulas</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Link
                        href={`/professor/cursos/${curso.id}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-semibold transition-all hover:bg-muted"
                      >
                        <Edit className="size-3.5" />
                        Gerenciar
                      </Link>
                      <button
                        onClick={() => remover(curso.id, curso.name)}
                        className="flex items-center justify-center rounded-lg border border-border p-2 text-xs font-semibold text-isometrica-danger transition-all hover:bg-isometrica-danger/5"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
