'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import {
  BookOpen, Users, FileText, Plus, TrendingUp, Clock, ChevronRight,
  BarChart3, GraduationCap, AlertTriangle, CheckCircle, Play, Loader2,
} from 'lucide-react'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
}

export default function ProfessorDashboardPage() {
  const { usuario } = useAuth()
  const [data, setData] = useState<any>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    api.analytics.professor().then(setData).catch(console.error).finally(() => setCarregando(false))
  }, [])

  if (carregando) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}
        </div>
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  const overview = data?.overview ?? { totalCourses: 0, totalStudents: 0, totalLessons: 0, avgAccuracy: 0 }
  const courses = data?.courses ?? []
  const strugglingStudents = data?.strugglingStudents ?? []

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">
            Bem-vindo, Prof. {usuario?.name?.split(' ')[0] ?? 'Professor'}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Visão geral dos cursos e alunos</p>
        </div>
        <Link
          href="/professor/cursos/novo"
          className="inline-flex items-center gap-1.5 rounded-lg bg-isometrica-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-isometrica-accent/90"
        >
          <Plus className="size-4" />
          Novo Curso
        </Link>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Cursos', value: overview.totalCourses, icon: BookOpen, color: 'text-isometrica-accent', bg: 'bg-isometrica-accent/10' },
          { label: 'Alunos', value: overview.totalStudents, icon: Users, color: 'text-isometrica-info', bg: 'bg-isometrica-info/10' },
          { label: 'Aulas', value: overview.totalLessons, icon: FileText, color: 'text-isometrica-success', bg: 'bg-isometrica-success/10' },
          { label: 'Taxa de Acerto', value: `${overview.avgAccuracy}%`, icon: TrendingUp, color: 'text-isometrica-warning', bg: 'bg-isometrica-warning/10' },
        ].map((s) => (
          <div key={s.label} className="bento-card flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${s.bg}`}>
              <s.icon className={`size-5 ${s.color}`} />
            </div>
            <div>
              <p className="font-display text-xl font-bold tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-3">
        <motion.div variants={item} className="bento-card rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-info/10">
                <BookOpen className="size-3.5 text-isometrica-info" />
              </div>
              <h3 className="text-sm font-semibold">Cursos</h3>
            </div>
            <Link href="/professor/cursos" className="text-xs font-medium text-muted-foreground hover:text-isometrica-accent transition-colors">Ver todos →</Link>
          </div>
          {courses.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum curso criado ainda.</p>
          ) : (
            <div className="space-y-3">
              {courses.map((curso: any) => (
                <div key={curso.id} className="flex items-center gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{curso.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span>{curso.totalStudents} alunos</span>
                      <span>{curso.totalLessons} aulas</span>
                      <span className={`font-medium ${curso.completionRate > 50 ? 'text-isometrica-success' : 'text-isometrica-warning'}`}>
                        {curso.completionRate}% conclusão
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-isometrica-accent" style={{ width: `${curso.completionRate}%` }} />
                    </div>
                  </div>
                  <Link
                    href={`/professor/cursos/${curso.id}`}
                    className="shrink-0 rounded-md border border-border px-3 py-1 text-[10px] font-semibold transition-all hover:border-isometrica-accent hover:text-isometrica-accent"
                  >
                    Gerenciar
                  </Link>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={item} className="bento-card rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-isometrica-danger/10">
              <AlertTriangle className="size-3.5 text-isometrica-danger" />
            </div>
            <h3 className="text-sm font-semibold">Alunos com Dificuldade</h3>
          </div>
          {strugglingStudents.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum aluno com dificuldade identificado.</p>
          ) : (
            <div className="space-y-2">
              {strugglingStudents.map((a: any) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-isometrica-accent to-orange-400 text-xs font-bold text-white">
                    {a.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight">{a.name}</p>
                    <p className="text-xs text-isometrica-danger">{a.accuracy}% de acerto · {a.totalQuestions} questões</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
